/**
 * ViewModel del detalle de pedido del administrador: carga, próximo paso,
 * resolución de pagos, cambios de estado y envío de previas.
 */
import { renderHook, act } from '@testing-library/react-native';
import { Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { usePedidoAdminDetalleViewModel } from '../../src/features/pedidos-admin/viewmodels/usePedidoAdminDetalleViewModel';
import { pedidosAdminService } from '../../src/features/pedidos-admin/services/pedidosAdminService';
import { pedirPermisoGaleria } from '../../src/shared/utils/permisos';

const mockRouter = { back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn(() => true) };
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    useRouter: () => mockRouter,
    useLocalSearchParams: () => ({ id: '15' }),
    useFocusEffect: (cb: () => void) => React.useEffect(cb, [cb]),
  };
});
jest.mock('../../src/features/pedidos-admin/services/pedidosAdminService', () => ({
  pedidosAdminService: { getPedido: jest.fn(), resolverPago: jest.fn(), cambiarEstado: jest.fn(), enviarPrevia: jest.fn() },
}));
jest.mock('../../src/shared/utils/permisos', () => ({ pedirPermisoGaleria: jest.fn(async () => true) }));
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));

const servicio = pedidosAdminService as unknown as Record<string, jest.Mock>;

const pago = (id: number, tipo_pago: string, estado_pago: string, notas_admin: string | null = null) =>
  ({ id, tipo_pago, estado_pago, monto: 150, comprobante_url: 'c', notas_admin, fecha_pago: null });
const previa = (numero_previa: number, extra: object = {}) =>
  ({ id: numero_previa, numero_previa, imagen_url: 'p', aprobada: false, rechazada: false, fecha_subida: null, fecha_vista: null, fecha_aprobacion: null, comentario_cliente: null, ...extra });
const datos = (estado: string, pagos: any[] = [], previas: any[] = []) => ({
  pedido: { id: 15, estado, total_general: 300, monto_anticipo: 150, monto_restante: 150, fecha_pedido: '', direccion_envio: null, cliente_nombre: 'Ana', cliente_correo: '', metodo_entrega: null, metodo_pago: null },
  productos: [], pagos, previas, disenos: [],
});

const montar = async (d: any) => {
  servicio.getPedido.mockResolvedValue(d);
  const h = await renderHook(() => usePedidoAdminDetalleViewModel());
  await act(async () => {});
  return h;
};

beforeEach(() => jest.clearAllMocks());

describe('Detalle de pedido (admin): carga y navegación', () => {
  it('PVA-01 · carga el pedido al enfocar la pantalla', async () => {
    const { result } = await montar(datos('EN_DISENO'));
    expect(servicio.getPedido).toHaveBeenCalledWith(15);
    expect(result.current.cargando).toBe(false);
    expect(result.current.data?.pedido.estado).toBe('EN_DISENO');
    expect(result.current.puedeCancelar).toBe(true);
  });

  it('PVA-02 · muestra el error del backend y permite reintentar y refrescar', async () => {
    servicio.getPedido.mockRejectedValueOnce({ response: { data: { error: 'No autorizado' } } });
    const { result } = await renderHook(() => usePedidoAdminDetalleViewModel());
    await act(async () => {});
    expect(result.current.error).toBe('No autorizado');
    servicio.getPedido.mockResolvedValue(datos('ENVIADO'));
    await act(() => result.current.refrescar());
    expect(result.current.error).toBeNull();
    expect(result.current.refrescando).toBe(false);
    expect(result.current.puedeCancelar).toBe(false);
  });

  it('PVA-03 · volver regresa o va a la lista; abrirUrl avisa si falla', async () => {
    const { result } = await montar(datos('EN_DISENO'));
    result.current.volver();
    expect(mockRouter.back).toHaveBeenCalled();
    mockRouter.canGoBack.mockReturnValueOnce(false);
    result.current.volver();
    expect(mockRouter.replace).toHaveBeenCalledWith('/(admin)/pedidos');
    jest.spyOn(Linking, 'openURL').mockRejectedValueOnce(new Error('x'));
    await act(async () => { await result.current.abrirUrl('https://x'); });
    expect(result.current.aviso).toEqual({ texto: 'No se pudo abrir el archivo.', ok: false });
  });

  it('PVA-04 · abre y cierra la hoja de detalle', async () => {
    const { result } = await montar(datos('EN_DISENO'));
    await act(() => result.current.abrirDetalle({ tipo: 'producto' } as any));
    expect(result.current.detalle).toEqual({ tipo: 'producto' });
    await act(() => result.current.cerrarDetalle());
    expect(result.current.detalle).toBeNull();
  });
});

