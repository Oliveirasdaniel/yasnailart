"use client";

import { useEffect, useState } from "react";
import { agoraNoRio } from "@/lib/agenda/regras";
import styles from "./Agendamento.module.css";

const SEMANA = [
  ["D", "Domingo"],
  ["S", "Segunda"],
  ["T", "Terça"],
  ["Q", "Quarta"],
  ["Q", "Quinta"],
  ["S", "Sexta"],
  ["S", "Sábado"],
];

const nomeDoMes = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });

function deslocarMes(mes: string, quantos: number) {
  const [a, m] = mes.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1 + quantos, 1)).toISOString().slice(0, 7);
}

function semanasDoMes(mes: string) {
  const [a, m] = mes.split("-").map(Number);
  const total = new Date(Date.UTC(a, m, 0)).getUTCDate();
  const vazios = new Date(Date.UTC(a, m - 1, 1)).getUTCDay();
  const celulas: (number | null)[] = [...Array(vazios).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  while (celulas.length % 7) celulas.push(null);
  const semanas: (number | null)[][] = [];
  for (let i = 0; i < celulas.length; i += 7) semanas.push(celulas.slice(i, i + 7));
  return semanas;
}

export function Calendario(props: {
  servicos: string;
  data: string;
  rodada: number;
  aoEscolher: (data: string) => void;
}) {
  const { servicos, data, rodada, aoEscolher } = props;
  const [hoje, setHoje] = useState("");
  const [deslocamento, setDeslocamento] = useState(0);
  const [disponiveis, setDisponiveis] = useState<string[] | null>(null);

  useEffect(() => setHoje(agoraNoRio().slice(0, 10)), []);

  const mes = hoje ? deslocarMes(hoje.slice(0, 7), deslocamento) : "";

  useEffect(() => {
    if (!mes) return;
    setDisponiveis(null);
    let ativo = true;
    fetch(`/api/agenda/mes?mes=${mes}&servicos=${servicos}`)
      .then((r) => r.json())
      .then((d) => ativo && setDisponiveis(d.dias));
    return () => {
      ativo = false;
    };
  }, [mes, servicos, rodada]);

  if (!mes) return null;

  return (
    <div className={styles.calendario}>
      <div className={styles.mes}>
        <button type="button" aria-label="Mês anterior" disabled={deslocamento === 0} onClick={() => setDeslocamento(0)}>‹</button>
        <strong aria-live="polite">{nomeDoMes.format(new Date(`${mes}-15T12:00:00Z`))}</strong>
        <button type="button" aria-label="Próximo mês" disabled={deslocamento === 1} onClick={() => setDeslocamento(1)}>›</button>
      </div>

      <table>
        <thead>
          <tr>
            {SEMANA.map(([letra, nome]) => (
              <th key={nome} scope="col"><abbr title={nome}>{letra}</abbr></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {semanasDoMes(mes).map((semana, i) => (
            <tr key={i}>
              {semana.map((dia, j) => {
                if (!dia) return <td key={j} />;
                const valor = `${mes}-${String(dia).padStart(2, "0")}`;
                const livre = disponiveis?.includes(valor);
                return (
                  <td key={j}>
                    <button
                      type="button"
                      disabled={!livre}
                      aria-pressed={valor === data}
                      aria-current={valor === hoje ? "date" : undefined}
                      className={valor === data ? styles.ativo : ""}
                      onClick={() => aoEscolher(valor)}
                    >
                      {dia}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {disponiveis?.length === 0 && deslocamento === 0 && (
        <button type="button" className={styles.proximo} onClick={() => setDeslocamento(1)}>
          Sem horários neste mês. Ver o próximo ›
        </button>
      )}
    </div>
  );
}

export function TabelaHorarios(props: { horarios: string[]; hora: string; aoEscolher: (hora: string) => void }) {
  const periodos = [
    { nome: "Manhã", itens: props.horarios.filter((h) => h < "12:00") },
    { nome: "Tarde", itens: props.horarios.filter((h) => h >= "12:00" && h < "18:00") },
    { nome: "Noite", itens: props.horarios.filter((h) => h >= "18:00") },
  ].filter((p) => p.itens.length);
  const linhas = Math.max(...periodos.map((p) => p.itens.length));

  return (
    <table className={styles.tabelaHoras}>
      <thead>
        <tr>
          {periodos.map((p) => (
            <th key={p.nome} scope="col">{p.nome}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: linhas }, (_, i) => (
          <tr key={i}>
            {periodos.map((p) => {
              const h = p.itens[i];
              return (
                <td key={p.nome}>
                  {h && (
                    <button
                      type="button"
                      aria-pressed={h === props.hora}
                      className={h === props.hora ? styles.ativo : ""}
                      onClick={() => props.aoEscolher(h)}
                    >
                      {h}
                    </button>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
