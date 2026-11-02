/**
 * Cambio de contraseña desde el perfil (cliente y admin)
 */
import { renderHook, act } from '@testing-library/react-native';
import { useCambioContrasena } from '../../src/shared/hooks/useCambioContrasena';

const mockRouter = { replace: jest.fn() };
const mockDeleteSession = jest.fn(async () => {});
jest.mock('expo-router', () => ({ useRouter: () => mockRouter }));
jest.mock('../../src/shared/hooks/useAuth', () => ({ useAuth: () => ({ deleteSession: mockDeleteSession }) }));

const escribir = async (r: any, actual: string, nueva: string, confirmar: string) => {
  await act(() => r.current.setCampo('actual', actual));
  await act(() => r.current.setCampo('nueva', nueva));
  await act(() => r.current.setCampo('confirmar', confirmar));
};

describe('Cambio de contraseña', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });
  afterEach(() => jest.useRealTimers());

  it('PS-12 · exige mínimo 8 caracteres con letra y número', async () => {
    const guardar = jest.fn();
    const { result } = await renderHook(() => useCambioContrasena(guardar));
    await escribir(result, 'vieja1234', 'abc12', 'abc12');
    expect(result.current.valido).toBe(false);
    await act(() => result.current.guardar());
    expect(guardar).not.toHaveBeenCalled();
  });

  it('PS-13 · la nueva debe ser distinta a la actual y coincidir con la confirmación', async () => {
    const { result } = await renderHook(() => useCambioContrasena(jest.fn()));
    await escribir(result, 'clave1234', 'clave1234', 'clave1234');
    expect(result.current.valido).toBe(false);
    await escribir(result, 'vieja1234', 'nueva1234', 'otra12345');
    expect(result.current.errores.confirmar).toBe('Las contraseñas no coinciden');
  });

  it('PS-14 · al cambiarla cierra la sesión y manda al login', async () => {
    const guardar = jest.fn(async () => ({ message: 'ok' }));
    const { result } = await renderHook(() => useCambioContrasena(guardar));
    await escribir(result, 'vieja1234', 'nueva1234', 'nueva1234');
    await act(async () => result.current.guardar());
    expect(guardar).toHaveBeenCalledWith('vieja1234', 'nueva1234');
    expect(result.current.aviso?.ok).toBe(true);
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(mockDeleteSession).toHaveBeenCalled();
    expect(mockRouter.replace).toHaveBeenCalledWith('/(auth)/login');
  });

  it('PS-15 · contraseña actual incorrecta: muestra el mensaje y no cierra sesión', async () => {
    const guardar = jest.fn(async () => {
      throw { response: { data: { message: 'Contraseña actual incorrecta' } } };
    });
    const { result } = await renderHook(() => useCambioContrasena(guardar));
    await escribir(result, 'mala1234', 'nueva1234', 'nueva1234');
    await act(async () => result.current.guardar());
    expect(result.current.aviso).toEqual({ texto: 'Contraseña actual incorrecta', ok: false });
    expect(mockDeleteSession).not.toHaveBeenCalled();
  });
});
