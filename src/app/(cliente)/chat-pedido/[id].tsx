import { useLocalSearchParams } from 'expo-router';
import { ChatPedidoScreen } from '@/features/chat-pedido-cliente';

export default function RutaChatPedido() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ChatPedidoScreen key={id} pedidoId={Number(id)} />;
}