describe('Detalle de pedido (admin): próximo paso', () => {
  it.each([
    ['PENDIENTE_VERIFICACION', 'Revisa el anticipo', [pago(1, 'ANTICIPO', 'PENDIENTE')], []],
    ['PENDIENTE_VERIFICACION', 'Esperando nuevo comprobante', [pago(1, 'ANTICIPO', 'RECHAZADO')], []],
    ['PENDIENTE_VERIFICACION', 'Esperando el anticipo', [], []],
    ['EN_DISENO', 'Esperando el diseño', [], []],
    ['EN_REVISION', 'Envía la previa 1', [], []],
    ['PREVIAS_ENVIADAS', 'El cliente pidió cambios', [], [previa(1, { rechazada: true })]],
    ['PREVIAS_ENVIADAS', 'Esperando respuesta', [], [previa(1)]],
    ['EN_PRODUCCION', 'En producción', [], []],
    ['PENDIENTE_PAGO_FINAL', 'Revisa el pago final', [pago(2, 'SALDO_FINAL', 'PENDIENTE')], []],
    ['VERIFICANDO_PAGO_FINAL', 'Pago completo', [pago(2, 'SALDO_FINAL', 'APROBADO')], []],
    ['PENDIENTE_PAGO_FINAL', 'Esperando el pago final', [], []],
    ['ENVIADO', 'Pedido enviado', [], []],
    ['CANCELADO', 'Pedido cancelado', [], []],
  ])('PVA-05 · estado %s → "%s"', async (estado, titulo, pagos, previas) => {
    const { result } = await montar(datos(estado, pagos, previas));
    expect(result.current.proximoPaso?.titulo).toBe(titulo);
  });

  it('PVA-06 · un estado desconocido no muestra próximo paso', async () => {
    const { result } = await montar(datos('OTRO'));
    expect(result.current.proximoPaso).toBeNull();
  });
});

describe('Detalle de pedido (admin): pagos', () => {
  it('PVA-07 · rechazar sin motivo avisa y no confirma', async () => {
    const { result } = await montar(datos('PENDIENTE_VERIFICACION', [pago(1, 'ANTICIPO', 'PENDIENTE')]));
    await act(() => result.current.pedirResolverPago(result.current.pagosOrdenados[0], 'RECHAZADO'));
    expect(result.current.confirmacion).toBeNull();
    expect(result.current.aviso?.ok).toBe(false);
  });

  it('PVA-08 · aprobar el anticipo lo resuelve y pasa el pedido a EN_DISENO', async () => {
    const { result } = await montar(datos('PENDIENTE_VERIFICACION', [pago(1, 'ANTICIPO', 'PENDIENTE', 'nota previa')]));
    await act(() => result.current.pedirResolverPago(result.current.pagosOrdenados[0], 'APROBADO'));
    expect(result.current.confirmacion?.textoConfirmar).toBe('Sí, aprobar');
    await act(async () => { result.current.confirmacion?.onConfirmar(); });
    expect(servicio.resolverPago).toHaveBeenCalledWith(1, 'APROBADO', 'nota previa');
    expect(servicio.cambiarEstado).toHaveBeenCalledWith(15, 'EN_DISENO');
    expect(result.current.aviso).toEqual({ texto: 'Pago aprobado correctamente', ok: true });
  });

  it('PVA-09 · rechazar el pago final con motivo regresa a PENDIENTE_PAGO_FINAL', async () => {
    const { result } = await montar(datos('VERIFICANDO_PAGO_FINAL', [pago(2, 'SALDO_FINAL', 'PENDIENTE')]));
    await act(() => result.current.editarNotaPago(2, '  Monto incorrecto '));
    expect(result.current.notasPago[2]).toBe('  Monto incorrecto ');
    await act(() => result.current.pedirResolverPago(result.current.pagosOrdenados[0], 'RECHAZADO'));
    expect(result.current.confirmacion?.tono).toBe('peligro');
    await act(async () => { result.current.confirmacion?.onConfirmar(); });
    expect(servicio.resolverPago).toHaveBeenCalledWith(2, 'RECHAZADO', 'Monto incorrecto');
    expect(servicio.cambiarEstado).toHaveBeenCalledWith(15, 'PENDIENTE_PAGO_FINAL');
  });

  it('PVA-10 · si la acción falla, se muestra el error', async () => {
    const { result } = await montar(datos('EN_PRODUCCION', [pago(2, 'SALDO_FINAL', 'PENDIENTE')]));
    servicio.resolverPago.mockRejectedValueOnce({ response: { data: { message: 'Pago ya resuelto' } } });
    await act(() => result.current.pedirResolverPago(result.current.pagosOrdenados[0], 'APROBADO'));
    await act(async () => { result.current.confirmacion?.onConfirmar(); });
    expect(result.current.aviso).toEqual({ texto: 'Pago ya resuelto', ok: false });
    expect(result.current.trabajando).toBe(false);
  });
});

