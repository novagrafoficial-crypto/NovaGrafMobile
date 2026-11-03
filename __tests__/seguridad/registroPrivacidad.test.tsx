/**
 * Opt-in del Aviso de Privacidad (derechos ARCO / consentimiento explícito)
 */
import { renderHook, act } from '@testing-library/react-native';
import { useRegisterViewModel } from '../../src/features/autenticacion/viewmodels/useRegisterViewModel';
import { authService } from '../../src/features/autenticacion/services/authService';

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => true) };
jest.mock('expo-router', () => ({ useRouter: () => mockRouter }));
jest.mock('../../src/features/autenticacion/services/authService', () => ({
  authService: { register: jest.fn() },
}));
jest.mock('../../src/features/autenticacion/viewmodels/useGoogleSignIn', () => ({
  useGoogleSignIn: () => ({ continuarConGoogle: jest.fn(), isGoogleLoading: false, googleError: null }),
}));

const llenar = async (vm: { current: ReturnType<typeof useRegisterViewModel> }) => {
  const paso1: [string, string][] = [
    ['name', 'Ana'], ['lastNameP', 'López'], ['birthDate', '05032000'],
    ['phone', '7711234567'], ['address', 'Calle Reforma 10, Centro'],
  ];
  for (const [c, v] of paso1) await act(() => vm.current.setField(c as any, v));
  await act(() => vm.current.siguiente());
  const paso2: [string, string][] = [
    ['username', 'ana_lopez'], ['email', 'ana@correo.com'],
    ['password', 'clave1234'], ['confirmPassword', 'clave1234'],
  ];
  for (const [c, v] of paso2) await act(() => vm.current.setField(c as any, v));
};

describe('Registro: consentimiento del Aviso de Privacidad (opt-in)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('PS-01 · la casilla inicia SIN marcar', async () => {
    const { result } = await renderHook(() => useRegisterViewModel());
    expect(result.current.aceptaPrivacidad).toBe(false);
  });

  it('PS-02 · sin aceptar el aviso no se crea la cuenta', async () => {
    const { result } = await renderHook(() => useRegisterViewModel());
    await llenar(result);
    await act(() => result.current.registrar());
    expect(authService.register).not.toHaveBeenCalled();
    expect(result.current.error).toBe('Para crear tu cuenta debes aceptar el Aviso de Privacidad.');
  });

  it('PS-03 · al aceptar el aviso sí se registra', async () => {
    (authService.register as jest.Mock).mockResolvedValue({ id_usuario: 9 });
    const { result } = await renderHook(() => useRegisterViewModel());
    await llenar(result);
    await act(() => result.current.alternarPrivacidad());
    await act(() => result.current.registrar());
    expect(authService.register).toHaveBeenCalledTimes(1);
  });

  it('PS-04 · el enlace abre el Aviso de Privacidad', async () => {
    const { result } = await renderHook(() => useRegisterViewModel());
    await act(() => result.current.verAviso());
    expect(mockRouter.push).toHaveBeenCalledWith('/politicas');
  });
});
