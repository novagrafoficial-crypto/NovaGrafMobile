/**
 * Servicios del cliente (patrón Adapter): pedidos, avisos, chat, diseños, legal y pago final.
 */
import { pedidoService } from '../../src/features/pedidos/services/pedidoService';
import { notificacionesService } from '../../src/features/notificaciones/services/notificacionesService';
import { chatClienteService } from '../../src/features/chat-pedido-cliente/services/chatClienteService';
import { disenoService } from '../../src/features/diseno/services/disenoService';
import { legalService } from '../../src/features/legal/services/legalService';
import { pagoFinalService } from '../../src/features/pago-final/services/pagoFinalService';
import { pedidosApi } from '../../src/data/api/pedidosApi';
import { notificacionesApi } from '../../src/data/api/notificacionesApi';
import { chatClienteApi } from '../../src/data/api/chatClienteApi';
import { disenoApi } from '../../src/data/api/disenoApi';
import { legalApi } from '../../src/data/api/legalApi';
import { contactoApi } from '../../src/data/api/contactoApi';
import { pagoApi } from '../../src/data/api/pagoApi';
import { subirArchivo } from '../../src/data/supabase';
import { pagoService } from '../../src/features/pago/services/pagoService';
import { crearPedido } from '../../test-utils/fabricas';

jest.mock('../../src/data/api/pedidosApi', () => ({
  pedidosApi: { getAll: jest.fn(), getById: jest.fn(), getDisenos: jest.fn(), getPrevias: jest.fn(), aprobarPrevia: jest.fn(), rechazarPrevia: jest.fn() },
}));
jest.mock('../../src/data/api/notificacionesApi', () => ({
  notificacionesApi: { getAll: jest.fn(), marcarLeida: jest.fn(), marcarTodasLeidas: jest.fn(), eliminar: jest.fn() },
}));
jest.mock('../../src/data/api/chatClienteApi', () => ({ chatClienteApi: { getMensajes: jest.fn(), enviarMensaje: jest.fn() } }));
jest.mock('../../src/data/api/disenoApi', () => ({ disenoApi: { enviarDisenos: jest.fn(async () => ({ ok: true })) } }));
jest.mock('../../src/data/api/legalApi', () => ({ legalApi: { getPoliticas: jest.fn(), solicitarEliminacion: jest.fn() } }));
jest.mock('../../src/data/api/contactoApi', () => ({ contactoApi: { getContactos: jest.fn() } }));
jest.mock('../../src/data/api/pagoApi', () => ({ pagoApi: { registrarPagoFinal: jest.fn(async () => ({ ok: true })) } }));
jest.mock('../../src/data/supabase', () => ({ subirArchivo: jest.fn(async (ruta: string) => `https://supabase/${ruta}`) }));
jest.mock('../../src/features/pago/services/pagoService', () => ({ pagoService: { getPantalla: jest.fn() } }));

const m = (f: unknown) => f as jest.Mock;
beforeEach(() => jest.clearAllMocks());

