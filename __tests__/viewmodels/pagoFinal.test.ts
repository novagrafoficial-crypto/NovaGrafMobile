/**
 * ViewModel del pago final: vista según el estado, comprobante, envío y recibo PDF.
 */
import { renderHook, act } from '@testing-library/react-native';
import { Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { usePagoFinalViewModel } from '../../src/features/pago-final/viewmodels/usePagoFinalViewModel';
import { pagoFinalService } from '../../src/features/pago-final/services/pagoFinalService';
import { pdfService } from '../../src/features/pago/services/pdfService';
import { pedirPermisoGaleria } from '../../src/shared/utils/permisos';

const mockRouter = { back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn(() => true) };
let mockUsuario: any = { id_usuario: 7, nombre: 'Ana' };
jest.mock('expo-router', () => {
  const React = require('react');
  return { useRouter: () => mockRouter, useFocusEffect: (cb: () => void) => React.useEffect(cb, [cb]) };
});
jest.mock('../../src/shared/hooks/useAuth', () => ({ useAuth: () => ({ user: mockUsuario }) }));
jest.mock('../../src/features/pago-final/services/pagoFinalService', () => ({ pagoFinalService: { getPantalla: jest.fn(), registrar: jest.fn() } }));
jest.mock('../../src/features/pago/services/pdfService', () => ({ pdfService: { descargar: jest.fn(), imprimir: jest.fn() } }));
jest.mock('../../src/shared/utils/permisos', () => ({ pedirPermisoGaleria: jest.fn(async () => true) }));
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));
jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));

const servicio = pagoFinalService as unknown as Record<string, jest.Mock>;
const pdf = pdfService as unknown as Record<string, jest.Mock>;
const metodoTransfer = { id: 1, nombre: 'Transferencia', tipo: 'TRANSFERENCIA', requiere_comprobante: true, datos: [] };
const metodoTienda = { id: 2, nombre: 'Efectivo', tipo: 'EFECTIVO', requiere_comprobante: false, datos: [] };
const pantalla = (estado: string, extra: object = {}) => ({
  pedido: { id: 15, estado, total_general: 300, monto_anticipo: 150, monto_restante: 150, detalles: [], pagos: [] },
  metodo: metodoTransfer, pagado: 150, montoPendiente: 150, pagoFinal: null, ...extra,
});

const montar = async (p: any) => {
  servicio.getPantalla.mockResolvedValue(p);
  const h = await renderHook(() => usePagoFinalViewModel(15));
  await act(async () => {});
  return h;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUsuario = { id_usuario: 7, nombre: 'Ana' };
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Pago final: vista y carga', () => {
  it.each([
    ['PENDIENTE_PAGO_FINAL', {}, 'pagar'],
    ['PENDIENTE_PAGO_FINAL', { pagoFinal: { id: 2, estado_pago: 'PENDIENTE', comprobante_url: 'https://c' } }, 'enviado'],
    ['VERIFICANDO_PAGO_FINAL', {}, 'enviado'],
    ['PENDIENTE_PAGO_FINAL', { montoPendiente: 0 }, 'noDisponible'],
    ['EN_PRODUCCION', {}, 'noDisponible'],
  ])('PPF-01 · %s %j → vista "%s"', async (estado, extra, vista) => {
    const { result } = await montar(pantalla(estado, extra));
    expect(result.current.vista).toBe(vista);
  });

  it('PPF-02 · muestra el rechazo anterior y el enlace al comprobante', async () => {
    const { result } = await montar(pantalla('PENDIENTE_PAGO_FINAL', { pagoFinal: { id: 2, estado_pago: 'RECHAZADO', notas_admin: 'Borroso', comprobante_url: 'https://c' } }));
    expect(result.current.rechazoAnterior?.notas_admin).toBe('Borroso');
    expect(result.current.comprobanteUrl).toBe('https://c');
    const abrir = jest.spyOn(Linking, 'openURL').mockResolvedValueOnce(true);
    result.current.verComprobante();
    expect(abrir).toHaveBeenCalledWith('https://c');
  });

  it('PPF-03 · pago en tienda no tiene enlace de comprobante', async () => {
    const { result } = await montar(pantalla('PENDIENTE_PAGO_FINAL', { metodo: metodoTienda, pagoFinal: { id: 2, estado_pago: 'APROBADO', comprobante_url: 'TIENDA_FISICA' } }));
    expect(result.current.esTienda).toBe(true);
    expect(result.current.comprobanteUrl).toBeNull();
    expect(result.current.verComprobante()).toBeNull();
  });

  it('PPF-04 · error al cargar, reintento y navegación', async () => {
    servicio.getPantalla.mockRejectedValueOnce(new Error('red'));
    const { result } = await renderHook(() => usePagoFinalViewModel(15));
    await act(async () => {});
    expect(result.current.error).toBe('No se pudo cargar la información del pago.');
    servicio.getPantalla.mockResolvedValue(pantalla('PENDIENTE_PAGO_FINAL'));
    await act(() => result.current.reintentar());
    expect(result.current.error).toBeNull();
    result.current.volver();
    mockRouter.canGoBack.mockReturnValueOnce(false);
    result.current.volver();
    result.current.irAlPedido();
    expect(mockRouter.back).toHaveBeenCalled();
    expect(mockRouter.replace).toHaveBeenCalledWith('/(cliente)/pedido/15');
  });
});

