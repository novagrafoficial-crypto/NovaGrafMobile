import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import { AdminHeader, BotonHeader, PastillaAdmin, SeccionAdmin } from '@/shared/components/admin';
import { CustomButton } from '@/shared/components/CustomButton';
import { FadeInView } from '@/shared/components/FadeInView';
import { Loading } from '@/shared/components/Loading';
import { PressableScale } from '@/shared/components/PressableScale';
import {
  accionAdmin,
  colorEstado,
  etiquetaEstado,
  formatFecha,
  formatMoney,
  iconoEstado,
} from '@/features/pedidos-admin/utils/pedidoAdminUtils';
import { useDashboardViewModel } from '../viewmodels/useDashboardViewModel';

const ESCALA = 1.15;
const MAX_ATENCION = 5;

type Icono = React.ComponentProps<typeof Ionicons>['name'];

// Tarjeta de indicador (KPI)
const Indicador = ({ icono, valor, etiqueta, color, onPress }: { icono: Icono; valor: string; etiqueta: string; color: string; onPress?: () => void }) => (
  <PressableScale style={styles.kpi} onPress={onPress} disabled={!onPress} scaleTo={0.97}>
    <View style={[styles.kpiIcono, { backgroundColor: color + '1A' }]}>
      <Ionicons name={icono} size={19} color={color} />
    </View>
    <Text style={styles.kpiValor} numberOfLines={1} adjustsFontSizeToFit maxFontSizeMultiplier={ESCALA}>{valor}</Text>
    <Text style={styles.kpiEtiqueta} numberOfLines={1} maxFontSizeMultiplier={ESCALA}>{etiqueta}</Text>
  </PressableScale>
);

