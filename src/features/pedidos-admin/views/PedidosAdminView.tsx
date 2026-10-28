import React from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import { AdminHeader, BotonHeader, PastillaAdmin } from '@/shared/components/admin';
import { CustomButton } from '@/shared/components/CustomButton';
import { Loading } from '@/shared/components/Loading';
import { PressableScale } from '@/shared/components/PressableScale';
import { usePedidosAdminViewModel } from '../viewmodels/usePedidosAdminViewModel';
import { accionAdmin, colorEstado, etiquetaEstado, formatFecha, formatMoney, iconoEstado } from '../utils/pedidoAdminUtils';
import type { PedidoResumen } from '../models/PedidoAdmin';

const ESCALA = 1.15;

// Fila de pedido: barra de color del estado a la izquierda, datos y total.
const PedidoFila = ({ pedido, onPress }: { pedido: PedidoResumen; onPress: () => void }) => {
  const c = colorEstado(pedido.estado);
  const accion = accionAdmin(pedido.estado);
  return (
    <PressableScale style={styles.card} onPress={onPress} scaleTo={0.98} accessibilityRole="button">
      <View style={[styles.barraEstado, { backgroundColor: c.fg }]} />
      <View style={styles.cardCuerpo}>
        <View style={styles.cardFila}>
          <Text style={styles.cardId} maxFontSizeMultiplier={ESCALA}>#{pedido.id}</Text>
          <Text style={styles.cardTotal} maxFontSizeMultiplier={ESCALA}>{formatMoney(pedido.total_general)}</Text>
        </View>
        <View style={styles.cardFila}>
          <View style={styles.cliente}>
            <Ionicons name="person-outline" size={14} color={textColors.secondary} />
            <Text style={styles.clienteTexto} numberOfLines={1} maxFontSizeMultiplier={ESCALA}>{pedido.cliente_nombre}</Text>
          </View>
          <Text style={styles.fecha} maxFontSizeMultiplier={ESCALA}>{formatFecha(pedido.fecha_pedido)}</Text>
        </View>
        <View style={styles.cardFila}>
          <PastillaAdmin texto={etiquetaEstado(pedido.estado)} icono={iconoEstado(pedido.estado)} bg={c.bg} fg={c.fg} />
          {!!accion && (
            <View style={styles.accion}>
              <Ionicons name="flash" size={12} color="#B45309" />
              <Text style={styles.accionTexto} maxFontSizeMultiplier={ESCALA}>Te toca</Text>
            </View>
          )}
        </View>
      </View>
    </PressableScale>
  );
};

