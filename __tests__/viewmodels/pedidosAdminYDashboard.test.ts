/**
 * ViewModels de la lista de pedidos del admin y del inicio (dashboard).
 */
import { renderHook, act } from '@testing-library/react-native';
import { usePedidosAdminViewModel } from '../../src/features/pedidos-admin/viewmodels/usePedidosAdminViewModel';
import { useDashboardViewModel } from '../../src/features/dashboard/viewmodels/useDashboardViewModel';
import { pedidosAdminService } from '../../src/features/pedidos-admin/services/pedidosAdminService';
import { clientesAdminService } from '../../src/features/clientes-admin/services/clientesAdminService';

const mockRouter = { push: jest.fn(), setParams: jest.fn() };
let mockParams: any = {};
let mockUsuario: any = { id_usuario: 1, nombre: 'Luis Pérez' };
jest.mock('expo-router', () => {
  const React = require('react');
  return { useRouter: () => mockRouter, useLocalSearchParams: () => mockParams, useFocusEffect: (cb: () => void) => React.useEffect(cb, [cb]) };
});
jest.mock('../../src/shared/hooks/useAuth', () => ({ useAuth: () => ({ user: mockUsuario }) }));
jest.mock('../../src/features/notificaciones-admin', () => ({ useNotificacionesAdmin: () => ({ noLeidas: 4 }) }));
jest.mock('../../src/features/pedidos-admin/services/pedidosAdminService', () => ({ pedidosAdminService: { getPedidos: jest.fn() } }));
jest.mock('../../src/features/clientes-admin/services/clientesAdminService', () => ({ clientesAdminService: { getClientes: jest.fn() } }));

const getPedidos = pedidosAdminService.getPedidos as jest.Mock;
const hoy = new Date().toISOString();
const resumen = (id: number, estado: string, fecha = hoy, extra: object = {}) =>
  ({ id, estado, fecha_pedido: fecha, total_general: 100, monto_anticipo: 50, monto_restante: 50, direccion_envio: null, cliente_nombre: `Cliente ${id}`, cliente_correo: `c${id}@correo.com`, metodo_entrega: null, metodo_pago: null, ...extra });

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = {};
  mockUsuario = { id_usuario: 1, nombre: 'Luis Pérez' };
});

describe('Lista de pedidos (admin)', () => {
  const lista = [
    resumen(1, 'PENDIENTE_VERIFICACION', '2026-10-01T10:00:00Z', { cliente_nombre: 'José Ñandú' }),
    resumen(2, 'EN_PRODUCCION', '2026-10-05T10:00:00Z'),
    resumen(3, 'ENVIADO', '2026-10-03T10:00:00Z'),
    resumen(4, 'EN_PRODUCCION', 'fecha-mala'),
  ];
  const montar = async () => {
    getPedidos.mockResolvedValue(lista);
    const h = await renderHook(() => usePedidosAdminViewModel());
    await act(async () => {});
    return h;
  };

  it('PVL-01 · arma los chips con su cantidad y ordena por fecha', async () => {
    const { result } = await montar();
    const chips = Object.fromEntries(result.current.opcionesEstado.map((o) => [o.valor, o.cantidad]));
    expect(chips.TODOS).toBe(4);
    expect(chips.EN_PRODUCCION).toBe(2);
    expect(result.current.pedidosFiltrados.map((p) => p.id)).toEqual([2, 3, 1, 4]);
    await act(() => result.current.alternarOrden());
    expect(result.current.orden).toBe('ANTIGUOS');
    expect(result.current.pedidosFiltrados[0].id).toBe(4);
    await act(() => result.current.setOrden('RECIENTES'));
    expect(result.current.orden).toBe('RECIENTES');
    expect(result.current.opcionesOrden.length).toBeGreaterThan(0);
  });

  it('PVL-02 · filtra por estado, por atender y busca por folio o nombre sin acentos', async () => {
    const { result } = await montar();
    await act(() => result.current.setFiltro('ENVIADO'));
    expect(result.current.pedidosFiltrados.map((p) => p.id)).toEqual([3]);
    await act(() => result.current.setFiltro('ATENDER'));
    expect(result.current.pedidosFiltrados.every((p) => p.estado !== 'ENVIADO')).toBe(true);
    await act(() => result.current.setFiltro('TODOS'));
    await act(() => result.current.setBusqueda('jose nandu'));
    expect(result.current.pedidosFiltrados.map((p) => p.id)).toEqual([1]);
    await act(() => result.current.setBusqueda('#2'));
    expect(result.current.pedidosFiltrados.map((p) => p.id)).toEqual([2]);
    await act(() => result.current.limpiarFiltros());
    expect(result.current.busqueda).toBe('');
    expect(result.current.pedidosFiltrados).toHaveLength(4);
  });

  it('PVL-03 · aplica el filtro que llega desde el Inicio y abre un pedido', async () => {
    mockParams = { estado: 'CANCELADO' };
    const { result } = await montar();
    expect(result.current.filtro).toBe('CANCELADO');
    expect(result.current.opcionesEstado.some((o) => o.valor === 'CANCELADO')).toBe(true);
    expect(mockRouter.setParams).toHaveBeenCalledWith({ estado: undefined });
    result.current.abrirPedido(2);
    expect(mockRouter.push).toHaveBeenCalledWith('/(admin)/pedido/2');
  });

  it('PVL-04 · error al cargar, reintento y refresco', async () => {
    getPedidos.mockRejectedValueOnce({ response: { data: { message: 'Sin sesión' } } });
    const { result } = await renderHook(() => usePedidosAdminViewModel());
    await act(async () => {});
    expect(result.current.error).toBe('Sin sesión');
    getPedidos.mockRejectedValueOnce(new Error('red'));
    await act(() => result.current.reintentar());
    expect(result.current.error).toBe('No se pudieron cargar los pedidos.');
    getPedidos.mockResolvedValueOnce(lista);
    await act(() => result.current.refrescar());
    expect(result.current.pedidos).toHaveLength(4);
    expect(result.current.refrescando).toBe(false);
  });
});

