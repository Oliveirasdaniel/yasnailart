# Pagamento com SyncPay

## Decisão

SyncPay, só com Pix no lançamento. O provedor fica isolado em `src/lib/pagamentos/`, para ser trocado sem mexer nas telas.

| Critério | SyncPay |
|---|---|
| Custo por Pix | R$ 0,75 |
| Custo no cartão | 4,20% + R$ 1,49, com reserva de 10% a 30% por 90 a 180 dias. Fica fora do lançamento |
| Cadastro | Aceita CPF ou CNPJ |
| Ambiente de testes | Não encontrado: testar com Pix real de valor baixo |

Se o cartão for indispensável, a Asaas é a alternativa: R$ 0,49 + 2,99% à vista.

**O que é cobrado:** um sinal por agendamento, definido em `sinalReais` (`src/content/site.ts`). O agendamento é todo no site: o horário fica reservado por 15 minutos e só é confirmado pelo webhook.

**Webhook:** cadastrar na conta com `POST /webhooks`, evento `transaction`. O campo `webhook_url` da cobrança usa o formato antigo, sem assinatura, e não é usado.

**IP:** a documentação diz que IP e chave precisam ser autorizados. Confirmar com a SyncPay como isso funciona na Vercel.

**Campo de ligação:** o webhook é ligado à reserva por `transaction.reference_id` ou pelo código Pix. Confirmar no primeiro Pix real.

## Fluxo

1. A cliente escolhe o que vai pagar e informa seus dados.
2. O site chama `src/app/api/agenda/reservas/` no servidor.
3. O servidor define o valor. O navegador nunca escolhe o preço.
4. O servidor autentica na SyncPay e cria a cobrança.
5. A página mostra o QR Code e o Pix copia e cola.
6. A SyncPay avisa `src/app/api/pagamentos/webhook/`.
7. O servidor valida a assinatura e o status.
8. A tela mostra a confirmação e a Yas é avisada.

## API

Base: `https://api.syncpayments.com.br/api/partner/v1`

| Chamada | Uso |
|---|---|
| `POST /auth-token` | Troca `client_id` e `client_secret` por um token de 3600 segundos, que deve ser reaproveitado até expirar |
| `POST /cash-in` | Cria a cobrança, retorna `pix_code` e `identifier` |
| `GET /transaction/{identifier}` | Consulta o status |
| `POST /webhooks` | Cadastra o webhook, retorna o segredo `token` uma única vez |
| `POST /webhooks/{webhook}/rotate-secret` | Gera um novo segredo |

Eventos: `transaction.created` e `transaction.updated`, no evento `transaction`.

## Regras de segurança do webhook

1. Ler o corpo bruto, antes de qualquer conversão.
2. Ler o header `X-SyncPay-Signature`, no formato `t=<unix>,v1=<hex>`.
3. Calcular HMAC-SHA256 de `{t}.{corpo bruto}`.
4. Comparar as assinaturas em tempo constante.
5. Recusar diferença de horário acima de 300 segundos.
6. Eliminar repetição por `event_id`, nunca por `X-SyncPay-Delivery`.
7. Ordenar eventos por `occurred_at`.
8. Liberar o pedido somente com status `completed`.
9. Tratar `refunding`, `refunded`, `chargeback` e `med` como cancelamento ou suspensão.
10. Responder 2xx depois de processar.

A documentação chama o `token` de segredo de assinatura, mas não diz de forma explícita que ele é a chave do HMAC. Confirmar no primeiro teste.

## Dados e chaves

- O webhook traz CPF em texto claro em `customer.document`: nunca registrar esse campo em log.
- Guardar só o necessário para o pedido e informar isso na política de privacidade.
- Variáveis de ambiente: `SYNCPAY_CLIENT_ID`, `SYNCPAY_CLIENT_SECRET`, `SYNCPAY_WEBHOOK_SECRET`.
- Nenhuma chave vai para o navegador nem para o git.

## Cuidados com a conta

- Sacar com frequência, porque os termos permitem reter o saldo por até 180 dias em caso de suspeita.
- No envio de Press On, guardar o rastreio. Os termos citam falta de rastreio válido como motivo de bloqueio.
- Confirmar quem é a instituição parceira: os termos não a citam.

## Testes obrigatórios

1. Pix real de valor baixo pago até a confirmação.
2. Webhook com assinatura errada recusado.
3. Webhook com horário antigo recusado.
4. Mesmo `event_id` recebido duas vezes, processado uma vez.
5. Cobrança expirada sem liberar pedido.
6. Valor alterado no navegador sem efeito.
