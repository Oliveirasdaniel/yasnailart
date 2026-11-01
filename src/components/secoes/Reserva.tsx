"use client";

import { contato, servicos } from "@/content/site";
import { formatarDuracao, idDoServico, itensDoCatalogo } from "@/lib/agenda/regras";
import { Agendamento } from "./Agendamento";
import { CatalogoNailArt } from "./CatalogoNailArt";
import { useReserva } from "./ContextoReserva";
import styles from "./Secoes.module.css";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function Reserva() {
  const { selecionados, alternarServico: alternar, combinacao, extras, definirQuantidade } = useReserva();

  return (
    <>
      <section id="servicos" className={styles.servicos}>
        <h2><small>monte seu</small> <b>horário</b></h2>
        <p className={styles.dica}>Marque um ou mais serviços. O tempo e o valor somam sozinhos.</p>
        <div className={styles.catalogo}>
          <CatalogoNailArt />
          {extras.length > 0 && (
            <ul className={styles.artes}>
              {extras.map(([id, quantidade]) => (
                <li key={id}>
                  <span>{itensDoCatalogo.find((i) => i.id === id)?.nome}{quantidade > 1 ? ` x${quantidade}` : ""}</span>
                  <button type="button" aria-label="Remover" onClick={() => definirQuantidade(id, 0)}>×</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={styles.categorias}>
          {servicos.map((grupo, i) => (
            <details key={grupo.categoria} open={i === 0}>
              <summary><h3>{grupo.categoria}</h3></summary>
              <ul>
                {grupo.itens.map((item) => {
                  const id = idDoServico(grupo.categoria, item.nome);
                  const consulta = item.valor === "Sob consulta";
                  const marcado = selecionados.includes(id);
                  return (
                    <li key={item.nome}>
                      {consulta ? (
                        <a className={styles.linhaServico} href={contato.whatsapp}>
                          <span className={styles.semCaixa} aria-hidden="true">✦</span>
                          <span className={styles.corpo}>
                            <span className={styles.titulo}><strong>{item.nome}</strong><em>{item.valor}</em></span>
                            <small>{item.duracao}{item.nota ? ` · ${item.nota}` : ""}</small>
                          </span>
                        </a>
                      ) : (
                        <label className={`${styles.linhaServico} ${marcado ? styles.marcado : ""}`}>
                          <input type="checkbox" checked={marcado} onChange={() => alternar(id)} />
                          <span className={styles.corpo}>
                            <span className={styles.titulo}><strong>{item.nome}</strong><em>{item.valor}</em></span>
                            <small>{item.duracao}{item.nota ? ` · ${item.nota}` : ""}</small>
                          </span>
                        </label>
                      )}
                    </li>
                  );
                })}
              </ul>
            </details>
          ))}
        </div>

        <div className={styles.resumo} aria-live="polite">
          <p>
            {combinacao
              ? `${combinacao.ids.length} ${combinacao.ids.length > 1 ? "serviços" : "serviço"}${extras.length ? ` + ${extras.length} nail art` : ""} · ${formatarDuracao(combinacao.minutos)} · ${moeda.format(combinacao.preco)}`
              : extras.length
                ? "Marque também o serviço base"
                : "Nenhum serviço marcado"}
          </p>
          <a className={styles.botao} href="#agendar">Escolher horário</a>
        </div>
      </section>

      <Agendamento />
    </>
  );
}
