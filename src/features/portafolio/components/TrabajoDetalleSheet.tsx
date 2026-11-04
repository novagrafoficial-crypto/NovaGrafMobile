import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from '@/shared/components/PressableScale';
import { CustomButton } from '@/shared/components/CustomButton';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import { splitDescripcion } from '../utils/splitDescripcion';
import { tituloTrabajo } from './TrabajoCard';
import type { PortfolioItem } from '../models/PortfolioItem';

interface Props {
  trabajo: PortfolioItem | null;
  onCerrar: () => void;
  onEntrar: () => void;
  onRegistrarse: () => void;
}

const ESCALA = 1.15;

// Detalle de un trabajo realizado (sin precio). Para pedir uno así hay que tener cuenta.
export const TrabajoDetalleSheet = ({ trabajo, onCerrar, onEntrar, onRegistrarse }: Props) => {
  const insets = useSafeAreaInsets();
  const partes = splitDescripcion(trabajo?.descripcion);
  const descripcion = (trabajo?.productoNombre ? trabajo?.descripcion : partes.detalle) || 'Hecho a la medida en nuestro taller.';

  return (
    <Modal visible={!!trabajo} transparent animationType="slide" onRequestClose={onCerrar}>
      <Pressable style={styles.fondo} onPress={onCerrar}>
        <Pressable style={[styles.hoja, { paddingBottom: insets.bottom + space.lg }]} onPress={() => {}}>
          {trabajo && (
            <>
              <View style={styles.imagenBox}>
                {trabajo.imagenUrl ? (
                  <Image source={{ uri: trabajo.imagenUrl }} style={styles.imagen} contentFit="cover" cachePolicy="memory-disk" />
                ) : (
                  <Ionicons name="image-outline" size={40} color={textColors.muted} />
                )}
                <PressableScale style={styles.cerrar} onPress={onCerrar} hitSlop={8} accessibilityLabel="Cerrar">
                  <Ionicons name="close" size={20} color="#FFFFFF" />
                </PressableScale>
              </View>

              <ScrollView style={{ maxHeight: 200 }} contentContainerStyle={styles.cuerpo} showsVerticalScrollIndicator={false}>
                {!!trabajo.categoriaNombre && <Text style={styles.categoria} maxFontSizeMultiplier={ESCALA}>{trabajo.categoriaNombre}</Text>}
                <Text style={styles.titulo} maxFontSizeMultiplier={ESCALA}>{tituloTrabajo(trabajo)}</Text>
                <Text style={styles.descripcion} maxFontSizeMultiplier={ESCALA}>{descripcion}</Text>
              </ScrollView>

              <View style={styles.aviso}>
                <Ionicons name="sparkles-outline" size={16} color={brandColors.primary} />
                <Text style={styles.avisoTexto} maxFontSizeMultiplier={ESCALA}>¿Quieres uno así? Crea tu cuenta y pídelo con tu diseño.</Text>
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
  imagenBox: { height: 280, backgroundColor: surface.muted, alignItems: 'center', justifyContent: 'center' },
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
  descripcion: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 21, color: textColors.secondary },
  aviso: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginHorizontal: space.lg, padding: space.md, borderRadius: radius.md, backgroundColor: '#E6F2EF' },
  avisoTexto: { flex: 1, fontFamily: fontFamily.medium, fontSize: 13, color: textColors.primary },
  botones: { flexDirection: 'row', gap: space.sm, paddingHorizontal: space.lg, paddingTop: space.md },
});
