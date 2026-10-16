import { useLocalSearchParams } from 'expo-router';
import { PedidoDetalleView } from '@/features/pedidos';

export default function RutaPedidoDetalle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PedidoDetalleView pedidoId={Number(id)} />;
}