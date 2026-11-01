import { funcionamento, sinalReais } from "@/content/site";
import { banco } from "@/lib/db";
import { criarCobrancaPix } from "@/lib/pagamentos/syncpay";
import {
  INTERVALO_MINUTOS,
  agoraNoRio,
  combinarServicos,
  type Extra,
  diaDaSemana,
  minutosParaHora,
  ultimoDiaReservavel,
} from "./regras";

const ANTECEDENCIA_MINUTOS = 60;
const RESERVA_MINUTOS = 15;
const TAXA_PIX = 0.75;
export const VIOLACAO_EXCLUSAO = "23P01";
export const HOJE_NO_RIO = `(now() AT TIME ZONE 'America/Sao_Paulo')::date`;

export class HorarioIndisponivel extends Error {}

async function liberarVencidas() {
  const db = await banco();
  await db.query(`UPDATE reservas SET status = 'expirada' WHERE status = 'pendente' AND expira_em < now()`);
}

export async function horariosLivres(data: string, servicoIds: string[], extras: Extra[] = []) {
  const combinacao = combinarServicos(servicoIds, extras);
  const janela = funcionamento[diaDaSemana(data)];
  const hoje = agoraNoRio().slice(0, 10);
  if (!combinacao || !janela || data < hoje || data > ultimoDiaReservavel()) return [];

  await liberarVencidas();
  const db = await banco();
  const { rows } = await db.query<{ inicio: number; fim: number }>(
    `SELECT extract(hour FROM lower(periodo)) * 60 + extract(minute FROM lower(periodo)) AS inicio,
            extract(hour FROM upper(periodo)) * 60 + extract(minute FROM upper(periodo)) AS fim
       FROM reservas
      WHERE status IN ('pendente', 'confirmada') AND lower(periodo)::date = $1::date`,
    [data],
  );

  const agora = agoraNoRio();
  const minimo =
    agora.slice(0, 10) === data
      ? Number(agora.slice(11, 13)) * 60 + Number(agora.slice(14, 16)) + ANTECEDENCIA_MINUTOS
      : 0;

  const livres: string[] = [];
  const [abre, fecha] = janela;
  for (let inicio = abre * 60; inicio + combinacao.minutos <= fecha * 60; inicio += INTERVALO_MINUTOS) {
    const fim = inicio + combinacao.minutos;
    const ocupado = rows.some((r) => inicio < Number(r.fim) && fim > Number(r.inicio));
    if (inicio >= minimo && !ocupado) livres.push(minutosParaHora(inicio));
  }
  return livres;
}

export async function diasDisponiveis(mes: string, servicoIds: string[], extras: Extra[] = []) {
  const [ano, numero] = mes.split("-").map(Number);
  const total = new Date(Date.UTC(ano, numero, 0)).getUTCDate();
  const hoje = agoraNoRio().slice(0, 10);
  const dias = Array.from({ length: total }, (_, i) => `${mes}-${String(i + 1).padStart(2, "0")}`).filter(
    (d) => funcionamento[diaDaSemana(d)] && d >= hoje && d <= ultimoDiaReservavel(),
  );
  if (!combinarServicos(servicoIds, extras)) return dias;

  const livres = await Promise.all(dias.map((d) => horariosLivres(d, servicoIds, extras)));
  return dias.filter((_, i) => livres[i].length > 0);
}

