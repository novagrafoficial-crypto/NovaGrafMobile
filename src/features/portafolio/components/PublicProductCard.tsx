import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { brandColors, brandTints } from '@/constants/brand';
import { FadeInView } from '@/shared/components/FadeInView';
import { PressableScale } from '@/shared/components/PressableScale';
import type { PortfolioItem } from '../models/PortfolioItem';
import { splitDescripcion } from '../utils/splitDescripcion';

interface Props {
  item: PortfolioItem;
  onPress: () => void;
  /** Posición en la lista: sirve para que las tarjetas aparezcan escalonadas. */
  index?: number;
}

// Tarjeta de un trabajo: la imagen se ve completa (sin recortar) y sin precio.
export const PublicProductCard = ({ item, onPress, index = 0 }: Props) => {
  const [failed, setFailed] = useState(false);
  const partes = splitDescripcion(item.descripcion);
  const titulo = item.productoNombre || partes.titulo || 'Producto personalizado';
  const detalle = item.productoNombre ? item.descripcion : partes.detalle;

  return (
    <FadeInView delay={Math.min(index, 5) * 70} style={styles.envoltura}>
      <PressableScale
        onPress={onPress}
        style={styles.card}
        scaleTo={0.97}
        accessibilityRole="button"
        accessibilityLabel={`Ver detalle de ${titulo}`}
      >
        <View style={styles.imagenBox}>
          {item.imagenUrl && !failed ? (
            <Image
              source={{ uri: item.imagenUrl }}
              style={styles.imagen}
              resizeMode="contain"
              onError={() => setFailed(true)}
            />
          ) : (
            <Text style={styles.placeholder}>🖼️</Text>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.titulo} numberOfLines={2}>
            {titulo}
          </Text>
          {detalle && (
            <Text style={styles.detalle} numberOfLines={2}>
              {detalle}
            </Text>
          )}
          <View style={styles.pie}>
            {item.categoriaNombre ? (
              <View style={styles.pastilla}>
                <Text style={styles.textoPastilla}>{item.categoriaNombre}</Text>
              </View>
            ) : (
              <View />
            )}
            <Text style={styles.verDetalle}>Ver detalle →</Text>
          </View>
        </View>
      </PressableScale>
    </FadeInView>
  );
};

const styles = StyleSheet.create({
  envoltura: { marginBottom: 16 },
  card: {
    backgroundColor: brandColors.white,
    borderRadius: 18,
    overflow: 'hidden',
  },
  // 4:3 = tamaño moderado. Para tarjetas más bajas usa 16 / 9; para más altas, 1.
  imagenBox: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: brandTints.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagen: { width: '100%', height: '100%' },
  placeholder: { fontSize: 40 },
  info: { padding: 14 },
  titulo: { fontSize: 17, fontWeight: '700', color: brandColors.primaryDark },
  detalle: { fontSize: 13, color: brandTints.textMuted, marginTop: 4 },
  pie: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  pastilla: {
    backgroundColor: brandTints.accentSoft,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  textoPastilla: { fontSize: 12, fontWeight: '600', color: brandColors.primaryDark },
  verDetalle: { fontSize: 13, fontWeight: '700', color: brandColors.primary },
});
