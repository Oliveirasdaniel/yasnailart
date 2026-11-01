"use client";

import { useRef, useState } from "react";
import { catalogoNailArt, contato } from "@/content/site";
import { LIMITE_QUANTIDADE, itensDoCatalogo, rotuloDoExtra } from "@/lib/agenda/regras";
import { useReserva } from "./ContextoReserva";
import styles from "./CatalogoNailArt.module.css";

const PAGINAS = ["/images/catalogo/pagina-1.png", "/images/catalogo/pagina-2.png", "/images/catalogo/pagina-3.png"];
const FOTOS = "Fotos";
const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function CatalogoNailArt() {
  const janela = useRef<HTMLDialogElement>(null);
  const [aba, setAba] = useState(catalogoNailArt[0].nivel);
  const { quantidades, definirQuantidade, extras } = useReserva();
  const nivel = catalogoNailArt.find((n) => n.nivel === aba);

  const soma = extras.reduce((total, [id, q]) => total + (itensDoCatalogo.find((i) => i.id === id)?.preco ?? 0) * q, 0);

  function continuar() {
    janela.current?.close();
    document.getElementById("servicos")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <button type="button" className={styles.abrir} onClick={() => janela.current?.showModal()}>
        Ver preços das nail arts
      </button>

      <dialog ref={janela} className={styles.janela} aria-labelledby="titulo-catalogo">
        <header className={styles.topo}>
          <h2 id="titulo-catalogo">Nail art</h2>
          <button type="button" className={styles.fechar} aria-label="Fechar" onClick={() => janela.current?.close()}>×</button>
        </header>

        <div className={styles.abas}>
          {[...catalogoNailArt.map((n) => n.nivel), FOTOS].map((rotulo) => (
            <button
              type="button"
              key={rotulo}
              aria-pressed={rotulo === aba}
              className={rotulo === aba ? styles.ativa : ""}
              onClick={() => setAba(rotulo)}
            >
              {rotulo}
            </button>
          ))}
        </div>

        <div className={styles.conteudo}>
          {nivel && (
            <>
              <p className={styles.faixa}>{nivel.faixa}</p>
              <ul className={styles.lista}>
                {itensDoCatalogo
                  .filter((item) => item.nivel === nivel.nivel)
                  .map((item) => {
                    const quantidade = quantidades[item.id] ?? 0;
                    return (
                      <li key={item.id} className={quantidade ? styles.marcado : ""}>
                        <label>
                          <input
                            type="checkbox"
                            checked={quantidade > 0}
                            onChange={() => definirQuantidade(item.id, quantidade ? 0 : 1)}
                          />
                          <span>{item.nome}</span>
                          <strong>{rotuloDoExtra(item)}</strong>
                        </label>
                        {quantidade > 0 && item.unidade !== "fixo" && (
                          <div className={styles.quantidade}>
                            <span>{item.unidade === "unha" ? "Unhas" : "Peças"}</span>
                            <button
                              type="button"
                              aria-label={`Menos ${item.nome}`}
                              onClick={() => definirQuantidade(item.id, quantidade - 1)}
                            >
                              −
                            </button>
                            <output>{quantidade}</output>
                            <button
                              type="button"
                              aria-label={`Mais ${item.nome}`}
                              disabled={quantidade >= LIMITE_QUANTIDADE[item.unidade]}
                              onClick={() => definirQuantidade(item.id, quantidade + 1)}
                            >
                              +
                            </button>
                          </div>
                        )}
                      </li>
                    );
                  })}
              </ul>
            </>
          )}

          {aba === FOTOS &&
            PAGINAS.map((src, i) => (
              <img key={src} src={src} alt={`Catálogo de nail art, página ${i + 1}`} loading="lazy" />
            ))}
        </div>

        <footer className={styles.rodape}>
          <p>Valor estimado: a Yas confirma pela sua inspiração.</p>
          <button type="button" className={styles.continuar} onClick={continuar}>
            {extras.length ? `Adicionar ${extras.length} · ${moeda.format(soma)}` : "Voltar aos serviços"}
          </button>
          <a href={contato.whatsapp}>Enviar inspiração no WhatsApp</a>
        </footer>
      </dialog>
    </>
  );
}
