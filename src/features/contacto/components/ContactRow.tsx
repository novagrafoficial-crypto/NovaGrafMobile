import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors, brandTints } from '@/constants/brand';

interface Props {
  icono: string;
  etiqueta: string;
  valor: string;
  /** Si hay enlace, la fila se puede tocar y muestra la flecha. */
  href: string | null;
  onPress: () => void;
  esUltima: boolean;
}

// Una fila de contacto (teléfono, correo, WhatsApp...). Tocarla abre la app correspondiente.
export const ContactRow = ({ icono, etiqueta, valor, href, onPress, esUltima }: Props) => {
  const contenido = (
    <>
      <Text style={styles.icono}>{icono}</Text>
      <View style={styles.texto}>
        <Text style={styles.etiqueta}>{etiqueta}</Text>
        <Text style={styles.valor}>{valor}</Text>
      </View>
      {!!href && <Text style={styles.flecha}>›</Text>}
    </>
  );

  const estilo = [styles.fila, !esUltima && styles.separador];

  return href ? (
    <PressableScale style={estilo} onPress={onPress} scaleTo={0.98} accessibilityLabel={`${etiqueta}: ${valor}`}>
      {contenido}
    </PressableScale>
  ) : (
    <View style={estilo}>{contenido}</View>
  );
};

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  separador: { borderBottomWidth: 1, borderBottomColor: brandTints.surfaceMuted },
  icono: { fontSize: 22 },
  texto: { flex: 1 },
  etiqueta: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8, color: brandColors.accent },
  valor: { fontSize: 15, fontWeight: '600', color: brandColors.primaryDark, marginTop: 1 },
  flecha: { fontSize: 24, color: brandColors.primary, fontWeight: '700' },
});