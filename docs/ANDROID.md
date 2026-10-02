# App Android (Capacitor)

O app Android é o mesmo site empacotado com o [Capacitor](https://capacitorjs.com). A pasta `android/` é o projeto nativo; o conteúdo web vem de `dist/` a cada `cap sync`.

## Gerar o APK de teste
Requisitos: Node, Java 21 e o Android SDK (`ANDROID_HOME`).

```bash
npm run android:apk
# resultado: android/app/build/outputs/apk/debug/app-debug.apk
# a versão vem do package.json (0.6.0 → versionCode 600)
```

`npm run android:sync` só atualiza o conteúdo web dentro do projeto Android (para abrir no Android Studio).

## Instalar no aparelho
1. Copie o `app-debug.apk` para o celular/tablet (Drive, WhatsApp, cabo).
2. Toque no arquivo e permita "instalar apps desta fonte" quando o Android pedir.
3. Abra **Aprender & Brincar**.

## Modo criança no app
Ligado por padrão; liga e desliga na Área da Família.

- **Fixa o app na tela** ao abrir (fixação de tela do Android): Início e Recentes deixam de funcionar. Na primeira vez o Android pode mostrar um aviso "App fixado".
- **Tela cheia imersiva**: as barras do sistema somem e só aparecem com um deslize da borda, sumindo de novo.
- **Voltar** não faz nada; a tela não apaga enquanto ela brinca.
- **Liberar**: Área da Família → "Liberar o aparelho agora". Emergência: segurar **Voltar + Recentes** (ou, com navegação por gestos, deslizar para cima e segurar).
- Recomendado: em Configurações → Segurança → Fixar app, ligar **"Pedir PIN para liberar"**. Assim, mesmo o atalho de emergência pede a senha do aparelho.

## Código nativo
- `android/app/src/main/java/br/app/aprenderebrincar/KidLockPlugin.java`: `lock`, `unlock`, `getStatus` (fixação de tela).
- `android/app/src/main/java/br/app/aprenderebrincar/MainActivity.java`: tela cheia imersiva, tela sempre acesa e botão Voltar.
- `src/core/kid-lock.js`: no app usa o plugin; no navegador usa tela cheia, botão ▶ de volta e as travas da web.

## Atualizações pelo GitHub
O app se atualiza sozinho pelos *releases* do repositório (`.github/workflows/release.yml`).

**Publicar uma versão nova**
1. Suba o número em `package.json` (`"version": "0.6.1"`).
2. Envie para a `main` e crie a tag: `git tag v0.6.1 && git push origin v0.6.1`.
3. O GitHub gera e publica: `update.json`, `web-0.6.1.zip` (conteúdo) e `aprender-e-brincar.apk`.

**No aparelho** (`src/core/app-update.js`)
- Ao abrir (no máximo a cada 6 h), o app lê o último release.
- **Conteúdo** (brincadeiras, falas, imagens, correções): se a parte nativa é a mesma, baixa o zip em segundo plano e aplica na próxima vez que o app abrir. A criança não vê nada.
- **Parte nativa mudou** (Java, plugins, `capacitor.config.json`, gradle): a impressão digital (`scripts/native-fingerprint.mjs`) muda; o conteúdo novo não é aplicado e a Área da Família mostra **"Baixar e instalar o app novo"**, que libera a trava e abre o APK no navegador.
- Se uma atualização de conteúdo travar ao abrir, o plugin volta sozinho para a versão anterior.
- Nada é enviado para fora: os endereços de estatística do plugin (Capgo) estão desligados em `capacitor.config.json`.

**Assinatura** — todo APK publicado precisa da mesma chave, senão não instala por cima. Ela fica nos segredos do repositório (Settings → Secrets and variables → Actions): `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`. Sem eles o release sai só com o conteúdo. Guarde uma cópia da chave fora do GitHub.

O APK de teste gerado antes desta configuração usa outra chave: desinstale-o uma vez antes de instalar o do release.

## Publicar na Play Store (futuro)
Falta: ícones finais, política de privacidade, gerar `.aab` (`./gradlew bundleRelease`) e a ficha "Família" da Play Store (app para crianças).
