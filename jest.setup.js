// Configuración global de Jest para Nova Graf Mobile.
// Simula el área segura (notch/barra de estado), que en las pruebas no existe.
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);
