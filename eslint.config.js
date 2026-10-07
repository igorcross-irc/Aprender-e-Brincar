// ESLint: pega erros reais (variável não definida, import sem uso, código morto) sem brigar com o estilo
// do projeto (os jogos mais antigos são compactos de propósito).
import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist/**', 'android/**', 'node_modules/**', 'public/**', 'design/**', 'src/content/audio-files.js', 'src/content/asset-files.js', 'src/legacy/emoji-map.js'] },
  js.configs.recommended,
  {
    languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { ...globals.browser, __APP_VERSION__: 'readonly' } },
    rules: {
      'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none', varsIgnorePattern: '^_' }],
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-prototype-builtins': 'off',
      'no-useless-escape': 'warn',
      'no-cond-assign': ['error', 'except-parens']
    }
  },
  { files: ['scripts/**', 'tests/**', 'vite.config.js', 'eslint.config.js'], languageOptions: { globals: { ...globals.node, ...globals.browser } }, rules: { 'no-irregular-whitespace': 'off', 'no-regex-spaces': 'off', 'no-useless-escape': 'off' } },
  { files: ['**/*.cjs'], languageOptions: { sourceType: 'commonjs', globals: globals.node } }
];
