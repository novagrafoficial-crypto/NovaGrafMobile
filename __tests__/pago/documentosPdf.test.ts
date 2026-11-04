/**
 * Documentos PDF del pago: ficha del anticipo, recibo del pago final y servicio de descarga.
 */
import * as Print from 'expo-print';
import { Directory, File } from 'expo-file-system';
import { htmlFichaPago, nombreArchivoPdf } from '../../src/features/pago/utils/pagoPdf';
import { htmlReciboPagoFinal, nombreReciboPdf } from '../../src/features/pago-final/utils/reciboPagoFinal';
import { pdfService } from '../../src/features/pago/services/pdfService';

jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn(async () => ({ uri: 'file://ficha.pdf' })),
  printAsync: jest.fn(async () => {}),
}));
jest.mock('expo-file-system', () => {
  const escribir = jest.fn();
  return {
    File: jest.fn().mockImplementation(() => ({ bytes: jest.fn(async () => new Uint8Array([1, 2])) })),
    Directory: { pickDirectoryAsync: jest.fn() },
    __escribir: escribir,
  };
});

const pedido = {
  id: 15, estado: 'PENDIENTE', total_general: 300, monto_anticipo: 150, monto_restante: 150, costo_envio: 0,
  direccion_envio: null, metodo_entrega_nombre: 'Recoger <en> tienda', metodo_pago_id: 1,
  detalles: [
    { producto_nombre: 'Taza & logo', color: 'Rojo', cantidad: 2, precio_unitario: 50, subtotal: 100 },
    { producto_nombre: 'Gorra', color: null, cantidad: 1, precio_unitario: 200, subtotal: 200 },
  ],
  pagos: [],
};
const metodo = (tipo: string, extra: object = {}) =>
  ({ id: 1, nombre: tipo, tipo, descripcion: null, requiere_comprobante: tipo !== 'EFECTIVO', datos: [{ etiqueta: 'CLABE', valor: '0123' }], instrucciones: 'Usa el folio "NG"', ...extra }) as any;

describe('Ficha de pago del anticipo', () => {
  it('PDF-01 · transferencia: muestra datos, referencia, instrucciones y escapa el HTML', () => {
    const html = htmlFichaPago({ pedido, metodo: metodo('TRANSFERENCIA') } as any, 'Ana <Admin>');
    expect(html).toContain('Datos para transferencia');
    expect(html).toContain('Referencia / concepto');
    expect(html).toContain('Usa el folio &quot;NG&quot;');
    expect(html).toContain('Taza &amp; logo (Rojo)');
    expect(html).toContain('Ana &lt;Admin&gt;');
    expect(html).toContain('MONTO EXACTO A PAGAR');
  });

  it('PDF-02 · depósito bancario usa su propio título y pasos', () => {
    const html = htmlFichaPago({ pedido, metodo: metodo('DEPOSITO') } as any, 'Ana');
    expect(html).toContain('Ficha de depósito bancario');
    expect(html).toContain('Realiza el depósito');
  });

  it('PDF-03 · pago en tienda: sin referencia ni instrucciones', () => {
    const html = htmlFichaPago({ pedido, metodo: metodo('EFECTIVO') } as any, 'Ana');
    expect(html).toContain('Ticket de pago en tienda');
    expect(html).toContain('Datos de la tienda');
    expect(html).not.toContain('Referencia / concepto');
    expect(html).toContain('MONTO A PAGAR EN TIENDA');
  });

  it('PDF-04 · sin método ni datos no muestra el bloque de datos', () => {
    const html = htmlFichaPago({ pedido, metodo: null } as any, 'Ana');
    expect(html).toContain('Método de pago: —');
    const sinDatos = htmlFichaPago({ pedido, metodo: metodo('EFECTIVO', { datos: undefined, instrucciones: null }) } as any, 'Ana');
    expect(sinDatos).not.toContain('Datos de la tienda');
    expect(nombreArchivoPdf(15)).toBe('Ficha-de-pago-NG-00015.pdf');
  });
});

describe('Recibo del pago final', () => {
  const base = { pedido, metodo: { nombre: 'Transferencia' }, pagado: 150, montoPendiente: 150 } as any;

  it('PDF-05 · muestra el estado del pago final', () => {
    expect(htmlReciboPagoFinal({ ...base, pagoFinal: { monto: 150, estado_pago: 'APROBADO', comprobante_url: 'x' } }, 'Ana')).toContain('Aprobado');
    expect(htmlReciboPagoFinal({ ...base, pagoFinal: { monto: 150, estado_pago: 'RECHAZADO', comprobante_url: 'x' } }, 'Ana')).toContain('Rechazado');
    expect(htmlReciboPagoFinal({ ...base, pagoFinal: { monto: 150, estado_pago: 'PENDIENTE', comprobante_url: 'x' } }, 'Ana')).toContain('En verificación');
  });

  it('PDF-06 · pago en tienda, sin pago registrado y sin método', () => {
    expect(htmlReciboPagoFinal({ ...base, pagoFinal: { monto: 150, estado_pago: 'APROBADO', comprobante_url: 'TIENDA_FISICA' } }, 'Ana')).toContain('Pago en tienda');
    const sinPago = htmlReciboPagoFinal({ ...base, metodo: null, pagoFinal: null }, 'Ana');
    expect(sinPago).toContain('Método de pago: —');
    expect(sinPago).toContain('$150.00 MXN');
    expect(nombreReciboPdf(15)).toBe('Recibo-pago-final-NG-00015.pdf');
  });
});

describe('Servicio de descarga del PDF', () => {
  beforeEach(() => jest.clearAllMocks());

  it('PDF-07 · guarda el PDF en la carpeta que elige el usuario', async () => {
    const write = jest.fn();
    (Directory.pickDirectoryAsync as jest.Mock).mockResolvedValueOnce({ name: 'Descargas', createFile: jest.fn(() => ({ write })) });
    await expect(pdfService.descargar('<html/>', 'ficha.pdf')).resolves.toEqual({ estado: 'guardado', carpeta: 'Descargas' });
    expect(Print.printToFileAsync).toHaveBeenCalledWith({ html: '<html/>' });
    expect(File).toHaveBeenCalledWith('file://ficha.pdf');
    expect(write).toHaveBeenCalled();
  });

  it('PDF-08 · si cierra el selector de carpetas, se cancela; y puede imprimir como plan B', async () => {
    (Directory.pickDirectoryAsync as jest.Mock).mockRejectedValueOnce(new Error('cancelado'));
    await expect(pdfService.descargar('<html/>', 'ficha.pdf')).resolves.toEqual({ estado: 'cancelado' });
    await pdfService.imprimir('<html/>');
    expect(Print.printAsync).toHaveBeenCalledWith({ html: '<html/>' });
  });
});
