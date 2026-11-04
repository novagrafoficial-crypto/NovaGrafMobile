/**
 * Capa de datos (patrón Repository): cada función de los módulos de /data/api
 * llama al cliente HTTP compartido (Singleton) y devuelve el cuerpo de la respuesta.
 */
import apiClient from '../../src/data/api/ApiClient';
import { adminChatApi } from '../../src/data/api/adminChatApi';
import { adminNotificacionesApi } from '../../src/data/api/adminNotificacionesApi';
import { adminPedidosApi } from '../../src/data/api/adminPedidosApi';
import { adminUsuariosApi } from '../../src/data/api/adminUsuariosApi';
import { authApi } from '../../src/data/api/authApi';
import { cartApi } from '../../src/data/api/cartApi';
import { catalogApi } from '../../src/data/api/catalogApi';
import { chatClienteApi } from '../../src/data/api/chatClienteApi';
import { checkoutApi } from '../../src/data/api/checkoutApi';
import { contactoApi } from '../../src/data/api/contactoApi';
import { disenoApi } from '../../src/data/api/disenoApi';
import { legalApi } from '../../src/data/api/legalApi';
import { nosotrosApi } from '../../src/data/api/nosotrosApi';
import { notificacionesApi } from '../../src/data/api/notificacionesApi';
import { ofertasApi } from '../../src/data/api/ofertasApi';
import { pagoApi } from '../../src/data/api/pagoApi';
import { pedidosApi } from '../../src/data/api/pedidosApi';
import { portfolioApi } from '../../src/data/api/portfolioApi';
import { profileApi } from '../../src/data/api/profileApi';

jest.mock('../../src/data/api/ApiClient', () => {
  const respuesta = async () => ({ data: { ok: true } });
  const cliente = { get: jest.fn(respuesta), post: jest.fn(respuesta), put: jest.fn(respuesta), patch: jest.fn(respuesta), delete: jest.fn(respuesta) };
  return { __esModule: true, default: cliente, apiClient: cliente };
});

const http = apiClient as unknown as Record<'get' | 'post' | 'put' | 'patch' | 'delete', jest.Mock>;
const llamadas = () => ['get', 'post', 'put', 'patch', 'delete'].reduce((s, m) => s + http[m as 'get'].mock.calls.length, 0);

const MODULOS: Record<string, Record<string, (...a: any[]) => Promise<unknown>>> = {
  adminChatApi, adminNotificacionesApi, adminPedidosApi, adminUsuariosApi, authApi, cartApi, catalogApi,
  chatClienteApi, checkoutApi, contactoApi, disenoApi, legalApi, nosotrosApi, notificacionesApi,
  ofertasApi, pagoApi, pedidosApi, portfolioApi, profileApi,
} as any;

describe('Capa de datos: endpoints REST', () => {
  beforeEach(() => jest.clearAllMocks());

  const casos = Object.entries(MODULOS).flatMap(([modulo, api]) =>
    Object.keys(api).filter((k) => typeof api[k] === 'function').map((fn) => [modulo, fn] as const)
  );

  it('PD-01 · todos los módulos exponen funciones', () => {
    expect(casos.length).toBeGreaterThan(40);
  });

  it.each(casos)('PD-02 · %s.%s hace una petición HTTP y devuelve su respuesta', async (modulo, fn) => {
    const r = await MODULOS[modulo][fn](7, { campo: 'valor' }, 'texto', 3);
    expect(llamadas()).toBeGreaterThanOrEqual(1);
    expect(r).toBeDefined();
  });

  it('PD-03 · las rutas de pedidos del admin usan el id recibido', async () => {
    await adminPedidosApi.getById(15);
    await adminPedidosApi.actualizarEstado(15, 'EN_PRODUCCION');
    expect(http.get).toHaveBeenCalledWith('/admin/pedidos/15');
    expect(http.patch).toHaveBeenCalledWith('/admin/pedidos/15/estado', { estado: 'EN_PRODUCCION' });
  });

  it('PD-04 · la solicitud de eliminación envía correo y motivo', async () => {
    await legalApi.solicitarEliminacion('ana@correo.com', 'Ya no la uso');
    expect(http.post).toHaveBeenCalledWith('/users/solicitar-eliminacion', { correo: 'ana@correo.com', motivo: 'Ya no la uso' });
  });
});
