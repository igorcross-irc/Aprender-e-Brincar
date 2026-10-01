import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // Arquivos com hash ficam em /build/ (cache imutável); /assets/ guarda mídias editáveis.
    assetsDir: 'build'
  }
});
