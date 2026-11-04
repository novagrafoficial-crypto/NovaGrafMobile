/**
 * Flujos de código OTP: activar cuenta, recuperar contraseña y cambiarla.
 */
import { renderHook, act } from '@testing-library/react-native';
import { useVerifyAccountViewModel } from '../../src/features/autenticacion/viewmodels/useVerifyAccountViewModel';
import { useVerifyRecoveryViewModel } from '../../src/features/autenticacion/viewmodels/useVerifyRecoveryViewModel';
import { useResetPasswordViewModel } from '../../src/features/autenticacion/viewmodels/useResetPasswordViewModel';
import { useForgotPasswordViewModel } from '../../src/features/autenticacion/viewmodels/useForgotPasswordViewModel';
import { authService } from '../../src/features/autenticacion/services/authService';

const mockRouter = { push: jest.fn(), replace: jest.fn() };
let mockParams: any = { id_usuario: '7' };
jest.mock('expo-router', () => ({ useRouter: () => mockRouter, useLocalSearchParams: () => mockParams }));
jest.mock('../../src/features/autenticacion/services/authService', () => ({
  authService: { verifyAccount: jest.fn(), resendActivation: jest.fn(), verifyRecovery: jest.fn(), resendRecovery: jest.fn(), resetPassword: jest.fn(), forgotPassword: jest.fn() },
}));

const auth = authService as unknown as Record<string, jest.Mock>;
const fallo = (message?: string) => ({ response: { data: message ? { message } : {} } });

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  mockParams = { id_usuario: '7' };
});
afterEach(() => jest.useRealTimers());

describe('Activar cuenta', () => {
  it('PVO-01 · solo acepta 6 dígitos y activa la cuenta', async () => {
    const { result } = await renderHook(() => useVerifyAccountViewModel());
    await act(() => result.current.handleOtpChange('12a3'));
    await act(() => result.current.handleVerify());
    expect(result.current.error).toBe('El código debe tener 6 dígitos');
    await act(() => result.current.handleOtpChange('123456789'));
    expect(result.current.otp).toBe('123456');
    await act(() => result.current.handleVerify());
    expect(auth.verifyAccount).toHaveBeenCalledWith('7', '123456');
    expect(result.current.success).toBe(true);
    result.current.goToLogin();
    expect(mockRouter.replace).toHaveBeenCalledWith('/(auth)/login');
  });

  it('PVO-02 · código incorrecto, reenvío con cuenta regresiva y error de reenvío', async () => {
    const { result } = await renderHook(() => useVerifyAccountViewModel());
    await act(() => result.current.handleOtpChange('111111'));
    auth.verifyAccount.mockRejectedValueOnce(fallo('Código expirado')).mockRejectedValueOnce(fallo());
    await act(() => result.current.handleVerify());
    expect(result.current.error).toBe('Código expirado');
    await act(() => result.current.handleVerify());
    expect(result.current.error).toBe('Código incorrecto');
    await act(() => result.current.handleResend());
    expect(result.current.info).toBe('Código reenviado. Revisa tu correo.');
    expect(result.current.cooldown).toBe(30);
    await act(() => result.current.handleResend());
    expect(auth.resendActivation).toHaveBeenCalledTimes(1);
    await act(async () => { jest.advanceTimersByTime(1000); });
    expect(result.current.cooldown).toBe(29);
    for (let i = 0; i < 30; i++) await act(async () => { jest.advanceTimersByTime(1000); });
    expect(result.current.cooldown).toBe(0);
    auth.resendActivation.mockRejectedValueOnce(fallo());
    await act(() => result.current.handleResend());
    expect(result.current.error).toBe('No se pudo reenviar el código');
  });

  it('PVO-03 · sin cuenta no verifica ni reenvía', async () => {
    mockParams = {};
    const { result } = await renderHook(() => useVerifyAccountViewModel());
    await act(() => result.current.handleVerify());
    expect(result.current.error).toMatch(/No se encontró la cuenta/);
    await act(() => result.current.handleResend());
    expect(auth.resendActivation).not.toHaveBeenCalled();
  });
});