describe('Servicio de pedidos del cliente', () => {
  const crudo = {
    id: '15', fecha_pedido: 'f', estado: 'PENDIENTE', total_productos: '300', costo_envio: '0', total_general: '300',
    monto_anticipo: '150', monto_restante: '150', direccion_envio: 'Centro', fecha_entrega_estimada: 'e',
    metodo_entrega_nombre: 'Envío', metodo_pago_nombre: 'Transferencia',
    detalles: [{ variante_id: '1', producto_nombre: 'Taza', color: 'Rojo', imagen_url: 'i', cantidad: '2', precio_unitario: '50', subtotal: '100' }, { variante_id: 2 }],
    pagos: [{ id: '1', tipo_pago: 'ANTICIPO', monto: '150', comprobante_url: 'c', estado_pago: 'APROBADO', notas_admin: 'n', fecha_pago: 'f' }, { id: 2 }],
  };

  it('PSC-01 · convierte la lista de pedidos y tolera null', async () => {
    m(pedidosApi.getAll).mockResolvedValueOnce([crudo, { id: 3 }]);
    const lista = await pedidoService.getAll();
    expect(lista[0]).toMatchObject({ id: 15, total_general: 300, direccion_envio: 'Centro', metodo_pago_nombre: 'Transferencia' });
    expect(lista[0].detalles[1]).toMatchObject({ color: null, imagen_url: null });
    expect(lista[0].pagos[1]).toMatchObject({ comprobante_url: null, notas_admin: null, fecha_pago: null });
    expect(lista[1]).toMatchObject({ direccion_envio: null, metodo_entrega_nombre: '', metodo_pago_nombre: null, detalles: [], pagos: [] });
    m(pedidosApi.getAll).mockResolvedValueOnce(null);
    expect(await pedidoService.getAll()).toEqual([]);
  });

  it('PSC-02 · el detalle junta diseños y previas (ordenadas) aunque alguno falle', async () => {
    m(pedidosApi.getById).mockResolvedValue(crudo);
    m(pedidosApi.getDisenos).mockResolvedValueOnce({ disenos: [{ id: '1', variante_id: '1', archivo_url: 'a', notas_cliente: 'n', fecha_envio: 'f' }, { id: 2, variante_id: null }] });
    m(pedidosApi.getPrevias).mockResolvedValueOnce({ previas: [{ id: 2, numero_previa: 2, imagen_url: 'b', aprobada: 1 }, { id: 1 }] });
    const p = await pedidoService.getById(15);
    expect(p.disenos[0]).toMatchObject({ variante_id: 1, archivo_url: 'a' });
    expect(p.disenos[1]).toMatchObject({ variante_id: null, archivo_url: null, notas_cliente: null, fecha_envio: null });
    expect(p.previas.map((x) => x.numero_previa)).toEqual([0, 2]);
    expect(p.previas[0]).toMatchObject({ imagen_url: '', fecha_subida: null, comentario_cliente: null });

    m(pedidosApi.getDisenos).mockRejectedValueOnce(new Error('404'));
    m(pedidosApi.getPrevias).mockRejectedValueOnce(new Error('404'));
    const sinExtras = await pedidoService.getById(15);
    expect(sinExtras).toMatchObject({ disenos: [], previas: [] });
  });

  it('PSC-03 · aprueba y rechaza previas', async () => {
    await pedidoService.aprobarPrevia(15, 1);
    await pedidoService.rechazarPrevia(15, 1, 'Cambiar color');
    expect(pedidosApi.aprobarPrevia).toHaveBeenCalledWith(15, 1);
    expect(pedidosApi.rechazarPrevia).toHaveBeenCalledWith(15, 1, 'Cambiar color');
  });
});

describe('Avisos y chat del cliente', () => {
  it('PSC-04 · convierte los avisos y su contador', async () => {
    m(notificacionesApi.getAll).mockResolvedValueOnce({
      notificaciones: [{ id: '1', pedido_id: '15', tipo: 'CHAT', titulo: 'T', mensaje: 'M', leida: 1, creado_en: 'f' }, { id: 2, pedido_id: null }],
      noLeidas: '3',
    });
    const r = await notificacionesService.getAll();
    expect(r.noLeidas).toBe(3);
    expect(r.notificaciones[0]).toMatchObject({ pedido_id: 15, leida: true });
    expect(r.notificaciones[1]).toMatchObject({ pedido_id: null, titulo: '', mensaje: '', leida: false });
    m(notificacionesApi.getAll).mockResolvedValueOnce({});
    expect(await notificacionesService.getAll()).toEqual({ notificaciones: [], noLeidas: 0 });
    await notificacionesService.marcarLeida(1);
    await notificacionesService.marcarTodasLeidas();
    await notificacionesService.eliminar(1);
    expect(notificacionesApi.eliminar).toHaveBeenCalledWith(1);
  });

  it('PSC-05 · convierte el chat del cliente y envía el texto limpio', async () => {
    m(chatClienteApi.getMensajes).mockResolvedValueOnce({ mensajes: [{ id: '1', remitente_id: '7', remitente_nombre: 'Ana', mensaje: 'Hola', fecha_envio: 'f' }, { id: 2, remitente_id: 1 }] });
    const chat = await chatClienteService.getMensajes(15);
    expect(chat[1]).toMatchObject({ remitente_nombre: '', mensaje: '', fecha_envio: null });
    m(chatClienteApi.getMensajes).mockResolvedValueOnce(null);
    expect(await chatClienteService.getMensajes(15)).toEqual([]);
    await chatClienteService.enviar(15, '  ¿Ya está?  ');
    expect(chatClienteApi.enviarMensaje).toHaveBeenCalledWith(15, '¿Ya está?');
  });
});

describe('Diseños del pedido', () => {
  it('PSC-06 · sube un archivo por producto y avisa al backend una sola vez', async () => {
    const pedido = crearPedido();
    await disenoService.enviar({
      pedido,
      archivos: { 1: { uri: 'file://a.PDF', name: 'a.PDF', mimeType: 'application/pdf' }, 2: { uri: 'file://b', name: '', mimeType: 'image/jpeg' } } as any,
      notas: { 1: '  Logo grande  ' },
      usuarioId: 7,
    });
    expect(m(subirArchivo).mock.calls[0][0]).toMatch(/^disenos\/usuario_7\/diseno_pedido_15_prod_1_\d+\.pdf$/);
    expect(m(subirArchivo).mock.calls[1][0]).toMatch(/\.jpg$/);
    expect(disenoApi.enviarDisenos).toHaveBeenCalledTimes(1);
    const enviados = m(disenoApi.enviarDisenos).mock.calls[0][1];
    expect(enviados[0].notas_cliente).toBe('Logo grande');
    expect(enviados[1].notas_cliente).toBe('');
  });
});

