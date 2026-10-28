import React from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import { DetallePublicoSheet, ProductoPublicoCard } from '@/features/catalogo-publico';
import { FadeInView } from '@/shared/components/FadeInView';
import { Loading } from '@/shared/components/Loading';
import { PressableScale } from '@/shared/components/PressableScale';
import { SeccionTitulo } from '../components/SeccionTitulo';
import { usePublicHomeViewModel } from '../viewmodels/usePublicHomeViewModel';

type Icono = ComponentProps<typeof Ionicons>['name'];
const ESCALA = 1.15;
const ANCHO_TARJETA = 150;

const BENEFICIOS: { icono: Icono; texto: string }[] = [
  { icono: 'pricetags-outline', texto: 'Precios y ofertas' },
  { icono: 'color-palette-outline', texto: 'Tu diseño' },
  { icono: 'location-outline', texto: 'Sigue tu pedido' },
];

export const PublicHomeView = () => {
  const vm = usePublicHomeViewModel();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.pantalla}>
      {/* Encabezado verde: marca + Entrar + buscador (lleva al catálogo) */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.fila}>
          <View style={{ flex: 1 }}>
            <Text style={styles.marca} maxFontSizeMultiplier={ESCALA}>Nova Graf</Text>
            <Text style={styles.lema} maxFontSizeMultiplier={ESCALA}>Personalización a tu medida</Text>
          </View>
          <PressableScale style={styles.entrar} onPress={vm.entrar} scaleTo={0.93} accessibilityLabel="Iniciar sesión">
            <Ionicons name="person-circle-outline" size={18} color={brandColors.primary} />
            <Text style={styles.entrarTexto} maxFontSizeMultiplier={ESCALA}>Entrar</Text>
          </PressableScale>
        </View>

        <PressableScale style={styles.buscador} onPress={() => vm.verCatalogo()} scaleTo={0.98} accessibilityLabel="Buscar en el catálogo">
          <Ionicons name="search-outline" size={18} color={textColors.muted} />
          <Text style={styles.buscadorTexto} maxFontSizeMultiplier={ESCALA}>Buscar tazas, playeras, termos…</Text>
        </PressableScale>
      </View>

      {vm.cargando ? (
        <Loading fullScreen />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={vm.refrescando} onRefresh={vm.refrescar} tintColor={brandColors.primary} colors={[brandColors.primary]} />}
        >
          {/* 1. Banner principal */}
          <FadeInView style={styles.banner}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.bannerTitulo} maxFontSizeMultiplier={ESCALA}>Haz único tu producto</Text>
              <Text style={styles.bannerTexto} maxFontSizeMultiplier={ESCALA}>Tazas, playeras, termos y más con tu logo o idea.</Text>
              <PressableScale style={styles.bannerBoton} onPress={() => vm.verCatalogo()} scaleTo={0.95}>
                <Text style={styles.bannerBotonTexto} maxFontSizeMultiplier={ESCALA}>Ver catálogo</Text>
                <Ionicons name="arrow-forward" size={16} color={brandColors.primary} />
              </PressableScale>
            </View>
            <View style={styles.bannerIcono}>
              <Ionicons name="color-palette" size={44} color="#FFFFFF" />
            </View>
          </FadeInView>

          {!!vm.error && (
            <View style={styles.error}>
              <Ionicons name="cloud-offline-outline" size={20} color={brandColors.error} />
              <Text style={styles.errorTexto} maxFontSizeMultiplier={ESCALA}>{vm.error}</Text>
            </View>
          )}

          {/* 2. Categorías */}
          {vm.categorias.length > 0 && (
            <View style={styles.seccion}>
              <View style={styles.titulo}><SeccionTitulo titulo="Categorías" /></View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categorias}>
                {vm.categorias.map((c) => (
                  <PressableScale key={c} style={styles.categoria} onPress={() => vm.verCatalogo(c)} scaleTo={0.95}>
                    <Ionicons name="pricetag-outline" size={15} color={brandColors.primary} />
                    <Text style={styles.categoriaTexto} maxFontSizeMultiplier={ESCALA}>{c}</Text>
                  </PressableScale>
                ))}
              </ScrollView>
            </View>
          )}

          {/* 3. Productos (solo algunos; el resto en Catálogo) */}
          {vm.productos.length > 0 && (
            <View style={styles.seccion}>
              <View style={styles.titulo}><SeccionTitulo titulo="Productos para personalizar" accion="Ver todo" onAccion={() => vm.verCatalogo()} /></View>
              <FlatList
                horizontal
                data={vm.productos}
                keyExtractor={(p) => String(p.id)}
                renderItem={({ item }) => <ProductoPublicoCard producto={item} ancho={ANCHO_TARJETA} onPress={() => vm.abrirProducto(item)} />}
                contentContainerStyle={styles.carrusel}
                showsHorizontalScrollIndicator={false}
                initialNumToRender={3}
                windowSize={3}
              />
            </View>
          )}

          {/* 4. Trabajos realizados */}
          {vm.trabajos.length > 0 && (
            <View style={styles.seccion}>
              <View style={styles.titulo}><SeccionTitulo titulo="Trabajos realizados" subtitulo="Hechos en nuestro taller" /></View>
              <FlatList
                horizontal
                data={vm.trabajos}
                keyExtractor={(t) => String(t.id)}
                renderItem={({ item }) => (
                  <PressableScale style={styles.trabajo} onPress={() => vm.abrirTrabajo(item)} scaleTo={0.97}>
                    {item.imagenUrl ? (
                      <Image source={{ uri: item.imagenUrl }} style={styles.trabajoImg} contentFit="cover" cachePolicy="memory-disk" recyclingKey={String(item.id)} transition={150} />
                    ) : (
                      <View style={[styles.trabajoImg, styles.centrado]}>
                        <Ionicons name="image-outline" size={28} color={textColors.muted} />
                      </View>
                    )}
                    {!!item.categoriaNombre && (
                      <View style={styles.trabajoEtiqueta}>
                        <Text style={styles.trabajoEtiquetaTexto} numberOfLines={1} maxFontSizeMultiplier={1}>{item.categoriaNombre}</Text>
                      </View>
                    )}
                  </PressableScale>
                )}
                contentContainerStyle={styles.carrusel}
                showsHorizontalScrollIndicator={false}
                initialNumToRender={3}
                windowSize={3}
              />
            </View>
          )}

          {/* 5. Crear cuenta */}
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
            <PressableScale style={styles.ctaBoton} onPress={vm.registrarse} scaleTo={0.97}>
              <Text style={styles.ctaBotonTexto} maxFontSizeMultiplier={ESCALA}>Crear mi cuenta</Text>
            </PressableScale>
            <PressableScale onPress={vm.entrar} hitSlop={8} scaleTo={0.97}>
              <Text style={styles.ctaEnlace} maxFontSizeMultiplier={ESCALA}>
                ¿Ya tienes cuenta? <Text style={styles.ctaEnlaceFuerte}>Inicia sesión</Text>
              </Text>
            </PressableScale>
          </FadeInView>
        </ScrollView>
      )}

      <DetallePublicoSheet detalle={vm.detalle} onCerrar={vm.cerrarDetalle} onEntrar={vm.entrar} onRegistrarse={vm.registrarse} />
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: surface.screen },

  header: { backgroundColor: brandColors.primary, paddingHorizontal: space.lg, paddingBottom: space.md, gap: space.md },
  fila: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  marca: { fontFamily: fontFamily.bold, fontSize: 22, color: '#FFFFFF' },
  lema: { fontFamily: fontFamily.regular, fontSize: 13, color: 'rgba(255,255,255,0.8)' },
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
  buscador: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: surface.card,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
  },
  buscadorTexto: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.muted },

  scroll: { paddingBottom: 40, gap: space.xl, paddingTop: space.lg },
  seccion: {},
  titulo: { paddingHorizontal: space.lg },
  centrado: { alignItems: 'center', justifyContent: 'center' },

  banner: {
    marginHorizontal: space.lg,
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

  error: { marginHorizontal: space.lg, flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, borderRadius: radius.md, backgroundColor: '#FEE2E2' },
  errorTexto: { flex: 1, fontFamily: fontFamily.medium, fontSize: 14, color: textColors.primary },

  categorias: { gap: space.sm, paddingHorizontal: space.lg },
  categoria: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: surface.card,
    borderWidth: 1,
    borderColor: surface.border,
  },
  categoriaTexto: { fontFamily: fontFamily.medium, fontSize: 14, color: textColors.primary },

  carrusel: { gap: space.md, paddingHorizontal: space.lg },
  trabajo: { width: 160, height: 160, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: surface.muted },
  trabajoImg: { width: '100%', height: '100%' },
  trabajoEtiqueta: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    maxWidth: 144,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  trabajoEtiquetaTexto: { fontFamily: fontFamily.medium, fontSize: 11, color: '#FFFFFF' },

  cta: {
    marginHorizontal: space.lg,
    padding: space.lg,
    gap: space.md,
    borderRadius: radius.lg,
    backgroundColor: surface.card,
    borderWidth: 1,
    borderColor: surface.border,
    alignItems: 'center',
  },
  ctaTitulo: { fontFamily: fontFamily.bold, fontSize: 18, color: textColors.primary },
  beneficios: { flexDirection: 'row', gap: space.sm, alignSelf: 'stretch' },
  beneficio: { flex: 1, alignItems: 'center', gap: 6 },
  beneficioIcono: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E6F2EF', alignItems: 'center', justifyContent: 'center' },
  beneficioTexto: { fontFamily: fontFamily.medium, fontSize: 12, color: textColors.secondary, textAlign: 'center' },
  ctaBoton: { alignSelf: 'stretch', height: 50, borderRadius: radius.md, backgroundColor: brandColors.primary, alignItems: 'center', justifyContent: 'center' },
  ctaBotonTexto: { fontFamily: fontFamily.semibold, fontSize: 16, color: '#FFFFFF' },
  ctaEnlace: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary },
  ctaEnlaceFuerte: { fontFamily: fontFamily.semibold, color: brandColors.primary },
});
