import { useState, useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useRouter } from 'expo-router';
import { authService } from '../services/authService';
import { useAuth } from '@/shared/hooks/useAuth';
import { homeByRole } from '@/shared/utils/roleRoutes';
import type { User } from '../models/User';

WebBrowser.maybeCompleteAuthSession();

export const useLoginViewModel = () => {
  const redirectUri = AuthSession.makeRedirectUri();
  const router = useRouter();
  const { saveSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    redirectUri,
  });

  const startSession = async (user: User) => {
    await saveSession(user);
    router.replace(homeByRole(user.rol) as any);
  };

  const run = async (action: () => Promise<User>, fallbackMsg: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await startSession(await action());
    } catch (err: any) {
      setError(err.response?.data?.message || fallbackMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (response?.type !== 'success') return;

    const idToken =
      (response.params as any)?.id_token ?? response.authentication?.idToken;

    if (idToken) {
      run(
        () => authService.login({ type: 'google', idToken }),
        'Error al autenticar con Google'
      );
    } else {
      setError('Google no devolvió el idToken');
    }
  }, [response]);

  const handleCredentialsLogin = () => {
    if (!email.trim() || !password) {
      setError('Ingresa tu correo y contraseña');
      return;
    }
    run(
      () => authService.login({ type: 'credentials', email: email.trim(), password }),
      'Correo o contraseña incorrectos'
    );
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    error,
    handleCredentialsLogin,
    handleGoogleLogin: () => promptAsync(),
    isGoogleDisabled: !request,
  };
};