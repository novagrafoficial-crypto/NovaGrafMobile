/**
 * Prueba de integración: ApiClient + Certificate Pinning
 * Flujo: petición de axios → interceptor de ApiClient → asegurarPinning()
 *        → CertificatePinner (simulado) → adaptador HTTP
 */
import { initializeSslPinning } from 'react-native-ssl-public-key-pinning';
import apiClient from '../../src/data/api/ApiClient';

jest.mock('../../src/constants/app', () => ({
  API_URL: 'https://nova-graf-zbdt.onrender.com/api',
  API_TIMEOUT: 15000,
}));
jest.mock('../../src/data/SessionStorage', () => ({
  SessionStorage: { get: jest.fn(async () => ({ token: 'jwt' })), save: jest.fn(), clear: jest.fn() },
}));

const iniciar = initializeSslPinning as jest.Mock;

describe('Integración: ApiClient con certificate pinning', () => {
  it('PI-23 · el pinning se activa ANTES de que salga la primera petición y solo una vez', async () => {
    const orden: string[] = [];
    iniciar.mockImplementation(async () => {
      orden.push('pinning');
    });
    apiClient.defaults.adapter = async (config) => {
      orden.push(`GET ${config.url}`);
      return { data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config };
    };

    await apiClient.get('/client/carrito');
    await apiClient.get('/client/pedidos');

    expect(orden).toEqual(['pinning', 'GET /client/carrito', 'GET /client/pedidos']);
    expect(iniciar).toHaveBeenCalledWith(
      expect.objectContaining({ 'nova-graf-zbdt.onrender.com': expect.objectContaining({ includeSubdomains: false }) })
    );
  });

  it('PI-24 · la petición sigue llevando el token Bearer', async () => {
    let autorizacion: unknown;
    apiClient.defaults.adapter = async (config) => {
      autorizacion = config.headers?.Authorization;
      return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
    };
    await apiClient.get('/users/profile/7');
    expect(autorizacion).toBe('Bearer jwt');
  });
});
