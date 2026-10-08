import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { brandColors } from '@/constants/brand';
import type { PortfolioItem } from '@/features/portafolio';

interface Props {
  item: PortfolioItem;
  onPress: () => void;
}

// Tarjeta pública: sin precio, solo imagen + nombre para despertar curiosidad.
export const FeaturedProductCard = ({ item, onPress }: Props) => {
  const [imageFailed, setImageFailed] = useState(false);
  const titulo = item.productoNombre || item.descripcion || 'Producto personalizado';

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.card}>
      <View style={styles.imageBox}>
        {item.imagenUrl && !imageFailed ? (
          <Image
            source={{ uri: item.imagenUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>🖼️</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.titulo} numberOfLines={2}>
          {titulo}
        </Text>
        {item.categoriaNombre && <Text style={styles.categoria}>{item.categoriaNombre}</Text>}
        <Text style={styles.descubre}>Descúbrelo</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 170,
    backgroundColor: brandColors.white,
    borderRadius: 14,
    overflow: 'hidden',
  },
  imageBox: { width: '100%', aspectRatio: 1, backgroundColor: '#EEE' },
  image: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderIcon: { fontSize: 32 },
  info: { padding: 12 },
  titulo: { fontSize: 14, fontWeight: '700', color: brandColors.primaryDark },
  categoria: { fontSize: 11, color: '#666', marginTop: 2 },
  descubre: { fontSize: 12, fontWeight: '700', color: brandColors.primary, marginTop: 8 },
});
