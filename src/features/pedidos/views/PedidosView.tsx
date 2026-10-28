import React from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePedidosViewModel } from '../viewmodels/usePedidosViewModel';
import { PedidoCard } from '../components/PedidoCard';
import { Header } from '@/shared/components/Header';
import { Loading } from '@/shared/components/Loading';
import { CustomButton } from '@/shared/components/CustomButton';
import { FadeInView } from '@/shared/components/FadeInView';
import { brandColors } from '@/constants/brand';
import { fontSize, fontWeight, surface, textColors } from '@/constants/theme';

export const PedidosView = () => {
  const vm = usePedidosViewModel();

  const cuerpo = () => {
    if (vm.cargando) return <Loading fullScreen />;

    if (vm.error) {
      return (
        <View style={styles.centrado}>
          <Ionicons name="cloud-offline-outline" size={48} color={textColors.muted} style={{ marginBottom: 8 }} />
          <Text style={styles.error}>{vm.error}</Text>
          <CustomButton title="Reintentar" onPress={vm.reintentar} style={styles.boton} />
        </View>
      );
    }

    if (vm.pedidos.length === 0) {
      return (
        <FadeInView style={styles.centrado}>
          <Ionicons name="bag-handle-outline" size={56} color={textColors.muted} style={{ marginBottom: 8 }} />
          <Text style={styles.vacioTitulo}>Aún no tienes pedidos</Text>
          <Text style={styles.vacioTexto}>Cuando hagas tu primera compra aparecerá aquí.</Text>
          <CustomButton title="Ver catálogo" onPress={vm.irAlCatalogo} style={styles.boton} />
        </FadeInView>
      );
    }

    return (
      <FlatList
        data={vm.pedidos}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={styles.lista}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        refreshControl={
          <RefreshControl
            refreshing={vm.refrescando}
            onRefresh={vm.refrescar}
            tintColor={brandColors.primary}
            colors={[brandColors.primary]}
          />
        }
        ListHeaderComponent={
          <View style={styles.encabezado}>
            <Text style={styles.titulo}>Mis pedidos</Text>
            <Text style={styles.subtitulo}>
              {vm.pedidos.length} {vm.pedidos.length === 1 ? 'pedido' : 'pedidos'} · Toca uno para ver su seguimiento
            </Text>
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
    );
  };

  return (
    <View style={styles.pantalla}>
      <Header subtitle="Pedidos" />
      <View style={{ flex: 1 }}>{cuerpo()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: surface.screen },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  error: { fontSize: fontSize.body, color: textColors.secondary, textAlign: 'center', marginBottom: 6 },
  boton: { paddingHorizontal: 28, marginTop: 12 },
  vacioTitulo: { fontSize: fontSize.title, fontWeight: fontWeight.bold, color: textColors.primary },
  vacioTexto: { fontSize: fontSize.body, color: textColors.secondary, marginTop: 4, textAlign: 'center' },
  lista: { padding: 16, paddingBottom: 24 },
  encabezado: { marginBottom: 16 },
  titulo: { fontSize: fontSize.headline, fontWeight: fontWeight.bold, color: textColors.primary },
  subtitulo: { fontSize: fontSize.small, color: textColors.muted, marginTop: 2 },
});