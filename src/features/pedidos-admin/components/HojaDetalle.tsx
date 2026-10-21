import React, { useEffect, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brandColors, brandTints } from '@/constants/brand';
import { CustomButton } from '@/shared/components/CustomButton';
import { PressableScale } from '@/shared/components/PressableScale';
import { resolveImageUrl } from '@/shared/utils/resolveImageUrl';
import { esPdf } from '../utils/pedidoAdminUtils';

interface Props {
  visible: boolean;
  titulo: string;
  /** Imagen o PDF principal (diseño, comprobante, previa o foto del producto). */
  archivoUrl?: string | null;
  onCerrar: () => void;
  /** Abre el archivo fuera de la app (navegador / visor de PDF). */
  onAbrirArchivo: (url: string) => void;
  children?: React.ReactNode;
}

// Hoja que sube desde abajo: muestra el archivo en grande y, debajo, sus datos.
export const HojaDetalle = ({ visible, titulo, archivoUrl, onCerrar, onAbrirArchivo, children }: Props) => {
  const insets = useSafeAreaInsets();
  const [fallo, setFallo] = useState(false);
  const url = resolveImageUrl(archivoUrl);
  const pdf = !!url && esPdf(url);

  // Cada vez que cambia el archivo se vuelve a intentar cargar la imagen.
  useEffect(() => setFallo(false), [url, visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCerrar}>
      <Pressable style={styles.fondo} onPress={onCerrar}>
        {/* Pressable interno: tocar la hoja no la cierra */}
        <Pressable style={[styles.hoja, { paddingBottom: insets.bottom + 16 }]} onPress={() => {}}>
          <View style={styles.cabecera}>
            <Text style={styles.titulo} numberOfLines={2}>
              {titulo}
            </Text>
            <PressableScale onPress={onCerrar} hitSlop={12} accessibilityLabel="Cerrar">
              <Text style={styles.cerrar}>✕</Text>
            </PressableScale>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.cuerpo}>
            {!!url &&
              (pdf ? (
                <CustomButton title="📄 Abrir PDF" onPress={() => onAbrirArchivo(url)} />
              ) : fallo ? (
                <View style={styles.imgFallo}>
                  <Text style={styles.imgFalloTxt}>No se pudo cargar la imagen.</Text>
                  <CustomButton title="Intentar abrirla afuera" variant="outline" onPress={() => onAbrirArchivo(url)} />
                </View>
              ) : (
                <>
                  <Image
                    source={{ uri: url }}
                    style={styles.imagen}
                    resizeMode="contain"
                    onError={() => setFallo(true)}
                  />
                  <PressableScale onPress={() => onAbrirArchivo(url)} scaleTo={0.95} hitSlop={8}>
                    <Text style={styles.enlace}>Abrir en tamaño completo →</Text>
                  </PressableScale>
                </>
              ))}

            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: brandTints.overlay, justifyContent: 'flex-end' },
  hoja: {
    backgroundColor: brandColors.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 16,
    maxHeight: '88%',
  },
  cabecera: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 },
  titulo: { flex: 1, fontSize: 17, fontWeight: '800', color: brandColors.primaryDark },
  cerrar: { fontSize: 20, fontWeight: '800', color: brandTints.textMuted },
  cuerpo: { gap: 12, paddingBottom: 8 },
  imagen: { width: '100%', height: 300, borderRadius: 12, backgroundColor: brandTints.surfaceMuted },
  enlace: { color: brandColors.primary, fontWeight: '700', fontSize: 13, textAlign: 'center' },
  imgFallo: { gap: 10, padding: 14, borderRadius: 12, backgroundColor: brandTints.surfaceMuted },
  imgFalloTxt: { textAlign: 'center', color: brandTints.textMuted, fontSize: 13 },
});
