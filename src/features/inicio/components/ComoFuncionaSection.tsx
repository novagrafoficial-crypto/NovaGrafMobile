import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { FadeInView } from '@/shared/components/FadeInView';
import { brandColors, brandTints } from '@/constants/brand';

const PASOS = [
  {
    icono: '🛍️',
    titulo: 'Elige tu producto base',
    texto: 'Escoge en el catálogo el producto que quieres personalizar.',
  },
  {
    icono: '💳',
    titulo: 'Paga tu anticipo del 50%',
    texto: 'Con el anticipo reservas tu pedido y se activa tu solicitud.',
  },
  {
    icono: '✍️',
    titulo: 'Cuéntanos tu idea',
    texto: 'Sube imágenes de referencia y explícanos cómo lo quieres.',
  },
  {
    icono: '👀',
    titulo: 'Aprueba tu previa',
    texto: 'Te enviamos una vista previa; tú decides si está bien o pides cambios.',
  },
  {
    icono: '📦',
    titulo: 'Recibe tu pedido',
    texto: 'Lo personalizamos y das seguimiento desde tu celular.',
  },
];

interface Props {
  titulo?: string;
  subtitulo?: string;
  style?: StyleProp<ViewStyle>;
}

export const ComoFuncionaSection = ({ titulo = '¿Cómo funciona?', subtitulo, style }: Props) => (
  <View style={[styles.seccion, style]}>
    <Text style={styles.titulo}>{titulo}</Text>
    {!!subtitulo && <Text style={styles.subtitulo}>{subtitulo}</Text>}
    {PASOS.map((paso, i) => (
      <FadeInView key={paso.titulo} delay={i * 90} style={styles.fila}>
        <View style={styles.circulo}>
          <Text style={styles.icono}>{paso.icono}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.pasoTitulo}>
            {i + 1}. {paso.titulo}
          </Text>
          <Text style={styles.pasoTexto}>{paso.texto}</Text>
        </View>
      </FadeInView>
    ))}
  </View>
);

const styles = StyleSheet.create({
  seccion: { marginBottom: 24 },
  titulo: { fontSize: 20, fontWeight: '700', color: brandColors.primaryDark, marginBottom: 14 },
  subtitulo: { fontSize: 13, color: brandTints.textMuted, marginTop: -8, marginBottom: 14 },
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
  pasoTexto: { fontSize: 13, color: brandTints.textMuted, marginTop: 2 },
});