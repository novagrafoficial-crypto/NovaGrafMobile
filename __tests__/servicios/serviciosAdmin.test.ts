/**
 * Servicios del administrador (patrón Adapter): convierten la respuesta del backend
 * (números como texto, campos null) al modelo que usan los ViewModels.
 */
import { pedidosAdminService } from '../../src/features/pedidos-admin/services/pedidosAdminService';
import { clientesAdminService } from '../../src/features/clientes-admin/services/clientesAdminService';
import { adminProfileService } from '../../src/features/perfil-admin/services/adminProfileService';
import { notificacionesAdminService } from '../../src/features/notificaciones-admin/services/notificacionesAdminService';
import { chatPedidoService } from '../../src/features/chat-pedido-admin/services/chatPedidoService';
import { adminPedidosApi } from '../../src/data/api/adminPedidosApi';
import { adminUsuariosApi } from '../../src/data/api/adminUsuariosApi';
import { profileApi } from '../../src/data/api/profileApi';
import { adminNotificacionesApi } from '../../src/data/api/adminNotificacionesApi';
import { adminChatApi } from '../../src/data/api/adminChatApi';
import { subirImagenPrevia } from '../../src/data/supabasePrevias';

jest.mock('../../src/data/api/adminPedidosApi', () => ({
  adminPedidosApi: { getAll: jest.fn(), getById: jest.fn(), actualizarEstado: jest.fn(), actualizarPago: jest.fn(), subirPrevia: jest.fn() },
}));
jest.mock('../../src/data/api/adminUsuariosApi', () => ({ adminUsuariosApi: { getAll: jest.fn(), cambiarEstado: jest.fn() } }));
jest.mock('../../src/data/api/profileApi', () => ({ profileApi: { getProfile: jest.fn(), updateProfile: jest.fn(), changePassword: jest.fn() } }));
jest.mock('../../src/data/api/adminNotificacionesApi', () => ({ adminNotificacionesApi: { getNoLeidas: jest.fn(), marcarLeida: jest.fn() } }));
jest.mock('../../src/data/api/adminChatApi', () => ({ adminChatApi: { getPedido: jest.fn(), enviarMensaje: jest.fn() } }));
jest.mock('../../src/data/supabasePrevias', () => ({ subirImagenPrevia: jest.fn(async () => 'https://supabase/previas/p.png') }));

const m = (f: unknown) => f as jest.Mock;

const pedidoCompleto = {
  id: '15', fecha_pedido: '2026-10-20', estado: 'PENDIENTE', total_general: '300.50', monto_anticipo: '150',
  monto_restante: '150.50', direccion_envio: 'Centro', cliente_nombre: 'Ana', cliente_correo: 'ana@c.com',
  metodo_entrega: 'Envío', metodo_pago: 'Transferencia',
};

