import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import { PublicHeader } from '@/features/menu-publico';
import { TrabajoCard, TrabajoDetalleSheet } from '@/features/portafolio';
import { CustomButton } from '@/shared/components/CustomButton';
import { FadeInView } from '@/shared/components/FadeInView';
import { Loading } from '@/shared/components/Loading';
import { PressableScale } from '@/shared/components/PressableScale';
import { SeccionTitulo } from '../components/SeccionTitulo';
import { usePublicHomeViewModel } from '../viewmodels/usePublicHomeViewModel';

type Icono = ComponentProps<typeof Ionicons>['name'];
const ESCALA = 1.15;

const BENEFICIOS: { icono: Icono; texto: string }[] = [
  { icono: 'pricetags-outline', texto: 'Precios y ofertas' },
  { icono: 'color-palette-outline', texto: 'Tu diseño' },
  { icono: 'location-outline', texto: 'Sigue tu pedido' },
];

export const PublicHomeView = () => {
  const vm = usePublicHomeViewModel();

  // Cuadrícula de 2 columnas armada en filas (son pocos: no hace falta FlatList)
  const filas: (typeof vm.trabajos)[] = [];
  for (let i = 0; i < vm.trabajos.length; i += 2) filas.push(vm.trabajos.slice(i, i + 2));

  return (
    <View style={styles.pantalla}>
      <PublicHeader titulo="Nova Graf" subtitulo="Personalización a tu medida" />

      {vm.cargando ? (
        <Loading fullScreen />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={vm.refrescando} onRefresh={vm.refrescar} tintColor={brandColors.primary} colors={[brandColors.primary]} />}
        >
          {/* 1. Banner: lleva a Mi cuenta (iniciar sesión / registrarse) */}
          <FadeInView style={styles.banner}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.bannerTitulo} maxFontSizeMultiplier={ESCALA}>Haz único tu producto</Text>
              <Text style={styles.bannerTexto} maxFontSizeMultiplier={ESCALA}>Tazas, playeras, termos y más con tu logo o idea.</Text>
              <PressableScale style={styles.bannerBoton} onPress={vm.irACuenta} scaleTo={0.95}>
                <Text style={styles.bannerBotonTexto} maxFontSizeMultiplier={ESCALA}>Comenzar</Text>
                <Ionicons name="arrow-forward" size={16} color={brandColors.primary} />
              </PressableScale>
            </View>
            <View style={styles.bannerIcono}>
              <Ionicons name="color-palette" size={44} color="#FFFFFF" />
            </View>
          </FadeInView>

          {/* 2. Trabajos realizados */}
          <View style={styles.seccion}>
            <SeccionTitulo
              titulo="Trabajos realizados"
              subtitulo="Hechos en nuestro taller"
              accion={vm.hayMas ? 'Ver más' : undefined}
              onAccion={vm.hayMas ? vm.verTrabajos : undefined}
            />

            {vm.error ? (
              <View style={styles.aviso}>
                <Ionicons name="cloud-offline-outline" size={24} color={textColors.muted} />
                <Text style={styles.avisoTexto} maxFontSizeMultiplier={ESCALA}>{vm.error}</Text>
                <CustomButton title="Reintentar" variant="outline" onPress={vm.reintentar} />
              </View>
            ) : vm.trabajos.length === 0 ? (
              <View style={styles.aviso}>
                <Ionicons name="images-outline" size={24} color={textColors.muted} />
                <Text style={styles.avisoTexto} maxFontSizeMultiplier={ESCALA}>Pronto publicaremos nuestros trabajos.</Text>
              </View>
            ) : (
              <View style={{ gap: space.md }}>
                {filas.map((fila, i) => (
                  <View key={i} style={styles.fila}>
                    {fila.map((t) => <TrabajoCard key={t.id} trabajo={t} onPress={() => vm.abrirTrabajo(t)} />)}
                    {fila.length === 1 && <View style={{ flex: 1 }} />}
                  </View>
                ))}
                {vm.hayMas && (
                  <CustomButton
                    title={`Ver los ${vm.total} trabajos`}
                    variant="outline"
                    icon={<Ionicons name="images-outline" size={18} color={textColors.primary} />}
                    onPress={vm.verTrabajos}
                  />
                )}
              </View>
            )}
          </View>

          {/* 3. Crear cuenta */}
          <FadeInView delay={120} style={styles.cta}>
            <Text style={styles.ctaTitulo} maxFontSizeMultiplier={ESCALA}>Crea tu cuenta gratis</Text>
            <View style={styles.beneficios}>
              {BENEFICIOS.map((b) => (
                <View key={b.texto} style={styles.beneficio}>
                  <View style={styles.beneficioIcono}>
                    <Ionicons name={b.icono} size={20} color={brandColors.primary} />
                  </View>
                  <Text style={styles.beneficioTexto} maxFontSizeMultiplier={ESCALA}>{b.texto}</Text>
                </View>
              ))}
            </View>
            <CustomButton title="Crear mi cuenta" onPress={vm.registrarse} style={{ alignSelf: 'stretch' }} />
            <PressableScale onPress={vm.entrar} hitSlop={8} scaleTo={0.97}>
              <Text style={styles.ctaEnlace} maxFontSizeMultiplier={ESCALA}>
                ¿Ya tienes cuenta? <Text style={styles.ctaEnlaceFuerte}>Inicia sesión</Text>
              </Text>
            </PressableScale>
          </FadeInView>
        </ScrollView>
      )}

      <TrabajoDetalleSheet trabajo={vm.seleccionado} onCerrar={vm.cerrarTrabajo} onEntrar={vm.entrar} onRegistrarse={vm.registrarse} />
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: surface.screen },
  scroll: { padding: space.lg, paddingBottom: 40, gap: space.xl },
  seccion: {},
  fila: { flexDirection: 'row', gap: space.md },

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: brandColors.primaryDark,
  },
  bannerTitulo: { fontFamily: fontFamily.bold, fontSize: 19, color: '#FFFFFF' },
  bannerTexto: { fontFamily: fontFamily.regular, fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  bannerBoton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: space.sm,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
  },
  bannerBotonTexto: { fontFamily: fontFamily.semibold, fontSize: 14, color: brandColors.primary },
  bannerIcono: { width: 76, height: 76, borderRadius: 38, backgroundColor: 'rgba(53,186,153,0.35)', alignItems: 'center', justifyContent: 'center' },

  aviso: { alignItems: 'center', gap: space.sm, padding: space.lg, borderRadius: radius.lg, backgroundColor: surface.card, borderWidth: 1, borderColor: surface.border },
  avisoTexto: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary, textAlign: 'center' },

  cta: { padding: space.lg, gap: space.md, borderRadius: radius.lg, backgroundColor: surface.card, borderWidth: 1, borderColor: surface.border, alignItems: 'center' },
  ctaTitulo: { fontFamily: fontFamily.bold, fontSize: 18, color: textColors.primary },
  beneficios: { flexDirection: 'row', gap: space.sm, alignSelf: 'stretch' },
  beneficio: { flex: 1, alignItems: 'center', gap: 6 },
  beneficioIcono: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E6F2EF', alignItems: 'center', justifyContent: 'center' },
  beneficioTexto: { fontFamily: fontFamily.medium, fontSize: 12, color: textColors.secondary, textAlign: 'center' },
  ctaEnlace: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary },
  ctaEnlaceFuerte: { fontFamily: fontFamily.semibold, color: brandColors.primary },
});
