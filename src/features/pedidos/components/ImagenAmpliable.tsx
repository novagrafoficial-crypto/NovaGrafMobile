import React, { useState } from 'react';
import { Image, Modal, Text, StyleSheet } from 'react-native';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors, brandTints } from '@/constants/brand';

interface Props { url: string; alto?: number }

// Miniatura que se amplía a pantalla completa al tocarla.
export const ImagenAmpliable = ({ url, alto = 150 }: Props) => {
  const [ampliada, setAmpliada] = useState(false);
  return (
    <>
      <PressableScale onPress={() => setAmpliada(true)} scaleTo={0.98}>
        <Image source={{ uri: url }} style={[styles.imagen, { height: alto }]} resizeMode="cover" />
        <Text style={styles.toca}>Toca para ampliar</Text>
      </PressableScale>
      <Modal visible={ampliada} transparent animationType="fade" onRequestClose={() => setAmpliada(false)}>
        <PressableScale scaleTo={1} onPress={() => setAmpliada(false)} style={styles.modal}>
          <Image source={{ uri: url }} style={styles.grande} resizeMode="contain" />
          <Text style={styles.cerrar}>Toca para cerrar</Text>
        </PressableScale>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  imagen: { width: '100%', borderRadius: 10, backgroundColor: brandTints.surfaceMuted },
  toca: { fontSize: 11, color: brandTints.textMuted, textAlign: 'center', marginTop: 4 },
  modal: { flex: 1, backgroundColor: brandTints.overlay, alignItems: 'center', justifyContent: 'center', padding: 16 },
  grande: { width: '100%', height: '80%' },
  cerrar: { color: brandColors.white, fontSize: 12, marginTop: 10 },
});
