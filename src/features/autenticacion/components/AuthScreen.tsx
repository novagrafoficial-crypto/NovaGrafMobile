import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PressableScale } from '@/shared/components/PressableScale';
import { FadeInView } from '@/shared/components/FadeInView';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';

interface AuthScreenProps {
  title: string;
  subtitle?: string;
  /** Ícono del círculo de arriba */
  icono?: ComponentProps<typeof Ionicons>['name'];
  /** Si no se pasa, la flecha regresa a la pantalla anterior */
  onBack?: () => void;
  /** false = sin flecha (ej. verificar cuenta) */
  conFlecha?: boolean;
  error?: string | null;
  info?: string | null;
  /** Texto pequeño de arriba (ej. "Paso 1 de 2") */
  etiqueta?: string;
  children: React.ReactNode;
  /** Enlace de abajo, fuera del formulario (ej. "¿No tienes cuenta? Regístrate") */
  pie?: React.ReactNode;
  /** @deprecated se mantiene para no romper llamadas viejas */
  headerTitle?: string;
}

const ESCALA = 1.15;

// Plantilla de todas las pantallas de acceso: franja verde con ícono y título,
// y una hoja blanca redondeada con el formulario (estilo apps de delivery / bancos).
export const AuthScreen = ({
  title,
  subtitle,
  icono = 'person-circle-outline',
  onBack,
  conFlecha = true,
  error,
  info,
  etiqueta,
  children,
  pie,
}: AuthScreenProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const regresar = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/' as any)));

  return (
    <KeyboardAvoidingView style={styles.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Franja verde */}
        <View style={[styles.franja, { paddingTop: insets.top + 8 }]}>
          <View style={styles.barra}>
            {conFlecha ? (
              <PressableScale onPress={regresar} style={styles.atras} hitSlop={10} scaleTo={0.85} accessibilityLabel="Regresar">
                <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
              </PressableScale>
            ) : (
              <View style={{ width: 36 }} />
            )}
            <Text style={styles.marca} maxFontSizeMultiplier={1}>NOVA GRAF</Text>
            <View style={{ width: 36 }} />
          </View>

          <FadeInView style={styles.encabezado}>
            <View style={styles.icono}>
              <Ionicons name={icono} size={30} color={brandColors.primary} />
            </View>
            {!!etiqueta && <Text style={styles.etiqueta} maxFontSizeMultiplier={1}>{etiqueta}</Text>}
            <Text style={styles.titulo} maxFontSizeMultiplier={ESCALA}>{title}</Text>
            {!!subtitle && <Text style={styles.subtitulo} maxFontSizeMultiplier={ESCALA}>{subtitle}</Text>}
          </FadeInView>
        </View>

        {/* Hoja blanca con el formulario */}
        <View style={[styles.hoja, { paddingBottom: insets.bottom + space.xl }]}>
          {!!error && (
            <View style={[styles.aviso, styles.avisoError]}>
              <Ionicons name="alert-circle" size={18} color={brandColors.error} />
              <Text style={styles.avisoTexto} maxFontSizeMultiplier={ESCALA}>{error}</Text>
            </View>
          )}
          {!!info && (
            <View style={[styles.aviso, styles.avisoInfo]}>
              <Ionicons name="checkmark-circle" size={18} color="#166534" />
              <Text style={styles.avisoTexto} maxFontSizeMultiplier={ESCALA}>{info}</Text>
            </View>
          )}

          {children}

          {!!pie && <View style={styles.pie}>{pie}</View>}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

/** Enlace de texto: "¿No tienes cuenta? **Regístrate**" */
export const EnlaceAuth = ({ texto, accion, onPress }: { texto: string; accion: string; onPress: () => void }) => (
  <PressableScale onPress={onPress} scaleTo={0.97} hitSlop={8}>
    <Text style={styles.enlace} maxFontSizeMultiplier={ESCALA}>
      {texto} <Text style={styles.enlaceAccion}>{accion}</Text>
    </Text>
  </PressableScale>
);

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: brandColors.primary },
  franja: { backgroundColor: brandColors.primary, paddingHorizontal: space.lg, paddingBottom: 40 },
  barra: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  atras: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  marca: { fontFamily: fontFamily.semibold, fontSize: 13, letterSpacing: 2, color: 'rgba(255,255,255,0.85)' },
  encabezado: { alignItems: 'center', marginTop: space.lg, gap: 4 },
  icono: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  etiqueta: { fontFamily: fontFamily.medium, fontSize: 12, letterSpacing: 1, color: 'rgba(255,255,255,0.75)' },
  titulo: { fontFamily: fontFamily.bold, fontSize: 24, color: '#FFFFFF', textAlign: 'center' },
  subtitulo: { fontFamily: fontFamily.regular, fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center', maxWidth: 320 },
  hoja: {
    flex: 1,
    backgroundColor: surface.screen,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingHorizontal: space.xl,
    paddingTop: space.xl,
  },
  aviso: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, borderRadius: radius.md, marginBottom: space.lg },
  avisoError: { backgroundColor: '#FEE2E2' },
  avisoInfo: { backgroundColor: '#DCFCE7' },
  avisoTexto: { flex: 1, fontFamily: fontFamily.medium, fontSize: 14, color: textColors.primary },
  pie: { alignItems: 'center', marginTop: space.xl },
  enlace: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary, textAlign: 'center' },
  enlaceAccion: { fontFamily: fontFamily.semibold, color: brandColors.primary },
});
