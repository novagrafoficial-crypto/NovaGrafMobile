import {
  isValidEmail,
  isValidPassword,
  limpiarCampo,
  formatFecha,
  fechaAISO,
} from '../../src/features/autenticacion/utils/validaciones';

describe('Validaciones de autenticación', () => {
  it('acepta un correo válido y rechaza uno inválido', () => {
    expect(isValidEmail('cliente@novagraf.com')).toBe(true);
    expect(isValidEmail('cliente@novagraf')).toBe(false);
  });

  it('exige contraseña de mínimo 8 caracteres con letra y número', () => {
    expect(isValidPassword('abc12345')).toBe(true);
    expect(isValidPassword('abc123')).toBe(false);
    expect(isValidPassword('abcdefgh')).toBe(false);
  });

  it('el teléfono solo acepta 10 números', () => {
    expect(limpiarCampo('phone', '77-1234-56789')).toBe('7712345678');
  });

  it('formatea la fecha y la convierte al formato del backend', () => {
    expect(formatFecha('05032001')).toBe('05/03/2001');
    expect(fechaAISO('05/03/2001')).toBe('2001-03-05');
  });
});
