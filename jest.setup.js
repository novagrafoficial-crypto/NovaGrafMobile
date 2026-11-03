// Configuración global de Jest para Nova Graf Mobile.
// Simula el área segura (notch/barra de estado), que en las pruebas no existe.
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

// Simula react-native-keyboard-controller (módulo nativo del teclado)
jest.mock('react-native-keyboard-controller', () => require('react-native-keyboard-controller/jest'));

// Simula react-native-ssl-public-key-pinning (módulo nativo de OkHttp CertificatePinner)
jest.mock('react-native-ssl-public-key-pinning', () => ({
  initializeSslPinning: jest.fn(async () => {}),
  isSslPinningAvailable: jest.fn(() => true),
  addSslPinningErrorListener: jest.fn(() => ({ remove: jest.fn() })),
  disableSslPinning: jest.fn(async () => {}),
}));
