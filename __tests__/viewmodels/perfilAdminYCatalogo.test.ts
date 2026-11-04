/**
 * Perfil del administrador (datos, edición y cierre de sesión) y catálogo del cliente.
 */
import { renderHook, act } from '@testing-library/react-native';
import { useAdminProfileViewModel } from '../../src/features/perfil-admin/viewmodels/useAdminProfileViewModel';
import { useClientCatalogViewModel } from '../../src/features/catalogo-cliente/viewmodels/useClientCatalogViewModel';
import { adminProfileService } from '../../src/features/perfil-admin/services/adminProfileService';
import { clientProductService } from '../../src/features/catalogo-cliente/services/clientProductService';

const mockRouter = { push: jest.fn(), replace: jest.fn() };
const mockAuth = { user: { id_usuario: 1, nombre: 'Luis Pérez', rol: 'administrador' } as any, saveSession: jest.fn(), deleteSession: jest.fn() };
jest.mock('expo-router', () => ({ useRouter: () => mockRouter }));
jest.mock('../../src/shared/hooks/useAuth', () => ({ useAuth: () => mockAuth }));
jest.mock('../../src/features/perfil-admin/services/adminProfileService', () => ({ adminProfileService: { getProfile: jest.fn(), updateProfile: jest.fn(), changePassword: jest.fn() } }));
jest.mock('../../src/features/catalogo-cliente/services/clientProductService', () => ({ clientProductService: { getProducts: jest.fn() } }));

const servicio = adminProfileService as unknown as Record<string, jest.Mock>;
const perfil = { id_usuario: 1, nombre: 'Luis', apellido_paterno: 'Pérez', apellido_materno: '', nombre_usuario: 'luis', correo_electronico: 'l@c', telefono: '771', proveedor: 'local' };

beforeEach(() => {
  jest.clearAllMocks();
  mockAuth.user = { id_usuario: 1, nombre: 'Luis Pérez', rol: 'administrador' };
});

describe('Perfil del administrador', () => {
  const montar = async () => {
    servicio.getProfile.mockResolvedValue(perfil);
    const h = await renderHook(() => useAdminProfileViewModel());
    await act(async () => {});
    return h;
  };

  it('PAP-01 · carga el perfil; si falla avisa', async () => {
    const { result } = await montar();
    expect(result.current.form.nombre).toBe('Luis');
    expect(result.current.esGoogle).toBe(false);
    servicio.getProfile.mockRejectedValueOnce(new Error('x'));
    const fallo = (await renderHook(() => useAdminProfileViewModel())).result;
    await act(async () => {});
    expect(fallo.current.aviso).toEqual({ texto: 'No se pudo cargar tu perfil.', ok: false });
  });

  it('PAP-02 · edita, cancela y valida campos obligatorios', async () => {
    const { result } = await montar();
    await act(() => result.current.iniciarEdicion());
    await act(() => result.current.editarCampo('nombre', 'Otro'));
    expect(result.current.form.nombre).toBe('Otro');
    await act(() => result.current.cancelarEdicion());
    expect(result.current.form.nombre).toBe('Luis');
    expect(result.current.editando).toBe(false);
    await act(() => result.current.editarCampo('nombre_usuario', '  '));
    await act(() => result.current.guardarPerfil());
    expect(result.current.aviso?.texto).toBe('Nombre, apellido paterno y usuario son obligatorios.');
  });

  it('PAP-03 · guarda, actualiza la sesión y muestra errores del servidor', async () => {
    const { result } = await montar();
    servicio.updateProfile.mockResolvedValueOnce({ ...perfil, nombre: 'Luis Ángel' });
    await act(() => result.current.guardarPerfil());
    expect(mockAuth.saveSession).toHaveBeenCalledWith(expect.objectContaining({ nombre: 'Luis Ángel' }));
    expect(result.current.aviso).toEqual({ texto: 'Perfil actualizado correctamente.', ok: true });
    servicio.updateProfile.mockRejectedValueOnce({ response: { data: { message: 'Usuario en uso' } } });
    await act(() => result.current.guardarPerfil());
    expect(result.current.aviso?.texto).toBe('Usuario en uso');
    servicio.updateProfile.mockRejectedValueOnce({});
    await act(() => result.current.guardarPerfil());
    expect(result.current.aviso?.texto).toBe('Error de conexión.');
  });

  it('PAP-04 · cierra sesión y vuelve al inicio público', async () => {
    const { result } = await montar();
    await act(() => result.current.pedirLogout());
    expect(result.current.logoutVisible).toBe(true);
    await act(() => result.current.cancelarLogout());
    expect(result.current.logoutVisible).toBe(false);
    await act(() => result.current.confirmarLogout());
    expect(mockAuth.deleteSession).toHaveBeenCalled();
    expect(mockRouter.replace).toHaveBeenCalledWith('/');
  });

  it('PAP-05 · sin sesión no carga ni guarda', async () => {
    mockAuth.user = null;
    const { result } = await renderHook(() => useAdminProfileViewModel());
    await act(() => result.current.guardarPerfil());
    expect(servicio.getProfile).not.toHaveBeenCalled();
    expect(servicio.updateProfile).not.toHaveBeenCalled();
    await act(() => result.current.cancelarEdicion());
    expect(result.current.editando).toBe(false);
  });
});

