import { PoliticasView } from '@/features/legal';

// Fuera de (public) y (cliente): la pueden abrir con o sin sesión.
export default function RutaPoliticas() {
  return <PoliticasView />;
}
