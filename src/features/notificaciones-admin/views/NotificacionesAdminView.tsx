import { brandColors, brandTints } from '@/constants/brand';
import { formatFecha } from '@/features/pedidos-admin/utils/pedidoAdminUtils';
import { CustomButton } from '@/shared/components/CustomButton';
import { Header } from '@/shared/components/Header';
import { Loading } from '@/shared/components/Loading';
import { PressableScale } from '@/shared/components/PressableScale';
import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import type { NotificacionAdmin } from '../models/NotificacionAdmin';
import { useNotificacionesAdminViewModel } from '../viewmodels/useNotificacionesAdminViewModel';

const Tarjeta = ({ n, onPress }: { n: NotificacionAdmin; onPress: () => void }) => (
  <PressableScale
    style={[styles.card, !n.leida && styles.cardNueva]}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={n.titulo}
  >
    <View style={styles.fila}>
      {!n.leida && <View style={styles.punto} />}
      <Text style={[styles.titulo, !n.leida && styles.tituloNuevo]} numberOfLines={1}>
        {n.titulo || 'Notificación'}
      </Text>
    </View>
    {!!n.mensaje && (
      <Text style={styles.mensaje} numberOfLines={2}>
        {n.mensaje}
      </Text>
    )}
    <View style={styles.pie}>
      <Text style={styles.fecha}>{formatFecha(n.fecha, true)}</Text>
      {!!n.pedido_id && <Text style={styles.enlace}>Pedido #{n.pedido_id} →</Text>}
    </View>
  </PressableScale>
);

export const NotificacionesAdminView = () => {
  const vm = useNotificacionesAdminViewModel();

  return (
    <View style={styles.pantalla}>
      <Header subtitle="Notificaciones" />

      {vm.cargando ? (
        <Loading fullScreen />
      ) : (
        <FlatList
          data={vm.notificaciones}
          keyExtractor={(n) => String(n.id)}
          renderItem={({ item }) => <Tarjeta n={item} onPress={() => vm.abrir(item)} />}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={vm.refrescando}
              onRefresh={vm.onRefresh}
              tintColor={brandColors.primary}
              colors={[brandColors.primary]}
            />
          }
          ListHeaderComponent={
            vm.notificaciones.length > 0 ? (
              <View style={styles.barra}>
                <Text style={styles.conteo}>
                  {vm.noLeidas > 0 ? `${vm.noLeidas} sin leer` : 'Todo al día'}
                </Text>
                {vm.noLeidas > 0 && (
                  <PressableScale onPress={vm.marcarTodas} hitSlop={8} accessibilityLabel="Marcar todas como leídas">
                    <Text style={styles.enlace}>Marcar todas como leídas</Text>
                  </PressableScale>
                )}
              </View>
            ) : null
          }
          ListEmptyComponent={
            vm.error ? (
              <View style={styles.centro}>
                <Text style={styles.errorTxt}>{vm.error}</Text>
                <CustomButton title="Reintentar" variant="outline" onPress={vm.reintentar} />
              </View>
            ) : (
              <Text style={styles.vacio}>No tienes notificaciones.</Text>
            )
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: brandColors.background },
  lista: { padding: 16, paddingBottom: 40, gap: 10 },
  centro: { gap: 12, paddingTop: 24 },

  barra: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  conteo: { fontSize: 13, fontWeight: '700', color: brandColors.primaryDark },

  card: { backgroundColor: brandColors.white, borderRadius: 14, padding: 14, gap: 6 },
  cardNueva: { borderLeftWidth: 4, borderLeftColor: brandColors.accent, backgroundColor: brandTints.accentSoft },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  punto: { width: 8, height: 8, borderRadius: 4, backgroundColor: brandColors.accent },
  titulo: { flex: 1, fontSize: 14, color: brandColors.primaryDark, fontWeight: '600' },
  tituloNuevo: { fontWeight: '800' },
  mensaje: { fontSize: 13, color: brandTints.textMuted, lineHeight: 18 },
  pie: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fecha: { fontSize: 11, color: brandTints.textMuted },
  enlace: { fontSize: 12, fontWeight: '700', color: brandColors.primary },

  vacio: { color: brandTints.textMuted, fontSize: 14, textAlign: 'center', paddingTop: 40 },
  errorTxt: { color: brandColors.error, fontWeight: '600', textAlign: 'center' },
});