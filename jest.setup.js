// Configuración global de Jest para Nova Graf Mobile.
// Simula el área segura (notch/barra de estado), que en las pruebas no existe.
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

// Simula react-native-keyboard-controller (módulo nativo del teclado)
jest.mock('react-native-keyboard-controller', () => require('react-native-keyboard-controller/jest'));
