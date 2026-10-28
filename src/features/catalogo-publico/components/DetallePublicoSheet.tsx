import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from '@/shared/components/PressableScale';
import { CustomButton } from '@/shared/components/CustomButton';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import { money } from '@/shared/utils/format';
import type { DetallePublico } from '../models/ProductoPublico';

interface Props {
  detalle: DetallePublico | null;
  onCerrar: () => void;
  onEntrar: () => void;
  onRegistrarse: () => void;
}

const ESCALA = 1.15;

// Hoja que sube desde abajo con el detalle. Para personalizar o pedir hay que iniciar sesión
// (igual que Mercado Libre o Shein: puedes ver todo, pero comprar requiere cuenta).
export const DetallePublicoSheet = ({ detalle, onCerrar, onEntrar, onRegistrarse }: Props) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={!!detalle} transparent animationType="slide" onRequestClose={onCerrar}>
      <Pressable style={styles.fondo} onPress={onCerrar}>
        <Pressable style={[styles.hoja, { paddingBottom: insets.bottom + space.lg }]} onPress={() => {}}>
          {detalle && (
            <>
              <View style={styles.imagenBox}>
                {detalle.imagenUrl ? (
                  <Image source={{ uri: detalle.imagenUrl }} style={styles.imagen} contentFit="cover" cachePolicy="memory-disk" />
                ) : (
                  <Ionicons name="image-outline" size={40} color={textColors.muted} />
                )}
                <PressableScale style={styles.cerrar} onPress={onCerrar} hitSlop={8} accessibilityLabel="Cerrar">
                  <Ionicons name="close" size={20} color="#FFFFFF" />
                </PressableScale>
              </View>

              <ScrollView style={{ maxHeight: 220 }} contentContainerStyle={styles.cuerpo} showsVerticalScrollIndicator={false}>
                {!!detalle.categoria && (
                  <Text style={styles.categoria} maxFontSizeMultiplier={ESCALA}>{detalle.categoria}</Text>
                )}
                <Text style={styles.titulo} maxFontSizeMultiplier={ESCALA}>{detalle.titulo}</Text>
                {detalle.precio != null && (
                  <Text style={styles.desde} maxFontSizeMultiplier={ESCALA}>
                    Desde <Text style={styles.precio}>{money(detalle.precio)}</Text>
                  </Text>
                )}
                {detalle.colores.length > 0 && (
                  <View style={styles.colores}>
                    {detalle.colores.slice(0, 8).map((c) => (
                      <View key={c} style={styles.color}>
                        <Text style={styles.colorTexto} maxFontSizeMultiplier={ESCALA}>{c}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {!!detalle.descripcion && (
                  <Text style={styles.descripcion} maxFontSizeMultiplier={ESCALA}>{detalle.descripcion}</Text>
                )}
              </ScrollView>

              <View style={styles.aviso}>
                <Ionicons name="lock-closed-outline" size={16} color={brandColors.primary} />
                <Text style={styles.avisoTexto} maxFontSizeMultiplier={ESCALA}>Inicia sesión para personalizarlo y hacer tu pedido.</Text>
              </View>
              <View style={styles.botones}>
                <CustomButton title="Crear cuenta" variant="outline" onPress={onRegistrarse} style={{ flex: 1 }} />
                <CustomButton title="Iniciar sesión" onPress={onEntrar} style={{ flex: 1 }} />
              </View>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  hoja: { backgroundColor: surface.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  imagenBox: { height: 260, backgroundColor: surface.muted, alignItems: 'center', justifyContent: 'center' },
  imagen: { width: '100%', height: '100%' },
  cerrar: {
    position: 'absolute',
    top: space.md,
    right: space.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cuerpo: { padding: space.lg, gap: 6 },
  categoria: { fontFamily: fontFamily.medium, fontSize: 12, color: textColors.muted, textTransform: 'uppercase', letterSpacing: 0.6 },
  titulo: { fontFamily: fontFamily.bold, fontSize: 20, color: textColors.primary },
  desde: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary },
  precio: { fontFamily: fontFamily.bold, fontSize: 20, color: textColors.primary },
  colores: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  color: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: surface.muted },
  colorTexto: { fontFamily: fontFamily.medium, fontSize: 12, color: textColors.primary },
  descripcion: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 21, color: textColors.secondary, marginTop: 4 },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginHorizontal: space.lg,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: '#E6F2EF',
  },
  avisoTexto: { flex: 1, fontFamily: fontFamily.medium, fontSize: 13, color: textColors.primary },
  botones: { flexDirection: 'row', gap: space.sm, paddingHorizontal: space.lg, paddingTop: space.md },
});