describe('Detalle de pedido (admin): estados', () => {
  it.each([
    ['pedirMarcarListo', 'PENDIENTE_PAGO_FINAL'],
    ['pedirMarcarEnviado', 'ENVIADO'],
    ['pedirCancelar', 'CANCELADO'],
  ] as const)('PVA-11 · %s confirma y cambia a %s', async (accion, estado) => {
    const { result } = await montar(datos('EN_PRODUCCION'));
    await act(() => result.current[accion]());
    await act(async () => { result.current.confirmacion?.onConfirmar(); });
    expect(servicio.cambiarEstado).toHaveBeenCalledWith(15, estado);
  });

  it('PVA-12 · el botón del próximo paso abre la confirmación y se puede cerrar', async () => {
    const { result } = await montar(datos('EN_PRODUCCION'));
    await act(() => result.current.proximoPaso?.boton?.onPress());
    expect(result.current.confirmacion?.titulo).toBe('Marcar como listo');
    await act(() => result.current.cerrarConfirmacion());
    expect(result.current.confirmacion).toBeNull();
  });
});

describe('Detalle de pedido (admin): previas', () => {
  it('PVA-13 · banner y permiso de enviar según la revisión del cliente', async () => {
    let r = (await montar(datos('EN_REVISION'))).result;
    expect(r.current.bannerPrevias?.tono).toBe('info');
    expect(r.current.puedeEnviarPrevia).toBe(true);

    r = (await montar(datos('EN_DISENO'))).result;
    expect(r.current.bannerPrevias).toBeNull();

    r = (await montar(datos('PREVIAS_ENVIADAS', [], [previa(1, { rechazada: true })]))).result;
    expect(r.current.bannerPrevias).toEqual({ texto: 'El cliente rechazó la previa 1. Envía otra versión.', tono: 'aviso' });
    expect(r.current.siguientePrevia).toBe(2);
    expect(r.current.puedeEnviarPrevia).toBe(true);

    r = (await montar(datos('PREVIAS_ENVIADAS', [], [previa(1)]))).result;
    expect(r.current.bannerPrevias?.texto).toBe('Esperando la respuesta del cliente a la previa 1.');
    expect(r.current.puedeEnviarPrevia).toBe(false);

    r = (await montar(datos('EN_PRODUCCION', [], [previa(1, { rechazada: true }), previa(2, { aprobada: true })]))).result;
    expect(r.current.bannerPrevias).toEqual({ texto: 'El cliente aprobó la previa 2.', tono: 'ok' });
    expect(r.current.estadoDePrevia(previa(2, { aprobada: true }))).toBeDefined();
  });

  it('PVA-14 · elegir previa: sin permiso, cancelado, formato inválido y válido', async () => {
    const { result } = await montar(datos('EN_REVISION'));
    (pedirPermisoGaleria as jest.Mock).mockResolvedValueOnce(false);
    await act(() => result.current.elegirPrevia());
    expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();

    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({ canceled: true });
    await act(() => result.current.elegirPrevia());
    expect(result.current.previa).toBeNull();

    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'u', mimeType: 'application/pdf' }] });
    await act(() => result.current.elegirPrevia());
    expect(result.current.aviso?.texto).toBe('Solo se permiten imágenes JPG, PNG o WEBP.');

    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'u' }] });
    await act(() => result.current.elegirPrevia());
    expect(result.current.previa).toMatchObject({ uri: 'u', mimeType: 'image/jpeg' });
    expect(result.current.previa?.name).toMatch(/^previa_1_/);
    await act(() => result.current.quitarPrevia());
    expect(result.current.previa).toBeNull();
  });

  it('PVA-15 · enviar previa: pide imagen y luego la envía con su número', async () => {
    const { result } = await montar(datos('EN_REVISION'));
    await act(() => result.current.pedirEnviarPrevia());
    expect(result.current.aviso?.texto).toBe('Elige la imagen de la previa.');
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'u', mimeType: 'image/png', fileName: 'diseno.png' }] });
    await act(() => result.current.elegirPrevia());
    await act(() => result.current.pedirEnviarPrevia());
    expect(result.current.confirmacion?.titulo).toBe('Enviar previa 1');
    await act(async () => { result.current.confirmacion?.onConfirmar(); });
    expect(servicio.enviarPrevia).toHaveBeenCalledWith(15, { uri: 'u', name: 'diseno.png', mimeType: 'image/png' }, 1);
    expect(result.current.previa).toBeNull();
    expect(result.current.aviso?.texto).toBe('Previa 1 enviada correctamente');
  });
});
