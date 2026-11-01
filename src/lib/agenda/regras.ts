import { catalogoNailArt, funcionamento, servicos } from "@/content/site";

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

export type Extra = [string, number];

export const MINUTOS_NAIL_ART = 30;
export const LIMITE_QUANTIDADE = { fixo: 1, unha: 10, peca: 20 };

export const itensDoCatalogo = catalogoNailArt.flatMap((grupo) =>
  grupo.itens.map((item) => ({ ...item, nivel: grupo.nivel, id: paraId(`${grupo.nivel} ${item.nome}`) })),
);

const reais = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function rotuloDoExtra(item: (typeof itensDoCatalogo)[number]) {
  const valor = reais.format(item.preco);
  if (item.aPartirDe) return `a partir de ${valor}`;
  return item.unidade === "fixo" ? `+ ${valor}` : `+ ${valor} ${item.unidade === "unha" ? "por unha" : "cada"}`;
}

export function codificarExtras(extras: Extra[]) {
  return extras.map(([id, quantidade]) => `${id}:${quantidade}`).join(",");
}

export function lerExtras(texto: string | null): Extra[] {
  return (texto ?? "")
    .split(",")
    .filter(Boolean)
    .map((parte) => {
      const [id, quantidade] = parte.split(":");
      return [id, Number(quantidade)];
    });
}

export function combinarServicos(ids: string[], extras: Extra[] = []) {
  const itens = [...new Set(ids)].map(acharServico);
  if (!itens.length || itens.some((s) => !s)) return null;
  const validos = itens as NonNullable<(typeof itens)[number]>[];

  const artes = extras.map(([id, quantidade]) => {
    const item = itensDoCatalogo.find((i) => i.id === id);
    const valido = item && Number.isInteger(quantidade) && quantidade >= 1 && quantidade <= LIMITE_QUANTIDADE[item.unidade];
    return valido ? { item, quantidade } : null;
  });
  if (artes.some((a) => !a) || new Set(extras.map(([id]) => id)).size !== extras.length) return null;
  const artesValidas = artes as NonNullable<(typeof artes)[number]>[];

  return {
    ids: validos.map((s) => s.id),
    nome: [
      ...validos.map((s) => s.nome),
      ...artesValidas.map((a) => (a.item.unidade === "fixo" ? a.item.nome : `${a.item.nome} x${a.quantidade}`)),
    ].join(" + "),
    minutos: validos.reduce((total, s) => total + s.minutos, 0) + (artesValidas.length ? MINUTOS_NAIL_ART : 0),
    preco:
      validos.reduce((total, s) => total + s.preco, 0) +
      artesValidas.reduce((total, a) => total + a.item.preco * a.quantidade, 0),
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
