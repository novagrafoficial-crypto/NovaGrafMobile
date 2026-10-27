import { useState } from 'react';
import { useRouter } from 'expo-router';
import { authService } from '../services/authService';
import { isValidEmail } from '../utils/validaciones';

export const useForgotPasswordViewModel = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!isValidEmail(email)) {
      setError('Ingresa un correo electrónico válido');
      return;
    }
    setIsLoading(true);
    setError(null);
    setInfo(null);
    try {
      const res = await authService.forgotPassword(email.trim());
      if (res.id_usuario) {
        router.push({
          pathname: '/(auth)/verify-recovery',
          params: { id_usuario: String(res.id_usuario) },
        } as any);
      } else {
        // El backend no revela si el correo existe: responde 200 sin id_usuario
        setInfo(res.message || 'Si el correo existe, recibirás el código.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al enviar el código');
    } finally {
      setIsLoading(false);
    }
  };

  return { email, setEmail, isLoading, error, info, handleSubmit };
};