describe('Catálogo del cliente', () => {
  const productos = [
    { producto_id: 1, producto_nombre: 'Taza blanca', descripcion: 'Cerámica', categoria: 'Tazas', precio_base: 50 },
    { producto_id: 2, producto_nombre: 'Gorra', descripcion: null, categoria: 'Gorras', precio_base: 80 },
    { producto_id: 3, producto_nombre: 'Llavero', descripcion: 'Acrílico', categoria: null, precio_base: 20 },
  ];

  it('PCC-01 · carga, saluda por el primer nombre y lista categorías', async () => {
    (clientProductService.getProducts as jest.Mock).mockResolvedValue(productos);
    const { result } = await renderHook(() => useClientCatalogViewModel());
    await act(async () => {});
    expect(result.current.primerNombre).toBe('Luis');
    expect(result.current.categorias).toEqual(['Tazas', 'Gorras']);
    expect(result.current.tituloLista).toBe('Todos los productos');
  });

  it('PCC-03 · busca por nombre o descripción, filtra por categoría y navega', async () => {
    (clientProductService.getProducts as jest.Mock).mockResolvedValue(productos);
    const { result } = await renderHook(() => useClientCatalogViewModel());
    await act(async () => {});
    await act(() => result.current.setBusqueda(' acrílico '));
    expect(result.current.productosFiltrados.map((p) => p.producto_id)).toEqual([3]);
    await act(() => result.current.setBusqueda('taza'));
    expect(result.current.productosFiltrados.map((p) => p.producto_id)).toEqual([1]);
    await act(() => result.current.setBusqueda(''));
    await act(() => result.current.elegirCategoria('Gorras'));
    expect(result.current.productosFiltrados.map((p) => p.producto_id)).toEqual([2]);
    expect(result.current.tituloLista).toBe('Gorras');
    await act(() => result.current.refrescar());
    await act(() => result.current.reintentar());
    expect(clientProductService.getProducts).toHaveBeenCalledTimes(3);
    expect(result.current.refreshing).toBe(false);
    result.current.abrirNotificaciones();
    result.current.abrirProducto(1);
    expect(mockRouter.push.mock.calls.map((c) => c[0])).toEqual(['/(cliente)/notificaciones', '/(cliente)/producto/1']);
  });

  it('PCC-02 · si falla muestra el error', async () => {
    (clientProductService.getProducts as jest.Mock).mockRejectedValueOnce(new Error('red'));
    mockAuth.user = null;
    const { result } = await renderHook(() => useClientCatalogViewModel());
    await act(async () => {});
    expect(result.current.error).toMatch(/No se pudo conectar/);
    expect(result.current.primerNombre).toBe('');
  });
});