export const AdminDashboardView = () => {
  const vm = useDashboardViewModel();

  return (
    <View style={styles.pantalla}>
      <AdminHeader
        titulo={vm.nombre ? `Hola, ${vm.nombre}` : 'Hola'}
        derecha={<BotonHeader icono="notifications-outline" etiqueta="Avisos" contador={vm.noLeidas} onPress={vm.verAvisos} />}
      />

      {vm.cargando ? (
        <Loading fullScreen />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={vm.refrescando} onRefresh={vm.refrescar} tintColor={brandColors.primary} colors={[brandColors.primary]} />
          }
        >
          {!!vm.error && (
            <View style={styles.error}>
              <Ionicons name="cloud-offline-outline" size={22} color={brandColors.error} />
              <Text style={styles.errorTexto}>{vm.error}</Text>
              <CustomButton title="Reintentar" variant="outline" onPress={vm.reintentar} />
            </View>
          )}

          {/* 1. Indicadores */}
          <FadeInView style={styles.kpis}>
            <Indicador icono="alert-circle-outline" valor={String(vm.porAtender.length)} etiqueta="Por atender" color="#B45309" onPress={() => vm.verPedidos()} />
            <Indicador icono="receipt-outline" valor={String(vm.activos)} etiqueta="Pedidos activos" color={brandColors.primary} onPress={() => vm.verPedidos()} />
            <Indicador icono="trending-up-outline" valor={formatMoney(vm.ventasMes)} etiqueta="Ventas del mes" color="#166534" />
            <Indicador icono="people-outline" valor={vm.totalClientes == null ? '—' : String(vm.totalClientes)} etiqueta="Clientes" color="#5B21B6" onPress={vm.verClientes} />
          </FadeInView>

          {/* 2. Lo que necesita al admin */}
          <FadeInView delay={80}>
            <SeccionAdmin
              titulo="Requiere tu atención"
              icono="flash-outline"
              derecha={vm.porAtender.length > MAX_ATENCION ? (
                <PressableScale onPress={() => vm.verPedidos()} hitSlop={8}>
                  <Text style={styles.verTodo}>Ver todos</Text>
                </PressableScale>
              ) : undefined}
            >
              {vm.porAtender.length === 0 ? (
                <View style={styles.vacio}>
                  <Ionicons name="checkmark-done-circle-outline" size={34} color={textColors.muted} />
                  <Text style={styles.vacioTexto}>Todo al día. No hay pedidos esperando una acción tuya.</Text>
                </View>
              ) : (
                vm.porAtender.slice(0, MAX_ATENCION).map((p, i, arr) => {
                  const c = colorEstado(p.estado);
                  return (
                    <PressableScale
                      key={p.id}
                      style={[styles.tarea, i < arr.length - 1 && styles.linea]}
                      onPress={() => vm.abrirPedido(p.id)}
                      scaleTo={0.98}
                    >
                      <View style={[styles.tareaIcono, { backgroundColor: c.bg }]}>
                        <Ionicons name={iconoEstado(p.estado)} size={18} color={c.fg} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tareaTitulo} numberOfLines={1} maxFontSizeMultiplier={ESCALA}>{accionAdmin(p.estado)}</Text>
                        <Text style={styles.tareaSub} numberOfLines={1} maxFontSizeMultiplier={ESCALA}>
                          #{p.id} · {p.cliente_nombre} · {formatFecha(p.fecha_pedido)}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={textColors.muted} />
                    </PressableScale>
                  );
                })
              )}
            </SeccionAdmin>
          </FadeInView>

          {/* 3. Pedidos por etapa */}
          <FadeInView delay={140}>
            <SeccionAdmin titulo="Pedidos por etapa" icono="bar-chart-outline" derecha={`${vm.totalPedidos} en total`}>
              {vm.etapas.map((e) => {
                const c = colorEstado(e.estado);
                return (
                  <PressableScale key={e.estado} style={styles.etapa} onPress={() => vm.verPedidos(e.estado)} scaleTo={0.98}>
                    <View style={styles.etapaFila}>
                      <PastillaAdmin texto={etiquetaEstado(e.estado)} icono={iconoEstado(e.estado)} bg={c.bg} fg={c.fg} />
                      <Text style={styles.etapaNumero} maxFontSizeMultiplier={ESCALA}>{e.cantidad}</Text>
                    </View>
                    <View style={styles.barraFondo}>
                      <View style={[styles.barra, { width: `${(e.cantidad / vm.maximo) * 100}%`, backgroundColor: c.fg }]} />
                    </View>
                  </PressableScale>
                );
              })}
            </SeccionAdmin>
          </FadeInView>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: surface.screen },
  scroll: { padding: space.lg, paddingBottom: 40, gap: space.lg },

  error: { alignItems: 'center', gap: space.sm, padding: space.lg, backgroundColor: surface.card, borderRadius: radius.lg },
  errorTexto: { fontFamily: fontFamily.medium, fontSize: 14, color: textColors.primary, textAlign: 'center' },

  // Indicadores 2 x 2
  kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  kpi: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: surface.card,
    borderRadius: radius.lg,
    padding: space.md,
    gap: 4,
    borderWidth: 1,
    borderColor: surface.border,
  },
  kpiIcono: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  kpiValor: { fontFamily: fontFamily.bold, fontSize: 22, color: textColors.primary },
  kpiEtiqueta: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.secondary },

  verTodo: { fontFamily: fontFamily.semibold, fontSize: 13, color: brandColors.primary },

  vacio: { alignItems: 'center', gap: space.sm, paddingVertical: space.md },
  vacioTexto: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary, textAlign: 'center' },

  tarea: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 10 },
  linea: { borderBottomWidth: 1, borderBottomColor: surface.muted },
  tareaIcono: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tareaTitulo: { fontFamily: fontFamily.semibold, fontSize: 15, color: textColors.primary },
  tareaSub: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.secondary },

  etapa: { gap: 6 },
  etapaFila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  etapaNumero: { fontFamily: fontFamily.bold, fontSize: 15, color: textColors.primary },
  barraFondo: { height: 6, borderRadius: 3, backgroundColor: surface.muted, overflow: 'hidden' },
  barra: { height: 6, borderRadius: 3 },
});
