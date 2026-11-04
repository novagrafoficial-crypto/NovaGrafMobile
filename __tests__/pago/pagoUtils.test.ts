import { normalizarDatos, aBooleano, modoDePago, folioDe, money } from '../../src/features/pago/utils/pagoUtils';

describe('Utilidades de pago', () => {
  it('convierte los datos bancarios (texto JSON) en etiquetas legibles', () => {
    const datos = normalizarDatos('{"beneficiario":"Nova Graf","clabe":"012345678901234567"}');
    expect(datos).toEqual([
      { etiqueta: 'Beneficiario', valor: 'Nova Graf' },
      { etiqueta: 'CLABE', valor: '012345678901234567' },
    ]);
  });

  it('regresa lista vacía si los datos vienen dañados', () => {
    expect(normalizarDatos('{no es json')).toEqual([]);
    expect(normalizarDatos(null)).toEqual([]);
  });

  it('interpreta valores booleanos del backend', () => {
    expect(aBooleano('false')).toBe(false);
    expect(aBooleano(0)).toBe(false);
    expect(aBooleano('si')).toBe(true);
  });

  it('elige la pantalla de pago correcta según el método', () => {
    const base = { id: 1, nombre: 'x', descripcion: null, datos: [] } as any;
    expect(modoDePago({ ...base, tipo: 'DEPOSITO', requiere_comprobante: true })).toBe('DEPOSITO');
    expect(modoDePago({ ...base, tipo: 'TRANSFERENCIA', requiere_comprobante: true })).toBe('TRANSFERENCIA');
    expect(modoDePago({ ...base, tipo: 'EFECTIVO', requiere_comprobante: false })).toBe('TIENDA');
  });

  it('formatea folio y montos', () => {
    expect(folioDe(15)).toBe('NG-00015');
    expect(money(150)).toBe('$150.00');
  });
});
