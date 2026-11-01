"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { VIOLACAO_EXCLUSAO, lancar } from "@/lib/agenda/agenda";
import { banco } from "@/lib/db";
import { abrirSessao, fecharSessao, senhaCorreta, sessaoValida } from "@/lib/painel/sessao";

const texto = (dados: FormData, campo: string) => String(dados.get(campo) ?? "").trim();
const DIA = /^\d{4}-\d{2}-\d{2}$/;
const HORA = /^\d{2}:\d{2}$/;

async function exigirSessao() {
  if (!(await sessaoValida())) redirect("/painel");
}

export async function entrar(dados: FormData) {
  await new Promise((r) => setTimeout(r, 800));
  if (!senhaCorreta(texto(dados, "senha"))) redirect("/painel?erro=senha");
  await abrirSessao();
  redirect("/painel");
}

export async function sair() {
  await fecharSessao();
  redirect("/painel");
}

export async function concluirAtendimento(dados: FormData) {
  await exigirSessao();
  const db = await banco();
  const { rows } = await db.query<{ id: string; nome: string; servico_nome: string; restante: string }>(
    `UPDATE reservas SET atendimento = 'concluido'
      WHERE id = $1 AND status = 'confirmada' AND atendimento IS NULL
      RETURNING id, nome, servico_nome, valor_total - sinal AS restante`,
    [texto(dados, "id")],
  );
  const r = rows[0];
  if (r && Number(r.restante) > 0) {
    await lancar(r.id, "entrada", "Serviços", `${r.nome}: ${r.servico_nome}`, Number(r.restante), texto(dados, "forma") || "Pix");
  }
  revalidatePath("/painel");
}

export async function marcarFalta(dados: FormData) {
  await exigirSessao();
  const db = await banco();
  await db.query(`UPDATE reservas SET atendimento = 'faltou' WHERE id = $1 AND atendimento IS NULL`, [texto(dados, "id")]);
  revalidatePath("/painel");
}

export async function cancelarReserva(dados: FormData) {
  await exigirSessao();
  const db = await banco();
  await db.query(`UPDATE reservas SET status = 'cancelada' WHERE id = $1 AND atendimento IS NULL`, [texto(dados, "id")]);
  revalidatePath("/painel");
}

export async function bloquearHorario(dados: FormData) {
  await exigirSessao();
  const [dia, inicio, fim] = [texto(dados, "dia"), texto(dados, "inicio"), texto(dados, "fim")];
  if (!DIA.test(dia) || !HORA.test(inicio) || !HORA.test(fim) || inicio >= fim) redirect("/painel?erro=bloqueio");
  const db = await banco();
  try {
    await db.query(
      `INSERT INTO reservas (servico_id, servico_nome, periodo, nome, telefone, status, expira_em)
       VALUES ('bloqueio', 'Horário bloqueado', $1::tsrange, $2, '', 'confirmada', now())`,
      [`[${dia} ${inicio},${dia} ${fim})`, texto(dados, "motivo") || "Bloqueio"],
    );
  } catch (erro) {
    if ((erro as { code?: string }).code === VIOLACAO_EXCLUSAO) redirect("/painel?erro=conflito");
    throw erro;
  }
  revalidatePath("/painel");
}

export async function adicionarLancamento(dados: FormData) {
  await exigirSessao();
  const valor = Number(texto(dados, "valor").replace(",", "."));
  const tipo = texto(dados, "tipo");
  const dia = texto(dados, "dia");
  if (!(valor > 0) || !DIA.test(dia) || !["entrada", "saida"].includes(tipo)) {
    redirect("/painel?aba=financeiro&erro=lancamento");
  }
  const db = await banco();
  await db.query(
    `INSERT INTO lancamentos (data, tipo, categoria, descricao, valor, forma) VALUES ($1, $2, $3, $4, $5, $6)`,
    [dia, tipo, texto(dados, "categoria") || "Outros", texto(dados, "descricao"), valor, texto(dados, "forma") || "Pix"],
  );
  revalidatePath("/painel");
}

export async function excluirLancamento(dados: FormData) {
  await exigirSessao();
  const db = await banco();
  await db.query(`DELETE FROM lancamentos WHERE id = $1 AND reserva_id IS NULL`, [texto(dados, "id")]);
  revalidatePath("/painel");
}
