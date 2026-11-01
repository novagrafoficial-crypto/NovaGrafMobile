/**
 * Interceptor 401: cuando el token expira, se avisa para cerrar la sesión.
 */
import { sessionEvents } from '../../src/data/sessionEvents';
import apiClient from '../../src/data/api/ApiClient';

jest.mock('../../src/data/SessionStorage', () => ({
  SessionStorage: { get: jest.fn(async () => ({ token: 'jwt-vencido' })), save: jest.fn(), clear: jest.fn() },
}));

// ApiClient REAL con un adaptador falso que responde el código indicado.
const responder = (status: number) => {
  apiClient.defaults.adapter = async (config) => {
    const error: any = new Error(`HTTP ${status}`);
    error.config = config;
    error.response = { status, data: {}, headers: {}, config };
    throw error;
  };
};

describe('Interceptor 401 Unauthorized', () => {
  it('PS-05 · un 401 con token emite "sesión expirada"', async () => {
    const escucha = jest.fn();
    const quitar = sessionEvents.onSesionExpirada(escucha);
    responder(401);
    await expect(apiClient.get('/client/carrito')).rejects.toBeTruthy();
    expect(escucha).toHaveBeenCalledTimes(1);
    quitar();
  });

  it('PS-06 · otros errores (500) no cierran la sesión', async () => {
    const escucha = jest.fn();
    const quitar = sessionEvents.onSesionExpirada(escucha);
    responder(500);
    await expect(apiClient.get('/client/carrito')).rejects.toBeTruthy();
    expect(escucha).not.toHaveBeenCalled();
    quitar();
  });
});
