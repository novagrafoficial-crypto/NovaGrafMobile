import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import type { ComponentProps } from 'react';

type IconName = ComponentProps<typeof Ionicons>['name'];

// Los mismos 5 pasos de antes, pero en versión corta (2–3 palabras cada uno)
const PASOS: { icono: IconName; texto: string }[] = [
  { icono: 'cube-outline', texto: 'Elige tu producto' },
  { icono: 'card-outline', texto: 'Paga el 50%' },
  { icono: 'color-palette-outline', texto: 'Envía tu idea' },
  { icono: 'eye-outline', texto: 'Aprueba la previa' },
  { icono: 'gift-outline', texto: 'Recibe tu pedido' },
];

interface Props { onEmpezar: () => void }

// Tarjeta compacta: "cómo funciona" en una franja deslizable + botón para empezar.
export const PasosPersonalizacion = ({ onEmpezar }: Props) => (
  <View style={styles.card}>
    <Text style={styles.titulo} maxFontSizeMultiplier={1.15}>Personaliza tus productos</Text>

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.pasosScroll}
      contentContainerStyle={styles.pasos}
    >
      {PASOS.map((p, i) => (
        <View key={p.texto} style={styles.paso}>
          <View style={styles.circulo}>
            <Ionicons name={p.icono} size={22} color={textColors.primary} />
            <View style={styles.numero}>
              <Text style={styles.numeroTexto} maxFontSizeMultiplier={1}>{i + 1}</Text>
            </View>
          </View>
          <Text style={styles.pasoTexto} numberOfLines={2} maxFontSizeMultiplier={1.15}>{p.texto}</Text>
        </View>
      ))}
    </ScrollView>

    <PressableScale style={styles.boton} onPress={onEmpezar} scaleTo={0.97} accessibilityRole="button">
      <Text style={styles.botonTexto} maxFontSizeMultiplier={1.15}>Elegir mi producto base</Text>
      <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
    </PressableScale>
  </View>
);

const CIRCULO = 52;

const styles = StyleSheet.create({
  card: {
    backgroundColor: surface.card,
    borderRadius: radius.lg,
    padding: space.lg,
    borderWidth: 1,
    borderColor: surface.border,
  },
  titulo: { fontFamily: fontFamily.semibold, fontSize: 17, color: textColors.primary },
  subtitulo: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.secondary, marginTop: 2 },

  // La franja llega hasta las orillas de la tarjeta al deslizar
  pasosScroll: { marginHorizontal: -space.lg, marginTop: space.lg },
  pasos: { gap: space.md, paddingHorizontal: space.lg },
  paso: { width: 72, alignItems: 'center', gap: 6 },
  circulo: {
    width: CIRCULO,
    height: CIRCULO,
    borderRadius: CIRCULO / 2,
    backgroundColor: surface.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numero: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: textColors.primary,
    borderWidth: 2,
    borderColor: surface.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numeroTexto: { fontFamily: fontFamily.semibold, fontSize: 9, lineHeight: 12, color: '#FFFFFF' },
  pasoTexto: { fontFamily: fontFamily.medium, fontSize: 12, color: textColors.primary, textAlign: 'center' },

  boton: {
    marginTop: space.lg,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: brandColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  botonTexto: { fontFamily: fontFamily.semibold, fontSize: 15, color: '#FFFFFF' },
});