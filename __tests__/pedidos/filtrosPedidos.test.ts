import { coincideFiltro, requiereAccion } from '../../src/features/pedidos/utils/filtrosPedidos';
import { crearPedido, crearPago } from '../../test-utils/fabricas';

describe('Filtros de "Mis pedidos"', () => {
  it('sin anticipo, el pedido requiere acción del cliente', () => {
    const p = crearPedido();
    expect(requiereAccion(p)).toBe(true);
    expect(coincideFiltro(p, 'ACCION')).toBe(true);
    expect(coincideFiltro(p, 'PROCESO')).toBe(false);
  });

  it('con anticipo en revisión, pasa a "En proceso"', () => {
    const p = crearPedido({ pagos: [crearPago(1, 'ANTICIPO', 'PENDIENTE')] });
    expect(requiereAccion(p)).toBe(false);
    expect(coincideFiltro(p, 'PROCESO')).toBe(true);
  });

  it('una previa sin responder requiere acción', () => {
    const p = crearPedido({
      estado: 'PREVIAS_ENVIADAS',
      previas: [{ id: 1, numero_previa: 1, imagen_url: 'x.png', aprobada: false, rechazada: false, fecha_subida: null, comentario_cliente: null }],
    });
    expect(requiereAccion(p)).toBe(true);
  });

  it('clasifica enviados y cancelados', () => {
    expect(coincideFiltro(crearPedido({ estado: 'ENVIADO' }), 'ENVIADOS')).toBe(true);
    const cancelado = crearPedido({ estado: 'CANCELADO' });
    expect(coincideFiltro(cancelado, 'CANCELADOS')).toBe(true);
    expect(coincideFiltro(cancelado, 'ACCION')).toBe(false);
  });
});
