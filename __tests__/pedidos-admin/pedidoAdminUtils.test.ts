import { formatMoney } from '../../src/features/pedidos-admin/utils/pedidoAdminUtils';
import { isValidEmail } from '../../src/features/autenticacion/utils/validaciones';

describe('Formato de dinero (admin)', () => {
  it('agrega separador de miles y dos decimales', () => {
    expect(formatMoney(1234.5)).toBe('$1,234.50');
    expect(formatMoney(1234567)).toBe('$1,234,567.00');
  });

  it('maneja cero, montos pequeños y negativos', () => {
    expect(formatMoney(0)).toBe('$0.00');
    expect(formatMoney(999)).toBe('$999.00');
    expect(formatMoney(-1500)).toBe('-$1,500.00');
  });
});

describe('Validación de correo (regex sin backtracking)', () => {
  it('acepta correos con subdominios', () => {
    expect(isValidEmail('ana@correo.uthh.edu.mx')).toBe(true);
  });

  it('rechaza dominios incompletos o con puntos dobles', () => {
    expect(isValidEmail('ana@correo')).toBe(false);
    expect(isValidEmail('ana@correo..com')).toBe(false);
    expect(isValidEmail('ana@correo.c')).toBe(false);
  });
});
