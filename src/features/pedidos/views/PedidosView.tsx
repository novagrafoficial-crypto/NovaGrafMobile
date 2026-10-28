import React from 'react';
import { View, Text, FlatList, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePedidosViewModel } from '../viewmodels/usePedidosViewModel';
import { PedidoCard } from '../components/PedidoCard';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { Loading } from '@/shared/components/Loading';
import { CustomButton } from '@/shared/components/CustomButton';
import { FadeInView } from '@/shared/components/FadeInView';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';

const ESCALA = 1.15;

export const PedidosView = () => {
  const vm = usePedidosViewModel();

  const cuerpo = () => {
    if (vm.cargando) return <Loading fullScreen />;

    if (vm.error) {
      return (
        <View style={styles.centrado}>
          <Ionicons name="cloud-offline-outline" size={44} color={textColors.muted} />
          <Text style={styles.mensaje}>{vm.error}</Text>
          <CustomButton title="Reintentar" variant="outline" onPress={vm.reintentar} style={styles.boton} />
        </View>
      );
    }

    if (vm.sinPedidos) {
      return (
        <FadeInView style={styles.centrado}>
          <View style={styles.circulo}>
            <Ionicons name="bag-handle-outline" size={40} color={textColors.primary} />
          </View>
          <Text style={styles.vacioTitulo} maxFontSizeMultiplier={ESCALA}>Aún no tienes pedidos</Text>
          <Text style={styles.mensaje} maxFontSizeMultiplier={ESCALA}>{vm.textoVacio}</Text>
          <CustomButton title="Ver productos" onPress={vm.irAlCatalogo} style={styles.boton} />
        </FadeInView>
      );
    }

    return (
      <>
        {/* Pestañas de filtro con contador */}
        <View style={styles.filtrosBarra}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtros}>
            {vm.filtros.map((f) => {
              const activo = vm.filtro === f.key;
              const alerta = f.key === 'ACCION' && f.total > 0; 
              return (
                <PressableScale
                  key={f.key}
                  style={[styles.filtro, activo && styles.filtroActivo]}
                  onPress={() => vm.elegirFiltro(f.key)}
                  scaleTo={0.95}
                  hitSlop={{ top: 6, bottom: 6 }}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: activo }}
                >
                  <Text style={[styles.filtroTexto, activo && styles.filtroTextoActivo]} maxFontSizeMultiplier={ESCALA}>
                    {f.label}
                  </Text>
                  <View style={[styles.contador, activo && styles.contadorActivo, alerta && !activo && styles.contadorAlerta]}>
                    <Text
                      style={[styles.contadorTexto, (activo || alerta) && styles.contadorTextoClaro]}
                      maxFontSizeMultiplier={1}
                    >
                      {f.total}
                    </Text>
                  </View>
                </PressableScale>
              );
            })}
          </ScrollView>
        </View>

        <FlatList
          data={vm.pedidosFiltrados}
          keyExtractor={(p) => String(p.id)}
          contentContainerStyle={styles.lista}
          ItemSeparatorComponent={() => <View style={{ height: space.md }} />}
          refreshControl={
            <RefreshControl
              refreshing={vm.refrescando}
              onRefresh={vm.refrescar}
              tintColor={brandColors.primary}
              colors={[brandColors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.vacioFiltro}>
              <Ionicons name={vm.filtro === 'ACCION' ? 'checkmark-done-outline' : 'file-tray-outline'} size={36} color={textColors.muted} />
              <Text style={styles.mensaje} maxFontSizeMultiplier={ESCALA}>{vm.textoVacio}</Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <PedidoCard
              pedido={item}
              index={index}
              onPress={() => vm.verDetalle(item.id)}
              onPagar={() => vm.irAPagar(item.id)}
            />
          )}
        />
      </>
    );
  };

  return (
    <View style={styles.pantalla}>
      {/* Mismo encabezado verde que el resto de la app (sin flecha: es una pestaña) */}
      <ScreenHeader title="Mis pedidos" />
      <View style={{ flex: 1 }}>{cuerpo()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: surface.screen },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.sm },
  mensaje: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary, textAlign: 'center' },
  boton: { paddingHorizontal: 28, marginTop: space.sm },
  circulo: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: surface.card,
    borderWidth: 1, borderColor: surface.border, alignItems: 'center', justifyContent: 'center', marginBottom: space.sm,
  },
  vacioTitulo: { fontFamily: fontFamily.bold, fontSize: 18, color: textColors.primary },

  // Barra de filtros
  filtrosBarra: { backgroundColor: surface.card, borderBottomWidth: 1, borderBottomColor: surface.border },
  filtros: { gap: space.sm, paddingHorizontal: space.lg, paddingVertical: space.md },
  filtro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    paddingLeft: 14,
    paddingRight: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: surface.border,
    backgroundColor: surface.card,
  },
filtroActivo: { backgroundColor: brandColors.primary, borderColor: brandColors.primary },
  filtroTexto: { fontFamily: fontFamily.medium, fontSize: 13, color: textColors.primary },
  filtroTextoActivo: { color: '#FFFFFF' },
  contador: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: surface.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contadorActivo: { backgroundColor: 'rgba(255,255,255,0.2)' },
  contadorAlerta: { backgroundColor: brandColors.error },
  contadorTexto: { fontFamily: fontFamily.semibold, fontSize: 11, color: textColors.primary },
  contadorTextoClaro: { color: '#FFFFFF' },

  lista: { padding: space.lg, paddingBottom: space.xl, flexGrow: 1 },
  vacioFiltro: { alignItems: 'center', gap: space.sm, paddingVertical: 48 },
});