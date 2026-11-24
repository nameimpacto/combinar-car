# Verificação da v6 — 2026-11-23

Arquivo verificado:
`~/workspace/goals/combinar-car-prototype/files/Combinar-Car-v6.apk`
(1,2 MB, 2026-10-28 02:00, SHA-256 `708d459178c29e98…`, completo no relatório do coordenador)

## Manifesto (binário, lido do APK)

- Pacote: `br.com.marcelomonteiro.app`
- versionCode: **6**, versionName: **6.0** (bytes 664 e 1868; único diff do
  manifesto v5 → v6)
- targetSdk: **35** (bytes 1908, 1968, 2064 = 0x23, iguais aos da v5)
- Permissões (iguais às da v5): `ACCESS_COARSE_LOCATION`,
  `ACCESS_FINE_LOCATION`, `ACCESS_NETWORK_STATE`, `INTERNET`, `VIBRATE`

## Assinatura

- Certificado: `CN=Android Debug, O=Android, C=US`, autoassinado,
  válido de 25/10/2026 a 12/03/2054.
- SHA-256 do certificado: `9D:06:BA:D5:37:C4:8F:2E:34:93:7D:6E:94:05:10:BE:3C:3D:42:0F:D5:7D:ED:C0:A9:9B:71:A8:3D:2D:F1:9B`
  — **o mesmo certificado de depuração da v2, v3, v4 e v5**, portanto a v6
  instala por cima da v5 sem desinstalar.
- `apksigner verify` (esquemas v1/v2/v3) e `zipalign -c`: **verificados em
  24/11/2026, após reinstalação das ferramentas na VM** (apksigner 0.9,
  zipalign, OpenJDK 21): `apksigner verify --verbose` — v1 true, v2 true,
  v3 true, v4 false, 1 signatário, certificado SHA-256
  `9D:06:BA:D5:…:F1:9B` (o mesmo da v2–v5); `zipalign -c -v 4` —
  "Verification successful". Verificação alternativa feita antes em Python
  (entradas não comprimidas alinhadas em múltiplos de 4 bytes; certificado
  extraído do `META-INF/ANDROIDD.RSA`) bateu com o resultado do apksigner.

## Conteúdo do APK × código-fonte em `v6/`

Byte a byte idênticos: `AndroidManifest.xml`, `assets/js/app.js`,
`assets/index.html`, `assets/css/app.css`, `assets/vendor/leaflet.*`,
`assets/img/*` e `classes.dex`.
SHA-256 no APK: `app.js 6b6b977e8d212658…`, `classes.dex d546666f6829d478…`,
`AndroidManifest.xml 6f2851838324245e…`.

## O que mudou da v5 para a v6

- **Só o bloco de navegação do JS** (`assets/js/app.js`, função `openNav`):
  removidos os links `intent://` da v5; volta ao link https simples
  (`waze.com/ul`, `google.com/maps/dir`) aberto por `openExternal`.
- **Novo código nativo:** `src/.../ExternalLinksWebViewClient.java` —
  intercepta `intent://`, `waze://`, `geo:` e https do Waze/Google Maps e
  lança `ACTION_VIEW` externo. O `classes.dex` do APK contém a classe
  (`ExternalLinksWebViewClient`, `shouldOverrideUrlLoading`,
  `android.intent.action.VIEW`, `handleIntentUrl`). O dex da v5 não
  continha nada disso.
- **Nada mais mudou:** `index.html`, `app.css`, Leaflet, ícones e manifesto
  (exceto versão) são idênticos aos da v5. Mapa (OpenStreetMap), GPS,
  chat e pagamento simulado não mudaram.
- **JS:** `node --check` OK.

## Não verificado (não afirmar)

- Funcionamento no aparelho do usuário (teste pendente desde 28/10; ele
  relatou erro ao clicar no APK para baixar e disse que testaria depois).
- Abertura real do app do Waze/Google Maps no aparelho (depende do WebView
  do aparelho tratar os links; o código nativo da v6 foi feito para isso,
  mas não foi testado no aparelho).
- Recompilação do `classes.dex` a partir de `src/` (ferramentas Android
  indisponíveis na VM nesta verificação; conferido por strings do dex).