describe('Inicio del administrador', () => {
  it('PVH-01 · calcula activos, por atender (más viejos primero), ventas del mes y etapas', async () => {
    getPedidos.mockResolvedValue([
      resumen(1, 'PENDIENTE_VERIFICACION', '2026-01-02T00:00:00Z'),
      resumen(2, 'EN_REVISION', '2025-12-01T00:00:00Z'),
      resumen(3, 'ENVIADO'),
      resumen(4, 'CANCELADO'),
      resumen(5, 'EN_PRODUCCION', 'fecha-mala'),
    ]);
    (clientesAdminService.getClientes as jest.Mock).mockResolvedValue([{}, {}]);
    const { result } = await renderHook(() => useDashboardViewModel());
    await act(async () => {});
    expect(result.current).toMatchObject({ nombre: 'Luis', noLeidas: 4, totalPedidos: 5, totalClientes: 2, activos: 3, ventasMes: 100 });
    expect(result.current.porAtender[0].id).toBe(2);
    expect(result.current.etapas.find((e) => e.estado === 'ENVIADO')?.cantidad).toBe(1);
    expect(result.current.maximo).toBe(1);
    expect(result.current.iniciales).toBeTruthy();
  });

  it('PVH-02 · si fallan los clientes solo se oculta el número; si fallan los pedidos, error', async () => {
    getPedidos.mockResolvedValueOnce([]);
    (clientesAdminService.getClientes as jest.Mock).mockRejectedValueOnce(new Error('x'));
    const { result } = await renderHook(() => useDashboardViewModel());
    await act(async () => {});
    expect(result.current.totalClientes).toBeNull();
    expect(result.current.maximo).toBe(1);
    getPedidos.mockRejectedValueOnce(new Error('red'));
    await act(() => result.current.reintentar());
    expect(result.current.error).toBe('No se pudo cargar el resumen.');
    getPedidos.mockRejectedValueOnce({ response: { data: { message: 'Sin permiso' } } });
    await act(() => result.current.refrescar());
    expect(result.current.error).toBe('Sin permiso');
  });

  it('PVH-03 · navegación del inicio y usuario sin nombre', async () => {
    mockUsuario = null;
    getPedidos.mockResolvedValue([]);
    (clientesAdminService.getClientes as jest.Mock).mockResolvedValue([]);
    const { result } = await renderHook(() => useDashboardViewModel());
    await act(async () => {});
    expect(result.current.nombre).toBe('');
    result.current.abrirPedido(3);
    result.current.verPedidos('EN_PRODUCCION');
    result.current.verPedidos();
    result.current.verClientes();
    result.current.verAvisos();
    expect(mockRouter.push.mock.calls.map((c) => c[0])).toEqual([
      '/(admin)/pedido/3', '/(admin)/pedidos?estado=EN_PRODUCCION', '/(admin)/pedidos', '/(admin)/usuarios', '/(admin)/notificaciones',
    ]);
  });
});
