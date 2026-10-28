import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '@/shared/components/PressableScale';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import { money } from '@/shared/utils/format';
import type { ProductoPublico } from '../models/ProductoPublico';

interface Props {
  producto: ProductoPublico;
  onPress: () => void;
  /** Ancho fijo para listas horizontales; sin él ocupa su columna */
  ancho?: number;
}

const ESCALA = 1.15;

// Tarjeta de producto: foto cuadrada, nombre, categoría y "Desde $X".
// memo: no se vuelve a dibujar si el producto no cambió (la lista se siente más fluida).
export const ProductoPublicoCard = memo(({ producto, onPress, ancho }: Props) => (
  <PressableScale style={[styles.card, ancho ? { width: ancho } : { flex: 1 }]} onPress={onPress} scaleTo={0.97}>
    <View style={styles.imagenBox}>
      {producto.imagenUrl ? (
        <Image
          source={{ uri: producto.imagenUrl }}
          style={styles.imagen}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={String(producto.id)}
          transition={150}
        />
      ) : (
        <Ionicons name="image-outline" size={30} color={textColors.muted} />
      )}
    </View>
    <View style={styles.info}>
      {!!producto.categoria && (
        <Text style={styles.categoria} numberOfLines={1} maxFontSizeMultiplier={ESCALA}>{producto.categoria}</Text>
      )}
      <Text style={styles.nombre} numberOfLines={2} maxFontSizeMultiplier={ESCALA}>{producto.nombre}</Text>
      <Text style={styles.desde} maxFontSizeMultiplier={ESCALA}>
        Desde <Text style={styles.precio}>{money(producto.precioBase)}</Text>
      </Text>
    </View>
  </PressableScale>
));

const styles = StyleSheet.create({
  card: { backgroundColor: surface.card, borderRadius: radius.lg, borderWidth: 1, borderColor: surface.border, overflow: 'hidden' },
  imagenBox: { aspectRatio: 1, backgroundColor: surface.muted, alignItems: 'center', justifyContent: 'center' },
  imagen: { width: '100%', height: '100%' },
  info: { padding: space.md, gap: 2 },
  categoria: { fontFamily: fontFamily.medium, fontSize: 11, color: textColors.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  nombre: { fontFamily: fontFamily.semibold, fontSize: 14, lineHeight: 19, color: textColors.primary, minHeight: 38 },
  desde: { fontFamily: fontFamily.regular, fontSize: 12, color: textColors.secondary, marginTop: 2 },
  precio: { fontFamily: fontFamily.bold, fontSize: 16, color: textColors.primary },
});
