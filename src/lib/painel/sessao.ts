import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "painel";
const VALIDADE_SEGUNDOS = 12 * 60 * 60;

function iguais(a: string, b: string) {
  const x = createHash("sha256").update(a).digest();
  const y = createHash("sha256").update(b).digest();
  return timingSafeEqual(x, y);
}

function assinar(expira: string, senha: string) {
  return createHmac("sha256", senha).update(`painel.${expira}`).digest("hex");
}

export function senhaCorreta(tentativa: string) {
  const senha = process.env.ADMIN_SENHA;
  return !!senha && iguais(tentativa, senha);
}

export async function abrirSessao() {
  const expira = String(Math.floor(Date.now() / 1000) + VALIDADE_SEGUNDOS);
  (await cookies()).set(COOKIE, `${expira}.${assinar(expira, process.env.ADMIN_SENHA!)}`, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: VALIDADE_SEGUNDOS,
    path: "/",
  });
}

export async function fecharSessao() {
  (await cookies()).delete(COOKIE);
}

export async function sessaoValida() {
  const senha = process.env.ADMIN_SENHA;
  const [expira, assinatura] = ((await cookies()).get(COOKIE)?.value ?? "").split(".");
  if (!senha || !expira || !assinatura || Number(expira) < Date.now() / 1000) return false;
  return iguais(assinatura, assinar(expira, senha));
}
