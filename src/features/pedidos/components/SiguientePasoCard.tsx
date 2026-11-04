import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { brandColors } from '@/constants/brand';
import { fontSize, fontWeight, iconSize, radius, space, surface, textColors } from '@/constants/theme';
import { PressableScale } from '@/shared/components/PressableScale';
import { FadeInView } from '@/shared/components/FadeInView';
import type { IconoNombre } from '../utils/etapasPedido';

/** accion = el cliente debe hacer algo · espera = le toca a Nova Graf · listo / cancelado = final */
export type TonoPaso = 'accion' | 'espera' | 'listo' | 'cancelado';

export interface SiguientePaso {
  tono: TonoPaso;
  titulo: string;
  texto: string;
  boton?: string;
  onPress?: () => void;
}

const ESTILO: Record<TonoPaso, { icono: IconoNombre; color: string; fondoIcono: string; etiqueta: string }> = {
  accion: { icono: 'alert-circle-outline', color: brandColors.primary, fondoIcono: '#E6F2EF', etiqueta: 'Tu siguiente paso' },
  espera: { icono: 'hourglass-outline', color: '#52525B', fondoIcono: surface.muted, etiqueta: 'Estado actual' },
  listo: { icono: 'checkmark-done-outline', color: '#166534', fondoIcono: '#DCFCE7', etiqueta: 'Estado actual' },
  cancelado: { icono: 'close-circle-outline', color: brandColors.error, fondoIcono: '#FEE2E2', etiqueta: 'Estado actual' },
};

// Tarjeta "Tu siguiente paso": le dice al cliente en una frase qué hacer ahora.
export const SiguientePasoCard = ({ paso }: { paso: SiguientePaso }) => {
  const e = ESTILO[paso.tono];
  const esAccion = paso.tono === 'accion';

  return (
    <FadeInView style={[styles.card, esAccion && styles.cardAccion]}>
      <View style={styles.fila}>
        <View style={[styles.iconoCaja, { backgroundColor: e.fondoIcono }]}>
          <Ionicons name={e.icono} size={iconSize.lg} color={e.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.etiqueta, { color: e.color }]}>{e.etiqueta}</Text>
          <Text style={styles.titulo}>{paso.titulo}</Text>
        </View>
      </View>
      <Text style={styles.texto}>{paso.texto}</Text>

      {!!paso.boton && !!paso.onPress && (
        <PressableScale onPress={paso.onPress} style={styles.boton} accessibilityRole="button">
          <Text style={styles.botonTxt}>{paso.boton}</Text>
          <Ionicons name="arrow-forward" size={iconSize.md} color={textColors.inverse} />
        </PressableScale>
      )}
    </FadeInView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: surface.card, borderRadius: radius.lg, padding: space.lg, gap: space.md,
    borderWidth: 1, borderColor: surface.border,
  },
  cardAccion: { borderColor: brandColors.accent, borderWidth: 1.5 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  iconoCaja: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  etiqueta: { fontSize: fontSize.caption, fontWeight: fontWeight.semibold, textTransform: 'uppercase', letterSpacing: 0.5 },
  titulo: { fontSize: fontSize.title, fontWeight: fontWeight.bold, color: textColors.primary, marginTop: 2 },
  texto: { fontSize: fontSize.body, lineHeight: 21, color: textColors.secondary },
  boton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm,
    backgroundColor: brandColors.primary, borderRadius: radius.md, paddingVertical: 14,
  },
  botonTxt: { color: textColors.inverse, fontSize: fontSize.bodyLg, fontWeight: fontWeight.semibold },
});