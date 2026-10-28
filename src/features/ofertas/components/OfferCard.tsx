import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { FadeInView } from '@/shared/components/FadeInView';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors, brandTints } from '@/constants/brand';
import type { OfertaTarjeta } from '../models/Oferta';

interface Props {
  tarjeta: OfertaTarjeta;
  index: number;
  onPress: () => void;
}

// Tarjeta de una promoción: foto, insignia de descuento, precio nuevo y precio tachado
export const OfferCard = ({ tarjeta: t, index, onPress }: Props) => {
  const [fallo, setFallo] = useState(false);

  return (
    <FadeInView delay={Math.min(index, 5) * 70} style={styles.celda}>
      <PressableScale
        onPress={onPress}
        style={styles.card}
        scaleTo={0.96}
        accessibilityRole="button"
        accessibilityLabel={`${t.productoNombre}, ${t.descuentoTexto}`}
      >
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
            <Text style={styles.placeholder}>🏷️</Text>
          )}
          {!!t.descuentoTexto && (
            <View style={styles.insignia}>
              <Text style={styles.insigniaTexto}>{t.descuentoTexto}</Text>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.nombre} numberOfLines={2}>
            {t.productoNombre}
          </Text>
          {!!t.color && <Text style={styles.color}>{t.color}</Text>}
          <View style={styles.precios}>
            <Text style={styles.precioFinal}>${t.precioFinal.toFixed(2)}</Text>
            {t.precioOriginal > t.precioFinal && (
              <Text style={styles.precioOriginal}>${t.precioOriginal.toFixed(2)}</Text>
            )}
          </View>
          {t.cantidadMinima > 1 && <Text style={styles.minimo}>Mín. {t.cantidadMinima} piezas</Text>}
        </View>
      </PressableScale>
    </FadeInView>
  );
};

const styles = StyleSheet.create({
  celda: { width: '50%', padding: 6 },
  card: { backgroundColor: brandColors.white, borderRadius: 16, overflow: 'hidden' },
  imagenBox: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: brandTints.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagen: { width: '100%', height: '100%' },
  placeholder: { fontSize: 34 },
  insignia: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: brandColors.accent,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  insigniaTexto: { fontSize: 11, fontWeight: '800', color: brandColors.primaryDark },
  info: { padding: 10 },
  nombre: { fontSize: 13, fontWeight: '700', color: brandColors.primaryDark, minHeight: 34 },
  color: { fontSize: 11, color: brandTints.textMuted, marginTop: 1 },
  precios: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 },
  precioFinal: { fontSize: 16, fontWeight: '800', color: brandColors.primary },
  precioOriginal: { fontSize: 11, color: brandTints.textMuted, textDecorationLine: 'line-through' },
  minimo: { fontSize: 10, color: brandTints.textMuted, marginTop: 3 },
});