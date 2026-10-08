import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { brandColors } from '@/constants/brand';

const PASOS = [
  { icono: '🎨', titulo: 'Elige tu producto', texto: 'Explora el catálogo de productos personalizables.' },
  { icono: '✍️', titulo: 'Personalízalo', texto: 'Sube tu idea y nosotros la hacemos realidad.' },
  { icono: '📦', titulo: 'Recíbelo', texto: 'Da seguimiento a tu pedido desde tu celular.' },
];

export const ComoFuncionaSection = () => (
  <View style={styles.seccion}>
    <Text style={styles.titulo}>¿Cómo funciona?</Text>
    {PASOS.map((paso, i) => (
      <View key={paso.titulo} style={styles.fila}>
        <View style={styles.circulo}>
          <Text style={styles.icono}>{paso.icono}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.pasoTitulo}>
            {i + 1}. {paso.titulo}
          </Text>
          <Text style={styles.pasoTexto}>{paso.texto}</Text>
        </View>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  seccion: { marginBottom: 24 },
  titulo: { fontSize: 20, fontWeight: '700', color: brandColors.primaryDark, marginBottom: 14 },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: brandColors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 14,
  },
  circulo: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: brandColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icono: { fontSize: 22 },
  pasoTitulo: { fontSize: 15, fontWeight: '700', color: brandColors.primaryDark },
  pasoTexto: { fontSize: 13, color: '#555', marginTop: 2 },
});