describe('Código de recuperación', () => {
  it('PVO-04 · código válido lleva a cambiar la contraseña', async () => {
    const { result } = await renderHook(() => useVerifyRecoveryViewModel());
    await act(() => result.current.handleVerify());
    expect(result.current.error).toBe('El código debe tener exactamente 6 dígitos');
    await act(() => result.current.handleOtpChange('654321'));
    auth.verifyRecovery.mockResolvedValueOnce({ valid: true });
    await act(() => result.current.handleVerify());
    expect(mockRouter.push).toHaveBeenCalledWith({ pathname: '/(auth)/reset-password', params: { id_usuario: '7', otp: '654321' } });
  });

  it('PVO-05 · código inválido o error del servidor', async () => {
    const { result } = await renderHook(() => useVerifyRecoveryViewModel());
    await act(() => result.current.handleOtpChange('654321'));
    auth.verifyRecovery.mockResolvedValueOnce({ valid: false, message: 'Código vencido' }).mockResolvedValueOnce({ valid: false });
    await act(() => result.current.handleVerify());
    expect(result.current.error).toBe('Código vencido');
    await act(() => result.current.handleVerify());
    expect(result.current.error).toBe('Código incorrecto');
    auth.verifyRecovery.mockRejectedValueOnce(fallo('Demasiados intentos')).mockRejectedValueOnce(fallo());
    await act(() => result.current.handleVerify());
    expect(result.current.error).toBe('Demasiados intentos');
    await act(() => result.current.handleVerify());
    expect(result.current.error).toBe('Código incorrecto');
  });

  it('PVO-06 · reenvío con mensaje del servidor, cuenta regresiva y error', async () => {
    const { result } = await renderHook(() => useVerifyRecoveryViewModel());
    auth.resendRecovery.mockResolvedValueOnce({ message: 'Nuevo código enviado' });
    await act(() => result.current.handleResend());
    expect(result.current.info).toBe('Nuevo código enviado');
    await act(() => result.current.handleResend());
    expect(auth.resendRecovery).toHaveBeenCalledTimes(1);
    for (let i = 0; i < 31; i++) await act(async () => { jest.advanceTimersByTime(1000); });
    auth.resendRecovery.mockResolvedValueOnce({});
    await act(() => result.current.handleResend());
    expect(result.current.info).toBe('Código reenviado a tu correo');
    for (let i = 0; i < 31; i++) await act(async () => { jest.advanceTimersByTime(1000); });
    auth.resendRecovery.mockRejectedValueOnce(fallo('Límite alcanzado'));
    await act(() => result.current.handleResend());
    expect(result.current.error).toBe('Límite alcanzado');
  });

  it('PVO-07 · sin solicitud no verifica ni reenvía', async () => {
    mockParams = {};
    const { result } = await renderHook(() => useVerifyRecoveryViewModel());
    await act(() => result.current.handleVerify());
    expect(result.current.error).toBe('Solicitud inválida. Vuelve a pedir el código.');
    await act(() => result.current.handleResend());
    expect(auth.resendRecovery).not.toHaveBeenCalled();
  });
});

describe('Nueva contraseña', () => {
  it('PVO-08 · valida datos, reglas y confirmación antes de guardar', async () => {
    mockParams = {};
    let r = (await renderHook(() => useResetPasswordViewModel())).result;
    expect(r.current.missingData).toBe(true);
    await act(() => r.current.handleSubmit());
    expect(r.current.error).toBe('Solicitud inválida. Vuelve a pedir el código.');

    mockParams = { id_usuario: '7', otp: '654321' };
    r = (await renderHook(() => useResetPasswordViewModel())).result;
    await act(() => r.current.setNewPassword('corta'));
    await act(() => r.current.handleSubmit());
    expect(r.current.error).toBeTruthy();
    await act(() => r.current.setNewPassword('Segura2026'));
    await act(() => r.current.setConfirmPassword('Otra2026'));
    await act(() => r.current.handleSubmit());
    expect(r.current.error).toBe('Las contraseñas no coinciden');
    await act(() => r.current.setConfirmPassword('Segura2026'));
    await act(() => r.current.handleSubmit());
    expect(auth.resetPassword).toHaveBeenCalledWith('7', '654321', 'Segura2026', 'Segura2026');
    expect(r.current.success).toBe(true);
    r.current.goToLogin();
    r.current.goToForgot();
    expect(mockRouter.replace).toHaveBeenCalledWith('/(auth)/forgot-password');
  });

  it('PVO-09 · muestra el error del servidor al guardar', async () => {
    mockParams = { id_usuario: '7', otp: '654321' };
    const { result } = await renderHook(() => useResetPasswordViewModel());
    await act(() => result.current.setNewPassword('Segura2026'));
    await act(() => result.current.setConfirmPassword('Segura2026'));
    auth.resetPassword.mockRejectedValueOnce(fallo('Código vencido')).mockRejectedValueOnce(fallo());
    await act(() => result.current.handleSubmit());
    expect(result.current.error).toBe('Código vencido');
    await act(() => result.current.handleSubmit());
    expect(result.current.error).toBe('Error al actualizar la contraseña');
  });
});

describe('Olvidé mi contraseña', () => {
  it('PVO-10 · valida el correo y envía el código', async () => {
    const { result } = await renderHook(() => useForgotPasswordViewModel());
    await act(() => result.current.setEmail('no-es-correo'));
    await act(() => result.current.handleSubmit());
    expect(result.current.error).toBe('Ingresa un correo electrónico válido');
    await act(() => result.current.setEmail('  ana@correo.com '));
    auth.forgotPassword.mockResolvedValueOnce({ id_usuario: 7 });
    await act(() => result.current.handleSubmit());
    expect(auth.forgotPassword).toHaveBeenCalledWith('ana@correo.com');
    expect(mockRouter.push).toHaveBeenCalledWith({ pathname: '/(auth)/verify-recovery', params: { id_usuario: '7' } });
  });

  it('PVO-11 · no revela si el correo existe; muestra errores del servidor', async () => {
    const { result } = await renderHook(() => useForgotPasswordViewModel());
    await act(() => result.current.setEmail('ana@correo.com'));
    auth.forgotPassword.mockResolvedValueOnce({ message: 'Revisa tu correo' }).mockResolvedValueOnce({});
    await act(() => result.current.handleSubmit());
    expect(result.current.info).toBe('Revisa tu correo');
    await act(() => result.current.handleSubmit());
    expect(result.current.info).toBe('Si el correo existe, recibirás el código.');
    auth.forgotPassword.mockRejectedValueOnce(fallo('Correo bloqueado')).mockRejectedValueOnce(fallo());
    await act(() => result.current.handleSubmit());
    expect(result.current.error).toBe('Correo bloqueado');
    await act(() => result.current.handleSubmit());
    expect(result.current.error).toBe('Error al enviar el código');
  });
});
