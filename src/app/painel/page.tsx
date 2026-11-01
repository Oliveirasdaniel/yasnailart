import type { Metadata } from "next";
import { agoraNoRio } from "@/lib/agenda/regras";
import { lancamentosDoMes, reservasDoMes, resumirMes } from "@/lib/painel/dados";
import { sessaoValida } from "@/lib/painel/sessao";
import {
  adicionarLancamento,
  bloquearHorario,
  cancelarReserva,
  concluirAtendimento,
  entrar,
  excluirLancamento,
  marcarFalta,
  sair,
} from "./acoes";
import styles from "./painel.module.css";

export const metadata: Metadata = { title: "Painel | Yas Nail Art", robots: { index: false, follow: false } };

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const nomeMes = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
const nomeDia = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", timeZone: "UTC" });
const FORMAS = ["Pix", "Dinheiro", "Crédito", "Débito"];
const CATEGORIAS = ["Materiais", "Aluguel", "Marketing", "Transporte", "Press On", "Serviços", "Outros"];
const ERROS: Record<string, string> = {
  senha: "Senha incorreta.",
  bloqueio: "Confira o dia e os horários do bloqueio.",
  conflito: "Já existe reserva nesse período.",
  lancamento: "Confira o valor e a data.",
};

function mudarMes(mes: string, quantos: number) {
  const [a, m] = mes.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1 + quantos, 1)).toISOString().slice(0, 7);
}

const dia = (d: string) => nomeDia.format(new Date(`${d}T12:00:00Z`)).replace(".", "");

