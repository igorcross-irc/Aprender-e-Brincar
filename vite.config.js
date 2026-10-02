import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { readFileSync } from 'node:fs';

const { version } = JSON.parse(readFileSync('package.json', 'utf8'));

export default defineConfig({
  // Versão do conteúdo; o app Android compara com a do último release do GitHub.
  define: { __APP_VERSION__: JSON.stringify(version) },
  plugins: [
    // Aparelhos antigos (ex.: iPad com iOS 9, Android 5) não rodam módulos modernos:
    // recebem uma segunda versão traduzida para ES5 com os complementos que faltam.
    // Os novos continuam com a versão moderna; o navegador escolhe sozinho.
    legacy({
      targets: ['iOS >= 9', 'Safari >= 9', 'Android >= 5', 'Chrome >= 49', 'Firefox >= 52'],
      modernPolyfills: true
    })
  ],
  build: {
    // Arquivos com hash ficam em /build/ (cache imutável); /assets/ guarda mídias editáveis.
    assetsDir: 'build'
  }
});
