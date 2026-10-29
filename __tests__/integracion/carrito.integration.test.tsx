/**
 * Prueba de integración: Carrito
 * Flujo: AuthProvider (sesión de cliente) → CartProvider → CartView → useCartViewModel
 *        → cartService → cartApi → apiClient (HTTP simulado)
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { router, reiniciarRouter } from '../../test-utils/mocksExpo';
import { AuthProvider } from '../../src/shared/providers/AuthProvider';
import { CartProvider } from '../../src/features/carrito/providers/CartProvider';
import { CartView } from '../../src/features/carrito/views/CartView';
import apiClient from '../../src/data/api/ApiClient';

jest.mock('expo-router', () => ({ useRouter: () => require('../../test-utils/mocksExpo').router }));
jest.mock('../../src/data/SessionStorage', () => ({
  SessionStorage: {
    get: jest.fn(async () => ({ id_usuario: 7, nombre: 'Ana', rol: 'cliente', token: 'jwt' })),
    save: jest.fn(),
    clear: jest.fn(),
  },
}));
jest.mock('../../src/data/api/ApiClient', () => {
  const cliente = { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() };
  return { __esModule: true, default: cliente, apiClient: cliente };
});

const api = apiClient as unknown as Record<'get' | 'post' | 'put' | 'delete', jest.Mock>;

// Respuesta del backend tal como llega de PostgreSQL (números como texto)
const respuestaCarrito = (cantidad: number) => ({
  data: {
    items: [
      {
        detalle_id: '5', variante_id: '11', producto_id: '3',
        producto_nombre: 'Taza personalizada', color: 'Blanco', imagen_url: null,
        cantidad: String(cantidad), precio_unitario: '50.00', subtotal: (50 * cantidad).toFixed(2),
      },
    ],
    total: (50 * cantidad).toFixed(2),
  },
});

const pantallaCarrito = async () => {
  await render(
    <AuthProvider>
      <CartProvider>
        <CartView />
      </CartProvider>
    </AuthProvider>,
  );
};

describe('Integración: carrito de compras', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    reiniciarRouter();
  });

  it('PI-06 · carga el carrito del backend y muestra producto, total y anticipo del 50%', async () => {
    api.get.mockResolvedValue(respuestaCarrito(2));
    await pantallaCarrito();

    expect(await screen.findByText('Taza personalizada')).toBeOnTheScreen();
    expect(screen.getByText('Total (2 piezas)')).toBeOnTheScreen();
    expect(screen.getByText('$50.00')).toBeOnTheScreen(); // anticipo = 100 / 2
    expect(api.get).toHaveBeenCalledWith('/client/carrito');
  });

  it('PI-07 · al aumentar la cantidad actualiza el backend y recalcula el total', async () => {
    api.get.mockResolvedValueOnce(respuestaCarrito(2)).mockResolvedValue(respuestaCarrito(3));
    api.put.mockResolvedValue({ data: {} });
    await pantallaCarrito();
    await screen.findByText('Taza personalizada');

    await fireEvent.press(screen.getByLabelText('Agregar uno'));

    expect(await screen.findByText('Total (3 piezas)')).toBeOnTheScreen();
    expect(api.put).toHaveBeenCalledWith('/client/carrito/5', { cantidad: 3 });
  });

  it('PI-08 · eliminar pide confirmación, borra en el backend y avisa al usuario', async () => {
    api.get.mockResolvedValueOnce(respuestaCarrito(1)).mockResolvedValue({ data: { items: [], total: '0' } });
    api.delete.mockResolvedValue({ data: {} });
    await pantallaCarrito();
    await screen.findByText('Taza personalizada');

    await fireEvent.press(screen.getByLabelText('Eliminar Taza personalizada'));
    expect(await screen.findByText('Eliminar producto')).toBeOnTheScreen();
    expect(api.delete).not.toHaveBeenCalled(); // sin confirmar no se borra nada

    await fireEvent.press(screen.getByText('Sí, eliminar'));

    expect(await screen.findByText('Producto eliminado del carrito.')).toBeOnTheScreen();
    expect(screen.getByText('Tu carrito está vacío')).toBeOnTheScreen();
    expect(api.delete).toHaveBeenCalledWith('/client/carrito/5');
  });

  it('PI-09 · si el backend falla muestra el error y permite reintentar', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    api.get.mockRejectedValueOnce(new Error('Network Error')).mockResolvedValue(respuestaCarrito(1));
    await pantallaCarrito();

    expect(await screen.findByText('No se pudo cargar el carrito.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Reintentar'));

    expect(await screen.findByText('Taza personalizada')).toBeOnTheScreen();
  });

  it('PI-10 · "Continuar al pago" lleva al checkout', async () => {
    api.get.mockResolvedValue(respuestaCarrito(1));
    await pantallaCarrito();
    await screen.findByText('Taza personalizada');

    await fireEvent.press(screen.getByText('Continuar al pago'));

    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/(cliente)/checkout'));
  });
});
