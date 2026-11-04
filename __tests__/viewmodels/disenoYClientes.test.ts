/**
 * ViewModels de diseño del pedido (cliente) y de clientes (admin).
 */
import { renderHook, act } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useDisenoPedidoViewModel } from '../../src/features/diseno/viewmodels/useDisenoPedidoViewModel';
import { useClientesAdminViewModel, nombreCompleto } from '../../src/features/clientes-admin/viewmodels/useClientesAdminViewModel';
import { pedidoService } from '../../src/features/pedidos/services/pedidoService';
import { disenoService } from '../../src/features/diseno/services/disenoService';
import { clientesAdminService } from '../../src/features/clientes-admin/services/clientesAdminService';
import { pedirPermisoGaleria } from '../../src/shared/utils/permisos';
import { crearPedido } from '../../test-utils/fabricas';

const mockRouter = { back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn(() => true) };
let mockUsuario: any = { id_usuario: 7, nombre: 'Ana' };
jest.mock('expo-router', () => {
  const React = require('react');
  return { useRouter: () => mockRouter, useFocusEffect: (cb: () => void) => React.useEffect(cb, [cb]) };
});
jest.mock('../../src/shared/hooks/useAuth', () => ({ useAuth: () => ({ user: mockUsuario }) }));
jest.mock('../../src/features/pedidos/services/pedidoService', () => ({ pedidoService: { getById: jest.fn() } }));
jest.mock('../../src/features/diseno/services/disenoService', () => ({ disenoService: { enviar: jest.fn() } }));
jest.mock('../../src/features/clientes-admin/services/clientesAdminService', () => ({ clientesAdminService: { getClientes: jest.fn(), cambiarActivo: jest.fn() } }));
jest.mock('../../src/shared/utils/permisos', () => ({ pedirPermisoGaleria: jest.fn(async () => true) }));
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));
jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));

const galeria = ImagePicker.launchImageLibraryAsync as jest.Mock;
const docs = DocumentPicker.getDocumentAsync as jest.Mock;
beforeEach(() => {
  jest.clearAllMocks();
  mockUsuario = { id_usuario: 7, nombre: 'Ana' };
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Diseño del pedido', () => {
  const montar = async (pedido = crearPedido({ estado: 'EN_DISENO' })) => {
    (pedidoService.getById as jest.Mock).mockResolvedValue(pedido);
    const h = await renderHook(() => useDisenoPedidoViewModel(15));
    await act(async () => {});
    return h;
  };

  it('PVD-01 · carga el pedido; si falla muestra el error', async () => {
    const { result } = await montar();
    expect(result.current).toMatchObject({ total: 2, listos: 0, completo: false, puedeSubir: true });
    (pedidoService.getById as jest.Mock).mockRejectedValueOnce(new Error('red'));
    await act(() => result.current.reintentar());
    expect(result.current.error).toBe('No se pudo cargar el pedido.');
  });

  it('PVD-02 · valida tamaño y tipo, y guarda un archivo por producto', async () => {
    const { result } = await montar();
    (pedirPermisoGaleria as jest.Mock).mockResolvedValueOnce(false);
    await act(() => result.current.desdeGaleria(1));
    galeria.mockResolvedValueOnce({ canceled: true });
    await act(() => result.current.desdeGaleria(1));
    galeria.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'u', fileSize: 11 * 1024 * 1024 }] });
    await act(() => result.current.desdeGaleria(1));
    expect(result.current.errorEnvio).toBe('El archivo no debe superar los 10 MB.');
    docs.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'd', name: 'a.zip', mimeType: 'application/zip' }] });
    await act(() => result.current.desdeArchivo(1));
    expect(result.current.errorEnvio).toBe('Solo se permiten imágenes o PDF.');
    galeria.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'u' }] });
    await act(() => result.current.desdeGaleria(1));
    docs.mockResolvedValueOnce({ canceled: true });
    await act(() => result.current.desdeArchivo(2));
    docs.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'd', name: 'logo.pdf' }] });
    await act(() => result.current.desdeArchivo(2));
    expect(result.current.archivos[1]).toMatchObject({ mimeType: 'image/jpeg' });
    expect(result.current.archivos[2]).toMatchObject({ mimeType: 'application/pdf' });
    expect(result.current.completo).toBe(true);
    await act(() => result.current.quitar(2));
    expect(result.current.listos).toBe(1);
    await act(() => result.current.cambiarNotas(1, 'Centrado'));
    expect(result.current.notas[1]).toBe('Centrado');
  });

  it('PVD-03 · no deja enviar incompleto; luego envía, y muestra el error si falla', async () => {
    const { result } = await montar();
    await act(() => result.current.enviar());
    expect(result.current.errorEnvio).toBe('Sube el diseño de todos los productos para continuar.');
    galeria.mockResolvedValue({ canceled: false, assets: [{ uri: 'u', mimeType: 'image/png' }] });
    await act(() => result.current.desdeGaleria(1));
    await act(() => result.current.desdeGaleria(2));
    (disenoService.enviar as jest.Mock).mockRejectedValueOnce(new Error('Supabase caído'));
    await act(() => result.current.enviar());
    expect(result.current.errorEnvio).toBe('Supabase caído');
    await act(() => result.current.enviar());
    expect(disenoService.enviar).toHaveBeenLastCalledWith(expect.objectContaining({ usuarioId: 7 }));
    expect(result.current.enviado).toBe(true);
    galeria.mockReset();
  });

  it('PVD-04 · sin sesión no envía; navegación', async () => {
    mockUsuario = null;
    const { result } = await montar();
    await act(() => result.current.enviar());
    expect(disenoService.enviar).not.toHaveBeenCalled();
    result.current.verPedido();
    result.current.volver();
    mockRouter.canGoBack.mockReturnValueOnce(false);
    result.current.volver();
    expect(mockRouter.replace).toHaveBeenCalledWith('/(cliente)/pedido/15');
    expect(mockRouter.back).toHaveBeenCalled();
  });
});

