import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { brandColors } from '@/constants/brand';
import type { PortfolioItem } from '@/features/portafolio';
import { splitDescripcion } from '@/features/portafolio/utils/splitDescripcion';

interface Props {
  item: PortfolioItem;
  onPress: () => void;
}

// Tarjeta de un trabajo: la imagen se ve completa (sin recortar) y sin precio.
export const PublicProductCard = ({ item, onPress }: Props) => {
  const [failed, setFailed] = useState(false);
  const partes = splitDescripcion(item.descripcion);
  const titulo = item.productoNombre || partes.titulo || 'Producto personalizado';
  const detalle = item.productoNombre ? item.descripcion : partes.detalle;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.card}
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
          <Text style={styles.verDetalle}>Ver detalle</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: brandColors.white,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
  },
  // 4:3 = tamaño moderado. Para tarjetas más bajas usa 16 / 9; para más altas, 1.
  imagenBox: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#F4F7F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagen: { width: '100%', height: '100%' },
  placeholder: { fontSize: 40 },
  info: { padding: 14 },
  titulo: { fontSize: 17, fontWeight: '700', color: brandColors.primaryDark },
  detalle: { fontSize: 13, color: '#555', marginTop: 4 },
  pie: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  pastilla: {
    backgroundColor: '#E6F2EF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  textoPastilla: { fontSize: 12, fontWeight: '600', color: brandColors.primaryDark },
  verDetalle: { fontSize: 13, fontWeight: '700', color: brandColors.primary },
});