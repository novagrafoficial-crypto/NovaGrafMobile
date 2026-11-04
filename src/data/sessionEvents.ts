/**
 * Aviso de "sesión expirada" (patrón Observer).
 * ApiClient avisa cuando el backend responde 401; AuthProvider se suscribe
 * y cierra la sesión. Así la capa de datos no depende de la capa de UI.
 */
type Listener = () => void;

let listener: Listener | null = null;

export const sessionEvents = {
  onSesionExpirada(fn: Listener): () => void {
    listener = fn;
    return () => {
      if (listener === fn) listener = null;
    };
  },
  emitirSesionExpirada(): void {
    listener?.();
  },
};
