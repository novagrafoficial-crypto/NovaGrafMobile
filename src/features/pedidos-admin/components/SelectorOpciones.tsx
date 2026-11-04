import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { brandColors, brandTints } from '@/constants/brand';
import { PressableScale } from '@/shared/components/PressableScale';

export interface OpcionSelector {
  valor: string;
  etiqueta: string;
  /** Texto pequeño a la derecha (ej. la cantidad de pedidos). */
  detalle?: string;
}

interface Props {
  /** Título pequeño sobre el combo (ej. "Estado"). */
  titulo: string;
  opciones: OpcionSelector[];
  valor: string;
  onChange: (valor: string) => void;
}

// Combo desplegable: un botón que muestra la opción elegida y abre una lista para cambiarla.
export const SelectorOpciones = ({ titulo, opciones, valor, onChange }: Props) => {
  const [abierto, setAbierto] = useState(false);
  const actual = opciones.find((o) => o.valor === valor);

  const elegir = (v: string) => {
    setAbierto(false);
    onChange(v);
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>{titulo}</Text>
      <PressableScale
        style={styles.boton}
        onPress={() => setAbierto(true)}
        accessibilityRole="button"
        accessibilityLabel={`${titulo}: ${actual?.etiqueta ?? ''}`}
      >
        <Text style={styles.botonTxt} numberOfLines={1}>
          {actual?.etiqueta ?? '—'}
        </Text>
        <Text style={styles.flecha}>▾</Text>
      </PressableScale>

      <Modal visible={abierto} transparent animationType="fade" onRequestClose={() => setAbierto(false)}>
        <Pressable style={styles.fondo} onPress={() => setAbierto(false)}>
          {/* Pressable interno: tocar la lista no cierra el modal */}
          <Pressable style={styles.hoja} onPress={() => {}}>
            <Text style={styles.hojaTitulo}>{titulo}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {opciones.map((o) => {
                const activa = o.valor === valor;
                return (
                  <PressableScale
                    key={o.valor}
                    style={[styles.opcion, activa && styles.opcionActiva]}
                    onPress={() => elegir(o.valor)}
                    scaleTo={0.98}
                  >
                    <Text style={[styles.opcionTxt, activa && styles.opcionTxtActiva]}>
                      {activa ? '✓ ' : ''}
                      {o.etiqueta}
                    </Text>
                    {!!o.detalle && <Text style={styles.opcionDetalle}>{o.detalle}</Text>}
                  </PressableScale>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  titulo: { fontSize: 11, fontWeight: '700', color: brandTints.textMuted, marginBottom: 4, marginLeft: 4 },
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    backgroundColor: brandColors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: brandTints.border,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  botonTxt: { flex: 1, fontSize: 13, fontWeight: '700', color: brandColors.primaryDark },
  flecha: { fontSize: 12, color: brandColors.primary },

  fondo: { flex: 1, backgroundColor: brandTints.overlay, justifyContent: 'center', padding: 24 },
  hoja: {
    backgroundColor: brandColors.white,
    borderRadius: 18,
    padding: 16,
    maxHeight: '75%',
  },
  hojaTitulo: { fontSize: 16, fontWeight: '800', color: brandColors.primaryDark, marginBottom: 8 },
  opcion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  opcionActiva: { backgroundColor: brandTints.accentSoft },
  opcionTxt: { fontSize: 14, color: brandColors.primaryDark },
  opcionTxtActiva: { fontWeight: '800', color: brandColors.primary },
  opcionDetalle: { fontSize: 12, fontWeight: '700', color: brandTints.textMuted },
});
