import React, { useState } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Header } from '@/shared/components/Header';
import { Loading } from '@/shared/components/Loading';
import { FadeInView } from '@/shared/components/FadeInView';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors, brandTints } from '@/constants/brand';
import { useNotificaciones } from '../providers/NotificacionesProvider';
import { NotificacionItem } from '../components/NotificacionItem';
import type { Notificacion } from '../models/Notificacion';

export const NotificacionesView = () => {
  const router = useRouter();
  const { notificaciones, noLeidas, cargando, refrescar, marcarLeida, marcarTodasLeidas, eliminar } =
    useNotificaciones();
  const [refrescando, setRefrescando] = useState(false);

  const volver = () => (router.canGoBack() ? router.back() : router.replace('/(cliente)/inicio' as any));

  const abrir = (n: Notificacion) => {
    if (!n.leida) marcarLeida(n.id);
    if (n.pedido_id) router.push(`/(cliente)/pedido/${n.pedido_id}` as any);
  };

  const onRefresh = async () => {
    setRefrescando(true);
    await refrescar();
    setRefrescando(false);
  };

  const cuerpo = () => {
    if (cargando && notificaciones.length === 0) return <Loading fullScreen />;

    if (notificaciones.length === 0) {
      return (
        <FadeInView style={styles.centrado}>
          <Text style={styles.vacioIcono}>📭</Text>
          <Text style={styles.vacioTitulo}>No tienes notificaciones</Text>
          <Text style={styles.vacioTexto}>Aquí verás los avisos de tus pedidos, pagos y diseños.</Text>
        </FadeInView>
      );
    }

    return (
      <FlatList
        data={notificaciones}
        keyExtractor={(n) => String(n.id)}
        contentContainerStyle={styles.lista}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={onRefresh}
            tintColor={brandColors.primary}
            colors={[brandColors.primary]}
          />
        }
        renderItem={({ item }) => (
          <NotificacionItem notificacion={item} onPress={() => abrir(item)} onEliminar={() => eliminar(item.id)} />
        )}
      />
    );
  };

  return (
    <View style={styles.pantalla}>
      <Header subtitle="Notificaciones" />

      <View style={styles.barra}>
        <PressableScale onPress={volver} hitSlop={10} scaleTo={0.9} accessibilityLabel="Volver">
          <Text style={styles.volver}>‹ Volver</Text>
        </PressableScale>
        {noLeidas > 0 && (
          <PressableScale onPress={marcarTodasLeidas} hitSlop={10} scaleTo={0.92}>
            <Text style={styles.marcarTodas}>Marcar todas como leídas</Text>
          </PressableScale>
        )}
      </View>

      <View style={{ flex: 1 }}>{cuerpo()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: brandColors.background },
  barra: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  volver: { fontSize: 15, fontWeight: '700', color: brandColors.primary },
  marcarTodas: { fontSize: 13, fontWeight: '700', color: brandColors.primary },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  vacioIcono: { fontSize: 40, marginBottom: 8 },
  vacioTitulo: { fontSize: 18, fontWeight: '800', color: brandColors.primaryDark },
  vacioTexto: { fontSize: 14, color: brandTints.textMuted, marginTop: 4, textAlign: 'center' },
  lista: { paddingHorizontal: 16, paddingBottom: 24 },
});