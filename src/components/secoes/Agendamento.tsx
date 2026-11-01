"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { contato, sinalReais } from "@/content/site";
import { codificarExtras, formatarDuracao } from "@/lib/agenda/regras";
import { Calendario, TabelaHorarios } from "./Calendario";
import { useReserva } from "./ContextoReserva";
import styles from "./Agendamento.module.css";

type Pix = { id: string; pixCode: string; minutos: number; valor: number };

const formatoDia = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", timeZone: "UTC" });

function rotuloDia(data: string) {
  return formatoDia.format(new Date(`${data}T12:00:00Z`)).replace(".", "");
}

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function Agendamento() {
  const { selecionados, extras, combinacao } = useReserva();
  const servicos = selecionados.join(",");
  const consulta = extras.length ? `${servicos}&extras=${codificarExtras(extras)}` : servicos;
  const sinal = Math.min(sinalReais, combinacao?.preco ?? sinalReais);
  const [data, setData] = useState("");
  const [horarios, setHorarios] = useState<string[] | null>(null);
  const [hora, setHora] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [pix, setPix] = useState<Pix | null>(null);
  const [qr, setQr] = useState("");
  const [status, setStatus] = useState("pendente");
  const [copiado, setCopiado] = useState(false);
  const [rodada, setRodada] = useState(0);
  const blocoHoras = useRef<HTMLFieldSetElement>(null);
  const blocoDados = useRef<HTMLLabelElement>(null);

  // No celular, cada escolha leva a cliente direto ao próximo passo.
  useEffect(() => {
    if (data && servicos) blocoHoras.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [data, servicos]);

  useEffect(() => {
    if (hora) blocoDados.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [hora]);

  useEffect(() => {
    setHora("");
    setHorarios(null);
    if (!servicos || !data) return;
    let ativo = true;
    fetch(`/api/agenda/horarios?data=${data}&servicos=${consulta}`)
      .then((r) => r.json())
      .then((d) => ativo && setHorarios(d.horarios));
    return () => {
      ativo = false;
    };
  }, [consulta, data, rodada]);

  useEffect(() => {
    if (!pix) return;
    QRCode.toDataURL(pix.pixCode, { width: 280, margin: 1 }).then(setQr);
    const relogio = setInterval(async () => {
      const r = await fetch(`/api/agenda/reservas/${pix.id}`).then((x) => x.json());
      if (r.status) setStatus(r.status);
      if (r.status && r.status !== "pendente") clearInterval(relogio);
    }, 4000);
    return () => clearInterval(relogio);
  }, [pix]);

  async function reservar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);
    const resposta = await fetch("/api/agenda/reservas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ servicoIds: selecionados, extras, data, hora, nome, telefone }),
    });
    const corpo = await resposta.json();
    setEnviando(false);
    if (resposta.ok) {
      setPix(corpo);
      setStatus("pendente");
      return;
    }
    setErro(corpo.erro);
    if (resposta.status === 409) {
      setRodada((r) => r + 1);
    }
  }

  function recomecar() {
    setPix(null);
    setQr("");
    setStatus("pendente");
    setCopiado(false);
    setRodada((r) => r + 1);
  }

  const resumo = `${combinacao?.nome}, ${data && rotuloDia(data)} às ${hora}`;

  return (
    <section id="agendar" className={styles.agendar}>
      <div className={styles.painel}>
        <h2><small>escolha seu</small> <b>horário</b></h2>

        {status === "confirmada" && (
          <div role="status" className={styles.fim}>
            <h3>Horário confirmado!</h3>
            <p>{resumo}. Te espero, {nome.split(" ")[0]}!</p>
            <a
              className={styles.botao}
              href={`${contato.whatsapp}?text=${encodeURIComponent(`Oi, Yas! Agendei ${resumo}.`)}`}
            >
              Avisar a Yas no WhatsApp
            </a>
          </div>
        )}

        {status === "expirada" && (
          <div role="status" className={styles.fim}>
            <h3>O tempo do Pix acabou</h3>
            <p>O horário foi liberado. Você pode escolher de novo.</p>
            <button className={styles.botao} onClick={recomecar}>Escolher outro horário</button>
          </div>
        )}

        {status === "conflito" && (
          <div role="status" className={styles.fim}>
            <h3>Recebemos seu Pix, mas o horário foi ocupado</h3>
            <p>Fale com a Yas para remarcar ou receber o valor de volta.</p>
            <a className={styles.botao} href={contato.whatsapp}>Falar no WhatsApp</a>
          </div>
        )}

        {status === "pendente" && pix && (
          <div className={styles.pix}>
            <p className={styles.valor}>Sinal: {moeda.format(pix.valor)}</p>
            <p>{resumo}</p>
            {qr && <img src={qr} alt="QR Code do Pix" width={240} height={240} />}
            <button
              className={styles.botao}
              onClick={async () => {
                await navigator.clipboard.writeText(pix.pixCode);
                setCopiado(true);
              }}
            >
              {copiado ? "Código copiado!" : "Copiar Pix copia e cola"}
            </button>
            <p role="status">Aguardando o pagamento. Seu horário fica reservado por {pix.minutos} minutos.</p>
          </div>
        )}

        {status === "pendente" && !pix && (
          <form onSubmit={reservar} className={styles.form}>
            <div className={styles.escolhidos}>
              <span>1. Serviços</span>
              {combinacao ? (
                <p>{combinacao.nome} · {formatarDuracao(combinacao.minutos)} · {moeda.format(combinacao.preco)}</p>
              ) : (
                <p>Nenhum serviço marcado.</p>
              )}
              <a href="#servicos">{combinacao ? "Alterar serviços" : "Escolher serviços"}</a>
            </div>

            <fieldset>
              <legend>2. Dia</legend>
              <Calendario servicos={consulta} data={data} rodada={rodada} aoEscolher={setData} />
            </fieldset>

            {servicos && data && (
              <fieldset ref={blocoHoras}>
                <legend>3. Horário de {rotuloDia(data)}</legend>
                {horarios === null && <p>Buscando horários...</p>}
                {horarios?.length === 0 && <p>Sem horários neste dia. Escolha outro.</p>}
                {!!horarios?.length && <TabelaHorarios horarios={horarios} hora={hora} aoEscolher={setHora} />}
              </fieldset>
            )}

            {hora && (
              <>
                <label ref={blocoDados}>
                  <span>4. Seu nome</span>
                  <input value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" required />
                </label>
                <label>
                  <span>WhatsApp</span>
                  <input
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="(21) 90000-0000"
                    required
                  />
                </label>
                <button className={styles.botao} disabled={enviando}>
                  {enviando ? "Gerando Pix..." : `Pagar sinal de ${moeda.format(sinal)} no Pix`}
                </button>
              </>
            )}
            {erro && <p role="alert" className={styles.erro}>{erro}</p>}
          </form>
        )}
      </div>
    </section>
  );
}
