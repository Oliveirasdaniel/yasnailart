import { mkdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { Pool } from "pg";

type Resultado<T> = { rows: T[] };
type Banco = { query<T>(sql: string, params?: unknown[]): Promise<Resultado<T>> };

// O índice de exclusão garante no banco que dois horários ativos nunca se sobrepõem.
const ESQUEMA = [
  `CREATE TABLE IF NOT EXISTS reservas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    servico_id text NOT NULL,
    servico_nome text NOT NULL,
    periodo tsrange NOT NULL,
    nome text NOT NULL,
    telefone text NOT NULL,
    status text NOT NULL DEFAULT 'pendente',
    expira_em timestamptz NOT NULL,
    pix_code text,
    transacao_id text,
    pago_em timestamptz,
    criado_em timestamptz NOT NULL DEFAULT now(),
    EXCLUDE USING gist (periodo WITH &&) WHERE (status IN ('pendente', 'confirmada'))
  )`,
  `ALTER TABLE reservas ADD COLUMN IF NOT EXISTS valor_total numeric NOT NULL DEFAULT 0`,
  `ALTER TABLE reservas ADD COLUMN IF NOT EXISTS sinal numeric NOT NULL DEFAULT 0`,
  `ALTER TABLE reservas ADD COLUMN IF NOT EXISTS atendimento text`,
  `CREATE TABLE IF NOT EXISTS lancamentos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    data date NOT NULL,
    tipo text NOT NULL,
    categoria text NOT NULL,
    descricao text NOT NULL DEFAULT '',
    valor numeric NOT NULL,
    forma text NOT NULL DEFAULT 'Pix',
    reserva_id uuid,
    criado_em timestamptz NOT NULL DEFAULT now(),
    UNIQUE (reserva_id, categoria)
  )`,
  `CREATE TABLE IF NOT EXISTS eventos_webhook (
    event_id text PRIMARY KEY,
    recebido_em timestamptz NOT NULL DEFAULT now()
  )`,
];

const global_ = globalThis as unknown as { bancoPronto?: Promise<Banco> };

async function iniciar(): Promise<Banco> {
  if (!process.env.DATABASE_URL) mkdirSync(".dados", { recursive: true });
  const banco: Banco = process.env.DATABASE_URL
    ? (new Pool({ connectionString: process.env.DATABASE_URL }) as unknown as Banco)
    : (new PGlite(".dados/agenda") as unknown as Banco);
  for (const comando of ESQUEMA) await banco.query(comando);
  return banco;
}

export function banco() {
  global_.bancoPronto ??= iniciar();
  return global_.bancoPronto;
}
