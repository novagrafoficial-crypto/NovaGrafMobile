import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '@/shared/components/PressableScale';
import { formatFecha } from '@/shared/utils/format';
import { resolveImageUrl } from '@/shared/utils/resolveImageUrl';
import { brandColors } from '@/constants/brand';
import { fontSize, fontWeight, iconSize, radius, space, surface, textColors } from '@/constants/theme';
import { esPdf } from '../utils/pedidoUtils';
import { ImagenAmpliable } from './ImagenAmpliable';
import type { DisenoEnviado, PedidoItem } from '../models/Pedido';

interface Props {
  diseno: DisenoEnviado;
  producto?: PedidoItem;
  onAbrirUrl: (url: string) => void;
}

export const DisenoEnviadoItem = ({ diseno, producto, onAbrirUrl }: Props) => {
  const url = resolveImageUrl(diseno.archivo_url);
  return (
    <View style={styles.card}>
      <View style={styles.fila}>
        <Text style={styles.titulo} numberOfLines={2}>
          {producto?.producto_nombre ?? 'Diseño enviado'}
        </Text>
        <Text style={styles.fecha}>{formatFecha(diseno.fecha_envio)}</Text>
      </View>

      {url && esPdf(url) ? (
        <PressableScale onPress={() => onAbrirUrl(url)} style={styles.archivo}>
          <Ionicons name="document-attach-outline" size={iconSize.md} color={brandColors.primary} />
          <Text style={styles.archivoTxt}>Abrir diseño (PDF)</Text>
          <Ionicons name="open-outline" size={iconSize.sm} color={textColors.muted} />
        </PressableScale>
      ) : url ? (
        <ImagenAmpliable url={url} />
      ) : null}

      {!!diseno.notas_cliente && (
        <View style={styles.nota}>
          <Ionicons name="chatbox-ellipses-outline" size={iconSize.sm} color={textColors.muted} />
          <Text style={styles.notaTxt}>{diseno.notas_cliente}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: surface.muted, borderRadius: radius.md, padding: space.md, gap: space.sm },
  fila: { flexDirection: 'row', justifyContent: 'space-between', gap: space.sm },
  titulo: { flex: 1, fontSize: fontSize.body, fontWeight: fontWeight.semibold, color: textColors.primary },
  fecha: { fontSize: fontSize.caption, color: textColors.muted },
  archivo: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm,
    backgroundColor: surface.card, borderRadius: radius.sm, padding: space.md,
  },
  archivoTxt: { flex: 1, fontSize: fontSize.body, fontWeight: fontWeight.semibold, color: textColors.primary },
  nota: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
  notaTxt: { flex: 1, fontSize: fontSize.small, color: textColors.secondary, lineHeight: 19 },
});