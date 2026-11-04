import { useLocalSearchParams } from 'expo-router';
import { PagoFinalView } from '@/features/pago-final';

export default function RutaPagoFinal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PagoFinalView key={id} pedidoId={Number(id)} />;
}