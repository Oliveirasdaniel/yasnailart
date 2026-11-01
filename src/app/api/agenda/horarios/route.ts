import { horariosLivres } from "@/lib/agenda/agenda";
import { lerExtras } from "@/lib/agenda/regras";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const data = searchParams.get("data") ?? "";
  const servicos = (searchParams.get("servicos") ?? "").split(",").filter(Boolean);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return Response.json({ horarios: [] });
  return Response.json({ horarios: await horariosLivres(data, servicos, lerExtras(searchParams.get("extras"))) });
}
