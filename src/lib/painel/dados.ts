import { banco } from "@/lib/db";

export type ReservaPainel = {
  id: string;
  dia: string;
  inicio: string;
  fim: string;
  nome: string;
  telefone: string;
  servico_nome: string;
  servico_id: string;
  valor_total: string;
  sinal: string;
  atendimento: string | null;
};

export type Lancamento = {
  id: string;
  dia: string;
  tipo: string;
  categoria: string;
  descricao: string;
  valor: string;
  forma: string;
  reserva_id: string | null;
};

export async function reservasDoMes(mes: string) {
  const db = await banco();
  const { rows } = await db.query<ReservaPainel>(
    `SELECT id, to_char(lower(periodo), 'YYYY-MM-DD') AS dia, to_char(lower(periodo), 'HH24:MI') AS inicio,
            to_char(upper(periodo), 'HH24:MI') AS fim, nome, telefone, servico_nome, servico_id,
            valor_total, sinal, atendimento
       FROM reservas
      WHERE status = 'confirmada' AND to_char(lower(periodo), 'YYYY-MM') = $1
      ORDER BY lower(periodo)`,
    [mes],
  );
  return rows;
}

export async function lancamentosDoMes(mes: string) {
  const db = await banco();
  const { rows } = await db.query<Lancamento>(
    `SELECT id, to_char(data, 'YYYY-MM-DD') AS dia, tipo, categoria, descricao, valor, forma, reserva_id
       FROM lancamentos WHERE to_char(data, 'YYYY-MM') = $1
      ORDER BY data DESC, criado_em DESC`,
    [mes],
  );
  return rows;
}

export function resumirMes(lancamentos: Lancamento[], reservas: ReservaPainel[]) {
  const somar = (tipo: string) =>
    lancamentos.filter((l) => l.tipo === tipo).reduce((total, l) => total + Number(l.valor), 0);
  const entradas = somar("entrada");
  const saidas = somar("saida");
  const aReceber = reservas
    .filter((r) => !r.atendimento && r.servico_id !== "bloqueio")
    .reduce((total, r) => total + Number(r.valor_total) - Number(r.sinal), 0);

  const categorias = new Map<string, number>();
  for (const l of lancamentos) {
    categorias.set(l.categoria, (categorias.get(l.categoria) ?? 0) + (l.tipo === "entrada" ? 1 : -1) * Number(l.valor));
  }
  return { entradas, saidas, saldo: entradas - saidas, aReceber, categorias: [...categorias] };
}