describe('Servicio de pedidos del admin', () => {
  beforeEach(() => jest.clearAllMocks());

  it('PSA-01 · convierte la lista y tolera respuestas vacías', async () => {
    m(adminPedidosApi.getAll).mockResolvedValueOnce([pedidoCompleto, { id: 2 }]);
    const lista = await pedidosAdminService.getPedidos();
    expect(lista[0]).toMatchObject({ id: 15, total_general: 300.5, cliente_nombre: 'Ana' });
    expect(lista[1]).toMatchObject({ id: 2, estado: '', total_general: 0, direccion_envio: null, metodo_pago: null });
    m(adminPedidosApi.getAll).mockResolvedValueOnce(null);
    expect(await pedidosAdminService.getPedidos()).toEqual([]);
  });

  it('PSA-02 · arma el pedido completo con productos, pagos, previas ordenadas y diseños', async () => {
    m(adminPedidosApi.getById).mockResolvedValueOnce({
      pedido: pedidoCompleto,
      detalle: [
        { producto_nombre: 'Taza', sku: 'T1', cantidad: '2', precio_unitario: '50', subtotal: '100', color: 'Blanco', imagen_url: 'a.png', descripcion: 'd' },
        { cantidad: '3', precio_unitario: '10', imagen_variante: 'v.png', producto_descripcion: 'pd' },
        { cantidad: '1', precio_unitario: '5' },
      ],
      pagos: [{ id: '1', tipo_pago: 'ANTICIPO', monto: '150', estado_pago: 'APROBADO', comprobante_url: 'c', notas_admin: 'ok', fecha_pago: 'f' }, { id: '2' }],
      previas: [
        { id: '9', numero_previa: '2', imagen_url: 'p2', aprobada: 1, rechazada: 0, fecha_subida: 'f', fecha_vista: 'v', fecha_aprobacion: 'a', comentario_cliente: 'c' },
        { id: '8', numero_previa: '1' },
      ],
      disenos: [{ id: '4', tipo_origen: 'ARCHIVO', notas_cliente: 'n', archivo_url: 'u', fecha_envio: 'f', simulador_json: '{}' }, { id: '5' }],
    });
    const r = await pedidosAdminService.getPedido(15);
    expect(r.productos[0]).toMatchObject({ cantidad: 2, subtotal: 100, color: 'Blanco', imagen_url: 'a.png' });
    expect(r.productos[1]).toMatchObject({ subtotal: 30, imagen_url: 'v.png', descripcion: 'pd', producto_nombre: '', sku: '' });
    expect(r.productos[2]).toMatchObject({ imagen_url: null, descripcion: null, color: null });
    expect(r.pagos[1]).toMatchObject({ tipo_pago: '', estado_pago: 'PENDIENTE', comprobante_url: null });
    expect(r.previas.map((p) => p.numero_previa)).toEqual([1, 2]);
    expect(r.previas[1]).toMatchObject({ aprobada: true, rechazada: false });
    expect(r.previas[0]).toMatchObject({ imagen_url: '', fecha_vista: null, comentario_cliente: null });
    expect(r.disenos[0].usaSimulador).toBe(true);
    expect(r.disenos[1]).toMatchObject({ tipo_origen: '', usaSimulador: false, archivo_url: null });
  });

  it('PSA-03 · un pedido sin listas regresa listas vacías', async () => {
    m(adminPedidosApi.getById).mockResolvedValueOnce({ pedido: { id: 3 } });
    const r = await pedidosAdminService.getPedido(3);
    expect(r).toMatchObject({ productos: [], pagos: [], previas: [], disenos: [] });
  });

  it('PSA-04 · avisa si el pedido no existe', async () => {
    m(adminPedidosApi.getById).mockResolvedValueOnce({});
    await expect(pedidosAdminService.getPedido(99)).rejects.toThrow('Pedido no encontrado');
  });

  it('PSA-05 · cambia estado, resuelve pagos y envía una previa', async () => {
    await pedidosAdminService.cambiarEstado(15, 'EN_PRODUCCION');
    await pedidosAdminService.resolverPago(1, 'APROBADO', 'ok');
    await pedidosAdminService.enviarPrevia(15, { uri: 'file://p.PNG', name: 'previa.PNG', mimeType: 'image/png' } as any, 2);
    await pedidosAdminService.enviarPrevia(15, { uri: 'file://x', name: '', mimeType: 'image/jpeg' } as any, 3);
    expect(adminPedidosApi.actualizarPago).toHaveBeenCalledWith(1, 'APROBADO', 'ok');
    expect(m(subirImagenPrevia).mock.calls[0][0]).toMatch(/^previas\/.+\.png$/);
    expect(m(subirImagenPrevia).mock.calls[1][0]).toMatch(/\.jpg$/);
    expect(adminPedidosApi.subirPrevia).toHaveBeenCalledWith({ pedido_cliente_id: 15, numero_previa: 2, imagen_url: 'https://supabase/previas/p.png' });
    expect(adminPedidosApi.actualizarEstado).toHaveBeenCalledWith(15, 'PREVIAS_ENVIADAS');
  });
});

