/**
 * ViewModel del detalle de pedido del cliente: siguiente paso, etapas y revisión de previas.
 */
import { renderHook, act } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { usePedidoDetalleViewModel } from '../../src/features/pedidos/viewmodels/usePedidoDetalleViewModel';
import { pedidoService } from '../../src/features/pedidos/services/pedidoService';
import { crearPedido, crearPago } from '../../test-utils/fabricas';

const mockRouter = { push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn(() => true) };
jest.mock('expo-router', () => {
  const React = require('react');
  return { useRouter: () => mockRouter, useFocusEffect: (cb: () => void) => React.useEffect(cb, [cb]) };
});
jest.mock('../../src/features/pedidos/services/pedidoService', () => ({
  pedidoService: { getById: jest.fn(), aprobarPrevia: jest.fn(), rechazarPrevia: jest.fn() },
}));

const servicio = pedidoService as unknown as Record<string, jest.Mock>;
const previa = (n: number, extra: object = {}) => ({ id: n, numero_previa: n, imagen_url: 'p', aprobada: false, rechazada: false, fecha_subida: null, comentario_cliente: null, ...extra });

const montar = async (pedido: any) => {
  servicio.getById.mockResolvedValue(pedido);
  const h = await renderHook(() => usePedidoDetalleViewModel(15));
  await act(async () => {});
  return h;
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Detalle de pedido (cliente): siguiente paso', () => {
  it.each([
    ['CANCELADO', 'Pedido cancelado', {}],
    ['PENDIENTE_VERIFICACION', 'Paga tu anticipo', {}],
    ['PENDIENTE_VERIFICACION', 'Revisa tu comprobante', { pagos: [crearPago(1, 'ANTICIPO', 'RECHAZADO')] }],
    ['PENDIENTE_VERIFICACION', 'Verificando tu anticipo', { pagos: [crearPago(1, 'ANTICIPO', 'PENDIENTE')] }],
    ['EN_DISENO', 'Sube tu diseño', {}],
    ['EN_DISENO', 'Diseños recibidos', { disenos: [{ id: 1, variante_id: 1, archivo_url: 'a', notas_cliente: null, fecha_envio: null }] }],
    ['EN_REVISION', 'Preparando tu previa', {}],
    ['PREVIAS_ENVIADAS', 'Revisa la previa 1', { previas: [previa(1)] }],
    ['PREVIAS_ENVIADAS', 'Preparando una nueva previa', { previas: [previa(1, { rechazada: true })] }],
    ['EN_PRODUCCION', 'En producción', {}],
    ['PENDIENTE_PAGO_FINAL', 'Verificando tu pago final', { pagos: [crearPago(1, 'ANTICIPO', 'APROBADO'), crearPago(2, 'SALDO_FINAL', 'PENDIENTE')] }],
    ['PENDIENTE_PAGO_FINAL', 'Reenvía tu pago final', { pagos: [crearPago(1, 'ANTICIPO', 'APROBADO'), crearPago(2, 'SALDO_FINAL', 'RECHAZADO')] }],
    ['PENDIENTE_PAGO_FINAL', 'Liquida tu saldo', { pagos: [crearPago(1, 'ANTICIPO', 'APROBADO')] }],
    ['VERIFICANDO_PAGO_FINAL', 'Verificando tu pago final', {}],
    ['ENVIADO', '¡Tu pedido va en camino!', {}],
  ])('PVC-01 · %s → "%s"', async (estado, titulo, extra) => {
    const { result } = await montar(crearPedido({ estado, ...(extra as object) }));
    expect(result.current.siguientePaso?.titulo).toBe(titulo);
  });

  it('PVC-02 · un estado desconocido no tiene siguiente paso', async () => {
    const { result } = await montar(crearPedido({ estado: 'OTRO' }));
    expect(result.current.siguientePaso).toBeNull();
  });

  it('PVC-03 · los botones del siguiente paso navegan a la pantalla correcta', async () => {
    let r = (await montar(crearPedido({ estado: 'PENDIENTE_VERIFICACION' }))).result;
    r.current.siguientePaso?.onPress?.();
    expect(mockRouter.push).toHaveBeenLastCalledWith('/(cliente)/pago-pedido/15');
    r = (await montar(crearPedido({ estado: 'EN_DISENO' }))).result;
    expect(r.current.debeSubirDiseno).toBe(true);
    r.current.siguientePaso?.onPress?.();
    expect(mockRouter.push).toHaveBeenLastCalledWith('/(cliente)/diseno-pedido/15');
    r = (await montar(crearPedido({ estado: 'PENDIENTE_PAGO_FINAL', pagos: [crearPago(1, 'ANTICIPO', 'APROBADO')] }))).result;
    expect(r.current.puedePagarFinal).toBe(true);
    r.current.siguientePaso?.onPress?.();
    expect(mockRouter.push).toHaveBeenLastCalledWith('/(cliente)/pago-final/15');
    r.current.irAChat();
    expect(mockRouter.push).toHaveBeenLastCalledWith('/(cliente)/chat-pedido/15');
  });
});

