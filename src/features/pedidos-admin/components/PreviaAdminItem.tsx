import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '@/shared/components/PressableScale';
import { PastillaAdmin } from '@/shared/components/admin';
import { resolveImageUrl } from '@/shared/utils/resolveImageUrl';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import { COLOR_ESTADO_PREVIA, esPdf, estadoPrevia, formatFecha } from '../utils/pedidoAdminUtils';
import type { PreviaAdmin } from '../models/PedidoAdmin';

const ESCALA = 1.15;

// Previa enviada: miniatura, estado y, si pidió cambios, el comentario del cliente.
export const PreviaAdminItem = ({ previa, onPress }: { previa: PreviaAdmin; onPress: () => void }) => {
  const e = COLOR_ESTADO_PREVIA[estadoPrevia(previa)];
  const url = resolveImageUrl(previa.imagen_url);

  return (
    <PressableScale style={styles.item} onPress={onPress} scaleTo={0.98} accessibilityLabel={`Ver previa ${previa.numero_previa}`}>
      <View style={styles.fila}>
        {url && !esPdf(url) ? (
          <Image source={{ uri: url }} style={styles.img} contentFit="cover" cachePolicy="memory-disk" />
        ) : (
          <View style={[styles.img, styles.sinImg]}>
            <Ionicons name="image-outline" size={24} color={textColors.muted} />
          </View>
        )}
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.titulo} maxFontSizeMultiplier={ESCALA}>Previa {previa.numero_previa}</Text>
          <PastillaAdmin texto={e.texto} icono={e.icono} bg={e.bg} fg={e.fg} />
          <View style={styles.meta}>
            <Ionicons name={previa.fecha_vista ? 'eye-outline' : 'eye-off-outline'} size={13} color={textColors.muted} />
            <Text style={styles.metaTexto} maxFontSizeMultiplier={ESCALA}>
              {previa.fecha_vista ? 'Vista por el cliente' : 'Aún no la ve'} · {formatFecha(previa.fecha_subida)}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={textColors.muted} />
      </View>

      {previa.rechazada && !!previa.comentario_cliente && (
        <View style={styles.comentario}>
          <Ionicons name="chatbox-ellipses-outline" size={15} color="#991B1B" />
          <Text style={styles.comentarioTexto} maxFontSizeMultiplier={ESCALA}>“{previa.comentario_cliente}”</Text>
        </View>
      )}
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  item: { gap: space.sm, padding: space.md, borderRadius: radius.md, borderWidth: 1, borderColor: surface.border },
  fila: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  img: { width: 64, height: 64, borderRadius: radius.sm, backgroundColor: surface.muted },
  sinImg: { alignItems: 'center', justifyContent: 'center' },
  titulo: { fontFamily: fontFamily.semibold, fontSize: 15, color: textColors.primary },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaTexto: { fontFamily: fontFamily.regular, fontSize: 12, color: textColors.muted },
  comentario: { flexDirection: 'row', gap: 6, backgroundColor: '#FEF2F2', borderRadius: radius.sm, padding: space.sm },
  comentarioTexto: { flex: 1, fontFamily: fontFamily.regular, fontSize: 13, color: textColors.primary },
});