describe('Clientes (admin)', () => {
  const cliente = (id: number, extra: object = {}) => ({
    id_usuario: id, nombre: 'José', apellido_paterno: 'Pérez', apellido_materno: '', nombre_usuario: `jose${id}`,
    correo_electronico: `j${id}@c.com`, telefono: '', activo: true, proveedor: 'local', fecha_registro: null, ...extra,
  });
  const montar = async (lista: any[]) => {
    (clientesAdminService.getClientes as jest.Mock).mockResolvedValue(lista);
    const h = await renderHook(() => useClientesAdminViewModel());
    await act(async () => {});
    return h;
  };

  it('PVK-01 · cuenta activos, busca sin acentos y filtra por estado', async () => {
    const { result } = await montar([cliente(1), cliente(2, { nombre: 'Ana', apellido_paterno: 'Luna', activo: false })]);
    expect(result.current).toMatchObject({ activos: 1, inactivos: 1 });
    expect(nombreCompleto(cliente(1) as any)).toBe('José Pérez');
    await act(() => result.current.setBusqueda('JOSE perez'));
    expect(result.current.clientesFiltrados).toHaveLength(1);
    await act(() => result.current.setBusqueda(''));
    await act(() => result.current.setFiltro('INACTIVOS'));
    expect(result.current.clientesFiltrados.map((c) => c.id_usuario)).toEqual([2]);
    await act(() => result.current.setFiltro('ACTIVOS'));
    expect(result.current.clientesFiltrados.map((c) => c.id_usuario)).toEqual([1]);
  });

  it('PVK-02 · error al cargar y refrescar', async () => {
    (clientesAdminService.getClientes as jest.Mock).mockRejectedValueOnce({ response: { data: { message: 'Sin permiso' } } });
    const { result } = await renderHook(() => useClientesAdminViewModel());
    await act(async () => {});
    expect(result.current.error).toBe('Sin permiso');
    (clientesAdminService.getClientes as jest.Mock).mockRejectedValueOnce(new Error('x'));
    await act(() => result.current.reintentar());
    expect(result.current.error).toBe('No se pudo cargar la lista de clientes.');
    (clientesAdminService.getClientes as jest.Mock).mockResolvedValueOnce([cliente(1)]);
    await act(() => result.current.refrescar());
    expect(result.current.refrescando).toBe(false);
    expect(result.current.clientes).toHaveLength(1);
  });

  it('PVK-03 · abre el detalle; activar es directo y desactivar pide confirmación', async () => {
    const { result } = await montar([cliente(1), cliente(2, { activo: false })]);
    await act(() => result.current.abrirDetalle(result.current.clientes[0]));
    expect(result.current.seleccionado?.id_usuario).toBe(1);
    await act(() => result.current.cerrarDetalle());
    expect(result.current.seleccionado).toBeNull();

    await act(async () => { result.current.alternarActivo(result.current.clientes[1]); });
    expect(clientesAdminService.cambiarActivo).toHaveBeenCalledWith(2, true);
    expect(result.current.aviso?.texto).toBe('Cliente activado correctamente.');

    await act(() => result.current.alternarActivo(result.current.clientes[0]));
    expect(result.current.porDesactivar?.id_usuario).toBe(1);
    await act(() => result.current.cancelarDesactivar());
    expect(result.current.porDesactivar).toBeNull();
    await act(() => result.current.alternarActivo(result.current.clientes[0]));
    await act(async () => { result.current.confirmarDesactivar(); });
    expect(clientesAdminService.cambiarActivo).toHaveBeenLastCalledWith(1, false);
    expect(result.current.clientes[0].activo).toBe(false);
  });

  it('PVK-04 · si falla el cambio avisa; confirmar sin cliente no hace nada', async () => {
    const { result } = await montar([cliente(2, { activo: false })]);
    (clientesAdminService.cambiarActivo as jest.Mock).mockRejectedValueOnce({ response: { data: { error: 'No se pudo' } } });
    await act(async () => { result.current.alternarActivo(result.current.clientes[0]); });
    expect(result.current.aviso).toEqual({ texto: 'No se pudo', ok: false });
    await act(async () => { result.current.confirmarDesactivar(); });
    expect(clientesAdminService.cambiarActivo).toHaveBeenCalledTimes(1);
  });
});
