/**
 * Prueba de integración: Registro con Google
 * Flujo: Usuario → RegisterView → useRegisterViewModel → useGoogleSignIn
 *        → authService (Factory Method) → authApi → AuthProvider → navegación por rol
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { router, reiniciarRouter } from '../../test-utils/mocksExpo';
import { RegisterView } from '../../src/features/autenticacion/views/RegisterView';
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

const pantallaRegistro = async () => {
  await render(
    <AuthProvider>
      <RegisterView />
    </AuthProvider>,
  );
};

describe('Integración: registro con Google', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    reiniciarRouter();
  });

  it('PI-08 · crea/inicia la cuenta con Google y entra al inicio del cliente', async () => {
    (GoogleSignin.signIn as jest.Mock).mockResolvedValue({
      type: 'success',
      data: { idToken: 'id-token-nuevo', user: { email: 'nuevo@gmail.com' } },
    });
    post.mockResolvedValue({
      data: { id_usuario: 12, nombre: 'Nuevo', rol: 'cliente', token: 'jwt-nuevo' },
    });
    await pantallaRegistro();
    await fireEvent.press(screen.getByText('Continuar con Google'));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/(cliente)/inicio'));
    expect(post).toHaveBeenCalledWith('/auth/google/mobile', { idToken: 'id-token-nuevo' });
    expect(SessionStorage.save).toHaveBeenCalledWith(
      expect.objectContaining({ id_usuario: 12, rol: 'cliente', token: 'jwt-nuevo' }),
    );
  });

  it('PI-09 · correo ya registrado con contraseña: muestra el mensaje del backend', async () => {
    (GoogleSignin.signIn as jest.Mock).mockResolvedValue({
      type: 'success',
      data: { idToken: 'id-token-local', user: { email: 'ana@gmail.com' } },
    });
    post.mockRejectedValue({
      response: {
        status: 400,
        data: { message: 'Este correo ya está registrado con contraseña. Inicia sesión con tu correo y contraseña.' },
      },
    });
    await pantallaRegistro();
    await fireEvent.press(screen.getByText('Continuar con Google'));

    expect(await screen.findByText(/ya está registrado con contraseña/)).toBeOnTheScreen();
    expect(router.replace).not.toHaveBeenCalled();
    expect(SessionStorage.save).not.toHaveBeenCalled();
  });
});