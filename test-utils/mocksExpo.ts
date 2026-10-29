/**
 * Mocks compartidos para pruebas de integración.
 * Solo se simulan las piezas EXTERNAS (navegación, Google, almacenamiento seguro);
 * pantallas, ViewModels, servicios y capa de datos se ejecutan de verdad.
 */
export const router = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => true),
};

export const reiniciarRouter = () => {
  router.push.mockClear();
  router.replace.mockClear();
  router.back.mockClear();
};
