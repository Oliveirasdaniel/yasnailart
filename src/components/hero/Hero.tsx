import { contato, navegacao } from "@/content/site";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <header className={styles.hero}>
      <nav className={styles.topo} aria-label="Principal">
        <a href="#" className={styles.logo}>yasnailart</a>
        <div className={styles.links}>
          {navegacao.map((item) => (
            <a key={item.href} href={item.href}>{item.rotulo}</a>
          ))}
        </div>
        <a href={contato.agendamento} className={styles.cta}>Agendar</a>
        <details className={styles.menu}>
          <summary>Menu</summary>
          <div>
            {navegacao.map((item) => (
              <a key={item.href} href={item.href}>{item.rotulo}</a>
            ))}
          </div>
        </details>
      </nav>

      <div className={styles.cartaz}>
        <div className={styles.texto}>
          <h1>
            <span className={styles.garotas}>garotas</span>{" "}
            <span className={styles.legais}>legais</span>{" "}
            <span className={styles.linha}>
              <span className={styles.fazem}>fazem</span>{" "}
              <span className={styles.unhas}>unhas</span>
            </span>{" "}
            <span className={styles.legais}>legais</span>
          </h1>
          <p>Nail art, 3D e cartoon em Jacarepaguá, RJ.</p>
          <div className={styles.botoes}>
            <a href={contato.agendamento} className={styles.primario}>Agendar horário</a>
            <a href="#portfolio" className={styles.secundario}>Ver portfólio</a>
          </div>
        </div>

        <div className={styles.colagem}>
          <img className={styles.foto1} src="/images/hero/unhas-douradas.png" alt="Unhas com espirais douradas em relevo" />
          <img className={styles.foto2} src="/images/hero/unhas-rosa.png" alt="Unhas rosa com arte em 3D" />
          <img className={styles.foto3} src="/images/hero/unhas-ceu.png" alt="Unhas com céu azul e detalhes dourados" />
          <img className={styles.flor} src="/flores/flor.svg" alt="" />
          <span className={styles.brilho1} aria-hidden="true">✦</span>
          <span className={styles.brilho2} aria-hidden="true">✦</span>
        </div>
      </div>
    </header>
  );
}
