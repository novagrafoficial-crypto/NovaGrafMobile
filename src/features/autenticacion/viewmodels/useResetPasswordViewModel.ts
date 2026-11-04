import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { authService } from '../services/authService';
import { PASSWORD_RULE, isValidPassword } from '../utils/validaciones';

export const useResetPasswordViewModel = () => {
  const router = useRouter();
  const { id_usuario, otp } = useLocalSearchParams<{ id_usuario: string; otp: string }>();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Sin código verificado no se puede cambiar la contraseña (igual que la web)
  const missingData = !id_usuario || !otp;

  const handleSubmit = async () => {
    if (missingData) {
      setError('Solicitud inválida. Vuelve a pedir el código.');
      return;
    }
    if (!isValidPassword(newPassword)) {
      setError(PASSWORD_RULE);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await authService.resetPassword(id_usuario, otp, newPassword, confirmPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => router.replace('/(auth)/login' as any);
  const goToForgot = () => router.replace('/(auth)/forgot-password' as any);

  return {
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    error,
    success,
    missingData,
    handleSubmit,
    goToLogin,
    goToForgot,
  };
};