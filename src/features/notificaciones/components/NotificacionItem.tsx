import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors, brandTints } from '@/constants/brand';
import type { Notificacion } from '../models/Notificacion';

const ICONOS: Record<string, string> = {
  ESTADO_CAMBIADO: '🔄',
  PAGO_APROBADO: '✅',
  PAGO_RECHAZADO: '❌',
  PREVIA_ENVIADA: '🖼️',
  MENSAJE_NUEVO: '💬',
};

const COLORES: Record<string, string> = {
  ESTADO_CAMBIADO: '#3b82f6',
  PAGO_APROBADO: '#16a34a',
  PAGO_RECHAZADO: '#dc2626',
  PREVIA_ENVIADA: '#8b5cf6',
  MENSAJE_NUEVO: '#f59e0b',
};

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

interface Props {
  notificacion: Notificacion;
  onPress: () => void;
  onEliminar: () => void;
}

export const NotificacionItem = ({ notificacion: n, onPress, onEliminar }: Props) => (
  <PressableScale
    style={[styles.item, !n.leida && styles.noLeida]}
    onPress={onPress}
    scaleTo={0.98}
    accessibilityLabel={`${n.titulo}. ${n.mensaje}`}
  >
    <View style={[styles.icono, { backgroundColor: COLORES[n.tipo] ?? '#6b7280' }]}>
      <Text style={styles.iconoTexto}>{ICONOS[n.tipo] ?? '📢'}</Text>
    </View>

    <View style={styles.contenido}>
      <Text style={styles.titulo} numberOfLines={2}>{n.titulo}</Text>
      <Text style={styles.mensaje} numberOfLines={3}>{n.mensaje}</Text>
      <Text style={styles.tiempo}>{tiempoRelativo(n.creado_en)}</Text>
    </View>

    {!n.leida && <View style={styles.punto} />}

    <PressableScale onPress={onEliminar} hitSlop={10} scaleTo={0.85} accessibilityLabel="Eliminar notificación">
      <Text style={styles.eliminar}>✕</Text>
    </PressableScale>
  </PressableScale>
);

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: brandColors.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: brandTints.border,
  },
  noLeida: { backgroundColor: brandTints.accentSoft, borderColor: brandColors.accent },
  icono: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  iconoTexto: { fontSize: 18 },
  contenido: { flex: 1 },
  titulo: { fontSize: 14, fontWeight: '800', color: brandColors.primaryDark },
  mensaje: { fontSize: 13, color: brandTints.textMuted, marginTop: 2 },
  tiempo: { fontSize: 11, color: brandTints.textMuted, marginTop: 4 },
  punto: { width: 8, height: 8, borderRadius: 4, backgroundColor: brandColors.accent },
  eliminar: { fontSize: 14, fontWeight: '800', color: brandTints.textMuted, paddingHorizontal: 4 },
});