describe('Servicio de clientes del admin', () => {
  it('PSA-06 · solo regresa clientes y acepta ambos formatos de respuesta', async () => {
    m(adminUsuariosApi.getAll).mockResolvedValueOnce([
      { id_usuario: '1', rol: 'cliente', nombre: 'Ana', apellido_paterno: 'P', apellido_materno: 'M', nombre_usuario: 'ana', correo_electronico: 'a@c', telefono: '1', activo: 1, proveedor: 'google', fecha_registro: 'f' },
      { id_usuario: '2', rol: 'administrador' },
      { id_usuario: '3', rol: 'cliente' },
    ]);
    const lista = await clientesAdminService.getClientes();
    expect(lista).toHaveLength(2);
    expect(lista[0]).toMatchObject({ id_usuario: 1, activo: true, proveedor: 'google' });
    expect(lista[1]).toMatchObject({ nombre: '', telefono: '', proveedor: 'local', fecha_registro: null, activo: false });
    m(adminUsuariosApi.getAll).mockResolvedValueOnce({ usuarios: [{ id_usuario: 4, rol: 'cliente' }] });
    expect(await clientesAdminService.getClientes()).toHaveLength(1);
    m(adminUsuariosApi.getAll).mockResolvedValueOnce(null);
    expect(await clientesAdminService.getClientes()).toEqual([]);
    await clientesAdminService.cambiarActivo(1, false);
    expect(adminUsuariosApi.cambiarEstado).toHaveBeenCalledWith(1, false);
  });
});

describe('Servicio de perfil del admin', () => {
  it('PSA-07 · convierte el perfil, lo vuelve a consultar al actualizar y cambia la contraseña', async () => {
    m(profileApi.getProfile)
      .mockResolvedValueOnce({ id_usuario: '1', nombre: 'Luis', apellido_paterno: 'P', apellido_materno: 'M', nombre_usuario: 'luis', correo_electronico: 'l@c', telefono: '7', proveedor: 'google' })
      .mockResolvedValueOnce({ id_usuario: 1 });
    expect(await adminProfileService.getProfile(1)).toMatchObject({ nombre: 'Luis', proveedor: 'google' });
    const actualizado = await adminProfileService.updateProfile(1, { nombre: 'Luis' } as any);
    expect(profileApi.updateProfile).toHaveBeenCalledWith(1, { nombre: 'Luis' });
    expect(actualizado).toMatchObject({ nombre: '', telefono: '', proveedor: 'local' });
    await adminProfileService.changePassword(1, { actual: 'a', nueva: 'b' } as any);
    expect(profileApi.changePassword).toHaveBeenCalledWith(1, { actual: 'a', nueva: 'b' });
  });
});

describe('Avisos y chat del admin', () => {
  it('PSA-08 · convierte avisos no leídos y marca uno o todos', async () => {
    m(adminNotificacionesApi.getNoLeidas).mockResolvedValueOnce([
      { id: '1', pedido_id: '15', tipo: 'CHAT', titulo: 'T', mensaje: 'M', leida: 0, creado_en: 'f' },
      { id: '2', pedido_id: null },
    ]);
    const avisos = await notificacionesAdminService.getNoLeidas(1);
    expect(avisos[0]).toMatchObject({ id: 1, pedido_id: 15, leida: false, fecha: 'f' });
    expect(avisos[1]).toMatchObject({ pedido_id: null, tipo: '', titulo: '', mensaje: '', fecha: null });
    m(adminNotificacionesApi.getNoLeidas).mockResolvedValueOnce(undefined);
    expect(await notificacionesAdminService.getNoLeidas(1)).toEqual([]);
    await notificacionesAdminService.marcarLeida(1);
    await notificacionesAdminService.marcarTodas([2, 3]);
    expect(adminNotificacionesApi.marcarLeida).toHaveBeenCalledTimes(3);
  });

  it('PSA-09 · convierte los mensajes del chat y envía el texto sin espacios extra', async () => {
    m(adminChatApi.getPedido).mockResolvedValueOnce({ chat: [{ id: '1', remitente_id: '2', remitente_nombre: 'Ana', mensaje: 'Hola', fecha_envio: 'f' }, { id: 2, remitente_id: 3 }] });
    const chat = await chatPedidoService.getMensajes(15);
    expect(chat[0]).toMatchObject({ id: 1, remitente_id: 2, mensaje: 'Hola' });
    expect(chat[1]).toMatchObject({ remitente_nombre: '', mensaje: '', fecha_envio: null });
    m(adminChatApi.getPedido).mockResolvedValueOnce({});
    expect(await chatPedidoService.getMensajes(15)).toEqual([]);
    await chatPedidoService.enviar(15, 1, '  Listo  ');
    expect(adminChatApi.enviarMensaje).toHaveBeenCalledWith({ pedido_cliente_id: 15, remitente_id: 1, mensaje: 'Listo' });
  });
});
