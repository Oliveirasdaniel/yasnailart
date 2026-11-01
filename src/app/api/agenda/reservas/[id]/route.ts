import { statusDaReserva } from "@/lib/agenda/agenda";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return Response.json({ status: null }, { status: 404 });
  return Response.json({ status: await statusDaReserva(id) });
}
