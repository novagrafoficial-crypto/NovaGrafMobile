import React, { useState } from 'react';
import { View, Text, Modal, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';

export interface OpcionCombo {
  id: number;
  titulo: string;
  /** Segunda línea opcional (dirección de la tienda, etc.) */
  detalle?: string | null;
  /** Texto a la derecha (costo, "Gratis") */
  derecha?: string;
}

interface Props {
  etiqueta: string;
  placeholder: string;
  opciones: OpcionCombo[];
  seleccionadaId: number | null;
  onSeleccionar: (id: number) => void;
}

// "Combo" estilo app: un campo que, al tocarlo, abre una hoja desde abajo con las opciones.
export const SelectorCombo = ({ etiqueta, placeholder, opciones, seleccionadaId, onSeleccionar }: Props) => {
  const [abierto, setAbierto] = useState(false);
  const insets = useSafeAreaInsets();
  const actual = opciones.find((o) => o.id === seleccionadaId) ?? null;

  const elegir = (id: number) => {
    onSeleccionar(id);
    setAbierto(false);
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.etiqueta} maxFontSizeMultiplier={1.15}>{etiqueta}</Text>

      {/* Campo cerrado */}
      <PressableScale
        style={[styles.campo, !!actual && styles.campoLleno]}
        onPress={() => setAbierto(true)}
        scaleTo={0.99}
        accessibilityRole="button"
        accessibilityLabel={`${etiqueta}: ${actual?.titulo ?? placeholder}`}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={[styles.campoTexto, !actual && styles.placeholder]}
            numberOfLines={1}
            maxFontSizeMultiplier={1.15}
          >
            {actual?.titulo ?? placeholder}
          </Text>
          {!!actual?.detalle && (
            <Text style={styles.campoDetalle} numberOfLines={2} maxFontSizeMultiplier={1.15}>{actual.detalle}</Text>
          )}
        </View>
        {!!actual?.derecha && <Text style={styles.campoDerecha} maxFontSizeMultiplier={1.15}>{actual.derecha}</Text>}
        <Ionicons name="chevron-down" size={20} color={textColors.primary} />
      </PressableScale>

      {/* Hoja con las opciones */}
      <Modal visible={abierto} transparent animationType="slide" onRequestClose={() => setAbierto(false)}>
        <Pressable style={styles.fondo} onPress={() => setAbierto(false)} accessibilityLabel="Cerrar" />
        <View style={[styles.hoja, { paddingBottom: insets.bottom + space.md }]}>
          <View style={styles.agarradera} />
          <View style={styles.hojaEncabezado}>
            <Text style={styles.hojaTitulo} maxFontSizeMultiplier={1.15}>{etiqueta}</Text>
            <PressableScale onPress={() => setAbierto(false)} hitSlop={10} style={styles.cerrar} accessibilityLabel="Cerrar">
              <Ionicons name="close" size={20} color={textColors.primary} />
            </PressableScale>
          </View>

          <ScrollView style={{ maxHeight: 420 }}>
            {opciones.map((o) => {
              const activa = o.id === seleccionadaId;
              return (
                <PressableScale
                  key={o.id}
                  style={[styles.opcion, activa && styles.opcionActiva]}
                  onPress={() => elegir(o.id)}
                  scaleTo={0.99}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: activa }}
                >
                  <View style={[styles.radio, activa && styles.radioActivo]}>
                    {activa && <View style={styles.radioPunto} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.opcionTitulo} maxFontSizeMultiplier={1.15}>{o.titulo}</Text>
                    {!!o.detalle && <Text style={styles.opcionDetalle} maxFontSizeMultiplier={1.15}>{o.detalle}</Text>}
                  </View>
                  {!!o.derecha && <Text style={styles.opcionDerecha} maxFontSizeMultiplier={1.15}>{o.derecha}</Text>}
                </PressableScale>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { gap: 6 },
  etiqueta: { fontFamily: fontFamily.medium, fontSize: 14, color: textColors.primary },

  campo: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: surface.border,
    backgroundColor: surface.card,
  },
  campoLleno: { borderColor: textColors.primary },
  campoTexto: { fontFamily: fontFamily.medium, fontSize: 15, color: textColors.primary },
  placeholder: { fontFamily: fontFamily.regular, color: textColors.muted },
  campoDetalle: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.secondary, marginTop: 2 },
  campoDerecha: { fontFamily: fontFamily.semibold, fontSize: 14, color: textColors.primary },

  fondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  hoja: {
    backgroundColor: surface.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
  },
  agarradera: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: surface.border, marginBottom: space.sm },
  hojaEncabezado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.sm },
  hojaTitulo: { fontFamily: fontFamily.bold, fontSize: 17, color: textColors.primary },
  cerrar: { width: 34, height: 34, borderRadius: 17, backgroundColor: surface.muted, alignItems: 'center', justifyContent: 'center' },

  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: 14,
    paddingHorizontal: space.sm,
    borderRadius: radius.md,
  },
  opcionActiva: { backgroundColor: surface.muted },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: surface.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActivo: { borderColor: brandColors.primary },
  radioPunto: { width: 10, height: 10, borderRadius: 5, backgroundColor: brandColors.primary },
  opcionTitulo: { fontFamily: fontFamily.medium, fontSize: 15, color: textColors.primary },
  opcionDetalle: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.secondary, marginTop: 2 },
  opcionDerecha: { fontFamily: fontFamily.semibold, fontSize: 14, color: textColors.primary },
});