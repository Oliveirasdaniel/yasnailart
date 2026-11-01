import { HorarioIndisponivel, criarReserva } from "@/lib/agenda/agenda";

export async function POST(request: Request) {
  const { servicoIds, extras = [], data, hora, nome, telefone } = await request.json();
  const digitos = String(telefone ?? "").replace(/\D/g, "");
  if (
    !Array.isArray(servicoIds) ||
    !Array.isArray(extras) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(data) ||
    !/^\d{2}:\d{2}$/.test(hora) ||
    String(nome ?? "").trim().length < 2 ||
    !/^\d{10,11}$/.test(digitos)
  ) {
    return Response.json({ erro: "Confira seu nome e telefone." }, { status: 422 });
  }

  try {
    return Response.json(await criarReserva({ servicoIds, extras, data, hora, nome: nome.trim(), telefone: digitos }));
  } catch (erro) {
    if (erro instanceof HorarioIndisponivel) {
      return Response.json({ erro: "Esse horário acabou de ser reservado. Escolha outro." }, { status: 409 });
    }
    console.error("Falha ao criar reserva:", (erro as Error).message);
    return Response.json({ erro: "Não foi possível gerar o Pix. Tente de novo." }, { status: 502 });
  }
}
