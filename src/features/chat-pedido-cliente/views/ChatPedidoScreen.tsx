import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { folioDe } from '@/shared/utils/format';
import { brandColors } from '@/constants/brand';
import { ChatClienteView } from './ChatClienteView';

// Pantalla propia del chat del pedido: así el teclado no pelea con el scroll del detalle.
export const ChatPedidoScreen = ({ pedidoId }: { pedidoId: number }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const volver = () =>
    router.canGoBack() ? router.back() : router.replace(`/(cliente)/pedido/${pedidoId}` as any);

  return (
    <KeyboardAvoidingView
      style={styles.pantalla}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScreenHeader title={`Chat · ${folioDe(pedidoId)}`} onBack={volver} />
      <View style={[styles.cuerpo, { paddingBottom: insets.bottom }]}>
        <ChatClienteView pedidoId={pedidoId} pantallaCompleta />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: brandColors.background },
  cuerpo: { flex: 1, backgroundColor: brandColors.white },
});