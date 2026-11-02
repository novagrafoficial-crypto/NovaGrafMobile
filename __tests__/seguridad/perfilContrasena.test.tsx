/**
 * Perfil (cliente y admin): conexión del cambio de contraseña con el servicio,
 * y cierre de sesión global cuando el backend invalida el token.
 */
import React from 'react';
import { renderHook, act, render } from '@testing-library/react-native';
import { useAdminProfileViewModel } from '../../src/features/perfil-admin/viewmodels/useAdminProfileViewModel';
import { useClientProfileViewModel } from '../../src/features/perfil-cliente/viewmodels/useClientProfileViewModel';
import { adminProfileService } from '../../src/features/perfil-admin/services/adminProfileService';
import { clientProfileService } from '../../src/features/perfil-cliente/services/clientProfileService';
import { AuthProvider } from '../../src/shared/providers/AuthProvider';
import { useAuth } from '../../src/shared/hooks/useAuth';
import { sessionEvents } from '../../src/data/sessionEvents';
import { SessionStorage } from '../../src/data/SessionStorage';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn(), replace: jest.fn() }) }));
jest.mock('../../src/features/notificaciones', () => ({ useNotificaciones: () => ({ noLeidas: 0 }) }));
jest.mock('../../src/data/SessionStorage', () => ({
  SessionStorage: {
    get: jest.fn(async () => ({ id_usuario: 7, rol: 'cliente', token: 'jwt' })),
    save: jest.fn(),
    clear: jest.fn(),
  },
}));
jest.mock('../../src/features/perfil-admin/services/adminProfileService', () => ({
  adminProfileService: { getProfile: jest.fn(async () => ({ id_usuario: 7, proveedor: 'local' })), changePassword: jest.fn(async () => ({ message: 'ok' })) },
}));
jest.mock('../../src/features/perfil-cliente/services/clientProfileService', () => ({
  clientProfileService: { getProfile: jest.fn(async () => ({ id_usuario: 7, proveedor: 'local' })), changePassword: jest.fn(async () => ({ message: 'ok' })) },
}));

const Proveedor = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;

describe('Perfil: cambio de contraseña y sesión', () => {
  beforeEach(() => jest.clearAllMocks());

  it('PS-18 · el perfil del admin envía la contraseña al servicio y abre/cierra el formulario', async () => {
    const { result } = await renderHook(() => useAdminProfileViewModel(), { wrapper: Proveedor });
    await act(async () => {});
    await act(() => result.current.alternarPw());
    expect(result.current.verPw).toBe(true);
    await act(async () => {
      await result.current.cambiarContrasena('vieja1234', 'nueva1234');
    });
    expect(adminProfileService.changePassword).toHaveBeenCalledWith(7, { actual: 'vieja1234', nueva: 'nueva1234' });
  });

  it('PS-19 · el perfil del cliente envía la contraseña al servicio y abre/cierra el formulario', async () => {
    const { result } = await renderHook(() => useClientProfileViewModel(), { wrapper: Proveedor });
    await act(async () => {});
    await act(() => result.current.alternarPwForm());
    expect(result.current.showPwForm).toBe(true);
    await act(async () => {
      await result.current.cambiarContrasena('vieja1234', 'nueva1234');
    });
    expect(clientProfileService.changePassword).toHaveBeenCalledWith(7, { actual: 'vieja1234', nueva: 'nueva1234' });
  });

  it('PS-20 · si el backend invalida el token, AuthProvider cierra la sesión', async () => {
    let auth: ReturnType<typeof useAuth> | null = null;
    const Espia = () => {
      auth = useAuth();
      return null;
    };
    await render(<AuthProvider><Espia /></AuthProvider>);
    await act(async () => {});
    expect(auth!.user).not.toBeNull();

    await act(async () => sessionEvents.emitirSesionExpirada());
    expect(auth!.user).toBeNull();
    expect(SessionStorage.clear).toHaveBeenCalled();
  });
});
