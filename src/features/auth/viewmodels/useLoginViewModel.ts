import { useState } from 'react';
import { authApi } from '../api/authApi';
import { useSession } from '@/shared/hooks/useSession';

export const useLoginViewModel = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { saveSession } = useSession();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor complete todos los campos');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const user = await authApi.login(email, password);
      await saveSession(user); 
      return user;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error de credenciales, intente de nuevo');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { email, setEmail, password, setPassword, isLoading, error, handleLogin };
};
