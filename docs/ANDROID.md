# App Android (Capacitor)

O app Android é o mesmo site empacotado com o [Capacitor](https://capacitorjs.com). A pasta `android/` é o projeto nativo; o conteúdo web vem de `dist/` a cada `cap sync`.

## Gerar o APK de teste
Requisitos: Node, Java 21 e o Android SDK (`ANDROID_HOME`).

```bash
npm run android:apk
# resultado: android/app/build/outputs/apk/debug/app-debug.apk
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

## Publicar na Play Store (futuro)
Falta: chave de assinatura (`release`), ícones finais, `versionCode` em `android/app/build.gradle`, política de privacidade e a ficha "Família" da Play Store (app para crianças).
