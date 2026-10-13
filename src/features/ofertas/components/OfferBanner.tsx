import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FadeInView } from '@/shared/components/FadeInView';
import { PulseView } from '@/shared/components/PulseView';
import { brandColors, brandTints } from '@/constants/brand';

interface Props {
  titulo: string;
  subtitulo: string;
  /** Ej. "Válida hasta el 31 de octubre" (vacío si no hay fecha) */
  vigencia: string;
}

// Banner grande con la mejor promoción activa
export const OfferBanner = ({ titulo, subtitulo, vigencia }: Props) => (
  <FadeInView style={styles.banner}>
    <PulseView style={styles.circulo} scaleTo={1.2} duration={2400} />
    <View style={styles.contenido}>
      <Text style={styles.etiqueta}>OFERTA DE TEMPORADA</Text>
      <Text style={styles.titulo}>{titulo}</Text>
      {!!subtitulo && <Text style={styles.subtitulo}>{subtitulo}</Text>}
      {!!vigencia && (
        <View style={styles.pildora}>
          <Text style={styles.pildoraTexto}>{vigencia}</Text>
        </View>
      )}
    </View>
  </FadeInView>
);

const styles = StyleSheet.create({
  banner: {
    backgroundColor: brandColors.primary,
    borderRadius: 20,
    padding: 18,
    overflow: 'hidden',
  },
  circulo: {
    position: 'absolute',
    top: -34,
    right: -34,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: brandColors.accent,
    opacity: 0.35,
  },
  contenido: { maxWidth: '78%', gap: 6 },
  etiqueta: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, color: brandTints.accentSoft },
  titulo: { fontSize: 22, fontWeight: '800', color: brandColors.white, lineHeight: 27 },
  subtitulo: { fontSize: 13, color: brandTints.accentSoft },
  pildora: {
    alignSelf: 'flex-start',
    backgroundColor: brandColors.accent,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 6,
  },
  pildoraTexto: { fontSize: 12, fontWeight: '800', color: brandColors.primaryDark },
});