import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import type { ArchivoPrevia } from '../models/PedidoAdmin';

interface Props {
  titulo: string;
  archivo: ArchivoPrevia | null;
  onElegir: () => void;
  onQuitar: () => void;
  disabled: boolean;
}

const ESCALA = 1.15;

// Elige una imagen de la galería para enviarla como previa.
export const SelectorPrevia = ({ titulo, archivo, onElegir, onQuitar, disabled }: Props) => (
  <View style={styles.selector}>
    <Text style={styles.titulo} maxFontSizeMultiplier={ESCALA}>{titulo}</Text>
    {archivo ? (
      <View style={styles.elegido}>
        <Image source={{ uri: archivo.uri }} style={styles.img} contentFit="cover" />
        {!disabled && (
          <PressableScale style={styles.quitar} onPress={onQuitar} hitSlop={8} accessibilityLabel="Quitar imagen">
            <Ionicons name="close" size={18} color="#FFFFFF" />
          </PressableScale>
        )}
        <View style={styles.nombre}>
          <Ionicons name="image-outline" size={14} color={textColors.secondary} />
          <Text style={styles.nombreTexto} numberOfLines={1} maxFontSizeMultiplier={ESCALA}>{archivo.name}</Text>
        </View>
      </View>
    ) : (
      <PressableScale style={styles.boton} onPress={onElegir} disabled={disabled} scaleTo={0.98}>
        <View style={styles.botonIcono}>
          <Ionicons name="cloud-upload-outline" size={24} color={brandColors.primary} />
        </View>
        <Text style={styles.botonTexto} maxFontSizeMultiplier={ESCALA}>Elegir imagen de la galería</Text>
        <Text style={styles.botonSub} maxFontSizeMultiplier={ESCALA}>JPG, PNG o WEBP</Text>
      </PressableScale>
    )}
  </View>
);

const styles = StyleSheet.create({
  selector: { gap: space.sm },
  titulo: { fontFamily: fontFamily.semibold, fontSize: 14, color: textColors.primary },
  boton: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: space.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#9CC9BE',
    backgroundColor: '#F4FAF8',
  },
  botonIcono: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E6F2EF', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  botonTexto: { fontFamily: fontFamily.semibold, fontSize: 14, color: textColors.primary },
  botonSub: { fontFamily: fontFamily.regular, fontSize: 12, color: textColors.muted },
  elegido: { gap: space.sm },
  img: { width: '100%', height: 190, borderRadius: radius.md, backgroundColor: surface.muted },
  quitar: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nombre: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nombreTexto: { flex: 1, fontFamily: fontFamily.regular, fontSize: 13, color: textColors.secondary },
});
