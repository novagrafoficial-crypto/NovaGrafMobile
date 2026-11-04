import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { brandColors } from '@/constants/brand';
import { fontFamily, surface, textColors } from '@/constants/theme';

interface Props {
  pasos: readonly string[];
  actual: number;
}

// Indicador superior: 1 Compra — 2 Entrega — 3 Pago — 4 Confirmar
export const PasosCheckout = ({ pasos, actual }: Props) => (
  <View style={styles.contenedor}>
    {pasos.map((nombre, i) => {
      const hecho = i < actual;
      const activo = i === actual;
      return (
        <React.Fragment key={nombre}>
          <View style={styles.paso}>
            <View style={[styles.circulo, hecho && styles.circuloHecho, activo && styles.circuloActivo]}>
              {hecho ? (
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              ) : (
                <Text style={[styles.numero, activo && styles.numeroActivo]} maxFontSizeMultiplier={1}>{i + 1}</Text>
              )}
            </View>
            <Text style={[styles.nombre, (activo || hecho) && styles.nombreActivo]} maxFontSizeMultiplier={1.1}>
              {nombre}
            </Text>
          </View>
          {i < pasos.length - 1 && <View style={[styles.linea, hecho && styles.lineaHecha]} />}
        </React.Fragment>
      );
    })}
  </View>
);

const CIRCULO = 26;

const styles = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: surface.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: surface.border,
  },
  paso: { alignItems: 'center', width: 62 },
  circulo: {
    width: CIRCULO,
    height: CIRCULO,
    borderRadius: CIRCULO / 2,
    borderWidth: 1.5,
    borderColor: surface.border,
    backgroundColor: surface.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circuloActivo: { borderColor: brandColors.primary, backgroundColor: brandColors.primary },
  circuloHecho: { borderColor: textColors.primary, backgroundColor: textColors.primary },
  numero: { fontFamily: fontFamily.semibold, fontSize: 12, color: textColors.muted },
  numeroActivo: { color: '#FFFFFF' },
  nombre: { fontFamily: fontFamily.medium, fontSize: 11, color: textColors.muted, marginTop: 4 },
  nombreActivo: { color: textColors.primary },
  linea: { flex: 1, height: 2, backgroundColor: surface.border, marginTop: CIRCULO / 2 - 1 },
  lineaHecha: { backgroundColor: textColors.primary },
});