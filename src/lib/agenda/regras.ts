import { funcionamento, servicos } from "@/content/site";

export const INTERVALO_MINUTOS = 30;

function paraId(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function paraMinutos(duracao: string) {
  const horas = duracao.match(/(\d+) h/)?.[1] ?? "0";
  const minutos = duracao.match(/(\d+) min/)?.[1] ?? "0";
  return Number(horas) * 60 + Number(minutos);
}

export function idDoServico(categoria: string, nome: string) {
  return paraId(`${categoria} ${nome}`);
}

export const servicosAgendaveis = servicos.map((grupo) => ({
  categoria: grupo.categoria,
  itens: grupo.itens
    .filter((item) => item.valor !== "Sob consulta")
    .map((item) => ({
      id: idDoServico(grupo.categoria, item.nome),
      nome: item.nome,
      valor: item.valor,
      duracao: item.duracao,
      minutos: paraMinutos(item.duracao),
      preco: Number(item.valor.replace(/[^\d,]/g, "").replace(",", ".")),
    })),
}));

export function acharServico(id: string) {
  return servicosAgendaveis.flatMap((g) => g.itens).find((s) => s.id === id);
}

export function combinarServicos(ids: string[]) {
  const itens = [...new Set(ids)].map(acharServico);
  if (!itens.length || itens.some((s) => !s)) return null;
  const validos = itens as NonNullable<(typeof itens)[number]>[];
  return {
    ids: validos.map((s) => s.id),
    nome: validos.map((s) => s.nome).join(" + "),
    minutos: validos.reduce((total, s) => total + s.minutos, 0),
    preco: validos.reduce((total, s) => total + s.preco, 0),
  };
}

export function formatarDuracao(minutos: number) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return [h && `${h} h`, m && `${m} min`].filter(Boolean).join(" ");
}

export function agoraNoRio() {
  return new Date().toLocaleString("sv-SE", { timeZone: "America/Sao_Paulo" }).replace(" ", "T");
}

export function diaDaSemana(data: string) {
  return new Date(`${data}T12:00:00Z`).getUTCDay();
}

export function minutosParaHora(total: number) {
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

// Abre o mês atual e o seguinte.
export function ultimoDiaReservavel() {
  const [ano, mes] = agoraNoRio().split("-").map(Number);
  return new Date(Date.UTC(ano, mes + 1, 0)).toISOString().slice(0, 10);
}
