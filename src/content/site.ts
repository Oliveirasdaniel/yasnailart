export const contato = {
  agendamento: "#agendar",
  whatsapp: "https://wa.me/5521970645952",
  telefone: "tel:+5521970645952",
  telefoneVisivel: "(21) 97064-5952",
  instagram: "https://www.instagram.com/yasnailart._",
  mapa: "https://www.google.com/maps/search/?api=1&query=-22.9508304%2C%20-43.3772798&z=15",
};

export const horarios = [
  { dia: "Domingo", horario: "Fechado" },
  { dia: "Segunda-feira", horario: "Fechado" },
  { dia: "Terça-feira", horario: "09:00 - 20:00" },
  { dia: "Quarta-feira", horario: "09:00 - 20:00" },
  { dia: "Quinta-feira", horario: "09:00 - 20:00" },
  { dia: "Sexta-feira", horario: "09:00 - 20:00" },
  { dia: "Sábado", horario: "10:00 - 18:00" },
];

// Provisório: confirmar o valor com a Yas.
export const sinalReais = 30;

// Dia da semana (0 = domingo) e horas de abertura e fechamento.
export const funcionamento: Record<number, [number, number]> = {
  2: [9, 20],
  3: [9, 20],
  4: [9, 20],
  5: [9, 20],
  6: [10, 18],
};

export const navegacao = [
  { rotulo: "Portfólio", href: "#portfolio" },
  { rotulo: "Serviços", href: "#servicos" },
  { rotulo: "Press On", href: "#press-on" },
  { rotulo: "Contato", href: "#contato" },
];

export const portfolio = [
  { src: "agenda-17", alt: "Unhas rosa com arte em 3D" },
  { src: "agenda-05", alt: "Unhas vermelhas com listras pretas e brancas" },
  { src: "agenda-31", alt: "Unhas com espirais douradas em relevo" },
  { src: "agenda-20", alt: "Unhas com arte azul e flor cartoon" },
  { src: "agenda-36", alt: "Unhas coloridas com desenhos em cada dedo" },
  { src: "agenda-27", alt: "Unhas vermelhas e douradas" },
  { src: "agenda-45", alt: "Unhas pretas e brancas com espirais" },
  { src: "agenda-16", alt: "Unhas com céu azul e detalhes dourados" },
  { src: "agenda-46", alt: "Unhas rosa e douradas" },
  { src: "agenda-39", alt: "Unhas com pontas azuis" },
  { src: "De4eomSlnaO", alt: "Unhas pretas e vermelhas sobre arte de rosto com estrelas" },
  { src: "DepygUgFjuu", alt: "Unhas pretas, brancas e vermelhas" },
];

type Servico = { nome: string; valor: string; duracao: string; nota?: string };

const SIMPLES = "Valor fechado, apenas esmaltação simples";
const ATE_25 = "R$ 90 até 25 dias, depois R$ 95";

export const servicos: { categoria: string; itens: Servico[] }[] = [
  {
    categoria: "Alongamentos de gel",
    itens: [
      { nome: "Colocação Gel na tips", valor: "R$ 130,00", duracao: "1 h 15 min", nota: SIMPLES },
      { nome: "Colocação Soft gel", valor: "R$ 110,00", duracao: "1 h", nota: SIMPLES },
      { nome: "Colocação de Molde F1 ★", valor: "R$ 125,00", duracao: "1 h 15 min", nota: SIMPLES },
      { nome: "Colocação molde russo", valor: "R$ 135,00", duracao: "1 h 15 min", nota: "Indicado para quem tem unha roída" },
      { nome: "Nail art", valor: "Sob consulta", duracao: "30 min", nota: "Envie sua inspiração pelo WhatsApp" },
      { nome: "Remoção do gel", valor: "R$ 40,00", duracao: "30 min" },
    ],
  },
  {
    categoria: "Manutenções",
    itens: [
      { nome: "Manutenção Gel na tips", valor: "R$ 90,00", duracao: "1 h 15 min", nota: ATE_25 },
      { nome: "Manutenção Molde F1", valor: "R$ 90,00", duracao: "1 h 15 min", nota: ATE_25 },
      { nome: "Manutenção da Soft Gel", valor: "R$ 90,00", duracao: "1 h 15 min", nota: "R$ 90 até 20 dias, depois R$ 95" },
      { nome: "Manutenção molde russo", valor: "R$ 90,00", duracao: "1 h 15 min", nota: ATE_25 },
      { nome: "Nail art", valor: "Sob consulta", duracao: "35 min", nota: "Envie sua inspiração pelo WhatsApp" },
      { nome: "Reposição de unha na manutenção", valor: "R$ 10,00", duracao: "30 min", nota: "Avise no WhatsApp se for mais de uma" },
      { nome: "Reposição por unha fora da manutenção", valor: "R$ 12,50", duracao: "30 min" },
      { nome: "Troca de formato", valor: "R$ 10,00", duracao: "30 min" },
    ],
  },
  {
    categoria: "Natural em gel",
    itens: [
      { nome: "Banho de gel", valor: "R$ 90,00", duracao: "1 h", nota: "Manutenção de 15 a 25 dias, valor fixo" },
      { nome: "Esmaltação em gel", valor: "R$ 75,00", duracao: "1 h", nota: "Durabilidade de 15 a 20 dias" },
    ],
  },
  {
    categoria: "Pés",
    itens: [
      { nome: "Pedicure em gel", valor: "R$ 50,00", duracao: "1 h" },
      { nome: "Pedicure tradicional", valor: "R$ 30,00", duracao: "40 min" },
      { nome: "Reconstrução por unha do pé", valor: "R$ 15,00", duracao: "30 min" },
      { nome: "Reconstrução pé completo", valor: "R$ 80,00", duracao: "1 h 15 min" },
      { nome: "Pedicure em gel + francesinha", valor: "R$ 55,00", duracao: "1 h" },
      { nome: "Pedicure em gel + nail art", valor: "R$ 70,00", duracao: "30 min" },
      { nome: "Pedicure tradicional + francesinha", valor: "R$ 35,00", duracao: "30 min" },
    ],
  },
];
