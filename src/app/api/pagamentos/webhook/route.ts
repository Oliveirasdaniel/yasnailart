import { confirmarPagamento, liberarReserva } from "@/lib/agenda/agenda";
import { banco } from "@/lib/db";
import { assinaturaValida } from "@/lib/pagamentos/syncpay";

const LIBERAM: Record<string, string> = {
  failed: "expirada",
  refused: "expirada",
  three_ds_failed: "expirada",
  refunded: "cancelada",
  chargeback: "cancelada",
};

type Evento = {
  event_id: string;
  transaction?: { reference_id: string; status: string };
  payment?: { pix?: { code?: string } | null } | null;
};

export async function POST(request: Request) {
  const corpo = await request.text();
  if (!assinaturaValida(corpo, request.headers.get("x-syncpay-signature"))) {
    return new Response("assinatura inválida", { status: 401 });
  }

  const evento = JSON.parse(corpo) as Evento;
  const db = await banco();
  const { rows } = await db.query(`SELECT 1 FROM eventos_webhook WHERE event_id = $1`, [evento.event_id]);
  if (rows.length || !evento.transaction) return new Response("ok");

  const { reference_id: id, status } = evento.transaction;
  const pixCode = evento.payment?.pix?.code ?? null;
  if (status === "completed") await confirmarPagamento(id, pixCode);
  else if (LIBERAM[status]) await liberarReserva(id, pixCode, LIBERAM[status]);

  await db.query(`INSERT INTO eventos_webhook (event_id) VALUES ($1) ON CONFLICT DO NOTHING`, [evento.event_id]);
  return new Response("ok");
}
