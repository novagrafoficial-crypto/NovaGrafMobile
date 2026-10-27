import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { authService } from '../services/authService';

const COOLDOWN_SECONDS = 30;

export const useVerifyRecoveryViewModel = () => {
  const router = useRouter();
  const { id_usuario } = useLocalSearchParams<{ id_usuario: string }>();

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleOtpChange = (value: string) => setOtp(value.replace(/\D/g, '').slice(0, 6));

  const handleVerify = async () => {
    if (!id_usuario) {
      setError('Solicitud inválida. Vuelve a pedir el código.');
      return;
    }
    if (otp.length !== 6) {
      setError('El código debe tener exactamente 6 dígitos');
      return;
    }
    setIsLoading(true);
    setError(null);
    setInfo(null);
    try {
      const res = await authService.verifyRecovery(id_usuario, otp);
      if (res.valid) {
        router.push({
          pathname: '/(auth)/reset-password',
          params: { id_usuario, otp },
        } as any);
      } else {
        setError(res.message || 'Código incorrecto');
      }
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
      const res = await authService.resendRecovery(id_usuario);
      setInfo(res.message || 'Código reenviado a tu correo');
      setOtp('');
      setCooldown(COOLDOWN_SECONDS);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudo reenviar el código');
    } finally {
      setIsResending(false);
    }
  };

  return {
    otp,
    handleOtpChange,
    isLoading,
    isResending,
    error,
    info,
    cooldown,
    handleVerify,
    handleResend,
  };
};