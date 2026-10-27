import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatFecha } from '@/shared/utils/format';
import { resolveImageUrl } from '@/shared/utils/resolveImageUrl';
import { brandColors, brandTints } from '@/constants/brand';
import { CustomButton } from '@/shared/components/CustomButton';
import { ImagenAmpliable } from './ImagenAmpliable';
import type { PreviaPedido } from '../models/Pedido';

const estadoDe = (p: PreviaPedido) =>
  p.aprobada
    ? { texto: 'Aprobada', bg: brandTints.accentSoft, fg: brandColors.primary }
    : p.rechazada
      ? { texto: 'Rechazada', bg: brandTints.errorSoft, fg: brandColors.error }
      : { texto: 'Pendiente de tu revisión', bg: brandTints.surfaceMuted, fg: brandTints.textMuted };

interface Props {
  previa: PreviaPedido;
  /** Si vienen, se muestran los botones Aprobar / Pedir cambios (solo para la previa pendiente). */
  onAprobar?: () => void;
  onRechazar?: () => void;
  deshabilitado?: boolean;
}

export const PreviaItem = ({ previa, onAprobar, onRechazar, deshabilitado }: Props) => {
  const url = resolveImageUrl(previa.imagen_url);
  const estado = estadoDe(previa);
  const puedeRevisar = !!onAprobar && !!onRechazar;
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

      {previa.rechazada && !!previa.comentario_cliente && (
        <View style={styles.comentario}>
          <Text style={styles.comentarioLabel}>Tu comentario</Text>
          <Text style={styles.comentarioTxt}>{previa.comentario_cliente}</Text>
        </View>
      )}

      {puedeRevisar && (
        <View style={styles.acciones}>
          <CustomButton
            title="✅ Aprobar"
            variant="accent"
            onPress={onAprobar!}
            disabled={deshabilitado}
            style={styles.btn}
          />
          <CustomButton
            title="✏️ Pedir cambios"
            variant="outline"
            onPress={onRechazar!}
            disabled={deshabilitado}
            style={styles.btn}
          />
        </View>
      )}
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
  comentario: { backgroundColor: brandColors.white, borderRadius: 10, padding: 10, gap: 2 },
  comentarioLabel: { fontSize: 11, fontWeight: '800', color: brandTints.textMuted },
  comentarioTxt: { fontSize: 13, color: brandColors.primaryDark },
  acciones: { flexDirection: 'row', gap: 10, marginTop: 4 },
  btn: { flex: 1 },
});