"use client";

import { useState } from "react";
import { musica } from "@/content/site";
import styles from "./Musica.module.css";

export function Musica() {
  const [carregado, setCarregado] = useState(false);
  const [aberto, setAberto] = useState(false);

  function alternar() {
    setCarregado(true);
    setAberto((a) => !a);
  }

  return (
    <div className={styles.musica}>
      {/* Fica montado depois de aberto: fechar o painel não interrompe a música. */}
      {carregado && (
        <div className={styles.painel} hidden={!aberto}>
          <iframe
            src={`https://open.spotify.com/embed/track/${musica.faixa}?theme=0`}
            title={`${musica.titulo}, de ${musica.artista}, no Spotify`}
            width="100%"
            height="80"
            allow="autoplay; clipboard-write; encrypted-media"
            loading="lazy"
          />
        </div>
      )}
      <button
        type="button"
        className={styles.botao}
        aria-label={aberto ? "Fechar música" : "Tocar música"}
        aria-expanded={aberto}
        onClick={alternar}
      >
        <span aria-hidden="true">{aberto ? "×" : "♫"}</span>
        <span className={styles.rotulo}>{aberto ? "Fechar" : "Tocar música"}</span>
      </button>
    </div>
  );
}