describe('Detalle de pedido (cliente): carga, etapas y navegación', () => {
  it('PVC-04 · si falla la carga muestra el error', async () => {
    servicio.getById.mockRejectedValueOnce(new Error('red'));
    const { result } = await renderHook(() => usePedidoDetalleViewModel(15));
    await act(async () => {});
    expect(result.current.error).toBe('No se pudo cargar el pedido.');
    expect(result.current.debePagar).toBe(false);
    expect(result.current.progreso).toBe(0);
    expect(result.current.pagoFinal).toBeNull();
  });

  it('PVC-05 · abre la etapa actual, la alterna y "Revisar previa" baja a las previas', async () => {
    const { result } = await montar(crearPedido({ estado: 'PREVIAS_ENVIADAS', previas: [previa(1)] }));
    expect(result.current.etapas.length).toBeGreaterThan(0);
    const actual = result.current.etapaAbierta;
    expect(actual).not.toBeNull();
    await act(() => result.current.toggleEtapa(actual!));
    expect(result.current.etapaAbierta).toBeNull();
    await act(() => result.current.toggleEtapa(actual!));
    expect(result.current.etapaAbierta).toBe(actual);
    await act(() => result.current.siguientePaso?.onPress?.());
    expect(result.current.etapaAbierta).toBe('previas');
    expect(result.current.irAPrevias).toBe(1);
  });

  it('PVC-06 · volver y abrir enlaces', async () => {
    const { result } = await montar(crearPedido());
    result.current.volver();
    expect(mockRouter.back).toHaveBeenCalled();
    mockRouter.canGoBack.mockReturnValueOnce(false);
    result.current.volver();
    expect(mockRouter.replace).toHaveBeenCalledWith('/(cliente)/pedidos');
    const abrir = jest.spyOn(Linking, 'openURL').mockResolvedValueOnce(true);
    await result.current.abrirUrl('https://x');
    expect(abrir).toHaveBeenCalledWith('https://x');
  });
});

describe('Detalle de pedido (cliente): revisión de previas', () => {
  const pedido = () => crearPedido({ estado: 'PREVIAS_ENVIADAS', previas: [previa(1)] });

  it('PVC-07 · aprobar la previa la envía y recarga', async () => {
    const { result } = await montar(pedido());
    await act(() => result.current.aprobarPrevia(result.current.previaPendiente!));
    expect(result.current.previaAAprobar?.numero_previa).toBe(1);
    await act(() => result.current.confirmarAprobacion());
    expect(servicio.aprobarPrevia).toHaveBeenCalledWith(15, 1);
    expect(result.current.previaAAprobar).toBeNull();
  });

  it('PVC-08 · si aprobar falla muestra el mensaje y se puede cerrar', async () => {
    const { result } = await montar(pedido());
    servicio.aprobarPrevia.mockRejectedValueOnce({ response: { data: { message: 'Ya fue aprobada' } } });
    await act(() => result.current.aprobarPrevia(result.current.previaPendiente!));
    await act(() => result.current.confirmarAprobacion());
    expect(result.current.errorRevision).toBe('Ya fue aprobada');
    await act(() => result.current.cerrarAprobacion());
    expect(result.current.previaAAprobar).toBeNull();
    expect(result.current.errorRevision).toBeNull();
    await act(() => result.current.confirmarAprobacion());
    expect(servicio.aprobarPrevia).toHaveBeenCalledTimes(1);
  });

  it('PVC-09 · rechazar pide un comentario mínimo y luego lo envía', async () => {
    const { result } = await montar(pedido());
    await act(() => result.current.abrirRechazo(result.current.previaPendiente!));
    await act(() => result.current.confirmarRechazo('  no '));
    expect(result.current.errorRevision).toMatch(/mínimo 5 caracteres/);
    await act(() => result.current.confirmarRechazo('  Cambiar el color a azul  '));
    expect(servicio.rechazarPrevia).toHaveBeenCalledWith(15, 1, 'Cambiar el color a azul');
    expect(result.current.previaARechazar).toBeNull();
  });

  it('PVC-10 · si rechazar falla usa el mensaje por defecto; cerrar limpia', async () => {
    const { result } = await montar(pedido());
    servicio.rechazarPrevia.mockRejectedValueOnce(new Error('red'));
    await act(() => result.current.abrirRechazo(result.current.previaPendiente!));
    await act(() => result.current.confirmarRechazo('Cambiar el color'));
    expect(result.current.errorRevision).toBe('No se pudo enviar tu respuesta. Intenta de nuevo.');
    await act(() => result.current.cerrarRechazo());
    expect(result.current.previaARechazar).toBeNull();
    await act(() => result.current.confirmarRechazo('Cambiar el color'));
    expect(servicio.rechazarPrevia).toHaveBeenCalledTimes(1);
  });
});
