import { diasDisponiveis } from "@/lib/agenda/agenda";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mes = searchParams.get("mes") ?? "";
  if (!/^\d{4}-\d{2}$/.test(mes)) return Response.json({ dias: [] });
  return Response.json({ dias: await diasDisponiveis(mes, (searchParams.get("servicos") ?? "").split(",").filter(Boolean)) });
}
