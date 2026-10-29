/**
 * Prueba de integración: Checkout (creación del pedido)
 * Flujo: Carrito (CartProvider) → useCheckoutViewModel → checkoutService → checkoutApi
 *        → apiClient (HTTP simulado) → navegación a la pantalla de pago
 */
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { router, reiniciarRouter } from '../../test-utils/mocksExpo';
import { AuthProvider } from '../../src/shared/providers/AuthProvider';
import { CartProvider } from '../../src/features/carrito/providers/CartProvider';
import { useCheckoutViewModel } from '../../src/features/checkout/viewmodels/useCheckoutViewModel';
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

const api = apiClient as unknown as Record<'get' | 'post', jest.Mock>;

// Simula las rutas del backend que usa el checkout (costos llegan como texto)
const backend: Record<string, unknown> = {
  '/client/carrito': {
    items: [{ detalle_id: '5', variante_id: '11', producto_id: '3', producto_nombre: 'Taza', cantidad: '2', precio_unitario: '100.00', subtotal: '200.00' }],
    total: '200.00',
  },
  '/client/checkout/tiendas-fisicas': [{ id: '1', tipo: 'TIENDA', nombre: 'Tienda Matriz', descripcion: 'Centro, Huejutla', costo: '0.00' }],
  '/client/checkout/puntos-medios': [],
  '/client/checkout/colonias': [{ id: '3', tipo: 'ENVIO_LOCAL', nombre: 'Col. Centro', costo: '40.00' }],
  '/client/checkout/metodos-pago': [{ id: '2', nombre: 'Transferencia', tipo: 'TRANSFERENCIA', requiere_comprobante: true }],
};

const Proveedores = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <CartProvider>{children}</CartProvider>
  </AuthProvider>
);

const abrirCheckout = async () => {
  const hook = await renderHook(() => useCheckoutViewModel(), { wrapper: Proveedores });
  await waitFor(() => expect(hook.result.current.cargando).toBe(false));
  await waitFor(() => expect(hook.result.current.subtotal).toBe(200));
  return hook;
};

describe('Integración: checkout y creación del pedido', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    reiniciarRouter();
    api.get.mockImplementation(async (url: string) => ({ data: backend[url] }));
  });

  it('PI-11 · carga del backend solo las categorías de entrega que tienen opciones', async () => {
    const { result } = await abrirCheckout();
    expect(result.current.categorias.map((c) => c.key)).toEqual(['TIENDA', 'ENVIO_LOCAL']);
    expect(result.current.metodosPago[0]).toMatchObject({ id: 2, requiere_comprobante: true });
  });

  it('PI-12 · no deja avanzar sin elegir método de entrega', async () => {
    const { result } = await abrirCheckout();
    await act(() => result.current.siguiente()); // Compra → Entrega
    await act(() => result.current.siguiente()); // intenta pasar a Pago sin elegir

    expect(result.current.paso).toBe(1);
    expect(result.current.errorEnvio).toBe('Elige cómo quieres recibir tu pedido.');
  });

  it('PI-13 · envío a domicilio suma el costo de envío al total y al anticipo', async () => {
    const { result } = await abrirCheckout();
    await act(() => result.current.elegirCategoria('ENVIO_LOCAL'));
    await act(() => result.current.elegirEntrega(3));

    expect(result.current.costoEnvio).toBe(40);
    expect(result.current.totalGeneral).toBe(240);
    expect(result.current.montoAnticipo).toBe(120);
  });

  it('PI-14 · confirma el pedido en tienda, lo crea en el backend y abre la pantalla de pago', async () => {
    api.post.mockResolvedValue({ data: { pedido_id: '42' } });
    const { result } = await abrirCheckout();
    await act(() => result.current.elegirCategoria('TIENDA'));
    await act(() => result.current.elegirEntrega(1));
    await act(() => result.current.elegirPago(2));
    await act(() => result.current.confirmar());

    expect(api.post).toHaveBeenCalledWith('/client/checkout/crear-pedido', {
      metodo_entrega_id: 1,
      metodo_pago_id: 2,
      direccion_envio: 'Centro, Huejutla',
      distancia_km: 0,
    });
    expect(router.replace).toHaveBeenCalledWith('/(cliente)/pago-pedido/42');
  });

  it('PI-15 · si el backend rechaza el pedido muestra su mensaje y no navega', async () => {
    api.post.mockRejectedValue({ response: { data: { message: 'Stock insuficiente' } } });
    const { result } = await abrirCheckout();
    await act(() => result.current.elegirCategoria('TIENDA'));
    await act(() => result.current.elegirEntrega(1));
    await act(() => result.current.elegirPago(2));
    await act(() => result.current.confirmar());

    expect(result.current.errorEnvio).toBe('Stock insuficiente');
    expect(router.replace).not.toHaveBeenCalled();
  });
});
