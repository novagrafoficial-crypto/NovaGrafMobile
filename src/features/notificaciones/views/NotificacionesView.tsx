import React from 'react';
import { View, Text, SectionList, RefreshControl, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { Loading } from '@/shared/components/Loading';
import { FadeInView } from '@/shared/components/FadeInView';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import { useNotificacionesViewModel, type FiltroNotif } from '../viewmodels/useNotificacionesViewModel';
import { NotificacionItem } from '../components/NotificacionItem';

const ESCALA = 1.15;

export const NotificacionesView = () => {
  const vm = useNotificacionesViewModel();

  const Pestana = ({ id, texto, contador }: { id: FiltroNotif; texto: string; contador?: number }) => {
    const activa = vm.filtro === id;
    return (
      <PressableScale
        style={[styles.pestana, activa && styles.pestanaActiva]}
        onPress={() => vm.elegirFiltro(id)}
        scaleTo={0.95}
        hitSlop={{ top: 6, bottom: 6 }}
        accessibilityRole="tab"
        accessibilityState={{ selected: activa }}
      >
        <Text style={[styles.pestanaTexto, activa && styles.pestanaTextoActiva]} maxFontSizeMultiplier={ESCALA}>{texto}</Text>
        {!!contador && (
          <View style={[styles.contador, activa && styles.contadorActivo]}>
            <Text style={styles.contadorTexto} maxFontSizeMultiplier={1}>{contador > 99 ? '99+' : contador}</Text>
          </View>
        )}
      </PressableScale>
    );
  };

  const cuerpo = () => {
    if (vm.cargando) return <Loading fullScreen />;

    if (vm.total === 0) {
      return (
        <FadeInView style={styles.centrado}>
          <View style={styles.circulo}>
            <Ionicons name="notifications-off-outline" size={38} color={textColors.primary} />
          </View>
          <Text style={styles.vacioTitulo} maxFontSizeMultiplier={ESCALA}>Sin notificaciones</Text>
          <Text style={styles.vacioTexto} maxFontSizeMultiplier={ESCALA}>Aquí verás los avisos de tus pedidos.</Text>
        </FadeInView>
      );
    }

    return (
      <>
        {/* Filtros + marcar todas */}
        <View style={styles.barra}>
          <View style={styles.pestanas}>
            <Pestana id="TODAS" texto="Todas" />
            <Pestana id="NO_LEIDAS" texto="No leídas" contador={vm.noLeidas} />
          </View>
          {vm.noLeidas > 0 && (
            <PressableScale onPress={vm.marcarTodasLeidas} hitSlop={8} scaleTo={0.92} style={styles.marcar}>
              <Ionicons name="checkmark-done-outline" size={18} color={brandColors.primary} />
              <Text style={styles.marcarTexto} maxFontSizeMultiplier={ESCALA}>Leer todas</Text>
            </PressableScale>
          )}
        </View>

        <SectionList
          sections={vm.secciones}
          keyExtractor={(n) => String(n.id)}
          contentContainerStyle={styles.lista}
          stickySectionHeadersEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: space.sm }} />}
          renderSectionHeader={({ section }) => (
            <Text style={styles.seccion} maxFontSizeMultiplier={ESCALA}>{section.title}</Text>
          )}
          refreshControl={
            <RefreshControl
              refreshing={vm.refrescando}
              onRefresh={vm.onRefresh}
              tintColor={brandColors.primary}
              colors={[brandColors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.vacioFiltro}>
              <Ionicons name="checkmark-done-circle-outline" size={40} color={textColors.muted} />
              <Text style={styles.vacioTexto} maxFontSizeMultiplier={ESCALA}>Estás al día, no tienes notificaciones sin leer.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <NotificacionItem notificacion={item} onPress={() => vm.abrir(item)} onEliminar={() => vm.eliminar(item.id)} />
          )}
        />
      </>
    );
  };

  return (
    <View style={styles.pantalla}>
      <ScreenHeader title="Notificaciones" onBack={vm.volver} />
      <View style={{ flex: 1 }}>{cuerpo()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: surface.screen },

  // Barra de filtros
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: surface.card,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderBottomWidth: 1,
    borderBottomColor: surface.border,
  },
  pestanas: { flexDirection: 'row', gap: space.sm },
  pestana: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: surface.border,
    backgroundColor: surface.card,
  },
  pestanaActiva: { backgroundColor: brandColors.primary, borderColor: brandColors.primary },
  pestanaTexto: { fontFamily: fontFamily.medium, fontSize: 13, color: textColors.primary },
  pestanaTextoActiva: { color: '#FFFFFF' },
  contador: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: brandColors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contadorActivo: { backgroundColor: 'rgba(255,255,255,0.25)' },
  contadorTexto: { fontFamily: fontFamily.semibold, fontSize: 11, color: '#FFFFFF' },
  marcar: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  marcarTexto: { fontFamily: fontFamily.semibold, fontSize: 13, color: brandColors.primary },

  // Lista
  lista: { padding: space.lg, paddingTop: space.sm, paddingBottom: space.xl, flexGrow: 1 },
  seccion: {
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    color: textColors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: space.md,
    marginBottom: space.sm,
  },

  // Vacíos
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.sm },
  circulo: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: surface.card,
    borderWidth: 1,
    borderColor: surface.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  vacioTitulo: { fontFamily: fontFamily.bold, fontSize: 18, color: textColors.primary },
  vacioTexto: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary, textAlign: 'center' },
  vacioFiltro: { alignItems: 'center', gap: space.sm, paddingVertical: 48 },
});