# Combinar Car — Protótipo

Protótipo de aplicativo de corridas estilo inDrive, chamado **Combinar Car**.
**Isto é um protótipo, não um serviço real.**

## O que é simulado

- **Corridas, entregas e fretes:** frota, ofertas, contrapropostas e motoristas são
  simulados no aparelho. Não há servidor, não há motoristas reais e não há
  cobrança real.
- **Chat estilo WhatsApp:** conversa entre passageiro e motorista simulada,
  salva só no aparelho (localStorage).
- **Pagamento:** simulado, com opções dinheiro, cartão e Pix, pago diretamente
  ao motorista. Não há integração real com nenhum meio de pagamento.
- **Comissão:** 10% para motoristas filiados, conforme a regra do protótipo
  (o motorista fica com 90%). É regra de demonstração, não cobrança real.
- **Dados de demonstração:** usuários, corridas e preços de exemplo já vêm
  no código (`assets/js/app.js`, função `seed()`). Senhas de demonstração
  são `1234`. Não usar dados reais aqui.

## Como funciona no aparelho

- Wrapper Android em WebView sobre HTML/JS local (`assets/index.html` +
  `assets/js/app.js`). Pacote `br.com.marcelomonteiro.app`.
- **Mapa:** OpenStreetMap, sem chave de API
  (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`).
- **Rota:** OSRM (`router.project-osrm.org`), com rota de fallback local
  (distância em linha reta × 1,28) quando a rota online falha.
- **GPS:** `navigator.geolocation` no WebView, com permissão de localização
  do Android. Se o GPS falhar ou demorar, o app avisa em tela e usa como
  referência a Rodoviária do Plano Piloto, em Brasília.
- **Navegação externa:** os botões “Navegar no Waze” e “Navegar no Google
  Maps” aparecem no painel da corrida aceita. Eles abrem a navegação **fora**
  do app, no Waze ou no Google Maps instalado. Na v6 isso é feito pelo
  `ExternalLinksWebViewClient` (nativo, em Java), que intercepta links
  `intent://`, `waze://`, `geo:` e links https do Waze/Google Maps e lança
  um `ACTION_VIEW` externo. O GitHub **não** fornece mapa nem rota no
  aparelho: o GitHub serve só para guardar o código e para o ChatGPT, o
  Arena, o Codex e o Expo trabalharem sobre ele.
- **Decisão (23/11/2026):** o app vai ter interface do passageiro e
  interface do motorista (não de entregador) e, por isso, vai precisar de
  **navegação integrada dentro do aplicativo** — o passageiro acompanha a
  corrida e o motorista navega dentro do app. Waze e Google Maps ficam só
  como alternativa externa, se o ChatGPT coordenador justificar. A navegação
  integrada ainda não existe na v6: precisa ser desenhada pelo ChatGPT e
  construída. Para o desenvolvimento de mapa, rotas e navegação,
  provavelmente vai ser preciso o computador na nuvem do GitHub
  (Codespaces), só dentro da cota gratuita (120 horas por mês, 15 GB),
  conferindo antes de usar, sem nada pago.
- **Preços de demonstração (podem mudar):** corrida base R$ 6,00 + R$ 2,10/km
  + R$ 0,30/min; entrega base R$ 8,00 + R$ 2,50/km + R$ 0,25/min; frete base
  R$ 25,00 + R$ 4,50/km + R$ 0,50/min, com multiplicadores por tipo de carga.
  O valor de um frete de 18,3 km / 22 min **não está definido pelo usuário**
  e precisa de confirmação antes de virar regra.

## APK local — teste no navegador não é possível

Este é um **APK local**. Não dá para testar no navegador. Os testes feitos
nesta máquina cobrem só código, sintaxe, manifesto, assinatura e lógica.
O teste real de interface e de uso é no aparelho do usuário, com o APK
instalado. A entrega final para o usuário é só o **aplicativo na Expo**
(a build na Expo aguarda o login via Google na conta nameimpacto@gmail.com,
sem senha).

## Compilação futura: Expo, na nuvem

A compilação futura será via **Expo (EAS Build), na nuvem, sem precisar de
computador**. A entrega final para o usuário é só o **aplicativo na Expo**.
Atenção: o protótipo atual **não é** um app Expo/React Native —
é um WebView sobre HTML/JS local. Migrar para o Expo é uma reconstrução,
não é só trocar a ferramenta de build. O plano dessa migração é tarefa do
ChatGPT coordenador (ver conversa de coordenação “Combinar Car —
Desenvolvimento do app”): ele deve propor o caminho, com UI e UX, antes de
qualquer reescrita. O app Viver Jiu-Jítsu não é APK e não precisa de
compilação — não misturar os dois projetos.

Conta Expo: nameimpacto@gmail.com, acesso só por "Continuar com Google",
sem senha. **A build na Expo aguarda esse login via Google, não dados de
senha.** Não criar conta em nome dele e não pedir senha (não há senha Expo
para guardar). Ao entrar via Google no navegador, salvar a sessão/cookies
para não precisar fazer o login de novo — é o que o usuário pediu.

## Como testar no aparelho (v6)

1. Instalar o APK por cima da versão anterior (mesma assinatura de
   depuração desde a v2, então instala por cima da v3/v4/v5).
2. Ligar a localização do aparelho e permitir localização para o Combinar Car.
3. Abrir o app, tocar em “◎ GPS” e conferir se o mapa mostra as ruas e
   centraliza na posição real.
4. Criar uma corrida (origem e destino), fazer a oferta, aceitar a oferta do
   motorista e, no painel “Motorista a caminho”, tocar em “Navegar no Waze”
   e em “Navegar no Google Maps”. Conferir se abre o aplicativo
   correspondente — e, se ele não estiver instalado, o que acontece.
5. Testar o chat da corrida, o pagamento simulado e o cancelamento.
6. Se algo falhar, enviar captura da tela exata onde falhou.

## Histórico das versões

- **v1 (25/10/2026):** renomeação para Combinar Car, botões de navegação,
  chat estilo WhatsApp, interface atualizada. Assinatura diferente da
  original — exigia desinstalar a versão original antes.
- **v2 (25/10/2026):** pagamento simulado e comissão de 10% para motoristas
  filiados. Reassinada v1/v2/v3 com a chave de depuração.
- **v3 (25/10/2026):** targetSdk 35 (Android 15), versionCode 3. Corrige o
  bloqueio do Play Protect da v2, que era por alvo antigo (API 33).
- **v4 (25/10/2026):** mapa trocado de Carto (que passou a exigir chave de
  API, “API KEY REQUIRED”) para OpenStreetMap sem chave; botão “◎ GPS”;
  aviso em tela quando o GPS falha ou demora.
- **v5 (28/10/2026):** tentativa de abrir Waze/Google Maps por link
  `intent://` no JavaScript, com retorno para o link web em 2 segundos.
- **v6 (28/10/2026, atual):** a tentativa por `intent://` no JavaScript foi
  substituída por tratamento nativo no `ExternalLinksWebViewClient` (Java),
  que intercepta links externos e abre o Waze/Google Maps fora do WebView.
  Só o bloco de navegação do JS mudou em relação à v5; mapa, GPS, chat e
  pagamento não mudaram. Teste no aparelho segue pendente.

## Como a v6 foi montada (para reprodução)

Montagem manual por reempacotamento: `AndroidManifest.xml` (binário,
versionCode 6, versionName 6.0, targetSdk 35) + `res/` + `resources.arsc` +
`assets/` + `classes.dex` (compilado a partir de `src/`), alinhado com
`zipalign` e assinado com o keystore de depuração local. O keystore, as
senhas e os arquivos `.idsig` **não entram no repositório**. Verificação
da v6 em `VERIFICATION-v6.md`.

## Estrutura

```
AndroidManifest.xml
assets/
  index.html
  css/app.css
  js/app.js
  vendor/leaflet.js, leaflet.css
  img/app-icon.png, icon-512.png
src/br/com/marcelomonteiro/app/
  MainActivity.java
  ExternalLinksWebViewClient.java
```

## Regras de trabalho neste repositório

- Repositório próprio do Combinar Car. Nada do app Viver Jiu-Jítsu aqui.
- Nada pago: só cota gratuita (GitHub Codespaces grátis: 120 h/mês, 15 GB).
- Trabalhar em paralelo só em arquivos/áreas separadas, sem sobreposição.
- Testar tudo antes de entregar; não afirmar que funciona no aparelho sem
  teste real no aparelho.
