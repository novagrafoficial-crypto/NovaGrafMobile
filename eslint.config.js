// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'coverage/*', 'node_modules/*'],
  },
  {
    // Reglas del React Compiler: el patrón useRef(new Animated.Value()) es el
    // recomendado por React Native para animaciones, por eso se reportan como
    // advertencia (deuda técnica a revisar) y no como error que bloquee el CI.
    rules: {
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    // Archivos de prueba: Jest define describe, it, expect, etc. de forma global.
    files: ['__tests__/**', 'test-utils/**', 'jest.config.js'],
    languageOptions: {
      globals: {
        describe: 'readonly', it: 'readonly', test: 'readonly', expect: 'readonly',
        jest: 'readonly', beforeEach: 'readonly', afterEach: 'readonly',
        beforeAll: 'readonly', afterAll: 'readonly',
      },
    },
  },
]);
