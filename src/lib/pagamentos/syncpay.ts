import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

const BASE = "https://api.syncpayments.com.br/api/partner/v1";
const TOLERANCIA_SEGUNDOS = 300;

const cache: { token?: string; expiraEm?: number } = {};

async function token() {
  if (cache.token && cache.expiraEm! > Date.now() + 60_000) return cache.token;
  const resposta = await fetch(`${BASE}/auth-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: process.env.SYNCPAY_CLIENT_ID,
      client_secret: process.env.SYNCPAY_CLIENT_SECRET,
    }),
  });
  if (!resposta.ok) throw new Error(`SyncPay auth-token: ${resposta.status}`);
  const dados = (await resposta.json()) as { access_token: string; expires_in: number };
  cache.token = dados.access_token;
  cache.expiraEm = Date.now() + dados.expires_in * 1000;
  return cache.token;
}

export async function criarCobrancaPix(valor: number, descricao: string) {
  // Sem credenciais, o ambiente local simula a cobrança; em produção isso nunca acontece.
  if (!process.env.SYNCPAY_CLIENT_ID && process.env.NODE_ENV !== "production") {
    const id = randomUUID();
    return { pixCode: `PIX-SIMULADO-${id}`, identificador: id };
  }

  const resposta = await fetch(`${BASE}/cash-in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${await token()}`,
    },
    body: JSON.stringify({ amount: valor, description: descricao }),
  });
  if (!resposta.ok) throw new Error(`SyncPay cash-in: ${resposta.status}`);
  const dados = (await resposta.json()) as { pix_code: string; identifier: string };
  return { pixCode: dados.pix_code, identificador: dados.identifier };
}

export function assinaturaValida(corpo: string, cabecalho: string | null) {
  const segredo = process.env.SYNCPAY_WEBHOOK_SECRET;
  if (!segredo || !cabecalho) return false;

  const partes = Object.fromEntries(cabecalho.split(",").map((p) => p.trim().split("=") as [string, string]));
  const t = Number(partes.t);
  if (!partes.v1 || !t || Math.abs(Date.now() / 1000 - t) > TOLERANCIA_SEGUNDOS) return false;

  const esperada = Buffer.from(createHmac("sha256", segredo).update(`${partes.t}.${corpo}`).digest("hex"));
  const recebida = Buffer.from(partes.v1);
  return esperada.length === recebida.length && timingSafeEqual(esperada, recebida);
}
