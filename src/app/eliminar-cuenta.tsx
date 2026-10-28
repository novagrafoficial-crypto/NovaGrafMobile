import { EliminarCuentaView } from '@/features/legal';

// Fuera de (public) y (cliente): la pueden abrir con o sin sesión (Google Play lo pide).
export default function RutaEliminarCuenta() {
  return <EliminarCuentaView />;
}
