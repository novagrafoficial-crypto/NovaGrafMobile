import { useLocalSearchParams } from 'expo-router';
import { DisenoPedidoView } from '@/features/diseno';

export default function RutaDisenoPedido() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <DisenoPedidoView pedidoId={Number(id)} />;
}