import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import type { Notificacion } from '../models/Notificacion';

type IconName = ComponentProps<typeof Ionicons>['name'];

// Ícono y color por tipo de notificación (fondo suave + ícono del mismo tono)
const ESTILO: Record<string, { icono: IconName; color: string; fondo: string }> = {
  ESTADO_CAMBIADO: { icono: 'sync-outline', color: '#1A6163', fondo: '#E6F2EF' },
  PAGO_APROBADO: { icono: 'checkmark-circle-outline', color: '#166534', fondo: '#DCFCE7' },
  PAGO_RECHAZADO: { icono: 'close-circle-outline', color: '#B91C1C', fondo: '#FEE2E2' },
  PREVIA_ENVIADA: { icono: 'image-outline', color: '#6D28D9', fondo: '#EDE9FE' },
  MENSAJE_NUEVO: { icono: 'chatbubble-ellipses-outline', color: '#B45309', fondo: '#FEF3C7' },
};
const ESTILO_DEFAULT = { icono: 'notifications-outline' as IconName, color: '#3F3F46', fondo: '#F4F4F5' };

const tiempoRelativo = (iso: string): string => {
  const t = new Date(iso).getTime();
  if (isNaN(t)) return '';
  const min = Math.floor((Date.now() - t) / 60000);
  if (min < 1) return 'Ahora';
  if (min < 60) return `Hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `Hace ${d} d`;
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
};

// El backend guarda el título con emoji al inicio ("💬 Nuevo mensaje…").
// Se lo quitamos porque la tarjeta ya muestra su propio ícono.
const quitarEmoji = (texto: string) =>
  texto.replace(/^(?:[\u2600-\u27BF]|[\uD83C-\uDBFF][\uDC00-\uDFFF]|\uFE0F|\u200D|\s)+/, '');

const ESCALA = 1.15;

interface Props {
  notificacion: Notificacion;
  onPress: () => void;
  onEliminar: () => void;
}

export const NotificacionItem = ({ notificacion: n, onPress, onEliminar }: Props) => {
  const e = ESTILO[n.tipo] ?? ESTILO_DEFAULT;

  return (
    <PressableScale
      style={[styles.item, !n.leida && styles.noLeida]}
      onPress={onPress}
      scaleTo={0.98}
      accessibilityLabel={`${n.leida ? '' : 'No leída. '}${quitarEmoji(n.titulo)}. ${n.mensaje}`}
    >
      {/* Barra de color a la izquierda solo si no está leída */}
      {!n.leida && <View style={[styles.acento, { backgroundColor: e.color }]} />}

      <View style={[styles.icono, { backgroundColor: e.fondo }]}>
        <Ionicons name={e.icono} size={22} color={e.color} />
      </View>

      <View style={styles.contenido}>
        <View style={styles.filaTitulo}>
          <Text style={[styles.titulo, !n.leida && styles.tituloNoLeido]} numberOfLines={2} maxFontSizeMultiplier={ESCALA}>
            {quitarEmoji(n.titulo)}
          </Text>
          {!n.leida && <View style={[styles.punto, { backgroundColor: e.color }]} />}
        </View>

        <Text style={styles.mensaje} numberOfLines={3} maxFontSizeMultiplier={ESCALA}>{n.mensaje}</Text>

        <View style={styles.pie}>
          <View style={styles.tiempoFila}>
            <Ionicons name="time-outline" size={13} color={textColors.muted} />
            <Text style={styles.tiempo} maxFontSizeMultiplier={ESCALA}>{tiempoRelativo(n.creado_en)}</Text>
          </View>
          {!!n.pedido_id && (
            <View style={styles.verPedido}>
              <Text style={styles.verPedidoTexto} maxFontSizeMultiplier={ESCALA}>Ver pedido</Text>
              <Ionicons name="chevron-forward" size={14} color={brandColors.primary} />
            </View>
          )}
        </View>
      </View>

      <PressableScale
        onPress={onEliminar}
        hitSlop={8}
        scaleTo={0.85}
        style={styles.eliminar}
        accessibilityLabel="Eliminar notificación"
      >
        <Ionicons name="close" size={16} color={textColors.muted} />
      </PressableScale>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  item: {
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
  noLeida: { borderColor: '#D4D4D8' },
  acento: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },

  icono: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },

  contenido: { flex: 1, gap: 4 },
  filaTitulo: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  titulo: { flex: 1, fontFamily: fontFamily.medium, fontSize: 15, lineHeight: 20, color: textColors.primary },
  tituloNoLeido: { fontFamily: fontFamily.bold },
  punto: { width: 9, height: 9, borderRadius: 5, marginTop: 6 },
  mensaje: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 20, color: textColors.secondary },

  pie: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  tiempoFila: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tiempo: { fontFamily: fontFamily.regular, fontSize: 12, color: textColors.muted },
  verPedido: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  verPedidoTexto: { fontFamily: fontFamily.semibold, fontSize: 13, color: brandColors.primary },

  eliminar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: surface.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});