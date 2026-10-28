import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '@/shared/components/PressableScale';
import { FadeInView } from '@/shared/components/FadeInView';
import { fontFamily, radius, surface, textColors } from '@/constants/theme';
import type { PortfolioItem } from '../models/PortfolioItem';

interface Props {
  item: PortfolioItem;
  index?: number;
  /** Si se pasa, la tarjeta es tocable y muestra el botón "Pedir uno así". */
  onPress?: () => void;
}

const ESCALA = 1.15;

// Tarjeta de un trabajo ya personalizado. Igual que las de ofertas:
// foto cuadrada y renglones de alto fijo para que todas midan lo mismo.
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
      accessibilityLabel={onPress ? `Pedir uno como ${titulo}` : undefined}
    >
      <FadeInView delay={Math.min(index, 6) * 60} style={styles.card}>
        {/* Foto */}
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
              <Ionicons name="image-outline" size={32} color={textColors.muted} />
            </View>
          )}

          {!!item.categoriaNombre && (
            <View style={styles.badge}>
              <Text style={styles.badgeText} numberOfLines={1} maxFontSizeMultiplier={1}>{item.categoriaNombre}</Text>
            </View>
          )}
        </View>

        {/* Datos (alto fijo en cada renglón) */}
        <View style={styles.info}>
          <Text style={styles.titulo} numberOfLines={2} maxFontSizeMultiplier={ESCALA}>{titulo}</Text>

          <Text style={styles.precio} numberOfLines={1} maxFontSizeMultiplier={ESCALA}>
            {item.precioBase !== null ? (
              <>
                <Text style={styles.desde}>Desde </Text>${item.precioBase.toFixed(2)}
              </>
            ) : (
              ' '
            )}
          </Text>

          {!!onPress && (
            <View style={styles.boton}>
              <Text style={styles.botonTexto} maxFontSizeMultiplier={ESCALA}>Pedir uno así</Text>
              <Ionicons name="arrow-forward" size={15} color={textColors.primary} />
            </View>
          )}
        </View>
      </FadeInView>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  // El ancho vive en el contenedor táctil; la tarjeta ocupa todo su espacio
  celda: { width: '48.5%' },
  card: {
    width: '100%',
    backgroundColor: surface.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: surface.border,
  },

  // Foto cuadrada
  imageBox: { width: '100%', aspectRatio: 1, backgroundColor: surface.muted },
  image: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    maxWidth: '85%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  badgeText: { fontFamily: fontFamily.semibold, fontSize: 11, color: textColors.primary },

  // Renglones de alto fijo, todo en negro
  info: { paddingHorizontal: 10, paddingTop: 10, paddingBottom: 10 },
  titulo: { fontFamily: fontFamily.medium, fontSize: 14, lineHeight: 19, height: 38, color: textColors.primary },
  precio: { fontFamily: fontFamily.bold, fontSize: 17, lineHeight: 24, height: 24, color: textColors.primary, marginTop: 6 },
  desde: { fontFamily: fontFamily.regular, fontSize: 12, color: textColors.secondary },
  boton: {
    marginTop: 10,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: surface.muted,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  botonTexto: { fontFamily: fontFamily.semibold, fontSize: 13, color: textColors.primary },
});