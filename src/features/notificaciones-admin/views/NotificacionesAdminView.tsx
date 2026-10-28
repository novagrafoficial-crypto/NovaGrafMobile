import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import { formatFecha } from '@/features/pedidos-admin/utils/pedidoAdminUtils';
import { AdminHeader } from '@/shared/components/admin';
import { CustomButton } from '@/shared/components/CustomButton';
import { Loading } from '@/shared/components/Loading';
import { PressableScale } from '@/shared/components/PressableScale';
import type { NotificacionAdmin } from '../models/NotificacionAdmin';
import { useNotificacionesAdminViewModel } from '../viewmodels/useNotificacionesAdminViewModel';

type Icono = ComponentProps<typeof Ionicons>['name'];
const ESCALA = 1.15;

// Ícono y color según el tipo de aviso. Si llega uno nuevo, usa la campana.
const ESTILO: Record<string, { icono: Icono; color: string; fondo: string }> = {
  MENSAJE_NUEVO: { icono: 'chatbubble-ellipses-outline', color: '#B45309', fondo: '#FEF3C7' },
  DISENO_ENVIADO: { icono: 'color-palette-outline', color: '#075985', fondo: '#E0F2FE' },
  PREVIA_RECHAZADA: { icono: 'refresh-circle-outline', color: '#991B1B', fondo: '#FEE2E2' },
  PAGO_SUBIDO: { icono: 'receipt-outline', color: '#166534', fondo: '#DCFCE7' },
  NUEVO_PEDIDO: { icono: 'bag-add-outline', color: brandColors.primary, fondo: '#E6F2EF' },
};
const POR_DEFECTO = { icono: 'notifications-outline' as Icono, color: '#3F3F46', fondo: '#F4F4F5' };

// El backend guarda el título con emoji al inicio ("💬 Nuevo mensaje…"): se quita porque ya hay ícono.
const quitarEmoji = (t: string) =>
  t.replace(/^(?:[☀-➿]|[\uD83C-\uDBFF][\uDC00-\uDFFF]|️|‍|\s)+/, '');

const Aviso = ({ n, onPress }: { n: NotificacionAdmin; onPress: () => void }) => {
  const e = ESTILO[n.tipo] ?? POR_DEFECTO;
  return (
    <PressableScale style={styles.card} onPress={onPress} scaleTo={0.98} accessibilityRole="button" accessibilityLabel={n.titulo}>
      <View style={[styles.acento, { backgroundColor: e.color }]} />
      <View style={[styles.icono, { backgroundColor: e.fondo }]}>
        <Ionicons name={e.icono} size={21} color={e.color} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={styles.titulo} numberOfLines={2} maxFontSizeMultiplier={ESCALA}>{quitarEmoji(n.titulo) || 'Notificación'}</Text>
        {!!n.mensaje && <Text style={styles.mensaje} numberOfLines={3} maxFontSizeMultiplier={ESCALA}>{n.mensaje}</Text>}
        <View style={styles.pie}>
          <View style={styles.tiempo}>
            <Ionicons name="time-outline" size={13} color={textColors.muted} />
            <Text style={styles.fecha} maxFontSizeMultiplier={ESCALA}>{formatFecha(n.fecha, true)}</Text>
          </View>
          {!!n.pedido_id && (
            <View style={styles.tiempo}>
              <Text style={styles.enlace} maxFontSizeMultiplier={ESCALA}>Pedido #{n.pedido_id}</Text>
              <Ionicons name="chevron-forward" size={14} color={brandColors.primary} />
            </View>
          )}
        </View>
      </View>
    </PressableScale>
  );
};

export const NotificacionesAdminView = () => {
  const vm = useNotificacionesAdminViewModel();

  return (
    <View style={styles.pantalla}>
      <AdminHeader titulo="Avisos" />

      {/* Barra: cuántos hay y "Leer todos" */}
      {!vm.cargando && vm.notificaciones.length > 0 && (
        <View style={styles.barra}>
          <Text style={styles.conteo} maxFontSizeMultiplier={ESCALA}>
            {vm.noLeidas} {vm.noLeidas === 1 ? 'aviso sin leer' : 'avisos sin leer'}
          </Text>
          <PressableScale style={styles.leer} onPress={vm.marcarTodas} hitSlop={8} scaleTo={0.92} accessibilityLabel="Marcar todos como leídos">
            <Ionicons name="checkmark-done-outline" size={18} color={brandColors.primary} />
            <Text style={styles.leerTexto} maxFontSizeMultiplier={ESCALA}>Leer todos</Text>
          </PressableScale>
        </View>
      )}

      {vm.cargando ? (
        <Loading fullScreen />
      ) : (
        <FlatList
          data={vm.notificaciones}
          keyExtractor={(n) => String(n.id)}
          renderItem={({ item }) => <Aviso n={item} onPress={() => vm.abrir(item)} />}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={vm.refrescando} onRefresh={vm.onRefresh} tintColor={brandColors.primary} colors={[brandColors.primary]} />
          }
          ListEmptyComponent={
            vm.error ? (
              <View style={styles.vacio}>
                <Ionicons name="cloud-offline-outline" size={40} color={textColors.muted} />
                <Text style={styles.vacioTexto}>{vm.error}</Text>
                <CustomButton title="Reintentar" variant="outline" onPress={vm.reintentar} />
              </View>
            ) : (
              <View style={styles.vacio}>
                <View style={styles.vacioCirculo}>
                  <Ionicons name="checkmark-done-outline" size={36} color={brandColors.primary} />
                </View>
                <Text style={styles.vacioTitulo} maxFontSizeMultiplier={ESCALA}>Todo al día</Text>
                <Text style={styles.vacioTexto} maxFontSizeMultiplier={ESCALA}>Aquí verás los mensajes, diseños y cambios de tus clientes.</Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: surface.screen },
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: surface.card,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderBottomWidth: 1,
    borderBottomColor: surface.border,
  },
  conteo: { fontFamily: fontFamily.semibold, fontSize: 14, color: textColors.primary },
  leer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  leerTexto: { fontFamily: fontFamily.semibold, fontSize: 13, color: brandColors.primary },

  lista: { padding: space.lg, paddingBottom: 40, gap: space.sm, flexGrow: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    backgroundColor: surface.card,
    borderRadius: radius.lg,
    padding: space.md,
    paddingLeft: space.lg,
    borderWidth: 1,
    borderColor: surface.border,
    overflow: 'hidden',
  },
  acento: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  icono: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontFamily: fontFamily.semibold, fontSize: 15, color: textColors.primary },
  mensaje: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 20, color: textColors.secondary },
  pie: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  tiempo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  fecha: { fontFamily: fontFamily.regular, fontSize: 12, color: textColors.muted },
  enlace: { fontFamily: fontFamily.semibold, fontSize: 13, color: brandColors.primary },

  vacio: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.sm, paddingTop: 48, paddingHorizontal: space.xl },
  vacioCirculo: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E6F2EF', alignItems: 'center', justifyContent: 'center', marginBottom: space.sm },
  vacioTitulo: { fontFamily: fontFamily.bold, fontSize: 18, color: textColors.primary },
  vacioTexto: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary, textAlign: 'center' },
});
