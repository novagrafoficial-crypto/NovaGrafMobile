/**
 * Prueba de integración: Inicio de sesión
 * Flujo: Usuario → LoginView → useLoginViewModel → authService (Factory Method)
 *        → authApi → apiClient (HTTP simulado) → AuthProvider → navegación por rol
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { router, reiniciarRouter } from '../../test-utils/mocksExpo';
import { LoginView } from '../../src/features/autenticacion/views/LoginView';
import { AuthProvider } from '../../src/shared/providers/AuthProvider';
import apiClient from '../../src/data/api/ApiClient';
import { SessionStorage } from '../../src/data/SessionStorage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

jest.mock('expo-router', () => ({ useRouter: () => require('../../test-utils/mocksExpo').router }));
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(async () => true),
    signOut: jest.fn(async () => null),
    signIn: jest.fn(),
  },
  isSuccessResponse: (r: { type: string }) => r.type === 'success',
  isErrorWithCode: (e: any) => e != null && 'code' in e,
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  },
}));
jest.mock('../../src/data/SessionStorage', () => ({
  SessionStorage: { get: jest.fn(async () => null), save: jest.fn(), clear: jest.fn() },
}));
jest.mock('../../src/data/api/ApiClient', () => {
  const cliente = { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() };
  return { __esModule: true, default: cliente, apiClient: cliente };
});

const post = apiClient.post as jest.Mock;

const pantallaLogin = async () => {
  await render(
    <AuthProvider>
      <LoginView />
    </AuthProvider>,
  );
};

const escribirCredenciales = async (correo: string, contrasena: string) => {
  await fireEvent.changeText(screen.getByPlaceholderText('nombre@correo.com'), correo);
  await fireEvent.changeText(screen.getByPlaceholderText('Tu contraseña'), contrasena);
};

describe('Integración: inicio de sesión', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    reiniciarRouter();
  });

  it('PI-01 · no llama al backend si el formulario está vacío y muestra los errores', async () => {
    await pantallaLogin();
    await fireEvent.press(screen.getByText('Iniciar sesión'));

    expect(await screen.findByText('Escribe tu correo')).toBeOnTheScreen();
    expect(screen.getByText('Escribe tu contraseña')).toBeOnTheScreen();
    expect(post).not.toHaveBeenCalled();
  });

  it('PI-02 · cliente con credenciales válidas: guarda la sesión y entra al inicio del cliente', async () => {
    post.mockResolvedValue({
      data: { token: 'jwt-cliente', user: { id_usuario: 7, nombre: 'Ana', rol: 'cliente' } },
    });
    await pantallaLogin();
    await escribirCredenciales('  ana@correo.com ', 'clave1234');
    await fireEvent.press(screen.getByText('Iniciar sesión'));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/(cliente)/inicio'));
    expect(post).toHaveBeenCalledWith('/users/login', { email: 'ana@correo.com', password: 'clave1234' });
    expect(SessionStorage.save).toHaveBeenCalledWith(
      expect.objectContaining({ id_usuario: 7, rol: 'cliente', token: 'jwt-cliente' }),
    );
  });

  it('PI-03 · administrador: redirige al panel de administración', async () => {
    post.mockResolvedValue({ data: { token: 'jwt-admin', user: { id_usuario: 1, rol: 'administrador' } } });
    await pantallaLogin();
    await escribirCredenciales('admin@novagraf.com', 'admin1234');
    await fireEvent.press(screen.getByText('Iniciar sesión'));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/(admin)/dashboard'));
  });

  it('PI-04 · credenciales incorrectas: muestra el mensaje del backend y no navega', async () => {
    post.mockRejectedValue({ response: { status: 401, data: { message: 'Contraseña incorrecta' } } });
    await pantallaLogin();
    await escribirCredenciales('ana@correo.com', 'mala1234');
    await fireEvent.press(screen.getByText('Iniciar sesión'));

    expect(await screen.findByText('Contraseña incorrecta')).toBeOnTheScreen();
    expect(router.replace).not.toHaveBeenCalled();
    expect(SessionStorage.save).not.toHaveBeenCalled();
  });

  it('PI-05 · cuenta sin activar: envía al usuario a verificar su cuenta', async () => {
    post.mockRejectedValue({ response: { status: 403, data: { code: 'NOT_ACTIVE', id_usuario: 9 } } });
    await pantallaLogin();
    await escribirCredenciales('nuevo@correo.com', 'clave1234');
    await fireEvent.press(screen.getByText('Iniciar sesión'));

    await waitFor(() =>
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/(auth)/verify-account',
        params: { id_usuario: '9' },
      }),
    );
  });
  
  it('PI-06 · Google: envía el idToken al backend y entra al inicio del cliente', async () => {
    (GoogleSignin.signIn as jest.Mock).mockResolvedValue({
      type: 'success',
      data: { idToken: 'id-token-google', user: { email: 'ana@gmail.com' } },
    });
    post.mockResolvedValue({
      data: { id_usuario: 7, nombre: 'Ana', rol: 'cliente', token: 'jwt-google' },
    });
    await pantallaLogin();
    await fireEvent.press(screen.getByText('Continuar con Google'));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/(cliente)/inicio'));
    expect(post).toHaveBeenCalledWith('/auth/google/mobile', { idToken: 'id-token-google' });
    expect(SessionStorage.save).toHaveBeenCalledWith(
      expect.objectContaining({ id_usuario: 7, rol: 'cliente', token: 'jwt-google' }),
    );
  });

  it('PI-07 · Google cancelado: no llama al backend ni navega', async () => {
    (GoogleSignin.signIn as jest.Mock).mockResolvedValue({ type: 'cancelled', data: null });
    await pantallaLogin();
    await fireEvent.press(screen.getByText('Continuar con Google'));

    await waitFor(() => expect(GoogleSignin.signIn).toHaveBeenCalled());
    expect(post).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
