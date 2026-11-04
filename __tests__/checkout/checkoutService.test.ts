import { checkoutApi } from '../../src/data/api/checkoutApi';
import { checkoutService } from '../../src/features/checkout/services/checkoutService';

jest.mock('../../src/data/api/checkoutApi', () => ({
  checkoutApi: {
    tiendas: jest.fn(),
    puntosMedios: jest.fn(),
    colonias: jest.fn(),
    metodosPago: jest.fn(),
    crearPedido: jest.fn(),
  },
}));

const api = checkoutApi as jest.Mocked<typeof checkoutApi>;

describe('Servicio de checkout', () => {
  beforeEach(() => jest.clearAllMocks());

  it('convierte los costos que llegan como texto a número', async () => {
    (api.tiendas as jest.Mock).mockResolvedValue([{ id: '1', tipo: 'TIENDA', nombre: 'Matriz', costo: '0.00' }]);
    (api.puntosMedios as jest.Mock).mockResolvedValue([]);
    (api.colonias as jest.Mock).mockResolvedValue([{ id: '3', tipo: 'COLONIA', nombre: 'Centro', costo: '35.50' }]);
    (api.metodosPago as jest.Mock).mockResolvedValue([{ id: '2', nombre: 'Transferencia', tipo: 'TRANSFERENCIA', requiere_comprobante: 1 }]);

    const r = await checkoutService.getOptions();
    expect(r.tiendas[0]).toMatchObject({ id: 1, costo: 0, descripcion: null });
    expect(r.colonias[0].costo).toBe(35.5);
    expect(r.metodosPago[0].requiere_comprobante).toBe(true);
  });

  it('no se rompe si la API regresa algo que no es lista', async () => {
    (api.tiendas as jest.Mock).mockResolvedValue(null);
    (api.puntosMedios as jest.Mock).mockResolvedValue(undefined);
    (api.colonias as jest.Mock).mockResolvedValue({});
    (api.metodosPago as jest.Mock).mockResolvedValue([]);
    const r = await checkoutService.getOptions();
    expect(r.tiendas).toEqual([]);
    expect(r.colonias).toEqual([]);
  });

  it('crea el pedido mandando distancia 0 y regresa el id', async () => {
    (api.crearPedido as jest.Mock).mockResolvedValue({ pedido_id: '42' });
    const id = await checkoutService.crearPedido({ metodo_pago_id: 2 } as any);
    expect(id).toBe(42);
    expect(api.crearPedido).toHaveBeenCalledWith(expect.objectContaining({ distancia_km: 0 }));
  });
});
