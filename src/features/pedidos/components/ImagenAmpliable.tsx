import React, { useState } from 'react';
import { Image, Modal, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from '@/shared/components/PressableScale';
import { fontSize, fontWeight, radius, surface, textColors } from '@/constants/theme';

interface Props { url: string; alto?: number }

// Miniatura que se amplía a pantalla completa al tocarla.
export const ImagenAmpliable = ({ url, alto = 160 }: Props) => {
  const [ampliada, setAmpliada] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <>
      <PressableScale onPress={() => setAmpliada(true)} scaleTo={0.98} accessibilityLabel="Ampliar imagen">
        <Image source={{ uri: url }} style={[styles.imagen, { height: alto }]} resizeMode="cover" />
        <View style={styles.chip}>
          <Ionicons name="expand-outline" size={14} color={textColors.inverse} />
          <Text style={styles.chipTxt}>Ampliar</Text>
        </View>
      </PressableScale>

      <Modal visible={ampliada} transparent animationType="fade" onRequestClose={() => setAmpliada(false)}>
        <View style={styles.modal}>
          <PressableScale
            onPress={() => setAmpliada(false)}
            style={[styles.cerrar, { top: insets.top + 12 }]}
            accessibilityLabel="Cerrar"
          >
            <Ionicons name="close" size={26} color={textColors.inverse} />
          </PressableScale>
          <Image source={{ uri: url }} style={styles.grande} resizeMode="contain" />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  imagen: { width: '100%', borderRadius: radius.md, backgroundColor: surface.muted },
  chip: {
    position: 'absolute', right: 8, bottom: 8, flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill,
  },
  chipTxt: { color: textColors.inverse, fontSize: fontSize.caption, fontWeight: fontWeight.semibold },
  modal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center' },
  cerrar: {
    position: 'absolute', right: 16, zIndex: 1, width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  grande: { width: '100%', height: '80%' },
});