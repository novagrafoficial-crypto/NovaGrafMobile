import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import { useNotificacionesAdmin } from '@/features/notificaciones-admin';
import { ModalConfirmacionLogout } from '@/shared/components/ModalConfirmacionLogout';
import { PressableScale } from '@/shared/components/PressableScale';
import { useAuth } from '@/shared/hooks/useAuth';
import { getInitials } from '@/shared/utils/getInitials';
import { useMenuAdmin } from '../providers/MenuAdminProvider';

type Icono = ComponentProps<typeof Ionicons>['name'];
interface Opcion { titulo: string; icono: Icono; iconoActivo: Icono; ruta: string; activaEn: string; contador?: number }

const ANCHO = Math.min(Dimensions.get('window').width * 0.8, 320);
const ESCALA = 1.15;

// Menú lateral del administrador (como el panel de la web): reemplaza las pestañas de abajo.
export const MenuAdmin = () => {
  const { abierto, cerrar } = useMenuAdmin();
  const { user, deleteSession } = useAuth();
  const { noLeidas } = useNotificacionesAdmin();
  const router = useRouter();
  const ruta = usePathname();
  const insets = useSafeAreaInsets();
  const [salirVisible, setSalirVisible] = useState(false);
  // 0 = cerrado, 1 = abierto: un solo valor mueve el panel y oscurece el fondo
  const progreso = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progreso, { toValue: abierto ? 1 : 0, duration: 220, useNativeDriver: true }).start();
  }, [abierto, progreso]);

  const GESTION: Opcion[] = [
    { titulo: 'Inicio', icono: 'grid-outline', iconoActivo: 'grid', ruta: '/(admin)/dashboard', activaEn: '/dashboard' },
    { titulo: 'Pedidos', icono: 'receipt-outline', iconoActivo: 'receipt', ruta: '/(admin)/pedidos', activaEn: '/pedidos' },
    { titulo: 'Clientes', icono: 'people-outline', iconoActivo: 'people', ruta: '/(admin)/usuarios', activaEn: '/usuarios' },
    { titulo: 'Avisos', icono: 'notifications-outline', iconoActivo: 'notifications', ruta: '/(admin)/notificaciones', activaEn: '/notificaciones', contador: noLeidas },
  ];
  const CUENTA: Opcion[] = [
    { titulo: 'Mi perfil', icono: 'person-circle-outline', iconoActivo: 'person-circle', ruta: '/(admin)/perfil-admin', activaEn: '/perfil-admin' },
  ];

  const ir = (destino: string) => {
    cerrar();
    // navigate: si la pantalla ya está abierta regresa a ella en vez de apilar otra igual
    router.navigate(destino as any);
  };

  const salir = async () => {
    setSalirVisible(false);
    cerrar();
    await deleteSession();
    router.replace('/' as any);
  };

  const Fila = ({ o }: { o: Opcion }) => {
    // "Pedidos" también queda marcado dentro del detalle de un pedido
    const activa = ruta === o.activaEn || (o.activaEn === '/pedidos' && ruta.startsWith('/pedido/'));
    return (
      <PressableScale style={[styles.fila, activa && styles.filaActiva]} onPress={() => ir(o.ruta)} scaleTo={0.97}>
        <Ionicons name={activa ? o.iconoActivo : o.icono} size={21} color={activa ? brandColors.primary : textColors.secondary} />
        <Text style={[styles.filaTexto, activa && styles.filaTextoActiva]} maxFontSizeMultiplier={ESCALA}>{o.titulo}</Text>
        {!!o.contador && (
          <View style={styles.contador}>
            <Text style={styles.contadorTexto} maxFontSizeMultiplier={1}>{o.contador > 99 ? '99+' : o.contador}</Text>
          </View>
        )}
      </PressableScale>
    );
  };

  return (
    <>
      <ModalConfirmacionLogout visible={salirVisible} onConfirmar={salir} onCancelar={() => setSalirVisible(false)} />

      <Animated.View pointerEvents={abierto ? 'auto' : 'none'} style={[StyleSheet.absoluteFill, styles.fondo, { opacity: progreso }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={cerrar} accessibilityLabel="Cerrar menú" />
      </Animated.View>

      <Animated.View
        style={[
          styles.panel,
          { width: ANCHO, transform: [{ translateX: progreso.interpolate({ inputRange: [0, 1], outputRange: [-ANCHO, 0] }) }] },
        ]}
      >
        {/* Cabecera oscura con el administrador */}
        <View style={[styles.cabecera, { paddingTop: insets.top + space.lg }]}>
          <View style={styles.filaCabecera}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTexto} maxFontSizeMultiplier={1}>{getInitials(user?.nombre)}</Text>
            </View>
            <PressableScale onPress={cerrar} hitSlop={10} style={styles.cerrar} accessibilityLabel="Cerrar menú">
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </PressableScale>
          </View>
          <Text style={styles.nombre} numberOfLines={1} maxFontSizeMultiplier={ESCALA}>{user?.nombre ?? 'Administrador'}</Text>
          <View style={styles.rol}>
            <Ionicons name="shield-checkmark" size={13} color={brandColors.accent} />
            <Text style={styles.rolTexto} maxFontSizeMultiplier={1}>Panel administrativo</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.cuerpo} showsVerticalScrollIndicator={false}>
          <Text style={styles.seccion} maxFontSizeMultiplier={1}>GESTIÓN</Text>
          {GESTION.map((o) => <Fila key={o.ruta} o={o} />)}

          <Text style={styles.seccion} maxFontSizeMultiplier={1}>CUENTA</Text>
          {CUENTA.map((o) => <Fila key={o.ruta} o={o} />)}
        </ScrollView>

        <View style={[styles.pie, { paddingBottom: insets.bottom + space.lg }]}>
          <PressableScale style={styles.salir} onPress={() => setSalirVisible(true)} scaleTo={0.97}>
            <Ionicons name="log-out-outline" size={20} color={brandColors.error} />
            <Text style={styles.salirTexto} maxFontSizeMultiplier={ESCALA}>Cerrar sesión</Text>
          </PressableScale>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  fondo: { backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 20 },
  panel: { position: 'absolute', top: 0, bottom: 0, left: 0, backgroundColor: surface.card, zIndex: 30 },
  // Más oscuro que el verde del cliente: así el admin se distingue
  cabecera: { backgroundColor: brandColors.primaryDark, paddingHorizontal: space.lg, paddingBottom: space.lg, gap: 4 },
  filaCabecera: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.sm },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: brandColors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarTexto: { fontFamily: fontFamily.bold, fontSize: 18, color: '#FFFFFF' },
  cerrar: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  nombre: { fontFamily: fontFamily.bold, fontSize: 18, color: '#FFFFFF' },
  rol: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  rolTexto: { fontFamily: fontFamily.medium, fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  cuerpo: { padding: space.md, gap: 2 },
  seccion: { fontFamily: fontFamily.semibold, fontSize: 11, letterSpacing: 1, color: textColors.muted, marginTop: space.md, marginBottom: 4, paddingHorizontal: space.md },
  fila: { flexDirection: 'row', alignItems: 'center', gap: space.md, height: 48, paddingHorizontal: space.md, borderRadius: radius.md },
  filaActiva: { backgroundColor: '#E6F2EF' },
  filaTexto: { flex: 1, fontFamily: fontFamily.medium, fontSize: 15, color: textColors.primary },
  filaTextoActiva: { fontFamily: fontFamily.semibold, color: brandColors.primary },
  contador: { minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, backgroundColor: brandColors.error, alignItems: 'center', justifyContent: 'center' },
  contadorTexto: { fontFamily: fontFamily.semibold, fontSize: 11, color: '#FFFFFF' },
  pie: { paddingHorizontal: space.lg, paddingTop: space.md, borderTopWidth: 1, borderTopColor: surface.border },
  salir: { flexDirection: 'row', alignItems: 'center', gap: space.md, height: 48, paddingHorizontal: space.md, borderRadius: radius.md, backgroundColor: '#FEF2F2' },
  salirTexto: { fontFamily: fontFamily.semibold, fontSize: 15, color: brandColors.error },
});
