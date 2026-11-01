# Yas Nail Art: site

Site da nail artist Yas Sampaio ([@yasnailart._](https://www.instagram.com/yasnailart._), Jacarepaguá, RJ).

**Status:** planejamento concluído. Nenhum código foi escrito.

## Por onde começar

| Arquivo | O que tem |
|---|---|
| [docs/01-plano-de-execucao.md](docs/01-plano-de-execucao.md) | As fases do trabalho, em ordem, e quando cada uma termina |
| [docs/02-direcao-visual.md](docs/02-direcao-visual.md) | Cores, fontes, padrão orgânico, flores e textura |
| [docs/03-hero.md](docs/03-hero.md) | Montagem do hero, tile por tile |
| [docs/04-conteudo-do-site.md](docs/04-conteudo-do-site.md) | Seções, serviços, preços e links reais |
| [docs/05-pagamento-syncpay.md](docs/05-pagamento-syncpay.md) | Fluxo do Pix e regras de segurança |
| [docs/06-pendencias.md](docs/06-pendencias.md) | O que falta decidir ou enviar |

## Pastas

```text
Yasmin nail/
├── docs/                      Plano do projeto
│   └── referencias/           Imagens de referência (não vão para o site)
├── assets-brutos/             Material original, sem tratamento
│   ├── fotos-portfolio/       Fotos dos trabalhos
│   ├── fotos-yas/             Fotos da Yas e do estúdio
│   ├── flores/                Flores recortadas
│   ├── logo/                  Logo
│   └── fontes/                Arquivos de fonte licenciados
├── public/                    Arquivos finais, otimizados, servidos pelo site
│   ├── images/                hero, portfolio, press-on, estudio
│   ├── flores/                Flores em WebP com transparência
│   ├── texturas/              Textura de tecido
│   └── fonts/                 Fontes hospedadas no site
└── src/                       Código (vazio até a Fase 1)
    ├── app/                   Página e rotas
    │   └── api/pagamentos/    pix/ cria a cobrança, webhook/ recebe a confirmação
    ├── components/            hero/, secoes/, ui/
    ├── content/               Serviços, preços, textos e links
    ├── lib/pagamentos/        Integração SyncPay isolada
    └── styles/                Cores, fontes e estilos globais
```

Regra das imagens: o original entra em `assets-brutos/`, a versão otimizada vai para `public/`.
