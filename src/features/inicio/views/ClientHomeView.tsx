import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Header } from '@/shared/components/Header';
import { FadeInView } from '@/shared/components/FadeInView';
import { PressableScale } from '@/shared/components/PressableScale';
import { PortfolioView } from '@/features/portafolio';
import { brandColors, brandTints } from '@/constants/brand';

export const ClientHomeView = () => {
  const router = useRouter();

  return (
    <View style={styles.contenedor}>
      <Header profileRoute="/(cliente)/perfil" />

      <ScrollView contentContainerStyle={styles.contenidoScroll} showsVerticalScrollIndicator={false}>
        <PortfolioView />

        <FadeInView delay={200} style={styles.cardCTA}>
          <Text style={styles.tituloCTA}>¿Tienes una idea en mente?</Text>
          <Text style={styles.subtituloCTA}>Súbela y nosotros lo hacemos realidad</Text>
          <PressableScale style={styles.botonCTA} onPress={() => router.push('/(cliente)/productos-base' as any)}>
            <Text style={styles.textoBotonCTA}>Empezar</Text>
          </PressableScale>
        </FadeInView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: brandColors.background },
  contenidoScroll: { padding: 20, paddingBottom: 40 },
  cardCTA: { backgroundColor: brandColors.primary, borderRadius: 18, padding: 24 },
  tituloCTA: { color: brandColors.white, fontSize: 18, fontWeight: '700', marginBottom: 4 },
  subtituloCTA: { color: brandTints.accentSoft, fontSize: 14, marginBottom: 20 },
  botonCTA: {
    backgroundColor: brandColors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  textoBotonCTA: { color: brandColors.white, fontWeight: '800', fontSize: 14 },
});
