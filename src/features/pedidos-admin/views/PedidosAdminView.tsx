import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { brandColors, brandTints } from '@/constants/brand';
import { CustomButton } from '@/shared/components/CustomButton';
import { FadeInView } from '@/shared/components/FadeInView';
import { Header } from '@/shared/components/Header';
import { Loading } from '@/shared/components/Loading';
import { PressableScale } from '@/shared/components/PressableScale';
import { SelectorOpciones } from '../components/SelectorOpciones';
import { usePedidosAdminViewModel } from '../viewmodels/usePedidosAdminViewModel';
import { colorEstado, etiquetaEstado, formatFecha, formatMoney } from '../utils/pedidoAdminUtils';
import type { PedidoResumen } from '../models/PedidoAdmin';

const EstadoBadge = ({ estado }: { estado: string }) => {
  const c = colorEstado(estado);
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeTxt, { color: c.fg }]}>{etiquetaEstado(estado)}</Text>
    </View>
  );
};

const PedidoCard = ({ pedido, onPress }: { pedido: PedidoResumen; onPress: () => void }) => (
  <PressableScale style={styles.card} onPress={onPress} accessibilityRole="button">
    <View style={styles.cardFila}>
      <Text style={styles.cardId}>Pedido #{pedido.id}</Text>
      <Text style={styles.cardTotal}>{formatMoney(pedido.total_general)}</Text>
    </View>
    <Text style={styles.cardCliente} numberOfLines={1}>{pedido.cliente_nombre}</Text>
    <View style={[styles.cardFila, { marginTop: 8 }]}>
      <Text style={styles.cardFecha}>{formatFecha(pedido.fecha_pedido)}</Text>
      <EstadoBadge estado={pedido.estado} />
    </View>
  </PressableScale>
);

export const PedidosAdminView = () => {
  const vm = usePedidosAdminViewModel();
  const hayFiltros = !!vm.busqueda || vm.filtro !== 'TODOS';

  return (
    <View style={styles.pantalla}>
      <Header subtitle="Pedidos" />

      <View style={styles.controles}>
        <TextInput
          style={styles.input}
          placeholder="Buscar por #pedido, cliente o correo..."
          placeholderTextColor={brandTints.textMuted}
          value={vm.busqueda}
          onChangeText={vm.setBusqueda}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />

        <View style={styles.combos}>
          <SelectorOpciones
            titulo="Estado"
            opciones={vm.opcionesEstado}
            valor={vm.filtro}
            onChange={vm.setFiltro}
          />
          <SelectorOpciones
            titulo="Ordenar por"
            opciones={vm.opcionesOrden}
            valor={vm.orden}
            onChange={vm.setOrden}
          />
        </View>

        {!vm.cargando && !vm.error && (
          <Text style={styles.conteo}>
            {vm.pedidosFiltrados.length} de {vm.pedidos.length} pedidos
          </Text>
        )}
      </View>

      {vm.cargando ? (
        <Loading fullScreen />
      ) : (
        <FlatList
          data={vm.pedidosFiltrados}
          keyExtractor={(p) => String(p.id)}
          renderItem={({ item }) => <PedidoCard pedido={item} onPress={() => vm.abrirPedido(item.id)} />}
          contentContainerStyle={styles.lista}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={vm.refrescando}
              onRefresh={vm.refrescar}
              tintColor={brandColors.primary}
              colors={[brandColors.primary]}
            />
          }
          ListHeaderComponent={
            vm.error ? (
              <FadeInView style={styles.errorBox}>
                <Text style={styles.errorTxt}>{vm.error}</Text>
                <CustomButton title="Reintentar" variant="outline" onPress={vm.reintentar} />
              </FadeInView>
            ) : null
          }
          ListEmptyComponent={
            vm.error ? null : (
              <Text style={styles.vacio}>
                {hayFiltros ? 'Ningún pedido coincide con tu búsqueda.' : 'Aún no hay pedidos registrados.'}
              </Text>
            )
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: brandColors.background },

  controles: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6, gap: 10 },
  input: {
    backgroundColor: brandColors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: brandColors.primaryDark,
    borderWidth: 1,
    borderColor: brandTints.border,
  },
  combos: { flexDirection: 'row', gap: 10 },
  conteo: { fontSize: 12, color: brandTints.textMuted, marginLeft: 4 },

  lista: { padding: 16, paddingTop: 8, paddingBottom: 32, gap: 10 },
  vacio: { textAlign: 'center', color: brandTints.textMuted, paddingVertical: 32 },

  card: { backgroundColor: brandColors.white, borderRadius: 16, padding: 14 },
  cardFila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardId: { fontSize: 15, fontWeight: '800', color: brandColors.primaryDark },
  cardTotal: { fontSize: 15, fontWeight: '800', color: brandColors.primary },
  cardCliente: { fontSize: 13, color: brandTints.textMuted, marginTop: 2 },
  cardFecha: { fontSize: 12, color: brandTints.textMuted },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeTxt: { fontSize: 11, fontWeight: '800' },

  errorBox: { backgroundColor: brandTints.errorSoft, borderRadius: 12, padding: 12, marginBottom: 10, gap: 10 },
  errorTxt: { color: brandColors.error, fontWeight: '600', textAlign: 'center' },
});
