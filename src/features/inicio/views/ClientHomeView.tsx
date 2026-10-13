import React from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useClientHomeViewModel } from '../viewmodels/useClientHomeViewModel';
import { HomeHeader } from '../components/HomeHeader';
import { ChatFab } from '../components/ChatFab';
import { OfferBanner, OfferCard } from '@/features/ofertas';
import { PortfolioCard } from '@/features/portafolio';
import { Loading } from '@/shared/components/Loading';
import { CustomButton } from '@/shared/components/CustomButton';
import { FadeInView } from '@/shared/components/FadeInView';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors, brandTints } from '@/constants/brand';

export const ClientHomeView = () => {
  const vm = useClientHomeViewModel();

  return (
    <View style={styles.pantalla}>
      <HomeHeader
        busqueda={vm.busqueda}
        onBusqueda={vm.setBusqueda}
        categorias={vm.categorias}
        categoriaActiva={vm.categoria}
        onCategoria={vm.elegirCategoria}
        onNotificaciones={vm.abrirNotificaciones}
      />

      {vm.aviso && (
        <FadeInView distance={-10} duration={250} style={styles.toast}>
          <Text style={styles.toastTexto}>{vm.aviso}</Text>
        </FadeInView>
      )}

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={vm.refrescando}
            onRefresh={vm.refrescar}
            tintColor={brandColors.primary}
            colors={[brandColors.primary]}
          />
        }
      >
        {/* BANNER con la mejor oferta (solo si hay y no se está filtrando) */}
        {vm.banner && !vm.hayFiltros && (
          <OfferBanner titulo={vm.banner.titulo} subtitulo={vm.banner.subtitulo} vigencia={vm.banner.vigencia} />
        )}

        {/* PROMOCIONES Y DESCUENTOS */}
        <View style={styles.seccion}>
          <View style={styles.tituloFila}>
            <Text style={styles.titulo}>Promociones y descuentos</Text>
            {vm.hayMasOfertas && (
              <PressableScale onPress={vm.alternarVerTodas} scaleTo={0.94} hitSlop={8}>
                <Text style={styles.enlace}>{vm.verTodas ? 'Ver menos' : 'Ver todo'}</Text>
              </PressableScale>
            )}
          </View>

          {vm.cargandoOfertas ? (
            <Loading />
          ) : vm.errorOfertas ? (
            <View style={styles.estado}>
              <Text style={styles.error}>{vm.errorOfertas}</Text>
              <CustomButton title="Reintentar" onPress={vm.reintentarOfertas} style={styles.botonAncho} />
            </View>
          ) : vm.tarjetasVisibles.length === 0 ? (
            <View style={styles.vacio}>
              <Text style={styles.vacioTexto}>
                {vm.hayFiltros && !vm.sinOfertasActivas
                  ? 'No hay promociones que coincidan con tu búsqueda.'
                  : 'Aún no hay promociones activas. ¡Vuelve pronto!'}
              </Text>
            </View>
          ) : (
            <View style={styles.cuadricula}>
              {vm.tarjetasVisibles.map((t, i) => (
                <OfferCard key={t.clave} tarjeta={t} index={i} onPress={() => vm.abrirOferta(t)} />
              ))}
            </View>
          )}
        </View>

        {/* INSPÍRATE: trabajos personalizados */}
        <View style={styles.seccion}>
          <Text style={styles.titulo}>Inspírate</Text>
          <Text style={styles.subtitulo}>Trabajos personalizados que hemos hecho para nuestros clientes.</Text>

          {vm.portafolioCargando ? (
            <Loading />
          ) : vm.portafolioError ? (
            <View style={styles.estado}>
              <Text style={styles.error}>{vm.portafolioError}</Text>
              <CustomButton title="Reintentar" onPress={vm.recargarPortafolio} style={styles.botonAncho} />
            </View>
          ) : vm.portafolioFiltrado.length === 0 ? (
            <View style={styles.vacio}>
              <Text style={styles.vacioTexto}>
                {vm.hayFiltros
                  ? 'No encontramos trabajos con esa búsqueda.'
                  : 'No hay productos personalizados publicados aún.'}
              </Text>
            </View>
          ) : (
            <View style={styles.cuadriculaPortafolio}>
              {vm.portafolioFiltrado.map((item, i) => (
                <PortfolioCard key={item.id} item={item} index={i} />
              ))}
            </View>
          )}
        </View>

        {/* LLAMADA A LA ACCIÓN */}
        <FadeInView style={styles.cta}>
          <Text style={styles.ctaTitulo}>¿Tienes una idea en mente?</Text>
          <Text style={styles.ctaSub}>Elige un producto base y personalízalo a tu gusto.</Text>
          <PressableScale style={styles.ctaBoton} onPress={vm.irAlCatalogo}>
            <Text style={styles.ctaBotonTexto}>Ver productos</Text>
          </PressableScale>
        </FadeInView>
      </ScrollView>

      <ChatFab onPress={vm.abrirChat} />
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: brandColors.background },
  scroll: { padding: 16, paddingBottom: 96, gap: 22 },

  toast: { marginHorizontal: 16, marginTop: 10, padding: 12, borderRadius: 12, backgroundColor: brandTints.accentSoft },
  toastTexto: { textAlign: 'center', fontWeight: '600', color: brandColors.primary },

  seccion: { gap: 4 },
  tituloFila: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 },
  titulo: { fontSize: 18, fontWeight: '800', color: brandColors.primaryDark },
  subtitulo: { fontSize: 13, color: brandTints.textMuted, marginBottom: 10 },
  enlace: { fontSize: 13, fontWeight: '700', color: brandColors.primary },

  // El margen negativo cancela el padding de cada celda para que alineen con el resto
  cuadricula: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  cuadriculaPortafolio: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },

  estado: { alignItems: 'center', paddingVertical: 20 },
  error: { color: brandColors.error, textAlign: 'center', fontWeight: '500', marginBottom: 12 },
  botonAncho: { paddingHorizontal: 28 },
  vacio: { backgroundColor: brandColors.white, borderRadius: 16, padding: 18 },
  vacioTexto: { textAlign: 'center', color: brandTints.textMuted, fontSize: 14, lineHeight: 20 },

  cta: { backgroundColor: brandColors.primary, borderRadius: 18, padding: 22 },
  ctaTitulo: { color: brandColors.white, fontSize: 18, fontWeight: '800', marginBottom: 4 },
  ctaSub: { color: brandTints.accentSoft, fontSize: 14, marginBottom: 18 },
  ctaBoton: {
    alignSelf: 'flex-start',
    backgroundColor: brandColors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  ctaBotonTexto: { color: brandColors.primaryDark, fontWeight: '800', fontSize: 14 },
});