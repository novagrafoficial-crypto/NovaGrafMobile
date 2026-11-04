import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors } from '@/constants/brand';
import { fontFamily, space, surface, textColors } from '@/constants/theme';

interface Props {
  /** Nombre de Ionicons */
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
      <View style={styles.icono}>
        <Ionicons name={icono as any} size={19} color={brandColors.primary} />
      </View>
      <View style={styles.texto}>
        <Text style={styles.etiqueta} maxFontSizeMultiplier={1.15}>{etiqueta}</Text>
        <Text style={styles.valor} maxFontSizeMultiplier={1.15}>{valor}</Text>
      </View>
      {!!href && <Ionicons name="chevron-forward" size={18} color={textColors.muted} />}
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
  fila: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
  separador: { borderBottomWidth: 1, borderBottomColor: surface.muted },
  icono: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#E6F2EF', alignItems: 'center', justifyContent: 'center' },
  texto: { flex: 1 },
  etiqueta: { fontFamily: fontFamily.regular, fontSize: 12, color: textColors.muted },
  valor: { fontFamily: fontFamily.semibold, fontSize: 15, color: textColors.primary },
});
