import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { brandColors } from '@/constants/brand';
import { fontFamily, space, surface, textColors } from '@/constants/theme';
import type { PreferenciasPrivacidad as Prefs } from '../models/ClientProfile';

type IconName = ComponentProps<typeof Ionicons>['name'];
type Clave = keyof Prefs;

interface Props {
  prefs: Prefs;
  cargando: boolean;
  guardando: Clave | null;
  error: string | null;
  onCambiar: (clave: Clave, valor: boolean) => void;
}

const ESCALA = 1.15;

const OPCIONES: { clave: Clave; icono: IconName; titulo: string; descripcion: string }[] = [
  {
    clave: 'recibe_avisos',
    icono: 'notifications-outline',
    titulo: 'Avisos en la app',
    descripcion: 'Recibir avisos cuando haya mensajes o previas nuevas en mis pedidos.',
  },
];

// Derecho ARCO de Oposición: el switch se puede apagar en cualquier momento.
export const PreferenciasPrivacidad = ({ prefs, cargando, guardando, error, onCambiar }: Props) => (
  <View>
    <View style={styles.encabezado}>
      <Text style={styles.titulo} maxFontSizeMultiplier={ESCALA}>Privacidad</Text>
      <Text style={styles.subtitulo} maxFontSizeMultiplier={ESCALA}>
        Puedes oponerte al uso de tus datos cuando quieras.
      </Text>
    </View>

    {OPCIONES.map((op, i) => (
      <View key={op.clave} style={[styles.fila, i < OPCIONES.length - 1 && styles.linea]}>
        <View style={styles.icono}>
          <Ionicons name={op.icono} size={19} color={textColors.primary} />
        </View>
        <View style={styles.textos}>
          <Text style={styles.opcion} maxFontSizeMultiplier={ESCALA}>{op.titulo}</Text>
          <Text style={styles.descripcion} maxFontSizeMultiplier={ESCALA}>{op.descripcion}</Text>
        </View>
        <Switch
          accessibilityLabel={op.titulo}
          value={prefs[op.clave]}
          onValueChange={(v) => onCambiar(op.clave, v)}
          disabled={cargando || guardando !== null}
          trackColor={{ false: surface.border, true: brandColors.primary }}
          thumbColor="#FFFFFF"
        />
      </View>
    ))}

    {error && (
      <Text style={styles.error} accessibilityRole="alert" maxFontSizeMultiplier={ESCALA}>{error}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  encabezado: { paddingTop: space.md, paddingBottom: space.xs, gap: 2 },
  titulo: { fontFamily: fontFamily.semibold, fontSize: 16, color: textColors.primary },
  subtitulo: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.muted },
  fila: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
  linea: { borderBottomWidth: 1, borderBottomColor: surface.muted },
  icono: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: surface.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: { flex: 1, gap: 2 },
  opcion: { fontFamily: fontFamily.medium, fontSize: 15, color: textColors.primary },
  descripcion: { fontFamily: fontFamily.regular, fontSize: 12, color: textColors.muted },
  error: { fontFamily: fontFamily.medium, fontSize: 13, color: brandColors.error, paddingBottom: space.md },
});
