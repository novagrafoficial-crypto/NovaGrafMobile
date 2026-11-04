import { useAuth } from "@/shared/hooks/useAuth";
import { homeByRole } from "@/shared/utils/roleRoutes";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import { useState } from "react";
import { authService } from "../services/authService";

// Inicio de sesión nativo de Google (selector de cuentas de Android).
// Se usa el Client ID WEB: así Google emite un idToken que el backend
// valida en /auth/google/mobile (GOOGLE_CLIENT_ID está en sus audiences).
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

/**
 * Lógica compartida de "Continuar con Google" para Login y Registro.
 * El backend crea la cuenta si el correo no existe (findOrCreateGoogleUser),
 * así que iniciar sesión y registrarse con Google es el mismo flujo.
 */
export const useGoogleSignIn = () => {
  const router = useRouter();
  const { saveSession } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const continuarConGoogle = async () => {
    setGoogleError(null);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      // Cierra la cuenta de Google anterior para que siempre aparezca el selector.
      await GoogleSignin.signOut();
      const result = await GoogleSignin.signIn();
      if (!isSuccessResponse(result)) return; // el usuario canceló

      const idToken = result.data.idToken;
      if (!idToken) {
        setGoogleError("Google no devolvió el idToken");
        return;
      }

      setIsGoogleLoading(true);
      const user = await authService.login({ type: "google", idToken });
      await saveSession(user);
      router.replace(homeByRole(user.rol) as any);
    } catch (err: any) {
      if (isErrorWithCode(err)) {
        if (err.code === statusCodes.IN_PROGRESS) return;
        if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          setGoogleError("Google Play Services no está disponible en este dispositivo");
          return;
        }
      }
      // Mensaje del backend (p. ej. "Este correo ya está registrado con contraseña...")
      setGoogleError(err?.response?.data?.message || "No se pudo iniciar sesión con Google");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return {
    continuarConGoogle: () => void continuarConGoogle(),
    isGoogleLoading,
    googleError,
    limpiarErrorGoogle: () => setGoogleError(null),
  };
};