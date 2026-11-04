/**
 * Pago del anticipo (comprobante, envío, compartir y PDF) e inicio/trabajos públicos.
 */
import { renderHook, act } from '@testing-library/react-native';
import { Share } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { usePagoPedidoViewModel } from '../../src/features/pago/viewmodels/usePagoPedidoViewModel';
import { useTrabajosPublicosViewModel } from '../../src/features/portafolio/viewmodels/useTrabajosPublicosViewModel';
import { usePublicHomeViewModel } from '../../src/features/inicio/viewmodels/usePublicHomeViewModel';
import { pagoService } from '../../src/features/pago/services/pagoService';
import { pdfService } from '../../src/features/pago/services/pdfService';
import { portfolioService } from '../../src/features/portafolio/services/portfolioService';
import { pedirPermisoGaleria } from '../../src/shared/utils/permisos';

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn(), navigate: jest.fn(), canGoBack: jest.fn(() => true) };
let mockUsuario: any = { id_usuario: 7, nombre: 'Ana' };
jest.mock('expo-router', () => ({ useRouter: () => mockRouter }));
jest.mock('../../src/shared/hooks/useAuth', () => ({ useAuth: () => ({ user: mockUsuario }) }));
jest.mock('../../src/features/pago/services/pagoService', () => ({ pagoService: { getPantalla: jest.fn(), registrarAnticipo: jest.fn() } }));
jest.mock('../../src/features/pago/services/pdfService', () => ({ pdfService: { descargar: jest.fn(), imprimir: jest.fn() } }));
jest.mock('../../src/features/portafolio/services/portfolioService', () => ({ portfolioService: { getPublic: jest.fn() } }));
jest.mock('../../src/shared/utils/permisos', () => ({ pedirPermisoGaleria: jest.fn(async () => true) }));
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));
jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));

