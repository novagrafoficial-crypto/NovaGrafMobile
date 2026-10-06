import { useState, useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import { authApi } from '../api/authApi';
import { useSession } from '@/shared/hooks/useSession';

export const useLoginViewModel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // saveSession proviene de tu SessionProvider global
  const { saveSession } = useSession();

  // Inicializa el flujo nativo seguro de Google OAuth en el dispositivo
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: 'TU_ID_CLIENTE_://googleusercontent.com',
    iosClientId: 'TU_ID_CLIENTE_://googleusercontent.com',
    webClientId: 'TU_ID_CLIENTE_WEB_DE_TU_://googleusercontent.com', // El ID Web que usa tu backend desplegado
  });

  // Escucha reactiva cuando el celular obtiene exitosamente las credenciales desde Google
  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.idToken) {
      handleGoogleBackendVerification(response.authentication.idToken);
    }
  }, [response]);

  const handleGoogleBackendVerification = async (idToken: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Enviamos el token al servidor relacional Postgres
      const user = await authApi.loginWithGoogleMobile(idToken);
      // Guardamos la sesión de manera persistente en el dispositivo
      await saveSession(user);
      return user;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al autenticar con Google en NovaGraf');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    isLoading, 
    error, 
    handleGoogleLogin: () => promptAsync(),
    isGoogleDisabled: !request
  };
};
