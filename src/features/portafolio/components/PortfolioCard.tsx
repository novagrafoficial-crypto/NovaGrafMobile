import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { PressableScale } from '@/shared/components/PressableScale';
import { FadeInView } from '@/shared/components/FadeInView';
import { brandColors, brandTints } from '@/constants/brand';
import type { PortfolioItem } from '../models/PortfolioItem';

interface Props {
  item: PortfolioItem;
  index?: number;
  /** Si se pasa, la tarjeta es tocable y muestra "Elegir este producto base". */
  onPress?: () => void;
}

export const PortfolioCard = ({ item, index = 0, onPress }: Props) => {
  const [imageFailed, setImageFailed] = useState(false);
  const titulo = item.descripcion || item.productoNombre || 'Producto personalizado';

  return (
    <PressableScale
      style={styles.celda}
      onPress={onPress}
      disabled={!onPress}
      scaleTo={0.97}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? `Elegir producto base de ${titulo}` : undefined}
    >
    <FadeInView delay={Math.min(index, 6) * 60} style={styles.card}>
      <View style={styles.imageBox}>
        {item.imagenUrl && !imageFailed ? (
            <Image
              source={{ uri: item.imagenUrl }}
              style={styles.image}
              contentFit="cover"
              // expo-image reduce la foto al tamaño de la tarjeta y la guarda en caché → scroll fluido
              cachePolicy="memory-disk"
              recyclingKey={String(item.id)}
              transition={200}
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
        {!!onPress && <Text style={styles.accion}>Elegir este producto base →</Text>}
      </View>
    </FadeInView>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  // El ancho vive en el contenedor táctil; la tarjeta ocupa todo su espacio
  celda: { width: '48%' },
  card: {
    width: '100%',
    backgroundColor: brandColors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageBox: { width: '100%', aspectRatio: 1, backgroundColor: brandTints.surfaceMuted },
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
  categoria: { fontSize: 11, color: brandTints.textMuted, marginTop: 2 },
  precio: { fontSize: 12, fontWeight: '700', color: brandColors.primary, marginTop: 6 },
  accion: { fontSize: 11, fontWeight: '800', color: brandColors.accent, marginTop: 8 },
});