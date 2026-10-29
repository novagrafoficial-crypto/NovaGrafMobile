import {
  construirEtapas, indiceEtapaActual, progresoPedido, pagoAnticipo, TOTAL_ETAPAS,
} from '../../src/features/pedidos/utils/etapasPedido';
import { crearPedido, crearPago } from '../../test-utils/fabricas';

describe('Etapas del pedido (flujo paso a paso)', () => {
  it('un pedido nuevo está en la etapa de anticipo', () => {
    const etapas = construirEtapas(crearPedido());
    expect(etapas).toHaveLength(TOTAL_ETAPAS);
    expect(etapas[0].estado).toBe('completada');
    expect(etapas[1].estado).toBe('actual');
    expect(etapas[1].resumen).toBe('Paga el anticipo para iniciar');
  });

  it('el resumen del pedido suma las piezas', () => {
    expect(construirEtapas(crearPedido())[0].resumen).toBe('3 piezas · Recoger en tienda');
  });

  it('en producción, las etapas anteriores quedan completadas', () => {
    const etapas = construirEtapas(crearPedido({ estado: 'EN_PRODUCCION' }));
    expect(etapas.slice(0, 4).every((e) => e.estado === 'completada')).toBe(true);
    expect(etapas[4].estado).toBe('actual');
  });

  it('un pedido cancelado solo marca la primera etapa y su progreso es 0', () => {
    const p = crearPedido({ estado: 'CANCELADO' });
    const etapas = construirEtapas(p);
    expect(etapas[0].estado).toBe('completada');
    expect(etapas.slice(1).every((e) => e.estado === 'pendiente')).toBe(true);
    expect(progresoPedido(p)).toBe(0);
  });

  it('un pedido enviado tiene progreso completo', () => {
    const p = crearPedido({ estado: 'ENVIADO' });
    expect(indiceEtapaActual(p)).toBe(7);
    expect(progresoPedido(p)).toBe(1);
  });

  it('toma el comprobante de anticipo más reciente', () => {
    const p = crearPedido({ pagos: [crearPago(1, 'ANTICIPO', 'RECHAZADO'), crearPago(2, 'ANTICIPO', 'PENDIENTE')] });
    expect(pagoAnticipo(p)?.id).toBe(2);
  });

  it('avisa cuando el comprobante de anticipo fue rechazado', () => {
    const p = crearPedido({ pagos: [crearPago(1, 'ANTICIPO', 'RECHAZADO')] });
    expect(construirEtapas(p)[1].resumen).toBe('Comprobante rechazado, súbelo de nuevo');
  });
});
