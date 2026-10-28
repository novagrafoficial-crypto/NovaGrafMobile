import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { FadeInView } from '@/shared/components/FadeInView';
import { PressableScale } from '@/shared/components/PressableScale';
import { fontFamily, radius, surface, textColors } from '@/constants/theme';
import type { OfertaTarjeta } from '../models/Oferta';

interface Props {
  tarjeta: OfertaTarjeta;
  index: number;
  onPress: () => void;
}

const ROJO = '#DC2626';
const VERDE_AHORRO = '#15803D';
const ESCALA = 1.15;

// Tarjeta de una promoción. Todas miden lo mismo: cada renglón tiene un alto fijo
// aunque el dato venga vacío, así la cuadrícula queda pareja.
export const OfferCard = ({ tarjeta: t, index, onPress }: Props) => {
  const [fallo, setFallo] = useState(false);
  const ahorro = t.precioOriginal - t.precioFinal;

  return (
    <FadeInView delay={Math.min(index, 5) * 70} style={styles.celda}>
      <PressableScale
        onPress={onPress}
        style={styles.card}
        scaleTo={0.97}
        accessibilityRole="button"
        accessibilityLabel={`${t.productoNombre}, ${t.descuentoTexto}, ${t.precioFinal.toFixed(2)} pesos`}
      >
        {/* Imagen */}
        <View style={styles.imagenBox}>
          {t.imagen && !fallo ? (
            <Image
              source={{ uri: t.imagen }}
              style={styles.imagen}
              contentFit="contain"
              cachePolicy="memory-disk"
              recyclingKey={t.clave}
              transition={200}
              onError={() => setFallo(true)}
            />
          ) : (
            <Ionicons name="pricetag-outline" size={32} color={textColors.muted} />
          )}

          {!!t.descuentoTexto && (
            <View style={styles.descuento}>
              <Text style={styles.descuentoTexto} maxFontSizeMultiplier={1}>{t.descuentoTexto}</Text>
            </View>
          )}

          {t.cantidadMinima > 1 && (
            <View style={styles.minimo}>
              <Ionicons name="layers-outline" size={11} color="#FFFFFF" />
              <Text style={styles.minimoTexto} maxFontSizeMultiplier={1}>Mín. {t.cantidadMinima}</Text>
            </View>
          )}
        </View>

        {/* Datos (alto fijo en cada renglón) */}
        <View style={styles.info}>
          <Text style={styles.nombre} numberOfLines={2} maxFontSizeMultiplier={ESCALA}>
            {t.productoNombre}
          </Text>
          <Text style={styles.color} numberOfLines={1} maxFontSizeMultiplier={ESCALA}>
            {t.color || ' '}
          </Text>

          <View style={styles.precios}>
            <Text style={styles.precioFinal} maxFontSizeMultiplier={ESCALA}>${t.precioFinal.toFixed(2)}</Text>
            {ahorro > 0 && (
              <Text style={styles.precioOriginal} maxFontSizeMultiplier={ESCALA}>${t.precioOriginal.toFixed(2)}</Text>
            )}
          </View>

          <Text style={styles.ahorro} numberOfLines={1} maxFontSizeMultiplier={ESCALA}>
            {ahorro > 0 ? `Ahorras $${ahorro.toFixed(2)}` : ' '}
          </Text>
        </View>
      </PressableScale>
    </FadeInView>
  );
};

const styles = StyleSheet.create({
  celda: { width: '50%', padding: 6 },
  card: {
    flex: 1,
    backgroundColor: surface.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: surface.border,
  },

  // Imagen cuadrada: todas las tarjetas tienen la misma foto de alto
  imagenBox: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: surface.muted,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  imagen: { width: '100%', height: '100%' },
  descuento: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: ROJO,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  descuentoTexto: { fontFamily: fontFamily.bold, fontSize: 12, color: '#FFFFFF' },
  minimo: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(17,17,17,0.75)',
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  minimoTexto: { fontFamily: fontFamily.medium, fontSize: 10, color: '#FFFFFF' },

  // Renglones de alto fijo
  info: { paddingHorizontal: 10, paddingTop: 10, paddingBottom: 12 },
  nombre: { fontFamily: fontFamily.medium, fontSize: 14, lineHeight: 19, height: 38, color: textColors.primary },
  color: { fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 16, height: 16, color: textColors.muted, marginTop: 2 },
  precios: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 6, height: 24 },
  precioFinal: { fontFamily: fontFamily.bold, fontSize: 18, color: textColors.primary },
  precioOriginal: { fontFamily: fontFamily.regular, fontSize: 12, color: textColors.muted, textDecorationLine: 'line-through' },
  ahorro: { fontFamily: fontFamily.medium, fontSize: 12, lineHeight: 16, height: 16, color: VERDE_AHORRO, marginTop: 2 },
});