export default async function Painel({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string; mes?: string; erro?: string }>;
}) {
  const parametros = await searchParams;
  const erro = parametros.erro ? ERROS[parametros.erro] : "";

  if (!(await sessaoValida())) {
    return (
      <main className={styles.entrada}>
        <form action={entrar} className={styles.cartao}>
          <h1>Painel da Yas</h1>
          <label>
            Senha
            <input type="password" name="senha" autoComplete="current-password" required />
          </label>
          <button className={styles.primario}>Entrar</button>
          {erro && <p role="alert" className={styles.erro}>{erro}</p>}
        </form>
      </main>
    );
  }

  const hoje = agoraNoRio().slice(0, 10);
  const mes = /^\d{4}-\d{2}$/.test(parametros.mes ?? "") ? parametros.mes! : hoje.slice(0, 7);
  const aba = parametros.aba === "financeiro" ? "financeiro" : "agenda";
  const [reservas, lancamentos] = await Promise.all([reservasDoMes(mes), lancamentosDoMes(mes)]);
  const resumo = resumirMes(lancamentos, reservas);
  const link = (a: string, m = mes) => `/painel?aba=${a}&mes=${m}`;

  return (
    <main className={styles.painel}>
      <header className={styles.topo}>
        <h1>Painel da Yas</h1>
        <form action={sair}><button className={styles.discreto}>Sair</button></form>
      </header>

      <nav className={styles.abas} aria-label="Seções do painel">
        <a href={link("agenda")} aria-current={aba === "agenda" ? "page" : undefined}>Agenda</a>
        <a href={link("financeiro")} aria-current={aba === "financeiro" ? "page" : undefined}>Financeiro</a>
      </nav>

      <div className={styles.mes}>
        <a href={link(aba, mudarMes(mes, -1))} aria-label="Mês anterior">‹</a>
        <strong>{nomeMes.format(new Date(`${mes}-15T12:00:00Z`))}</strong>
        <a href={link(aba, mudarMes(mes, 1))} aria-label="Próximo mês">›</a>
      </div>

      {erro && <p role="alert" className={styles.erro}>{erro}</p>}

      {aba === "agenda" && (
        <>
          {reservas.length === 0 && <p>Nenhum horário neste mês.</p>}
          <ul className={styles.lista}>
            {reservas.map((r) => {
              const bloqueio = r.servico_id === "bloqueio";
              const restante = Number(r.valor_total) - Number(r.sinal);
              return (
                <li key={r.id} className={styles.cartao}>
                  <p className={styles.quando}>{dia(r.dia)} · {r.inicio} às {r.fim}</p>
                  <h2>{r.nome}</h2>
                  <p>{r.servico_nome}</p>
                  {!bloqueio && (
                    <>
                      <p>Total {moeda.format(Number(r.valor_total))} · Sinal {moeda.format(Number(r.sinal))} · <strong>Falta {moeda.format(restante)}</strong></p>
                      <a href={`https://wa.me/55${r.telefone}`}>WhatsApp: {r.telefone}</a>
                    </>
                  )}
                  {r.atendimento && <p className={styles.selo}>{r.atendimento === "concluido" ? "Concluído" : "Não compareceu"}</p>}
                  {!r.atendimento && (
                    <div className={styles.acoes}>
                      {!bloqueio && (
                        <form action={concluirAtendimento} className={styles.concluir}>
                          <input type="hidden" name="id" value={r.id} />
                          <select name="forma" aria-label="Forma de pagamento do restante">
                            {FORMAS.map((f) => <option key={f}>{f}</option>)}
                          </select>
                          <button className={styles.primario}>Concluir</button>
                        </form>
                      )}
                      {!bloqueio && (
                        <form action={marcarFalta}>
                          <input type="hidden" name="id" value={r.id} />
                          <button className={styles.secundario}>Faltou</button>
                        </form>
                      )}
                      <form action={cancelarReserva}>
                        <input type="hidden" name="id" value={r.id} />
                        <button className={styles.secundario}>{bloqueio ? "Liberar" : "Cancelar"}</button>
                      </form>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <form action={bloquearHorario} className={`${styles.cartao} ${styles.formulario}`}>
            <h2>Bloquear horário</h2>
            <label>Dia<input type="date" name="dia" defaultValue={hoje} required /></label>
            <div className={styles.duas}>
              <label>Início<input type="time" name="inicio" defaultValue="09:00" required /></label>
              <label>Fim<input type="time" name="fim" defaultValue="20:00" required /></label>
            </div>
            <label>Motivo<input name="motivo" placeholder="Folga, curso..." /></label>
            <button className={styles.primario}>Bloquear</button>
          </form>
        </>
      )}

      {aba === "financeiro" && (
        <>
          <dl className={styles.numeros}>
            <div><dt>Entradas</dt><dd>{moeda.format(resumo.entradas)}</dd></div>
            <div><dt>Saídas</dt><dd>{moeda.format(resumo.saidas)}</dd></div>
            <div className={styles.destaque}><dt>Saldo</dt><dd>{moeda.format(resumo.saldo)}</dd></div>
            <div><dt>A receber</dt><dd>{moeda.format(resumo.aReceber)}</dd></div>
          </dl>

          {resumo.categorias.length > 0 && (
            <section className={styles.cartao}>
              <h2>Por categoria</h2>
              <table className={styles.tabela}>
                <tbody>
                  {resumo.categorias.map(([categoria, valor]) => (
                    <tr key={categoria}><th scope="row">{categoria}</th><td>{moeda.format(valor)}</td></tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          <form action={adicionarLancamento} className={`${styles.cartao} ${styles.formulario}`}>
            <h2>Novo lançamento</h2>
            <div className={styles.duas}>
              <label>Tipo
                <select name="tipo"><option value="saida">Saída</option><option value="entrada">Entrada</option></select>
              </label>
              <label>Valor<input name="valor" inputMode="decimal" placeholder="0,00" required /></label>
            </div>
            <div className={styles.duas}>
              <label>Categoria
                <select name="categoria">{CATEGORIAS.map((c) => <option key={c}>{c}</option>)}</select>
              </label>
              <label>Forma
                <select name="forma">{FORMAS.map((f) => <option key={f}>{f}</option>)}</select>
              </label>
            </div>
            <label>Data<input type="date" name="dia" defaultValue={hoje} required /></label>
            <label>Descrição<input name="descricao" placeholder="Ex.: gel, tips, luz" /></label>
            <button className={styles.primario}>Lançar</button>
          </form>

          <section className={styles.cartao}>
            <h2>Lançamentos</h2>
            {lancamentos.length === 0 && <p>Nada lançado neste mês.</p>}
            <table className={styles.tabela}>
              <tbody>
                {lancamentos.map((l) => (
                  <tr key={l.id}>
                    <th scope="row">
                      {l.categoria}
                      <small>{dia(l.dia)} · {l.forma}{l.descricao ? ` · ${l.descricao}` : ""}</small>
                    </th>
                    <td className={l.tipo === "saida" ? styles.saida : ""}>
                      {l.tipo === "saida" ? "−" : ""}{moeda.format(Number(l.valor))}
                      {!l.reserva_id && (
                        <form action={excluirLancamento}>
                          <input type="hidden" name="id" value={l.id} />
                          <button className={styles.discreto}>Excluir</button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </main>
  );
}
