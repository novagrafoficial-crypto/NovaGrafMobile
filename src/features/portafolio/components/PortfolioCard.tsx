import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { brandColors } from '@/constants/brand';
import type { PortfolioItem } from '../models/PortfolioItem';

export const PortfolioCard = ({ item }: { item: PortfolioItem }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const titulo = item.descripcion || item.productoNombre || 'Producto personalizado';

  return (
    <View style={styles.card}>
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
        {item.productoNombre && (
          <View style={styles.badge}>
            <Text style={styles.badgeText} numberOfLines={1}>
              {item.productoNombre}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.titulo} numberOfLines={2}>
          {titulo}
        </Text>
        {item.categoriaNombre && <Text style={styles.categoria}>{item.categoriaNombre}</Text>}
        {item.precioBase !== null && (
          <Text style={styles.precio}>Desde ${item.precioBase.toFixed(2)}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: brandColors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageBox: { width: '100%', aspectRatio: 1, backgroundColor: '#EEE' },
  image: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderIcon: { fontSize: 32 },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    maxWidth: '85%',
    backgroundColor: brandColors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { color: brandColors.white, fontSize: 10, fontWeight: '700' },
  info: { padding: 10 },
  titulo: { fontSize: 13, fontWeight: '700', color: brandColors.primaryDark },
  categoria: { fontSize: 11, color: '#666', marginTop: 2 },
  precio: { fontSize: 12, fontWeight: '700', color: brandColors.primary, marginTop: 6 },
});
