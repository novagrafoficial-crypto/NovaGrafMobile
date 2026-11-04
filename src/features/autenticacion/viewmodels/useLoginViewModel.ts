import { useAuth } from "@/shared/hooks/useAuth";
import { homeByRole } from "@/shared/utils/roleRoutes";
import { useRouter } from "expo-router";
import { useState } from "react";
import type { User } from "../models/User";
import { authService } from "../services/authService";
import { isValidEmail } from "../utils/validaciones";
import { useGoogleSignIn } from "./useGoogleSignIn";

export const useLoginViewModel = () => {
  const router = useRouter();
  const { saveSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Errores debajo de cada campo
  const [errorEmail, setErrorEmail] = useState<string | null>(null);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const google = useGoogleSignIn();

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
      const data = err.response?.data;
      if (data?.code === 'NOT_ACTIVE' && data?.id_usuario) {
        router.push({
          pathname: '/(auth)/verify-account',
          params: { id_usuario: String(data.id_usuario) },
        } as any);
        return;
      }
      setError(data?.message || fallbackMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const validarEmail = (valor = email) =>
    !valor.trim() ? "Escribe tu correo" : !isValidEmail(valor) ? "Escribe un correo válido" : null;
  const validarPassword = (valor = password) => (!valor ? "Escribe tu contraseña" : null);

  const handleCredentialsLogin = () => {
    const eEmail = validarEmail();
    const ePass = validarPassword();
    setErrorEmail(eEmail);
    setErrorPassword(ePass);
    if (eEmail || ePass) return;
    void run(
      () =>
        authService.login({
          type: "credentials",
          email: email.trim(),
          password,
        }),
      "Correo o contraseña incorrectos",
    );
  };

  return {
    email,
    setEmail: (v: string) => {
      setEmail(v.replace(/\s/g, ""));
      if (errorEmail) setErrorEmail(null);
      if (error) setError(null);
      google.limpiarErrorGoogle();
    },
    password,
    setPassword: (v: string) => {
      setPassword(v);
      if (errorPassword) setErrorPassword(null);
      if (error) setError(null);
      google.limpiarErrorGoogle();
    },
    errorEmail,
    errorPassword,
    revisarEmail: () => email && setErrorEmail(validarEmail()),
    irARegistro: () => router.push("/(auth)/register" as any),
    irARecuperar: () => router.push("/(auth)/forgot-password" as any),
    volver: () => (router.canGoBack() ? router.back() : router.replace("/" as any)),
    isLoading,
    error: error ?? google.googleError,
    handleCredentialsLogin,
    handleGoogleLogin: google.continuarConGoogle,
    isGoogleLoading: google.isGoogleLoading,
  };
};