describe('Servicio legal', () => {
  it('PSC-07 · limpia las políticas y descarta las vacías', async () => {
    m(legalApi.getPoliticas).mockResolvedValueOnce({ data: [{ id: '1', descripcion: '  Política  ' }, { id: 2, descripcion: '   ' }, { id: 3 }] });
    expect(await legalService.getPoliticas()).toEqual([{ id: 1, descripcion: 'Política' }]);
    m(legalApi.getPoliticas).mockResolvedValueOnce(null);
    expect(await legalService.getPoliticas()).toEqual([]);
  });

  it('PSC-08 · regresa el mensaje del backend o uno por defecto', async () => {
    m(legalApi.solicitarEliminacion).mockResolvedValueOnce({ message: 'Solicitud registrada' }).mockResolvedValueOnce(null);
    expect(await legalService.solicitarEliminacion('a@c', 'x')).toBe('Solicitud registrada');
    expect(await legalService.solicitarEliminacion('a@c', 'x')).toBe('Recibimos tu solicitud.');
  });

  it('PSC-09 · busca el correo de contacto y regresa null si no hay o si falla', async () => {
    m(contactoApi.getContactos)
      .mockResolvedValueOnce([{ tipo_contacto: 'Telefono', valor_contacto: '771' }, { tipo_contacto: 'Correo', valor_contacto: 'novagraf@gmail.com' }])
      .mockResolvedValueOnce([{ valor_contacto: 'x' }])
      .mockRejectedValueOnce(new Error('red'));
    expect(await legalService.correoEmpresa()).toBe('novagraf@gmail.com');
    expect(await legalService.correoEmpresa()).toBeNull();
    expect(await legalService.correoEmpresa()).toBeNull();
  });
});

describe('Pago final', () => {
  const pedido = { ...crearPedido({ total_general: 300 }), pagos: [
    { id: 1, tipo_pago: 'ANTICIPO', monto: 150, estado_pago: 'APROBADO' },
    { id: 2, tipo_pago: 'SALDO_FINAL', monto: 150, estado_pago: 'RECHAZADO' },
    { id: 3, tipo_pago: 'SALDO_FINAL', monto: 150, estado_pago: 'PENDIENTE' },
  ] } as any;

  it('PSC-10 · calcula lo pagado, lo pendiente y el último pago final', async () => {
    m(pagoService.getPantalla).mockResolvedValueOnce({ pedido, metodo: { nombre: 'Transferencia' } });
    const p = await pagoFinalService.getPantalla(15);
    expect(p).toMatchObject({ pagado: 150, montoPendiente: 150 });
    expect(p.pagoFinal?.id).toBe(3);
    m(pagoService.getPantalla).mockResolvedValueOnce({ pedido: { ...pedido, pagos: [{ id: 1, tipo_pago: 'ANTICIPO', monto: 400, estado_pago: 'APROBADO' }] }, metodo: null });
    const sinFinal = await pagoFinalService.getPantalla(15);
    expect(sinFinal).toMatchObject({ montoPendiente: 0, pagoFinal: null });
  });

  it('PSC-11 · con comprobante lo sube con un nombre limpio; sin archivo es pago en tienda', async () => {
    const pantalla = { pedido, metodo: null, pagado: 150, montoPendiente: 150, pagoFinal: null } as any;
    await pagoFinalService.registrar({ pantalla, archivo: { uri: 'u', name: 'c.PNG', mimeType: 'image/png' } as any, nota: ' listo ', usuarioId: 7, nombreCliente: 'José Ñúñez' });
    expect(m(subirArchivo).mock.calls[0][0]).toMatch(/^comprobantes\/usuario_7\/PAGO_FINAL_Pedido_15_Cliente_Jose_Nunez_.+\.png$/);
    expect(pagoApi.registrarPagoFinal).toHaveBeenLastCalledWith(15, expect.objectContaining({ tipo_pago: 'SALDO_FINAL', monto: 150, notas_admin: 'listo' }));

    await pagoFinalService.registrar({ pantalla, archivo: { uri: 'u', name: '', mimeType: 'image/jpeg' } as any, nota: '', usuarioId: 7, nombreCliente: '***' });
    expect(m(subirArchivo).mock.calls[1][0]).toMatch(/Cliente_cliente_.+\.jpg$/);

    await pagoFinalService.registrar({ pantalla, archivo: null, nota: '   ', usuarioId: 7, nombreCliente: 'Ana' });
    expect(pagoApi.registrarPagoFinal).toHaveBeenLastCalledWith(15, expect.objectContaining({ comprobante_url: 'TIENDA_FISICA', notas_admin: null }));
  });
});
