# Plano de execução

Cada fase só começa quando a anterior cumprir o critério de "pronto".

## Decisões técnicas

| Tema | Decisão | Motivo |
|---|---|---|
| Base | Next.js com TypeScript, na Vercel | O pagamento precisa de servidor para guardar as chaves e receber o webhook |
| Estilo | CSS Modules com variáveis em `src/styles/` | Os recortes e colagens são muito específicos |
| Fontes | Hospedadas no próprio site | Carregam mais rápido e não dependem de terceiros |
| Animação | CSS, e a biblioteca Motion só no hero e nos elementos flutuantes | O impacto visual não pode custar lentidão no celular |
| Agenda | Própria do site, em Postgres | Pedido do usuário: tudo no site, com o horário ocupado após o pagamento |
| Pagamento | SyncPay, só Pix no lançamento | Decisão registrada em [05-pagamento-syncpay.md](05-pagamento-syncpay.md) |

## Fase 0: Material

- Resolver os itens bloqueantes de [06-pendencias.md](06-pendencias.md).
- **Pronto quando:** houver fonte de título definida, fotos originais do hero e a definição do que será pago no site.

## Fase 1: Base do projeto

1. Criar o `package.json` à mão, com o nome `yasnailart`. O nome da pasta tem espaço e maiúscula, o que o npm não aceita como nome de pacote.
2. Instalar Next.js e TypeScript.
3. Configurar `.gitignore` e `.env.example`, sem nenhuma chave real.
4. Iniciar o git.
5. Pausar a sincronização do OneDrive enquanto `node_modules` é instalado.

**Pronto quando:** a página vazia abrir localmente, sem erros.

## Fase 2: Sistema visual

1. Registrar cores, fontes, espaçamentos e raios em `src/styles/`.
2. Instalar as quatro fontes e testar acentos: `ã`, `ç`, `é`, `í`.
3. Redesenhar o padrão orgânico em SVG, com laranja no lugar do verde.
4. Criar a textura de tecido contínua, com os níveis de intensidade definidos na direção visual.
5. Tratar as flores recortadas.
6. Montar uma página interna de teste com todos os elementos juntos.

**Pronto quando:** a página de teste parecer da mesma família do post `2-post-tipografia.png`.

## Fase 3: Hero

Seguir [03-hero.md](03-hero.md), nesta ordem: 1440 px, 1024 px, 390 px, depois animação.

**Pronto quando:** a composição bater com `3-wireframe-hero.png` nas três larguras, sem texto cortado.

## Fase 4: Seções

Seguir a ordem de [04-conteudo-do-site.md](04-conteudo-do-site.md). Conteúdo editável fica em `src/content/`, nunca escrito direto nos componentes.

**Pronto quando:** a página inteira estiver navegável no computador e no celular, com conteúdo real.

## Fase 5: Pagamento

Seguir [05-pagamento-syncpay.md](05-pagamento-syncpay.md).

**Pronto quando:** um Pix real de valor baixo for pago e confirmado pelo webhook com assinatura válida, e um webhook falsificado for recusado.

## Fase 6: Revisão

1. Comparar o site renderizado com as referências e corrigir o que tiver se afastado delas.
2. Testar em 360 px, 390 px, 768 px, 1024 px e 1440 px.
3. Revisar contraste, navegação por teclado, texto alternativo e `prefers-reduced-motion`.
4. Medir desempenho no celular.
5. Testar todos os links: agendamento, WhatsApp e redes.
6. Fazer SEO local: título, descrição, imagem de compartilhamento e dados de negócio local.

**Pronto quando:** não houver falha aberta nessa lista.

## Fase 7: Publicação

Precisa da sua aprovação antes de começar.

1. Publicar na Vercel com as chaves de produção.
2. Conectar o domínio.
3. Cadastrar o webhook na SyncPay com a URL final.
4. Repetir o teste do Pix em produção.

**Pronto quando:** o site estiver no ar e o Pix de produção confirmado.
