import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '@/shared/components/PressableScale';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import { splitDescripcion } from '../utils/splitDescripcion';
import type { PortfolioItem } from '../models/PortfolioItem';

const ESCALA = 1.15;

/** Título corto del trabajo: nombre del producto o la primera línea de la descripción */
export const tituloTrabajo = (t: PortfolioItem) =>
  t.productoNombre || splitDescripcion(t.descripcion).titulo || 'Trabajo personalizado';

// Tarjeta de un trabajo realizado: foto cuadrada, categoría y título.
// memo: no se vuelve a dibujar si el trabajo no cambió (la lista se siente fluida).
export const TrabajoCard = memo(({ trabajo, onPress }: { trabajo: PortfolioItem; onPress: () => void }) => (
  <PressableScale style={styles.card} onPress={onPress} scaleTo={0.97}>
    <View style={styles.imagenBox}>
      {trabajo.imagenUrl ? (
        <Image
          source={{ uri: trabajo.imagenUrl }}
          style={styles.imagen}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={String(trabajo.id)}
          transition={150}
        />
      ) : (
        <Ionicons name="image-outline" size={30} color={textColors.muted} />
      )}
      {!!trabajo.categoriaNombre && (
        <View style={styles.etiqueta}>
          <Text style={styles.etiquetaTexto} numberOfLines={1} maxFontSizeMultiplier={1}>{trabajo.categoriaNombre}</Text>
        </View>
      )}
    </View>
    <Text style={styles.titulo} numberOfLines={2} maxFontSizeMultiplier={ESCALA}>{tituloTrabajo(trabajo)}</Text>
  </PressableScale>
));

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: surface.card, borderRadius: radius.lg, borderWidth: 1, borderColor: surface.border, overflow: 'hidden' },
  imagenBox: { aspectRatio: 1, backgroundColor: surface.muted, alignItems: 'center', justifyContent: 'center' },
  imagen: { width: '100%', height: '100%' },
  etiqueta: {
    position: 'absolute',
    left: 8,
    top: 8,
    maxWidth: '85%',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  etiquetaTexto: { fontFamily: fontFamily.medium, fontSize: 11, color: '#FFFFFF' },
  titulo: { fontFamily: fontFamily.semibold, fontSize: 14, lineHeight: 19, color: textColors.primary, padding: space.md, minHeight: 38 + space.md * 2 },
});