export async function criarReserva(entrada: {
  servicoIds: string[];
  extras: Extra[];
  data: string;
  hora: string;
  nome: string;
  telefone: string;
}) {
  const combinacao = combinarServicos(entrada.servicoIds, entrada.extras);
  if (!combinacao || !(await horariosLivres(entrada.data, entrada.servicoIds, entrada.extras)).includes(entrada.hora)) {
    throw new HorarioIndisponivel();
  }

  const [h, m] = entrada.hora.split(":").map(Number);
  const fim = minutosParaHora(h * 60 + m + combinacao.minutos);
  const periodo = `[${entrada.data} ${entrada.hora},${entrada.data} ${fim})`;
  const sinal = Math.min(sinalReais, combinacao.preco);

  const db = await banco();
  let id: string;
  try {
    const { rows } = await db.query<{ id: string }>(
      `INSERT INTO reservas (servico_id, servico_nome, periodo, nome, telefone, valor_total, sinal, expira_em)
       VALUES ($1, $2, $3::tsrange, $4, $5, $6, $7, now() + interval '${RESERVA_MINUTOS} minutes')
       RETURNING id`,
      [combinacao.ids.join(","), combinacao.nome, periodo, entrada.nome, entrada.telefone, combinacao.preco, sinal],
    );
    id = rows[0].id;
  } catch (erro) {
    if ((erro as { code?: string }).code === VIOLACAO_EXCLUSAO) throw new HorarioIndisponivel();
    throw erro;
  }

  try {
    const cobranca = await criarCobrancaPix(sinal, `Sinal: ${combinacao.nome}`.slice(0, 200));
    await db.query(`UPDATE reservas SET pix_code = $2, transacao_id = $3 WHERE id = $1`, [
      id,
      cobranca.pixCode,
      cobranca.identificador,
    ]);
    return { id, pixCode: cobranca.pixCode, valor: sinal, minutos: RESERVA_MINUTOS };
  } catch (erro) {
    await db.query(`UPDATE reservas SET status = 'expirada' WHERE id = $1`, [id]);
    throw erro;
  }
}

export async function statusDaReserva(id: string) {
  await liberarVencidas();
  const db = await banco();
  const { rows } = await db.query<{ status: string }>(`SELECT status FROM reservas WHERE id = $1`, [id]);
  return rows[0]?.status ?? null;
}

const FILTRO = `(transacao_id = $1 OR ($2::text IS NOT NULL AND pix_code = $2))`;

type Linha = { id: string; sinal: string; servico_nome: string; nome: string };

export async function lancar(reservaId: string, tipo: string, categoria: string, descricao: string, valor: number, forma: string) {
  const db = await banco();
  await db.query(
    `INSERT INTO lancamentos (data, tipo, categoria, descricao, valor, forma, reserva_id)
     VALUES (${HOJE_NO_RIO}, $1, $2, $3, $4, $5, $6)
     ON CONFLICT (reserva_id, categoria) DO NOTHING`,
    [tipo, categoria, descricao, valor, forma, reservaId],
  );
}

async function registrarSinal(r: Linha) {
  await lancar(r.id, "entrada", "Sinal", `${r.nome}: ${r.servico_nome}`, Number(r.sinal), "Pix");
  await lancar(r.id, "saida", "Taxa Pix", r.nome, TAXA_PIX, "Pix");
}

export async function confirmarPagamento(transacaoId: string, pixCode: string | null) {
  const db = await banco();
  try {
    const { rows } = await db.query<Linha>(
      `UPDATE reservas SET status = 'confirmada', pago_em = now()
        WHERE ${FILTRO} AND status IN ('pendente', 'expirada')
        RETURNING id, sinal, servico_nome, nome`,
      [transacaoId, pixCode],
    );
    for (const r of rows) await registrarSinal(r);
  } catch (erro) {
    if ((erro as { code?: string }).code !== VIOLACAO_EXCLUSAO) throw erro;
    // Pagou depois de vencer e outra cliente já ficou com o horário: precisa de reembolso manual.
    const { rows } = await db.query<Linha>(
      `UPDATE reservas SET status = 'conflito', pago_em = now() WHERE ${FILTRO}
        RETURNING id, sinal, servico_nome, nome`,
      [transacaoId, pixCode],
    );
    for (const r of rows) await registrarSinal(r);
  }
}

export async function liberarReserva(transacaoId: string, pixCode: string | null, status: string) {
  const db = await banco();
  const { rows } = await db.query<Linha & { pago_em: string | null }>(
    `UPDATE reservas SET status = $3 WHERE ${FILTRO} AND status <> 'conflito'
      RETURNING id, sinal, servico_nome, nome, pago_em`,
    [transacaoId, pixCode, status],
  );
  for (const r of rows) {
    if (status === "cancelada" && r.pago_em) {
      await lancar(r.id, "saida", "Estorno", `${r.nome}: ${r.servico_nome}`, Number(r.sinal), "Pix");
    }
  }
}
