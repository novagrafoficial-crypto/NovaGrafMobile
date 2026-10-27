import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PressableScale } from '@/shared/components/PressableScale';
import { formatFecha } from '@/shared/utils/format';
import { resolveImageUrl } from '@/shared/utils/resolveImageUrl';
import { brandColors, brandTints } from '@/constants/brand';
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
        <PressableScale onPress={() => onAbrirUrl(url)} style={styles.pdf}>
          <Text style={styles.pdfTxt}>📄 Abrir diseño (PDF)</Text>
        </PressableScale>
      ) : url ? (
        <ImagenAmpliable url={url} />
      ) : null}

      {!!diseno.notas_cliente && <Text style={styles.nota}>📝 {diseno.notas_cliente}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: brandTints.surfaceMuted, borderRadius: 12, padding: 12, gap: 8 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  titulo: { flex: 1, fontSize: 14, fontWeight: '800', color: brandColors.primaryDark },
  fecha: { fontSize: 12, color: brandTints.textMuted },
  pdf: { backgroundColor: brandColors.white, borderRadius: 10, padding: 10, alignItems: 'center' },
  pdfTxt: { fontSize: 13, fontWeight: '700', color: brandColors.primary },
  nota: { fontSize: 12, color: brandColors.primaryDark },
});
