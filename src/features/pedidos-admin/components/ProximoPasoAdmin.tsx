import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, textColors } from '@/constants/theme';
import type { ProximoPaso } from '../viewmodels/usePedidoAdminDetalleViewModel';

const TONOS = {
  accion: { fondo: '#FFFBEB', borde: '#FCD34D', icono: '#B45309', etiqueta: 'TE TOCA' },
  espera: { fondo: '#F0F9FF', borde: '#BAE6FD', icono: '#075985', etiqueta: 'ESPERANDO AL CLIENTE' },
  listo: { fondo: '#F0FDF4', borde: '#BBF7D0', icono: '#166534', etiqueta: 'COMPLETADO' },
  cancelado: { fondo: '#F4F4F5', borde: '#E4E4E7', icono: '#52525B', etiqueta: 'CANCELADO' },
};

interface Props {
  paso: ProximoPaso;
  /** Baja a la sección (pagos o previas) cuando el paso tiene destino */
  onIrA: (destino: 'pagos' | 'previas') => void;
  deshabilitado: boolean;
}

const ESCALA = 1.15;

// Tarjeta de arriba del detalle: dice qué sigue con el pedido y quién lo tiene que hacer.
export const ProximoPasoAdmin = ({ paso, onIrA, deshabilitado }: Props) => {
  const t = TONOS[paso.tono];
  const accion = paso.boton
    ? { texto: paso.boton.texto, icono: paso.boton.icono, onPress: paso.boton.onPress }
    : paso.destino
      ? { texto: paso.destino === 'pagos' ? 'Ir al comprobante' : 'Ir a previas', icono: 'arrow-down' as const, onPress: () => onIrA(paso.destino!) }
      : null;

  return (
    <View style={[styles.card, { backgroundColor: t.fondo, borderColor: t.borde }]}>
      <View style={styles.fila}>
        <View style={styles.icono}>
          <Ionicons name={paso.icono} size={22} color={t.icono} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[styles.etiqueta, { color: t.icono }]} maxFontSizeMultiplier={1}>{t.etiqueta}</Text>
          <Text style={styles.titulo} maxFontSizeMultiplier={ESCALA}>{paso.titulo}</Text>
          <Text style={styles.texto} maxFontSizeMultiplier={ESCALA}>{paso.texto}</Text>
        </View>
      </View>

      {!!accion && (
        <PressableScale
          style={[styles.boton, deshabilitado && { opacity: 0.6 }]}
          onPress={accion.onPress}
          disabled={deshabilitado}
          scaleTo={0.97}
        >
          <Ionicons name={accion.icono} size={18} color="#FFFFFF" />
          <Text style={styles.botonTexto} maxFontSizeMultiplier={ESCALA}>{accion.texto}</Text>
        </PressableScale>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: 1, padding: space.lg, gap: space.md },
  fila: { flexDirection: 'row', gap: space.md },
  icono: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  etiqueta: { fontFamily: fontFamily.semibold, fontSize: 11, letterSpacing: 0.8 },
  titulo: { fontFamily: fontFamily.bold, fontSize: 17, color: textColors.primary },
  texto: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary },
  boton: {
    height: 46,
    borderRadius: radius.md,
    backgroundColor: brandColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  botonTexto: { fontFamily: fontFamily.semibold, fontSize: 15, color: '#FFFFFF' },
});
