
import { cartApi } from '../../src/data/api/cartApi';
import { cartService } from '../../src/features/carrito/services/cartService';

jest.mock('../../src/data/api/cartApi', () => ({
  cartApi: {
    getCart: jest.fn(),
    addToCart: jest.fn(),
    updateQuantity: jest.fn(),
    removeItem: jest.fn(),
    clearCart: jest.fn(),
  },
}));

describe('Pruebas del servicio del carrito', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe convertir los datos del carrito a los tipos correctos', async () => {
    (cartApi.getCart as jest.Mock).mockResolvedValue({
      items: [
        {
          detalle_id: '1',
          variante_id: '2',
          producto_id: '3',
          producto_nombre: 'Taza personalizada',
          color: null,
          imagen_url: null,
          cantidad: '2',
          precio_unitario: '50.00',
          subtotal: '100.00',
        },
      ],
      total: '100.00',
    });

    const resultado = await cartService.getCart();

    expect(resultado.total).toBe(100);
    expect(resultado.items).toHaveLength(1);
    expect(resultado.items[0].detalle_id).toBe(1);
    expect(resultado.items[0].cantidad).toBe(2);
    expect(resultado.items[0].precio_unitario).toBe(50);
    expect(resultado.items[0].subtotal).toBe(100);
    expect(resultado.items[0].producto_nombre).toBe('Taza personalizada');
  });

  it('debe devolver un carrito vacío cuando la API no proporciona items', async () => {
    (cartApi.getCart as jest.Mock).mockResolvedValue({});

    const resultado = await cartService.getCart();

    expect(resultado.items).toEqual([]);
    expect(resultado.total).toBe(0);
  });

  it('debe enviar la variante y la cantidad correctas al agregar un producto', async () => {
    (cartApi.addToCart as jest.Mock).mockResolvedValue({
      mensaje: 'Producto agregado',
    });

    await cartService.addToCart(15, 2);

    expect(cartApi.addToCart).toHaveBeenCalledWith(15, 2);
  });

  it('debe enviar el identificador y la cantidad al actualizar un producto', async () => {
    (cartApi.updateQuantity as jest.Mock).mockResolvedValue({});

    await cartService.updateQuantity(8, 3);

    expect(cartApi.updateQuantity).toHaveBeenCalledWith(8, 3);
  });

  it('debe solicitar la eliminación del producto indicado', async () => {
    (cartApi.removeItem as jest.Mock).mockResolvedValue({});

    await cartService.removeItem(8);

    expect(cartApi.removeItem).toHaveBeenCalledWith(8);
  });

  it('debe solicitar que se vacíe el carrito', async () => {
    (cartApi.clearCart as jest.Mock).mockResolvedValue({});

    await cartService.clearCart();

    expect(cartApi.clearCart).toHaveBeenCalledTimes(1);
  });
});
