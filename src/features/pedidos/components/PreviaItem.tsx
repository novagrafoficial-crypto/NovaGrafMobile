import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatFecha } from '@/shared/utils/format';
import { resolveImageUrl } from '@/shared/utils/resolveImageUrl';
import { brandColors, brandTints } from '@/constants/brand';
import { ImagenAmpliable } from './ImagenAmpliable';
import type { PreviaPedido } from '../models/Pedido';

const estadoDe = (p: PreviaPedido) =>
  p.aprobada
    ? { texto: 'Aprobada', bg: brandTints.accentSoft, fg: brandColors.primary }
    : p.rechazada
      ? { texto: 'Rechazada', bg: brandTints.errorSoft, fg: brandColors.error }
      : { texto: 'Pendiente de tu revisión', bg: brandTints.surfaceMuted, fg: brandTints.textMuted };

export const PreviaItem = ({ previa }: { previa: PreviaPedido }) => {
  const url = resolveImageUrl(previa.imagen_url);
  const estado = estadoDe(previa);
  return (
    <View style={styles.card}>
      <View style={styles.fila}>
        <Text style={styles.titulo}>Previa {previa.numero_previa}</Text>
        <View style={[styles.badge, { backgroundColor: estado.bg }]}>
          <Text style={[styles.badgeTxt, { color: estado.fg }]}>{estado.texto}</Text>
        </View>
      </View>
      <Text style={styles.fecha}>Enviada el {formatFecha(previa.fecha_subida)}</Text>
      {url ? <ImagenAmpliable url={url} alto={200} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: brandTints.surfaceMuted, borderRadius: 12, padding: 12, gap: 8 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  titulo: { fontSize: 14, fontWeight: '800', color: brandColors.primaryDark },
  fecha: { fontSize: 12, color: brandTints.textMuted },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeTxt: { fontSize: 11, fontWeight: '700' },
});