const pago = pagoService as unknown as Record<string, jest.Mock>;
const pdf = pdfService as unknown as Record<string, jest.Mock>;
const galeria = ImagePicker.launchImageLibraryAsync as jest.Mock;
const docs = DocumentPicker.getDocumentAsync as jest.Mock;
const transfer = { id: 1, nombre: 'Transferencia', tipo: 'TRANSFERENCIA', requiere_comprobante: true, datos: [], instrucciones: null, descripcion: null };
const tienda = { ...transfer, id: 2, nombre: 'Efectivo', tipo: 'EFECTIVO', requiere_comprobante: false };
const pantalla = (estado: string, pagos: any[] = [], metodo: any = transfer) => ({
  pedido: { id: 15, estado, total_general: 300, monto_anticipo: 150, monto_restante: 150, costo_envio: 0, direccion_envio: null, metodo_entrega_nombre: 'Tienda', metodo_pago_id: 1, detalles: [], pagos },
  metodo,
});
const montarPago = async (p: any) => {
  pago.getPantalla.mockResolvedValue(p);
  const h = await renderHook(() => usePagoPedidoViewModel(15));
  await act(async () => {});
  return h;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUsuario = { id_usuario: 7, nombre: 'Ana' };
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('Pago del anticipo', () => {
  it('PPA-01 · puede pagar si no hay anticipo; si fue rechazado, puede volver a subirlo', async () => {
    let r = (await montarPago(pantalla('PENDIENTE_VERIFICACION'))).result;
    expect(r.current).toMatchObject({ puedePagar: true, pagoExistente: null, rechazoAnterior: null, esTienda: false });
    r = (await montarPago(pantalla('PENDIENTE_VERIFICACION', [{ id: 1, tipo_pago: 'ANTICIPO', estado_pago: 'RECHAZADO' }]))).result;
    expect(r.current.rechazoAnterior?.id).toBe(1);
    expect(r.current.puedePagar).toBe(true);
    r = (await montarPago(pantalla('PENDIENTE_VERIFICACION', [{ id: 1, tipo_pago: 'ANTICIPO', estado_pago: 'RECHAZADO' }, { id: 2, tipo_pago: 'ANTICIPO', estado_pago: 'PENDIENTE' }]))).result;
    expect(r.current.pagoExistente?.id).toBe(2);
    expect(r.current.puedePagar).toBe(false);
  });

  it('PPA-02 · error al cargar y reintento; navegación', async () => {
    pago.getPantalla.mockRejectedValueOnce(new Error('red'));
    const { result } = await renderHook(() => usePagoPedidoViewModel(15));
    await act(async () => {});
    expect(result.current.error).toBe('No se pudo cargar el pedido.');
    pago.getPantalla.mockResolvedValue(pantalla('PENDIENTE_VERIFICACION'));
    await act(() => result.current.reintentar());
    expect(result.current.error).toBeNull();
    result.current.irAPedidos();
    result.current.volver();
    mockRouter.canGoBack.mockReturnValueOnce(false);
    result.current.volver();
    expect(mockRouter.replace).toHaveBeenCalledWith('/(cliente)/pedidos');
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('PPA-03 · valida el comprobante de galería o archivo', async () => {
    const { result } = await montarPago(pantalla('PENDIENTE_VERIFICACION'));
    (pedirPermisoGaleria as jest.Mock).mockResolvedValueOnce(false);
    await act(() => result.current.desdeGaleria());
    galeria.mockResolvedValueOnce({ canceled: true });
    await act(() => result.current.desdeGaleria());
    galeria.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'u', fileSize: 6 * 1024 * 1024 }] });
    await act(() => result.current.desdeGaleria());
    expect(result.current.errorEnvio).toBe('El archivo no debe superar los 5 MB.');
    docs.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'd', name: 'x.doc', mimeType: 'application/msword' }] });
    await act(() => result.current.desdeArchivo());
    expect(result.current.errorEnvio).toBe('Solo se permiten archivos JPG, PNG o PDF.');
    docs.mockResolvedValueOnce({ canceled: true });
    await act(() => result.current.desdeArchivo());
    docs.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'd', name: 'pago.pdf' }] });
    await act(() => result.current.desdeArchivo());
    expect(result.current.archivo).toMatchObject({ mimeType: 'application/pdf' });
    galeria.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'u' }] });
    await act(() => result.current.desdeGaleria());
    expect(result.current.archivo).toMatchObject({ mimeType: 'image/jpeg' });
    await act(() => result.current.quitarArchivo());
    expect(result.current.archivo).toBeNull();
  });

  it('PPA-04 · pide comprobante en transferencia y lo registra', async () => {
    const { result } = await montarPago(pantalla('PENDIENTE_VERIFICACION'));
    await act(() => result.current.enviar());
    expect(result.current.errorEnvio).toBe('Selecciona tu comprobante de pago.');
    docs.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'd', name: 'pago.pdf', mimeType: 'application/pdf' }] });
    await act(() => result.current.desdeArchivo());
    await act(() => result.current.setNota('Ya pagué'));
    await act(() => result.current.enviar());
    expect(pago.registrarAnticipo).toHaveBeenCalledWith(expect.objectContaining({ nota: 'Ya pagué', usuarioId: 7, nombreCliente: 'Ana' }));
    expect(result.current.archivo).toBeNull();
  });

  it('PPA-05 · en tienda se registra sin archivo; error del servidor; sin sesión no envía', async () => {
    const { result } = await montarPago(pantalla('PENDIENTE_VERIFICACION', [], tienda));
    pago.registrarAnticipo.mockRejectedValueOnce({ response: { data: { message: 'Pedido cancelado' } } });
    await act(() => result.current.enviar());
    expect(pago.registrarAnticipo).toHaveBeenCalledWith(expect.objectContaining({ archivo: null }));
    expect(result.current.errorEnvio).toBe('Pedido cancelado');
    pago.registrarAnticipo.mockRejectedValueOnce({});
    await act(() => result.current.enviar());
    expect(result.current.errorEnvio).toBe('No se pudo registrar el pago.');
    mockUsuario = null;
    const sinSesion = (await montarPago(pantalla('PENDIENTE_VERIFICACION', [], tienda))).result;
    expect(sinSesion.current.cliente).toBe('Cliente');
    expect(sinSesion.current.compartir()).toBeUndefined();
    await act(() => sinSesion.current.enviar());
    expect(pago.registrarAnticipo).toHaveBeenCalledTimes(2);
  });

  it('PPA-06 · comparte los datos del pago', async () => {
    const compartir = jest.spyOn(Share, 'share').mockResolvedValueOnce({ action: 'sharedAction' } as any);
    const { result } = await montarPago(pantalla('PENDIENTE_VERIFICACION'));
    await result.current.compartir();
    expect(compartir).toHaveBeenCalledWith(expect.objectContaining({ title: 'Pedido NG-00015' }));
  });

  it('PPA-07 · ficha PDF: guardada, cancelada, plan B de impresión y error', async () => {
    const { result } = await montarPago(pantalla('PENDIENTE_VERIFICACION'));
    pdf.descargar.mockResolvedValueOnce({ estado: 'guardado', carpeta: 'Descargas' });
    await act(() => result.current.descargarPdf());
    expect(result.current.infoPdf).toBe('Ficha guardada en la carpeta "Descargas"');
    pdf.descargar.mockResolvedValueOnce({ estado: 'cancelado' });
    await act(() => result.current.descargarPdf());
    expect(result.current.infoPdf).toBeNull();
    pdf.descargar.mockRejectedValue(new Error('sin permiso'));
    await act(() => result.current.descargarPdf());
    expect(pdf.imprimir).toHaveBeenCalled();
    pdf.imprimir.mockRejectedValueOnce(new Error('Sin impresora'));
    await act(() => result.current.descargarPdf());
    expect(result.current.errorPdf).toBe('Sin impresora');
    pdf.imprimir.mockRejectedValueOnce({});
    await act(() => result.current.descargarPdf());
    expect(result.current.errorPdf).toBe('No se pudo generar el PDF.');
  });
});

