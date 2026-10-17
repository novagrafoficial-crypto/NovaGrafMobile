import { useLocalSearchParams } from 'expo-router';
import { PagoPedidoView } from '@/features/pago';

export default function RutaPagoPedido() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PagoPedidoView pedidoId={Number(id)} />;
}