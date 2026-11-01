import { contato, horarios, portfolio } from "@/content/site";
import { IconeInstagram, IconeWhatsApp } from "@/components/ui/Icones";
import { Reserva } from "./Reserva";
import styles from "./Secoes.module.css";

const faixa = "nail art ✦ 3D ✦ cartoon ✦ gel ✦ press on ✦ ";

export function Secoes() {
  return (
    <>
      <div className={styles.faixa} aria-hidden="true">
        <div>{faixa.repeat(12)}</div>
      </div>

      <section id="portfolio" className={styles.portfolio}>
        <h2><small>nail art é</small> <b>cultura</b></h2>
        <div className={styles.galeria}>
          {portfolio.map((foto) => (
            <figure key={foto.src}>
              <img src={`/images/portfolio/${foto.src}.png`} alt={foto.alt} loading="lazy" />
            </figure>
          ))}
        </div>
        <a className={styles.botaoInstagram} href={contato.instagram}><IconeInstagram /> Ver mais no Instagram</a>
      </section>

      <section className={styles.artista}>
        <img
          src="/images/portfolio/Dctam-Ppb5m.webp"
          alt="O estúdio, a artista e a arte: três fotos da Yas e do trabalho dela"
          loading="lazy"
        />
        <div>
          <h2><small>em busca do</small> <b>sucesso</b> <i>e consumida pela arte</i></h2>
          <p>Yas Sampaio é nail artist em Jacarepaguá, RJ. Nail art, 3D e cartoon, com alongamentos em gel e press on.</p>
        </div>
      </section>

      <Reserva />

      <section id="press-on" className={styles.pressOn}>
        <img className={styles.flor} src="/flores/flor.svg" alt="" loading="lazy" />
        <h2><small>unhas prontas</small> <b>press on</b></h2>
        <p>Fale no WhatsApp para saber modelos, tamanhos e valores.</p>
        <a className={styles.botaoWhats} href={contato.whatsapp}><IconeWhatsApp /> Pedir no WhatsApp</a>
      </section>

      <section id="contato" className={styles.contato}>
        <div>
          <h2><small>vem fazer</small> <b>arte</b></h2>
          <p>Jacarepaguá, Rio de Janeiro</p>
          <div className={styles.acoes}>
            <a className={styles.botao} href={contato.mapa}>Ver no mapa</a>
            <a className={styles.botao} href={contato.telefone}>{contato.telefoneVisivel}</a>
            <a className={styles.botaoWhats} href={contato.whatsapp}><IconeWhatsApp /> WhatsApp</a>
            <a className={styles.botaoInstagram} href={contato.instagram}><IconeInstagram /> Instagram</a>
          </div>
        </div>
        <dl>
          {horarios.map((h) => (
            <div key={h.dia}><dt>{h.dia}</dt><dd>{h.horario}</dd></div>
          ))}
        </dl>
      </section>

      <footer className={styles.rodape}>
        <p><small>um</small> <b>artista</b> <small>é uma</small> <i>criança</i> <small>que</small> <b>insistiu</b></p>
      </footer>

      <div className={styles.barra}>
        <a className={styles.barraAgendar} href={contato.agendamento}>Agendar</a>
        <a className={styles.barraWhats} href={contato.whatsapp} aria-label="WhatsApp"><IconeWhatsApp /></a>
        <a className={styles.barraInsta} href={contato.instagram} aria-label="Instagram"><IconeInstagram /></a>
      </div>
    </>
  );
}