export const PedidosAdminView = () => {
  const vm = usePedidosAdminViewModel();
  const hayFiltros = !!vm.busqueda || vm.filtro !== 'TODOS';

  return (
    <View style={styles.pantalla}>
      <AdminHeader
        titulo="Pedidos"
        derecha={
          <BotonHeader
            icono={vm.orden === 'RECIENTES' ? 'arrow-down-outline' : 'arrow-up-outline'}
            etiqueta={vm.orden === 'RECIENTES' ? 'Más recientes primero' : 'Más antiguos primero'}
            onPress={vm.alternarOrden}
          />
        }
      >
        {/* Buscador dentro del encabezado verde */}
        <View style={styles.buscador}>
          <Ionicons name="search-outline" size={18} color={textColors.muted} />
          <TextInput
            style={styles.input}
            placeholder="Buscar #pedido, cliente o correo"
            placeholderTextColor={textColors.muted}
            value={vm.busqueda}
            onChangeText={vm.setBusqueda}
            autoCapitalize="none"
            autoCorrect={false}
            maxFontSizeMultiplier={ESCALA}
          />
          {!!vm.busqueda && (
            <PressableScale onPress={() => vm.setBusqueda('')} hitSlop={8} accessibilityLabel="Borrar búsqueda">
              <Ionicons name="close-circle" size={18} color={textColors.muted} />
            </PressableScale>
          )}
        </View>
      </AdminHeader>

      {/* Chips de estado con cantidad */}
      <View style={styles.chipsBarra}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {vm.opcionesEstado.map((o) => {
            const activo = vm.filtro === o.valor;
            return (
              <PressableScale
                key={o.valor}
                style={[styles.chip, activo && styles.chipActivo]}
                onPress={() => vm.setFiltro(o.valor)}
                scaleTo={0.95}
                accessibilityRole="tab"
                accessibilityState={{ selected: activo }}
              >
                {o.valor === 'ATENDER' && <Ionicons name="flash" size={13} color={activo ? '#FFFFFF' : '#B45309'} />}
                <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]} maxFontSizeMultiplier={ESCALA}>{o.etiqueta}</Text>
                <View style={[styles.chipNumero, activo && styles.chipNumeroActivo]}>
                  <Text style={[styles.chipNumeroTexto, activo && { color: '#FFFFFF' }]} maxFontSizeMultiplier={1}>{o.cantidad}</Text>
                </View>
              </PressableScale>
            );
          })}
        </ScrollView>
      </View>

      {vm.cargando ? (
        <Loading fullScreen />
      ) : (
        <FlatList
          data={vm.pedidosFiltrados}
          keyExtractor={(p) => String(p.id)}
          renderItem={({ item }) => <PedidoFila pedido={item} onPress={() => vm.abrirPedido(item.id)} />}
          contentContainerStyle={styles.lista}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={vm.refrescando} onRefresh={vm.refrescar} tintColor={brandColors.primary} colors={[brandColors.primary]} />
          }
          ListHeaderComponent={
            vm.error ? (
              <View style={styles.error}>
                <Ionicons name="cloud-offline-outline" size={22} color={brandColors.error} />
                <Text style={styles.errorTexto}>{vm.error}</Text>
                <CustomButton title="Reintentar" variant="outline" onPress={vm.reintentar} />
              </View>
            ) : (
              <Text style={styles.conteo} maxFontSizeMultiplier={ESCALA}>
                {vm.pedidosFiltrados.length} {vm.pedidosFiltrados.length === 1 ? 'pedido' : 'pedidos'}
                {vm.orden === 'RECIENTES' ? ' · más recientes primero' : ' · más antiguos primero'}
              </Text>
            )
          }
          ListEmptyComponent={
            vm.error ? null : (
              <View style={styles.vacio}>
                <Ionicons name="file-tray-outline" size={40} color={textColors.muted} />
                <Text style={styles.vacioTexto} maxFontSizeMultiplier={ESCALA}>
                  {hayFiltros ? 'Ningún pedido coincide con el filtro.' : 'Aún no hay pedidos.'}
                </Text>
                {hayFiltros && <CustomButton title="Quitar filtros" variant="outline" onPress={vm.limpiarFiltros} />}
              </View>
            )
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: surface.screen },

  buscador: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: surface.card,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
  },
  input: { flex: 1, height: '100%', fontFamily: fontFamily.regular, fontSize: 14, color: textColors.primary, paddingVertical: 0 },

  chipsBarra: { backgroundColor: surface.card, borderBottomWidth: 1, borderBottomColor: surface.border },
  chips: { gap: space.sm, paddingHorizontal: space.lg, paddingVertical: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: surface.border,
    backgroundColor: surface.card,
  },
  chipActivo: { backgroundColor: brandColors.primary, borderColor: brandColors.primary },
  chipTexto: { fontFamily: fontFamily.medium, fontSize: 13, color: textColors.primary },
  chipTextoActivo: { color: '#FFFFFF' },
  chipNumero: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5, backgroundColor: surface.muted, alignItems: 'center', justifyContent: 'center' },
  chipNumeroActivo: { backgroundColor: 'rgba(255,255,255,0.25)' },
  chipNumeroTexto: { fontFamily: fontFamily.semibold, fontSize: 11, color: textColors.secondary },

  lista: { padding: space.lg, paddingBottom: 40, gap: space.sm, flexGrow: 1 },
  conteo: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.muted, marginBottom: 2 },

  card: {
    flexDirection: 'row',
    backgroundColor: surface.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: surface.border,
    overflow: 'hidden',
  },
  barraEstado: { width: 4 },
  cardCuerpo: { flex: 1, padding: space.md, gap: 6 },
  cardFila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  cardId: { fontFamily: fontFamily.bold, fontSize: 16, color: textColors.primary },
  cardTotal: { fontFamily: fontFamily.bold, fontSize: 16, color: textColors.primary },
  cliente: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  clienteTexto: { flex: 1, fontFamily: fontFamily.medium, fontSize: 14, color: textColors.secondary },
  fecha: { fontFamily: fontFamily.regular, fontSize: 12, color: textColors.muted },
  accion: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  accionTexto: { fontFamily: fontFamily.semibold, fontSize: 12, color: '#B45309' },

  error: { alignItems: 'center', gap: space.sm, padding: space.lg, backgroundColor: surface.card, borderRadius: radius.lg, marginBottom: space.sm },
  errorTexto: { fontFamily: fontFamily.medium, fontSize: 14, color: textColors.primary, textAlign: 'center' },
  vacio: { alignItems: 'center', gap: space.sm, paddingTop: 48 },
  vacioTexto: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary, textAlign: 'center' },
});
