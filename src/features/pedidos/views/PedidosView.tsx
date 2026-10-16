import React from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { usePedidosViewModel } from '../viewmodels/usePedidosViewModel';
import { PedidoCard } from '../components/PedidoCard';
import { Header } from '@/shared/components/Header';
import { Loading } from '@/shared/components/Loading';
import { CustomButton } from '@/shared/components/CustomButton';
import { FadeInView } from '@/shared/components/FadeInView';
import { brandColors, brandTints } from '@/constants/brand';

export const PedidosView = () => {
  const vm = usePedidosViewModel();

  const cuerpo = () => {
    if (vm.cargando) return <Loading fullScreen />;

    if (vm.error) {
      return (
        <View style={styles.centrado}>
          <Text style={styles.error}>{vm.error}</Text>
          <CustomButton title="Reintentar" onPress={vm.reintentar} style={styles.boton} />
        </View>
      );
    }

    if (vm.pedidos.length === 0) {
      return (
        <FadeInView style={styles.centrado}>
          <Text style={styles.vacioIcono}>📋</Text>
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
        ListHeaderComponent={<Text style={styles.titulo}>Mis pedidos ({vm.pedidos.length})</Text>}
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
  pantalla: { flex: 1, backgroundColor: brandColors.background },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  error: { color: brandColors.error, textAlign: 'center', fontWeight: '500', marginBottom: 14 },
  boton: { paddingHorizontal: 28, marginTop: 12 },
  vacioIcono: { fontSize: 40, marginBottom: 8 },
  vacioTitulo: { fontSize: 18, fontWeight: '800', color: brandColors.primaryDark },
  vacioTexto: { fontSize: 14, color: brandTints.textMuted, marginTop: 4, textAlign: 'center' },
  lista: { padding: 16, paddingBottom: 24 },
  titulo: { fontSize: 18, fontWeight: '800', color: brandColors.primaryDark, marginBottom: 12 },
});