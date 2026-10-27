import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { authService } from '../services/authService';

const COOLDOWN_SECONDS = 30;

export const useVerifyAccountViewModel = () => {
  const router = useRouter();
  const { id_usuario } = useLocalSearchParams<{ id_usuario: string }>();

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Cuenta regresiva para no reenviar códigos sin parar
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleOtpChange = (value: string) => setOtp(value.replace(/\D/g, '').slice(0, 6));

  const handleVerify = async () => {
    if (!id_usuario) {
      setError('No se encontró la cuenta a verificar. Vuelve a iniciar sesión.');
      return;
    }
    if (otp.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }
    setIsLoading(true);
    setError(null);
    setInfo(null);
    try {
      await authService.verifyAccount(id_usuario, otp);
      setSuccess(true);
      setInfo('¡Cuenta activada! Ya puedes iniciar sesión.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Código incorrecto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!id_usuario || cooldown > 0) return;
    setIsResending(true);
    setError(null);
    setInfo(null);
    try {
      await authService.resendActivation(id_usuario);
      setInfo('Código reenviado. Revisa tu correo.');
      setOtp('');
      setCooldown(COOLDOWN_SECONDS);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudo reenviar el código');
    } finally {
      setIsResending(false);
    }
  };

  const goToLogin = () => router.replace('/(auth)/login' as any);

  return {
    otp,
    handleOtpChange,
    isLoading,
    isResending,
    error,
    info,
    success,
    cooldown,
    handleVerify,
    handleResend,
    goToLogin,
  };
};