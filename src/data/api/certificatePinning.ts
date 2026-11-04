import {
  initializeSslPinning,
  isSslPinningAvailable,
  addSslPinningErrorListener,
} from 'react-native-ssl-public-key-pinning';
import { API_URL } from '@/constants/app';

/**
 * Certificate Pinning (anti-MitM).
 * En Android la librería configura el CertificatePinner de OkHttp: la app solo acepta
 * el backend si la cadena de su certificado contiene alguna de estas huellas
 * SHA-256 (de la llave pública, en Base64). Se fijan las autoridades certificadoras
 * (no el certificado del servidor, que Render renueva cada pocos meses).
 *
 * Huellas obtenidas del certificado real de nova-graf-zbdt.onrender.com (02/11/2026)
 * con: openssl x509 -pubkey | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | base64
 */
export const HUELLAS_API: readonly string[] = [
  'kIdp6NNEd8wsugYyyIYFsi1ylMCED3hZbSR8ZFsa/A4=', // Google Trust Services WE1 (intermedio actual)
  'mEflZT5enoR1FuXLgYYGqnVEoZvmf9c2bVBpiOjYQ0c=', // GTS Root R4 (raíz actual)
  // Respaldo por si Render cambia de autoridad certificadora:
  'hxqRlPTu1bMS/0DITB1SSu0vd4u/8l8TjPgfaAp63Gc=', // GTS Root R1
  'K87oWBWM9UZfyddvDfoxL+8lpNyoUB2ptGtn0fv6G2Q=', // GlobalSign Root CA (firma cruzada de GTS)
  'C5+lpZ7tcVwmwQIMcRtPbsQtWLABXhQzejna0wHFr8M=', // ISRG Root X1 (Let's Encrypt)
];

/** Después de esta fecha el pinning se desactiva solo, para no dejar la app sin conexión. */
export const PINNING_EXPIRA = '2027-12-31';

/** Dominio del backend tomado de EXPO_PUBLIC_API_URL; solo se fija si es HTTPS. */
export const obtenerDominioApi = (url: string | undefined): string | null => {
  const coincide = /^https:\/\/([^/:?#]+)/i.exec(url ?? '');
  return coincide ? coincide[1].toLowerCase() : null;
};

let inicializacion: Promise<boolean> | null = null;

/**
 * Activa el pinning una sola vez (el interceptor de ApiClient lo espera antes de la
 * primera petición). Devuelve true si quedó activo. En Expo Go o con una API local
 * por HTTP no hay nada que fijar y la app sigue funcionando normal.
 */
export const asegurarPinning = (url: string | undefined = API_URL): Promise<boolean> => {
  if (inicializacion) return inicializacion;

  inicializacion = (async () => {
    const dominio = obtenerDominioApi(url);
    if (!dominio || !isSslPinningAvailable()) return false;

    try {
      await initializeSslPinning({
        [dominio]: {
          includeSubdomains: false,
          publicKeyHashes: [...HUELLAS_API],
          expirationDate: PINNING_EXPIRA,
        },
      });
      // Si un certificado no coincide (posible ataque), OkHttp corta la conexión
      // y aquí queda registrado; la petición falla como un error de red.
      addSslPinningErrorListener((error) => {
        console.warn(`[Seguridad] Certificado no confiable para ${error.serverHostname}`);
      });
      return true;
    } catch (error) {
      console.warn('[Seguridad] No se pudo activar el certificate pinning', error);
      return false;
    }
  })();

  return inicializacion;
};

/** Solo para pruebas: permite volver a inicializar. */
export const reiniciarPinningParaPruebas = () => {
  inicializacion = null;
};