const trabajo = (id: number, categoriaNombre: string | null) => ({ id, titulo: `T${id}`, imagenUrl: 'i', categoriaNombre });

describe('Trabajos realizados (público)', () => {
  it('PTP-01 · lista categorías ordenadas, filtra y abre un trabajo', async () => {
    (portfolioService.getPublic as jest.Mock).mockResolvedValue([trabajo(1, 'Tazas'), trabajo(2, 'Gorras'), trabajo(3, null), trabajo(4, 'Tazas')]);
    const { result } = await renderHook(() => useTrabajosPublicosViewModel());
    await act(async () => {});
    expect(result.current.categorias).toEqual(['Gorras', 'Tazas']);
    await act(() => result.current.setCategoria('Tazas'));
    expect(result.current.filtrados.map((t) => t.id)).toEqual([1, 4]);
    await act(() => result.current.abrir(trabajo(1, 'Tazas') as any));
    expect(result.current.seleccionado?.id).toBe(1);
    await act(() => result.current.cerrar());
    await act(() => result.current.abrir(trabajo(1, 'Tazas') as any));
    await act(() => result.current.entrar());
    expect(result.current.seleccionado).toBeNull();
    await act(() => result.current.registrarse());
    expect(mockRouter.push.mock.calls.map((c) => c[0])).toEqual(['/(auth)/login', '/(auth)/register']);
  });

  it('PTP-02 · error, reintento y refresco', async () => {
    (portfolioService.getPublic as jest.Mock).mockRejectedValueOnce(new Error('red'));
    const { result } = await renderHook(() => useTrabajosPublicosViewModel());
    await act(async () => {});
    expect(result.current.error).toMatch(/No pudimos cargar los trabajos/);
    (portfolioService.getPublic as jest.Mock).mockResolvedValue([]);
    await act(async () => { result.current.reintentar(); });
    expect(result.current.error).toBeNull();
    await act(() => result.current.refrescar());
    expect(result.current.refrescando).toBe(false);
  });
});

describe('Inicio público', () => {
  it('PTP-03 · muestra hasta 6 trabajos e indica si hay más', async () => {
    (portfolioService.getPublic as jest.Mock).mockResolvedValue([1, 2, 3, 4, 5, 6, 7].map((i) => trabajo(i, 'Tazas')));
    const { result } = await renderHook(() => usePublicHomeViewModel());
    await act(async () => {});
    expect(result.current).toMatchObject({ total: 7, hayMas: true });
    expect(result.current.trabajos).toHaveLength(6);
    await act(() => result.current.abrirTrabajo(trabajo(1, 'Tazas') as any));
    expect(result.current.seleccionado?.id).toBe(1);
    await act(() => result.current.cerrarTrabajo());
    expect(result.current.seleccionado).toBeNull();
    result.current.verTrabajos();
    result.current.irACuenta();
    expect(mockRouter.navigate.mock.calls.map((c) => c[0])).toEqual(['/(public)/trabajos', '/(public)/cuenta']);
    await act(() => result.current.entrar());
    await act(() => result.current.registrarse());
    expect(mockRouter.push).toHaveBeenCalledWith('/(auth)/register');
  });

  it('PTP-04 · error, reintento y refresco', async () => {
    (portfolioService.getPublic as jest.Mock).mockRejectedValueOnce(new Error('red'));
    const { result } = await renderHook(() => usePublicHomeViewModel());
    await act(async () => {});
    expect(result.current.error).toMatch(/No pudimos cargar los trabajos/);
    (portfolioService.getPublic as jest.Mock).mockResolvedValue([]);
    await act(async () => { result.current.reintentar(); });
    await act(() => result.current.refrescar());
    expect(result.current).toMatchObject({ error: null, hayMas: false, refrescando: false });
  });
});
