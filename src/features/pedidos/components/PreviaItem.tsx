import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatFecha } from '@/shared/utils/format';
import { resolveImageUrl } from '@/shared/utils/resolveImageUrl';
import { brandColors } from '@/constants/brand';
import { fontSize, fontWeight, iconSize, radius, space, surface, textColors } from '@/constants/theme';
import { CustomButton } from '@/shared/components/CustomButton';
import { ImagenAmpliable } from './ImagenAmpliable';
import type { IconoNombre } from '../utils/etapasPedido';
import type { PreviaPedido } from '../models/Pedido';

const estadoDe = (p: PreviaPedido): { texto: string; icono: IconoNombre; bg: string; fg: string } =>
  p.aprobada
    ? { texto: 'Aprobada', icono: 'checkmark-circle', bg: '#DCFCE7', fg: '#166534' }
    : p.rechazada
      ? { texto: 'Cambios solicitados', icono: 'create-outline', bg: '#FEE2E2', fg: '#991B1B' }
      : { texto: 'Por revisar', icono: 'eye-outline', bg: '#FEF3C7', fg: '#92400E' };

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
    <View style={[styles.card, puedeRevisar && styles.cardRevisar]}>
      <View style={styles.fila}>
        <View>
          <Text style={styles.titulo}>Previa {previa.numero_previa}</Text>
          <Text style={styles.fecha}>Enviada el {formatFecha(previa.fecha_subida)}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: estado.bg }]}>
          <Ionicons name={estado.icono} size={14} color={estado.fg} />
          <Text style={[styles.badgeTxt, { color: estado.fg }]}>{estado.texto}</Text>
        </View>
      </View>

      {url ? <ImagenAmpliable url={url} alto={puedeRevisar ? 240 : 170} /> : null}

      {previa.rechazada && !!previa.comentario_cliente && (
        <View style={styles.comentario}>
          <Ionicons name="chatbox-ellipses-outline" size={iconSize.sm} color={textColors.secondary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.comentarioLabel}>Tus comentarios</Text>
            <Text style={styles.comentarioTxt}>{previa.comentario_cliente}</Text>
          </View>
        </View>
      )}

      {puedeRevisar && (
        <View style={styles.acciones}>
          <CustomButton
            title="Pedir cambios"
            variant="outline"
            icon={<Ionicons name="create-outline" size={iconSize.md} color={textColors.primary} />}
            onPress={onRechazar!}
            disabled={deshabilitado}
            style={styles.btn}
          />
          <CustomButton
            title="Aprobar"
            variant="primary"
            icon={<Ionicons name="checkmark" size={iconSize.md} color={textColors.inverse} />}
            onPress={onAprobar!}
            disabled={deshabilitado}
            style={styles.btn}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: surface.muted, borderRadius: radius.md, padding: space.md, gap: space.md },
  cardRevisar: { backgroundColor: surface.card, borderWidth: 1.5, borderColor: brandColors.accent },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: space.sm },
  titulo: { fontSize: fontSize.bodyLg, fontWeight: fontWeight.bold, color: textColors.primary },
  fecha: { fontSize: fontSize.caption, color: textColors.muted, marginTop: 2 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill,
  },
  badgeTxt: { fontSize: fontSize.caption, fontWeight: fontWeight.semibold },
  comentario: {
    flexDirection: 'row', gap: space.sm, backgroundColor: surface.card,
    borderRadius: radius.sm, padding: space.md,
  },
  comentarioLabel: { fontSize: fontSize.caption, fontWeight: fontWeight.semibold, color: textColors.muted },
  comentarioTxt: { fontSize: fontSize.body, color: textColors.primary, marginTop: 2, lineHeight: 21 },
  acciones: { flexDirection: 'row', gap: space.sm },
  btn: { flex: 1, paddingVertical: 13 },
});