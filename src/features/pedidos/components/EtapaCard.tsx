import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { brandColors } from '@/constants/brand';
import { fontSize, fontWeight, iconSize, radius, space, surface, textColors } from '@/constants/theme';
import { PressableScale } from '@/shared/components/PressableScale';
import { FadeInView } from '@/shared/components/FadeInView';
import type { Etapa } from '../utils/etapasPedido';

interface Props {
  etapa: Etapa;
  abierta: boolean;
  esUltima: boolean;
  onToggle: () => void;
  /** Contenido que se ve al expandir (comprobantes, diseños, previas...). */
  children?: React.ReactNode;
}

// Una fila de la línea de tiempo: indicador + línea a la izquierda y tarjeta desplegable a la derecha.
export const EtapaCard = ({ etapa, abierta, esUltima, onToggle, children }: Props) => {
  const hecha = etapa.estado === 'completada';
  const actual = etapa.estado === 'actual';
  const pendiente = etapa.estado === 'pendiente';

  return (
    <View style={styles.fila}>
      {/* Columna izquierda: indicador y conector */}
      <View style={styles.riel}>
        <View style={[styles.circulo, hecha && styles.circuloHecho, actual && styles.circuloActual]}>
          {hecha ? (
            <Ionicons name="checkmark" size={iconSize.sm} color={textColors.inverse} />
          ) : (
            <Text style={[styles.numero, actual && { color: textColors.inverse }]}>{etapa.numero}</Text>
          )}
        </View>
        {!esUltima && <View style={[styles.linea, hecha && styles.lineaHecha]} />}
      </View>

      {/* Tarjeta */}
      <View style={[styles.card, actual && styles.cardActual, pendiente && styles.cardPendiente]}>
        <PressableScale
          onPress={onToggle}
          disabled={pendiente}
          scaleTo={0.99}
          style={styles.cabecera}
          accessibilityRole="button"
          accessibilityState={{ expanded: abierta, disabled: pendiente }}
          accessibilityLabel={`${etapa.titulo}. ${etapa.resumen}`}
        >
          <View style={[styles.iconoCaja, actual && styles.iconoCajaActual]}>
            <Ionicons
              name={etapa.icono}
              size={iconSize.md}
              color={pendiente ? textColors.muted : actual ? brandColors.primary : textColors.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.titulo, pendiente && styles.txtPendiente]}>{etapa.titulo}</Text>
            <Text style={[styles.resumen, actual && styles.resumenActual]} numberOfLines={2}>
              {etapa.resumen}
            </Text>
          </View>
          {pendiente ? (
            <Ionicons name="lock-closed-outline" size={iconSize.sm} color={textColors.muted} />
          ) : (
            <Ionicons name={abierta ? 'chevron-up' : 'chevron-down'} size={iconSize.md} color={textColors.muted} />
          )}
        </PressableScale>

        {abierta && !pendiente && (
          <FadeInView distance={8} duration={250} style={styles.cuerpo}>
            {children}
          </FadeInView>
        )}
      </View>
    </View>
  );
};

const CIRCULO = 28;

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', gap: space.md },
  riel: { width: CIRCULO, alignItems: 'center' },
  circulo: {
    width: CIRCULO, height: CIRCULO, borderRadius: CIRCULO / 2,
    backgroundColor: surface.card, borderWidth: 2, borderColor: surface.border,
    alignItems: 'center', justifyContent: 'center', marginTop: 18,
  },
  circuloHecho: { backgroundColor: brandColors.accent, borderColor: brandColors.accent },
  circuloActual: { backgroundColor: brandColors.primary, borderColor: brandColors.primary },
  numero: { fontSize: fontSize.small, fontWeight: fontWeight.bold, color: textColors.muted },
  linea: { flex: 1, width: 2, backgroundColor: surface.border, marginVertical: 2 },
  lineaHecha: { backgroundColor: brandColors.accent },
  card: {
    flex: 1, backgroundColor: surface.card, borderRadius: radius.lg, marginBottom: space.md,
    borderWidth: 1, borderColor: surface.border, overflow: 'hidden',
  },
  cardActual: { borderColor: brandColors.accent, borderWidth: 1.5 },
  cardPendiente: { backgroundColor: surface.muted, borderColor: surface.muted },
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg },
  iconoCaja: {
    width: 38, height: 38, borderRadius: radius.sm, backgroundColor: surface.muted,
    alignItems: 'center', justifyContent: 'center',
  },
  iconoCajaActual: { backgroundColor: '#E6F2EF' },
  titulo: { fontSize: fontSize.bodyLg, fontWeight: fontWeight.semibold, color: textColors.primary },
  txtPendiente: { color: textColors.muted },
  resumen: { fontSize: fontSize.small, color: textColors.muted, marginTop: 2 },
  resumenActual: { color: brandColors.primary, fontWeight: fontWeight.medium },
  cuerpo: {
    paddingHorizontal: space.lg, paddingBottom: space.lg, paddingTop: space.md, gap: space.md,
    borderTopWidth: 1, borderTopColor: surface.border,
  },
});