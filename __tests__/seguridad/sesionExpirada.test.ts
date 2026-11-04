/**
 * Interceptor 401: cuando el token expira, se avisa para cerrar la sesión.
 */
import { sessionEvents } from '../../src/data/sessionEvents';
import apiClient from '../../src/data/api/ApiClient';

jest.mock('../../src/data/SessionStorage', () => ({
  SessionStorage: { get: jest.fn(async () => ({ token: 'jwt-vencido' })), save: jest.fn(), clear: jest.fn() },
}));

// ApiClient REAL con un adaptador falso que responde el código indicado.
const responder = (status: number, data: object = {}) => {
  apiClient.defaults.adapter = async (config) => {
    const error: any = new Error(`HTTP ${status}`);
    error.config = config;
    error.response = { status, data, headers: {}, config };
    throw error;
  };
};

describe('Interceptor 401 Unauthorized', () => {
  it('PS-05 · un 401 "Sesión expirada" (contraseña cambiada) cierra la sesión', async () => {
    const escucha = jest.fn();
    const quitar = sessionEvents.onSesionExpirada(escucha);
    responder(401, { error: 'Sesión expirada' });
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

  it('PS-11 · un 403 "Token inválido" también cierra la sesión', async () => {
    const escucha = jest.fn();
    const quitar = sessionEvents.onSesionExpirada(escucha);
    responder(403, { error: 'Token inválido' });
    await expect(apiClient.get('/client/carrito')).rejects.toBeTruthy();
    expect(escucha).toHaveBeenCalledTimes(1);
    quitar();
  });

  it('PS-16 · un 401 que no es del token (p. ej. contraseña incorrecta) NO cierra la sesión', async () => {
    const escucha = jest.fn();
    const quitar = sessionEvents.onSesionExpirada(escucha);
    responder(401, { message: 'Contraseña actual incorrecta' });
    await expect(apiClient.get('/client/carrito')).rejects.toBeTruthy();
    expect(escucha).not.toHaveBeenCalled();
    quitar();
  });
});