describe('Pago final: comprobante', () => {
  it('PPF-05 · galería: sin permiso, cancelado, muy grande, tipo inválido y válido', async () => {
    const { result } = await montar(pantalla('PENDIENTE_PAGO_FINAL'));
    const galeria = ImagePicker.launchImageLibraryAsync as jest.Mock;
    (pedirPermisoGaleria as jest.Mock).mockResolvedValueOnce(false);
    await act(() => result.current.desdeGaleria());
    expect(galeria).not.toHaveBeenCalled();
    galeria.mockResolvedValueOnce({ canceled: true });
    await act(() => result.current.desdeGaleria());
    galeria.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'u', fileSize: 6 * 1024 * 1024 }] });
    await act(() => result.current.desdeGaleria());
    expect(result.current.errorEnvio).toBe('El archivo no debe superar los 5 MB.');
    galeria.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'u', mimeType: 'image/gif' }] });
    await act(() => result.current.desdeGaleria());
    expect(result.current.errorEnvio).toBe('Solo se permiten archivos JPG, PNG o PDF.');
    galeria.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'u' }] });
    await act(() => result.current.desdeGaleria());
    expect(result.current.archivo).toMatchObject({ uri: 'u', mimeType: 'image/jpeg' });
    expect(result.current.errorEnvio).toBeNull();
    await act(() => result.current.quitarArchivo());
    expect(result.current.archivo).toBeNull();
  });

  it('PPF-06 · archivo PDF desde documentos', async () => {
    const { result } = await montar(pantalla('PENDIENTE_PAGO_FINAL'));
    const docs = DocumentPicker.getDocumentAsync as jest.Mock;
    docs.mockResolvedValueOnce({ canceled: true });
    await act(() => result.current.desdeArchivo());
    expect(result.current.archivo).toBeNull();
    docs.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'd', name: 'pago.pdf', size: 100 }] });
    await act(() => result.current.desdeArchivo());
    expect(result.current.archivo).toMatchObject({ name: 'pago.pdf', mimeType: 'application/pdf' });
  });
});

describe('Pago final: envío', () => {
  it('PPF-07 · transferencia sin comprobante no deja enviar', async () => {
    const { result } = await montar(pantalla('PENDIENTE_PAGO_FINAL'));
    await act(() => result.current.enviar());
    expect(result.current.errorEnvio).toBe('Selecciona tu comprobante de pago.');
    expect(result.current.confirmarVisible).toBe(false);
  });

  it('PPF-08 · con comprobante confirma y registra el pago', async () => {
    const { result } = await montar(pantalla('PENDIENTE_PAGO_FINAL'));
    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'd', name: 'pago.pdf', mimeType: 'application/pdf' }] });
    await act(() => result.current.desdeArchivo());
    await act(() => result.current.setNota('Pagué hoy'));
    await act(() => result.current.enviar());
    expect(result.current.confirmarVisible).toBe(true);
    await act(() => result.current.confirmarEnvio());
    expect(servicio.registrar).toHaveBeenCalledWith(expect.objectContaining({ nota: 'Pagué hoy', usuarioId: 7, nombreCliente: 'Ana', archivo: expect.objectContaining({ name: 'pago.pdf' }) }));
    expect(result.current.confirmarVisible).toBe(false);
    expect(result.current.archivo).toBeNull();
    expect(result.current.nota).toBe('');
  });

  it('PPF-09 · pago en tienda se registra sin archivo; un error se muestra', async () => {
    const { result } = await montar(pantalla('PENDIENTE_PAGO_FINAL', { metodo: metodoTienda }));
    servicio.registrar.mockRejectedValueOnce({ response: { data: { message: 'El pedido no acepta pagos' } } });
    await act(() => result.current.enviar());
    await act(() => result.current.confirmarEnvio());
    expect(servicio.registrar).toHaveBeenCalledWith(expect.objectContaining({ archivo: null }));
    expect(result.current.errorEnvio).toBe('El pedido no acepta pagos');
    await act(() => result.current.enviar());
    await act(() => result.current.cancelarConfirmacion());
    expect(result.current.confirmarVisible).toBe(false);
  });

  it('PPF-10 · sin sesión no registra nada', async () => {
    mockUsuario = null;
    const { result } = await montar(pantalla('PENDIENTE_PAGO_FINAL', { metodo: metodoTienda }));
    expect(result.current.cliente).toBe('Cliente');
    await act(() => result.current.confirmarEnvio());
    expect(servicio.registrar).not.toHaveBeenCalled();
  });
});

describe('Pago final: recibo PDF', () => {
  it('PPF-11 · guarda el recibo y muestra la carpeta', async () => {
    const { result } = await montar(pantalla('VERIFICANDO_PAGO_FINAL'));
    pdf.descargar.mockResolvedValueOnce({ estado: 'guardado', carpeta: 'Descargas' });
    await act(() => result.current.descargarRecibo());
    expect(result.current.infoPdf).toBe('Recibo guardado en la carpeta "Descargas"');
    pdf.descargar.mockResolvedValueOnce({ estado: 'cancelado' });
    await act(() => result.current.descargarRecibo());
    expect(result.current.infoPdf).toBeNull();
  });

  it('PPF-12 · si no puede guardar abre la impresión; si también falla, avisa', async () => {
    const { result } = await montar(pantalla('VERIFICANDO_PAGO_FINAL'));
    pdf.descargar.mockRejectedValue(new Error('sin permiso'));
    pdf.imprimir.mockResolvedValueOnce(undefined);
    await act(() => result.current.descargarRecibo());
    expect(pdf.imprimir).toHaveBeenCalled();
    pdf.imprimir.mockRejectedValueOnce(new Error('No hay impresora'));
    await act(() => result.current.descargarRecibo());
    expect(result.current.errorPdf).toBe('No hay impresora');
    expect(result.current.generandoPdf).toBe(false);
  });
});
