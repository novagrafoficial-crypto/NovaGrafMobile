import React from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useClientHomeViewModel } from '../viewmodels/useClientHomeViewModel';
import { HomeHeader } from '../components/HomeHeader';
import { ChatFab } from '../components/ChatFab';
import { ComoFuncionaSection } from '../components/ComoFuncionaSection';
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
        {/* 1. ¿CÓMO FUNCIONA? — cómo se pide un diseño (se oculta al buscar o filtrar) */}
        {!vm.hayFiltros && (
          <View>
            <ComoFuncionaSection
              titulo="¿Tienes una idea en mente?"
              subtitulo="Así pides tu diseño personalizado en 5 pasos."
              style={styles.comoFunciona}
            />
            <PressableScale style={styles.botonProducto} onPress={vm.irAlCatalogo}>
              <Text style={styles.botonProductoTexto}>Elegir mi producto base</Text>
            </PressableScale>
          </View>
        )}

        {/* 2. OFERTAS Y PROMOS */}
        {/* BANNER con la mejor oferta (solo si hay y no se está filtrando) */}
        {vm.banner && !vm.hayFiltros && (
          <OfferBanner titulo={vm.banner.titulo} subtitulo={vm.banner.subtitulo} vigencia={vm.banner.vigencia} />
        )}

        {/* PROMOCIONES Y DESCUENTOS */}
        <View style={styles.seccion}>
          <View style={styles.tituloFila}>
            <Text style={styles.titulo}>Descubre descuentos y promociones</Text>
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

        {/* 3. PRODUCTOS PERSONALIZADOS — solo como referencia/inspiración */}
        <View style={styles.seccion}>
          <Text style={styles.titulo}>Productos personalizados</Text>
          <Text style={styles.subtitulo}>
            Así lo han personalizado otros clientes. Toca uno para elegir su producto base y pídelo a tu manera.
          </Text>

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
                <PortfolioCard key={item.id} item={item} index={i} onPress={() => vm.abrirTrabajo(item)} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Chat flotante: se conserva tal cual para desarrollarlo después */}
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

  // ¿Cómo funciona? + botón
  comoFunciona: { marginBottom: 4 },
  botonProducto: {
    backgroundColor: brandColors.primary,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  botonProductoTexto: { color: brandColors.white, fontSize: 15, fontWeight: '800' },
});