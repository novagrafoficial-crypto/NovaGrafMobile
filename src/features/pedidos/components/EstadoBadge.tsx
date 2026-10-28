import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fontSize, fontWeight, radius } from '@/constants/theme';
import type { IconoNombre } from '../utils/etapasPedido';

type Tono = 'accion' | 'proceso' | 'listo' | 'error';

// Mismos textos que la web (DetallePedido.jsx), con ícono y un color por tono.
const ESTADOS: Record<string, { texto: string; icono: IconoNombre; tono: Tono }> = {
  PENDIENTE_VERIFICACION: { texto: 'Anticipo pendiente', icono: 'time-outline', tono: 'accion' },
  EN_DISENO: { texto: 'En diseño', icono: 'color-palette-outline', tono: 'proceso' },
  EN_REVISION: { texto: 'En revisión', icono: 'search-outline', tono: 'proceso' },
  PREVIAS_ENVIADAS: { texto: 'Previa lista', icono: 'eye-outline', tono: 'accion' },
  EN_PRODUCCION: { texto: 'En producción', icono: 'construct-outline', tono: 'proceso' },
  PENDIENTE_PAGO_FINAL: { texto: 'Pago final pendiente', icono: 'cash-outline', tono: 'accion' },
  VERIFICANDO_PAGO_FINAL: { texto: 'Verificando pago', icono: 'search-outline', tono: 'proceso' },
  ENVIADO: { texto: 'Enviado', icono: 'checkmark-circle-outline', tono: 'listo' },
  CANCELADO: { texto: 'Cancelado', icono: 'close-circle-outline', tono: 'error' },
};

const COLORES: Record<Tono, { bg: string; fg: string }> = {
  accion: { bg: '#FEF3C7', fg: '#92400E' },  // ámbar: el cliente debe hacer algo
  proceso: { bg: '#E6F2EF', fg: '#0F4F51' }, // teal de marca: en proceso
  listo: { bg: '#DCFCE7', fg: '#166534' },   // verde: terminado
  error: { bg: '#FEE2E2', fg: '#991B1B' },   // rojo: cancelado
};

export const EstadoBadge = ({ estado }: { estado: string }) => {
  const info = ESTADOS[estado] ?? {
    texto: estado.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()),
    icono: 'ellipse-outline' as IconoNombre,
    tono: 'proceso' as Tono,
  };
  const c = COLORES[info.tono];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Ionicons name={info.icono} size={14} color={c.fg} />
      <Text style={[styles.texto, { color: c.fg }]}>{info.texto}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill,
  },
  texto: { fontSize: fontSize.caption, fontWeight: fontWeight.semibold },
});