# Direção visual

## Conceito

**O feed da Yas virou um site.** A referência principal é o post dela "um artista é uma criança que insistiu" (`referencias/2-post-tipografia.png`): cartaz em creme, degradê que explode no centro, mistura de fontes e colagem.

O estilo trap entra pela atitude do feed: fotos escuras com luz vermelha e neon, estrelas Y2K, meio-tom (retícula), adesivos e frases com humor. As flores entram como adesivos gigantes por cima de tudo.

## Trava de referência

| Item | Definição |
|---|---|
| Base | O post dela: paleta, mistura de fontes e degradê radial |
| Preservar | Título tratado como imagem, degradê laranja e pink, colagem sobreposta, flores gigantes, textura em tudo |
| Pegar de The Pop Manifesto | Faixas de cor cheia separando as seções, foto como conteúdo principal |
| Pegar de Cassette | Grão como assinatura, botões em pílula com cara de adesivo |
| Pegar de GT America | Sobreposição de colagem controlada, tipografia em escala de cartaz |
| Pegar de Fresha | Serviços por categoria com abas: só a organização, não o visual |
| Rejeitar | Verde, layout de salão "clean", dourado e branco, cards iguais em grade, sombra suave de SaaS, bege elegante |

## Cores

Valores medidos nos arquivos de referência. Bubblegum vem da imagem 1, todo o resto vem da imagem 2.

| Nome | Hex | Origem | Papel |
|---|---|---|---|
| Bubblegum | `#F6B4CE` | Imagem 1 | Base do padrão orgânico e fundos de seção |
| Laranja | `#FE520F` | Centro do degradê | Par do Bubblegum no padrão, formas e destaques |
| Creme | `#FFF6D7` | Fundo do post | Fundo principal e texto sobre ameixa |
| Ameixa | `#533746` | "artista" | Texto, botão principal e seção escura do portfólio |
| Pink | `#FC78AC` | "UM" | Palavras de apoio grandes |
| Pink forte | `#EC4884` | "QUE" | Palavras de apoio grandes |
| Carmim | `#DC0454` | "criança" | Só na palavra em script |

**Degradê:** centro `#FE520F`, depois `#FE6458`, `#FE7BA5`, até sumir no creme.

### Contraste

| Combinação | Razão | Uso permitido |
|---|---|---|
| Ameixa e Creme | 9,69:1 | Qualquer texto |
| Ameixa e Bubblegum | 6,16:1 | Qualquer texto |
| Ameixa sobre Laranja | 3,21:1 | Só texto grande |
| Creme sobre Laranja | 3,02:1 | Só texto grande |
| Bubblegum e Laranja | 1,92:1 | Nunca para texto: só padrão decorativo |

O botão principal é ameixa com texto creme. Laranja nunca recebe texto pequeno.

## Fontes

Comparação visual em `referencias/6-teste-de-fontes.png`.

| Papel | No post | Fonte | Situação |
|---|---|---|---|
| Título gigante | "artista", "insistiu" | **A identificar** | Bloqueante, ver abaixo |
| Apoio largo | "UM", "QUE" | Archivo Black expandida | Muito próxima |
| Apoio serifado | "É UMA" | Caprasimo | Muito próxima |
| Script | "criança" | Playball | Próxima |
| Texto corrido | Não aparece | Archivo regular | Decisão para manter a leitura |

**Fonte do título:** é a alma do post, com `t` e `s` longos e cortes de estêncil. Cerca de 90 fontes do Google Fonts foram testadas sem semelhança real. O WhatTheFont também não achou a fonte exata: seu primeiro resultado, a paga Bold Galde, é apenas aproximado.

Caminho, em ordem de preferência:

1. A Yas informa a fonte usada no post, e confirmamos a licença para uso em site.
2. Se a fonte for de uso restrito, os títulos fixos viram arte vetorial exportada, com o texto real mantido para leitores de tela e buscadores.
3. Sem resposta, usar Galindo apenas como provisória. Ela aparece no teste e perde boa parte da personalidade.

## Padrão orgânico

Baseado em `referencias/1-padrao-organico.png`.

- Redesenhar em SVG, sem usar a imagem original.
- Trocar o verde Moss por Laranja e manter o Bubblegum.
- Usar em divisórias, bordas de seção e fundo de faixas.
- Manter grão fino por cima, como no original.
- Nunca colocar texto pequeno diretamente sobre as duas cores.

## Flores

Baseado em `referencias/4-flores.png`.

- Hibisco, plumeria e lírio em aquarela, recortados com borda clara de adesivo.
- Sempre grandes, entrando pelas bordas das seções e sobrepondo fotos.
- Leve movimento ao rolar a página, desligado em `prefers-reduced-motion`.
- As flores da imagem 4 são só referência: a origem é desconhecida, então não serão recortadas para o site.

## Textura de tecido

Uma trama contínua em `public/texturas/`, aplicada por cima das imagens, sem alterar os arquivos originais.

| Onde | Intensidade | Motivo |
|---|---|---|
| Hero, flores e formas | Forte | É onde a textura vira identidade |
| Galeria do portfólio | Leve | Não pode esconder o detalhe da unha |
| Foto ampliada | Desligada | Quem amplia quer ver o trabalho |

## Rastreabilidade

| Decisão | Origem |
|---|---|
| Paleta sem verde, laranja com Bubblegum | Seu pedido |
| Mistura de fontes | Seu pedido e post da Yas |
| Layout do hero | Imagem 3 |
| Textura de tecido | Seu pedido |
| Flores e adesivos | Seu pedido e imagem 4 |
| Seção escura no portfólio | Fotos do feed, que são escuras e com luz neon |
| Estrelas, retícula e frases | Feed da Yas |
| Abas de serviços | Estrutura real da agenda dela e padrão do Fresha |

## Posicionamento (enviado pelo usuário)

Marca Y2K / Urban Tropical para público jovem: nail art como cultura, arte, autoexpressão e libertação ("NAIL ART É CULTURA").

- Visual: fontes líquidas, sparkles, câmeras digitais antigas, colagem scrapbook, hibiscos e lírios, verão carioca.
- A descrição cita amarelo solar e serif editorial imponente: não fazem parte da paleta e das fontes travadas até haver decisão.
- Trabalho: 3D em gel, metálicos dourados e prateados, chrome, pedrarias, animal print, estrelas, aura; formatos stiletto, almond e coffin.
