import { useLocalSearchParams } from 'expo-router';
import { PagoPedidoView } from '@/features/pago';

export default function RutaPagoPedido() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PagoPedidoView key={id} pedidoId={Number(id)} />;
}