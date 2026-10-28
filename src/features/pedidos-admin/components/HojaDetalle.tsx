import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
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

const ESCALA = 1.15;

// Hoja que sube desde abajo: muestra el archivo en grande y, debajo, sus datos.
export const HojaDetalle = ({ visible, titulo, archivoUrl, onCerrar, onAbrirArchivo, children }: Props) => {
  const insets = useSafeAreaInsets();
  const [fallo, setFallo] = useState(false);
  const url = resolveImageUrl(archivoUrl);
  const pdf = !!url && esPdf(url);

  // Cada vez que cambia el archivo se vuelve a intentar cargar la imagen.
  useEffect(() => setFallo(false), [url, visible]);

  const BotonAbrir = ({ texto, icono }: { texto: string; icono: React.ComponentProps<typeof Ionicons>['name'] }) => (
    <PressableScale style={styles.abrir} onPress={() => url && onAbrirArchivo(url)} scaleTo={0.97}>
      <Ionicons name={icono} size={18} color={textColors.primary} />
      <Text style={styles.abrirTexto} maxFontSizeMultiplier={ESCALA}>{texto}</Text>
    </PressableScale>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCerrar}>
      <Pressable style={styles.fondo} onPress={onCerrar}>
        {/* Pressable interno: tocar la hoja no la cierra */}
        <Pressable style={[styles.hoja, { paddingBottom: insets.bottom + space.lg }]} onPress={() => {}}>
          <View style={styles.agarradera} />
          <View style={styles.cabecera}>
            <Text style={styles.titulo} numberOfLines={2} maxFontSizeMultiplier={ESCALA}>{titulo}</Text>
            <PressableScale style={styles.cerrar} onPress={onCerrar} hitSlop={10} accessibilityLabel="Cerrar">
              <Ionicons name="close" size={20} color={textColors.primary} />
            </PressableScale>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.cuerpo}>
            {!!url &&
              (pdf ? (
                <BotonAbrir texto="Abrir PDF" icono="document-outline" />
              ) : fallo ? (
                <View style={styles.fallo}>
                  <Ionicons name="image-outline" size={28} color={textColors.muted} />
                  <Text style={styles.falloTexto} maxFontSizeMultiplier={ESCALA}>No se pudo cargar la imagen.</Text>
                  <BotonAbrir texto="Abrir fuera de la app" icono="open-outline" />
                </View>
              ) : (
                <>
                  <Image
                    source={{ uri: url }}
                    style={styles.imagen}
                    contentFit="contain"
                    cachePolicy="memory-disk"
                    onError={() => setFallo(true)}
                  />
                  <BotonAbrir texto="Ver en tamaño completo" icono="expand-outline" />
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
  fondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  hoja: {
    backgroundColor: surface.card,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    maxHeight: '88%',
  },
  agarradera: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: surface.border, marginBottom: space.md },
  cabecera: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md, marginBottom: space.md },
  titulo: { flex: 1, fontFamily: fontFamily.bold, fontSize: 18, color: textColors.primary },
  cerrar: { width: 34, height: 34, borderRadius: 17, backgroundColor: surface.muted, alignItems: 'center', justifyContent: 'center' },
  cuerpo: { gap: space.md, paddingBottom: space.sm },
  imagen: { width: '100%', height: 300, borderRadius: radius.md, backgroundColor: surface.muted },
  abrir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: surface.border,
  },
  abrirTexto: { fontFamily: fontFamily.semibold, fontSize: 14, color: textColors.primary },
  fallo: { alignItems: 'center', gap: space.sm, padding: space.lg, borderRadius: radius.md, backgroundColor: surface.muted },
  falloTexto: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary },
});
