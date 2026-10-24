import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useDisenoPedidoViewModel } from '../viewmodels/useDisenoPedidoViewModel';
import { DisenoProductoCard } from '../components/DisenoProductoCard';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { Loading } from '@/shared/components/Loading';
import { CustomButton } from '@/shared/components/CustomButton';
import { folioDe } from '@/shared/utils/format';
import { brandColors, brandTints } from '@/constants/brand';

export const DisenoPedidoView = ({ pedidoId }: { pedidoId: number }) => {
  const vm = useDisenoPedidoViewModel(pedidoId);
  const p = vm.pedido;

  const cuerpo = () => {
    if (vm.cargando) return <Loading fullScreen />;

    if (vm.error || !p) {
      return (
        <View style={styles.centrado}>
          <Text style={styles.error}>{vm.error ?? 'Pedido no encontrado'}</Text>
          <CustomButton title="Reintentar" onPress={vm.reintentar} style={{ marginTop: 12 }} />
        </View>
      );
    }

    if (vm.enviado) {
      return (
        <View style={styles.centrado}>
          <Text style={styles.icono}>✅</Text>
          <Text style={styles.titulo}>¡Diseños enviados!</Text>
          <Text style={styles.texto}>El administrador revisará tus diseños y te avisará cuando tengas una previa.</Text>
          <CustomButton title="Ver mi pedido" onPress={vm.verPedido} style={{ marginTop: 16, paddingHorizontal: 28 }} />
        </View>
      );
    }

    if (!vm.puedeSubir) {
      return (
        <View style={styles.centrado}>
          <Text style={styles.icono}>🎨</Text>
          <Text style={styles.titulo}>Este pedido no está en etapa de diseño</Text>
          <Text style={styles.texto}>Podrás subir tus diseños cuando tu pago sea verificado.</Text>
          <CustomButton title="Volver al pedido" onPress={vm.verPedido} style={{ marginTop: 16, paddingHorizontal: 28 }} />
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>
          Sube el diseño de cada producto de tu pedido (logo, imagen o boceto). Te faltan {vm.total - vm.listos} de {vm.total}.
        </Text>

        {p.detalles.map((d) => (
          <DisenoProductoCard
            key={d.variante_id}
            producto={d}
            archivo={vm.archivos[d.variante_id] ?? null}
            notas={vm.notas[d.variante_id] ?? ''}
            onNotas={(t) => vm.cambiarNotas(d.variante_id, t)}
            onGaleria={() => vm.desdeGaleria(d.variante_id)}
            onArchivo={() => vm.desdeArchivo(d.variante_id)}
            onQuitar={() => vm.quitar(d.variante_id)}
          />
        ))}

        {!!vm.errorEnvio && <Text style={styles.error}>{vm.errorEnvio}</Text>}
      </ScrollView>
    );
  };

  const mostrarBoton = !!p && vm.puedeSubir && !vm.enviado && !vm.cargando && !vm.error;

  return (
    <View style={styles.pantalla}>
      <ScreenHeader title={p ? `Diseños · ${folioDe(p.id)}` : 'Diseños'} onBack={vm.volver} />
      <View style={{ flex: 1 }}>{cuerpo()}</View>

      {mostrarBoton && (
        <View style={styles.barra}>
          <CustomButton
            title={vm.enviando ? 'Enviando…' : `📤 Enviar diseños (${vm.listos}/${vm.total})`}
            onPress={vm.enviar}
            disabled={!vm.completo || vm.enviando}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: brandColors.background },
  scroll: { padding: 16, paddingBottom: 28, gap: 14 },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  intro: { fontSize: 13, color: brandTints.textMuted },
  icono: { fontSize: 40, marginBottom: 8 },
  titulo: { fontSize: 18, fontWeight: '800', color: brandColors.primaryDark, textAlign: 'center' },
  texto: { fontSize: 14, color: brandTints.textMuted, marginTop: 6, textAlign: 'center' },
  error: { color: brandColors.error, textAlign: 'center', fontWeight: '500' },
  barra: { backgroundColor: brandColors.white, padding: 14, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
});