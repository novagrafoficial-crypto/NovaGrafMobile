import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from '@/shared/components/PressableScale';
import { CustomButton } from '@/shared/components/CustomButton';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import { useMenuPublico } from '../providers/MenuPublicoProvider';

type Icono = ComponentProps<typeof Ionicons>['name'];
interface Opcion { titulo: string; icono: Icono; ruta: string; activaEn: string }

const ANCHO = Math.min(Dimensions.get('window').width * 0.8, 320);
const ESCALA = 1.15;

const PRINCIPAL: Opcion[] = [
  { titulo: 'Inicio', icono: 'home-outline', ruta: '/', activaEn: '/' },
  { titulo: 'Trabajos realizados', icono: 'images-outline', ruta: '/(public)/trabajos', activaEn: '/trabajos' },
  { titulo: 'Nosotros', icono: 'business-outline', ruta: '/(public)/nosotros', activaEn: '/nosotros' },
  { titulo: 'Contacto', icono: 'call-outline', ruta: '/(public)/contacto', activaEn: '/contacto' },
  { titulo: 'Mi cuenta', icono: 'person-circle-outline', ruta: '/(public)/cuenta', activaEn: '/cuenta' },
];

const LEGAL: Opcion[] = [
  { titulo: 'Políticas y privacidad', icono: 'document-text-outline', ruta: '/politicas', activaEn: '/politicas' },
  { titulo: 'Eliminar mi cuenta', icono: 'trash-outline', ruta: '/eliminar-cuenta', activaEn: '/eliminar-cuenta' },
];

// Menú que sale de la izquierda (desplegable). Vive en el layout público, una sola vez.
export const MenuLateral = () => {
  const { abierto, cerrar } = useMenuPublico();
  const router = useRouter();
  const ruta = usePathname();
  const insets = useSafeAreaInsets();
  // 0 = cerrado, 1 = abierto: un solo valor mueve el panel y oscurece el fondo
  const progreso = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progreso, { toValue: abierto ? 1 : 0, duration: 220, useNativeDriver: true }).start();
  }, [abierto, progreso]);

  const ir = (destino: string) => {
    cerrar();
    // navigate: si la pantalla ya está abierta regresa a ella en vez de apilar otra igual
    router.navigate(destino as any);
  };

  const Fila = ({ o }: { o: Opcion }) => {
    const activa = ruta === o.activaEn;
    return (
      <PressableScale style={[styles.fila, activa && styles.filaActiva]} onPress={() => ir(o.ruta)} scaleTo={0.97}>
        <Ionicons name={o.icono} size={21} color={activa ? brandColors.primary : textColors.secondary} />
        <Text style={[styles.filaTexto, activa && styles.filaTextoActiva]} maxFontSizeMultiplier={ESCALA}>{o.titulo}</Text>
      </PressableScale>
    );
  };

  return (
    <>
      <Animated.View pointerEvents={abierto ? 'auto' : 'none'} style={[StyleSheet.absoluteFill, styles.fondo, { opacity: progreso }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={cerrar} accessibilityLabel="Cerrar menú" />
      </Animated.View>

      <Animated.View
        style={[
          styles.panel,
          { width: ANCHO, transform: [{ translateX: progreso.interpolate({ inputRange: [0, 1], outputRange: [-ANCHO, 0] }) }] },
        ]}
      >
        {/* Cabecera verde con la marca */}
        <View style={[styles.cabecera, { paddingTop: insets.top + space.lg }]}>
          <View style={styles.logo}>
            <Ionicons name="color-palette" size={24} color={brandColors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.marca} maxFontSizeMultiplier={ESCALA}>Nova Graf</Text>
            <Text style={styles.lema} maxFontSizeMultiplier={ESCALA}>Personalización a tu medida</Text>
          </View>
          <PressableScale onPress={cerrar} hitSlop={10} style={styles.cerrar} accessibilityLabel="Cerrar menú">
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </PressableScale>
        </View>

        <ScrollView contentContainerStyle={styles.cuerpo} showsVerticalScrollIndicator={false}>
          {PRINCIPAL.map((o) => <Fila key={o.ruta} o={o} />)}

          <Text style={styles.seccion} maxFontSizeMultiplier={1}>LEGAL</Text>
          {LEGAL.map((o) => <Fila key={o.ruta} o={o} />)}
        </ScrollView>

        <View style={[styles.pie, { paddingBottom: insets.bottom + space.lg }]}>
          <CustomButton title="Iniciar sesión" onPress={() => ir('/(auth)/login')} />
          <CustomButton title="Crear cuenta" variant="outline" onPress={() => ir('/(auth)/register')} />
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  fondo: { backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 20 },
  panel: { position: 'absolute', top: 0, bottom: 0, left: 0, backgroundColor: surface.card, zIndex: 30 },
  cabecera: {
    backgroundColor: brandColors.primary,
    paddingHorizontal: space.lg,
    paddingBottom: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  logo: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  marca: { fontFamily: fontFamily.bold, fontSize: 18, color: '#FFFFFF' },
  lema: { fontFamily: fontFamily.regular, fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  cerrar: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  cuerpo: { padding: space.md, gap: 2 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: space.md, height: 48, paddingHorizontal: space.md, borderRadius: radius.md },
  filaActiva: { backgroundColor: '#E6F2EF' },
  filaTexto: { fontFamily: fontFamily.medium, fontSize: 15, color: textColors.primary },
  filaTextoActiva: { fontFamily: fontFamily.semibold, color: brandColors.primary },
  seccion: { fontFamily: fontFamily.semibold, fontSize: 11, letterSpacing: 1, color: textColors.muted, marginTop: space.lg, marginBottom: 4, paddingHorizontal: space.md },
  pie: { gap: space.sm, paddingHorizontal: space.lg, paddingTop: space.md, borderTopWidth: 1, borderTopColor: surface.border },
});
