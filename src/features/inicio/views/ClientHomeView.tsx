import React from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useClientHomeViewModel } from '../viewmodels/useClientHomeViewModel';
import { HomeHeader } from '../components/HomeHeader';
import { ChatFab } from '../components/ChatFab';
import { SeccionTitulo } from '../components/SeccionTitulo';
import { PasosPersonalizacion } from '../components/PasosPersonalizacion';
import { OfferCard } from '@/features/ofertas';
import { PortfolioCard } from '@/features/portafolio';
import { Loading } from '@/shared/components/Loading';
import { CustomButton } from '@/shared/components/CustomButton';
import { FadeInView } from '@/shared/components/FadeInView';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import type { ComponentProps } from 'react';

type IconName = ComponentProps<typeof Ionicons>['name'];

// Mensaje para "no hay resultados" o "error", con el mismo estilo en todas las secciones
const Aviso = ({ icono, texto }: { icono: IconName; texto: string }) => (
  <View style={styles.aviso}>
    <Ionicons name={icono} size={22} color={textColors.muted} />
    <Text style={styles.avisoTexto}>{texto}</Text>
  </View>
);

export const ClientHomeView = () => {
  const vm = useClientHomeViewModel();

  return (
    <View style={styles.pantalla}>
      <HomeHeader
        nombre={vm.primerNombre}
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
        {/* 1. CÓMO FUNCIONA (versión compacta) + botón para empezar */}
        {!vm.hayFiltros && <PasosPersonalizacion onEmpezar={vm.irAlCatalogo} />}

        {/* 2. OFERTAS */}
        <View>
          <SeccionTitulo
            titulo="Ofertas"
            subtitulo="Descuentos en productos para personalizar"
            accion={vm.hayMasOfertas ? (vm.verTodas ? 'Ver menos' : 'Ver todo') : undefined}
            onAccion={vm.alternarVerTodas}
          />

          {vm.cargandoOfertas ? (
            <Loading />
          ) : vm.errorOfertas ? (
            <View style={styles.estado}>
              <Aviso icono="cloud-offline-outline" texto={vm.errorOfertas} />
              <CustomButton title="Reintentar" variant="outline" onPress={vm.reintentarOfertas} />
            </View>
          ) : vm.tarjetasVisibles.length === 0 ? (
            <Aviso
              icono="pricetag-outline"
              texto={
                vm.hayFiltros && !vm.sinOfertasActivas
                  ? 'No hay ofertas que coincidan con tu búsqueda.'
                  : 'Aún no hay ofertas activas. Vuelve pronto.'
              }
            />
          ) : (
            <View style={styles.cuadricula}>
              {vm.tarjetasVisibles.map((t, i) => (
                <OfferCard key={t.clave} tarjeta={t} index={i} onPress={() => vm.abrirOferta(t)} />
              ))}
            </View>
          )}
        </View>

        {/* 3. INSPIRACIÓN — trabajos de otros clientes */}
        <View>
          <SeccionTitulo titulo="Inspiración" subtitulo="Ideas que otros clientes ya personalizaron" />

          {vm.portafolioCargando ? (
            <Loading />
          ) : vm.portafolioError ? (
            <View style={styles.estado}>
              <Aviso icono="cloud-offline-outline" texto={vm.portafolioError} />
              <CustomButton title="Reintentar" variant="outline" onPress={vm.recargarPortafolio} />
            </View>
          ) : vm.portafolioFiltrado.length === 0 ? (
            <Aviso
              icono="images-outline"
              texto={vm.hayFiltros ? 'No encontramos trabajos con esa búsqueda.' : 'Aún no hay trabajos publicados.'}
            />
          ) : (
            <>
              <View style={styles.cuadriculaPortafolio}>
                {vm.portafolioVisible.map((item, i) => (
                  <PortfolioCard key={item.id} item={item} index={i % 6} onPress={() => vm.abrirTrabajo(item)} />
                ))}
              </View>
              {vm.hayMasPortafolio && (
                <CustomButton
                  title="Ver más ideas"
                  variant="outline"
                  icon={<Ionicons name="chevron-down" size={18} color={textColors.primary} />}
                  onPress={vm.verMasPortafolio}
                  style={{ marginTop: space.md }}
                />
              )}
            </>
          )}
        </View>
      </ScrollView>

      <ChatFab onPress={vm.abrirChat} />
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: surface.screen },
  // Mismo espacio entre todas las secciones
  scroll: { padding: space.lg, paddingBottom: 110, gap: space.xl },

  toast: { marginHorizontal: space.lg, marginTop: space.sm, padding: space.md, borderRadius: radius.md, backgroundColor: textColors.primary },
  toastTexto: { textAlign: 'center', fontFamily: fontFamily.medium, fontSize: 13, color: '#FFFFFF' },

  // El margen negativo cancela el padding de cada celda para que alineen con el resto
  cuadricula: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  cuadriculaPortafolio: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: space.md },

  estado: { gap: space.md },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: surface.card,
    borderRadius: radius.md,
    padding: space.lg,
    borderWidth: 1,
    borderColor: surface.border,
  },
  avisoTexto: { flex: 1, fontFamily: fontFamily.regular, fontSize: 13, color: textColors.secondary },
});