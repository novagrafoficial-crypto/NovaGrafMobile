import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space } from '@/constants/theme';
import { useMenuPublico } from '../providers/MenuPublicoProvider';

interface Props {
  titulo: string;
  /** Texto pequeño debajo del título (solo en el inicio) */
  subtitulo?: string;
  /** Muestra el botón "Entrar" a la derecha */
  conEntrar?: boolean;
}

const ESCALA = 1.15;

// Encabezado verde de la parte pública: botón de menú (☰) a la izquierda.
export const PublicHeader = ({ titulo, subtitulo, conEntrar = true }: Props) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { abrir } = useMenuPublico();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <PressableScale onPress={abrir} style={styles.menu} hitSlop={8} scaleTo={0.88} accessibilityLabel="Abrir menú">
        <Ionicons name="menu" size={24} color="#FFFFFF" />
      </PressableScale>

      <View style={{ flex: 1 }}>
        <Text style={styles.titulo} numberOfLines={1} maxFontSizeMultiplier={ESCALA}>{titulo}</Text>
        {!!subtitulo && <Text style={styles.subtitulo} numberOfLines={1} maxFontSizeMultiplier={ESCALA}>{subtitulo}</Text>}
      </View>

      {conEntrar && (
        <PressableScale style={styles.entrar} onPress={() => router.push('/(auth)/login' as any)} scaleTo={0.93} accessibilityLabel="Iniciar sesión">
          <Ionicons name="person-circle-outline" size={18} color={brandColors.primary} />
          <Text style={styles.entrarTexto} maxFontSizeMultiplier={ESCALA}>Entrar</Text>
        </PressableScale>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: brandColors.primary,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  menu: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: { fontFamily: fontFamily.bold, fontSize: 20, color: '#FFFFFF' },
  subtitulo: { fontFamily: fontFamily.regular, fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  entrar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
  },
  entrarTexto: { fontFamily: fontFamily.semibold, fontSize: 14, color: brandColors.primary },
});
