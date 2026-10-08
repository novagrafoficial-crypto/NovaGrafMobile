import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Header } from '@/shared/components/Header';
import { PortfolioView } from '@/features/portafolio';
import { brandColors } from '@/constants/brand';

export const ClientHomeView = () => {
  return (
    <View style={styles.contenedor}>
      <Header profileRoute="/(cliente)/perfil" />

      <ScrollView contentContainerStyle={styles.contenidoScroll}>
        <PortfolioView />

        <View style={styles.cardCTA}>
          <Text style={styles.tituloCTA}>¿Tienes una idea en mente?</Text>
          <Text style={styles.subtituloCTA}>Súbela y nosotros lo hacemos realidad</Text>
          <TouchableOpacity style={styles.botonCTA}>
            <Text style={styles.textoBotonCTA}>Empezar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: brandColors.background },
  contenidoScroll: { padding: 20, paddingBottom: 40 },
  cardCTA: {
    backgroundColor: brandColors.primary,
    borderRadius: 16,
    padding: 24,
  },
  tituloCTA: { color: brandColors.white, fontSize: 18, fontWeight: '700', marginBottom: 4 },
  subtituloCTA: { color: '#E6F2EF', fontSize: 14, marginBottom: 20 },
  botonCTA: {
    backgroundColor: brandColors.white,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  textoBotonCTA: { color: brandColors.primaryDark, fontWeight: '700', fontSize: 14 },
});
