import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDisenoPedidoViewModel } from '../viewmodels/useDisenoPedidoViewModel';
import { DisenoProductoCard } from '../components/DisenoProductoCard';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { Loading } from '@/shared/components/Loading';
import { CustomButton } from '@/shared/components/CustomButton';
import { FadeInView } from '@/shared/components/FadeInView';
import { PressableScale } from '@/shared/components/PressableScale';
import { folioDe } from '@/shared/utils/format';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';

const ESCALA = 1.15;

export const DisenoPedidoView = ({ pedidoId }: { pedidoId: number }) => {
  const vm = useDisenoPedidoViewModel(pedidoId);
  const insets = useSafeAreaInsets();
  const p = vm.pedido;

  const cuerpo = () => {
    if (vm.cargando) return <Loading fullScreen />;

    if (vm.error || !p) {
      return (
        <View style={styles.centrado}>
          <Ionicons name="cloud-offline-outline" size={40} color={textColors.muted} />
          <Text style={styles.texto}>{vm.error ?? 'Pedido no encontrado'}</Text>
          <CustomButton title="Reintentar" variant="outline" onPress={vm.reintentar} style={styles.botonAncho} />
        </View>
      );
    }

    // Ya se enviaron
    if (vm.enviado) {
      return (
        <FadeInView style={styles.centrado}>
          <View style={[styles.circulo, styles.circuloOk]}>
            <Ionicons name="checkmark" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.titulo} maxFontSizeMultiplier={ESCALA}>Diseños enviados</Text>
          <Text style={styles.texto} maxFontSizeMultiplier={ESCALA}>Te avisaremos cuando tu previa esté lista.</Text>
          <CustomButton title="Ver mi pedido" onPress={vm.verPedido} style={styles.botonAncho} />
        </FadeInView>
      );
    }

    // Todavía no está en etapa de diseño
    if (!vm.puedeSubir) {
      return (
        <View style={styles.centrado}>
          <View style={styles.circulo}>
            <Ionicons name="lock-closed-outline" size={36} color={textColors.primary} />
          </View>
          <Text style={styles.titulo} maxFontSizeMultiplier={ESCALA}>Aún no puedes subir diseños</Text>
          <Text style={styles.texto} maxFontSizeMultiplier={ESCALA}>Se habilita cuando confirmemos tu anticipo.</Text>
          <CustomButton title="Volver al pedido" variant="outline" onPress={vm.verPedido} style={styles.botonAncho} />
        </View>
      );
    }

    const progreso = vm.total > 0 ? vm.listos / vm.total : 0;

    return (
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Avance: cuántos productos ya tienen su diseño */}
        <View style={styles.avance}>
          <View style={styles.avanceFila}>
            <Text style={styles.avanceTitulo} maxFontSizeMultiplier={ESCALA}>Tus diseños</Text>
            <Text style={styles.avanceContador} maxFontSizeMultiplier={ESCALA}>{vm.listos} de {vm.total} listos</Text>
          </View>
          <View style={styles.pista}>
            <View style={[styles.relleno, { width: `${Math.round(progreso * 100)}%` }]} />
          </View>
        </View>

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

        {!!vm.errorEnvio && (
          <View style={styles.error}>
            <Ionicons name="alert-circle-outline" size={18} color={brandColors.error} />
            <Text style={styles.errorTexto} maxFontSizeMultiplier={ESCALA}>{vm.errorEnvio}</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const mostrarBoton = !!p && vm.puedeSubir && !vm.enviado && !vm.cargando && !vm.error;
  const desactivado = !vm.completo || vm.enviando;

  return (
    <View style={styles.pantalla}>
      <ScreenHeader title={p ? `Diseños · ${folioDe(p.id)}` : 'Diseños'} onBack={vm.volver} />
      <View style={{ flex: 1 }}>{cuerpo()}</View>

      {mostrarBoton && (
        <View style={[styles.barra, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
          <PressableScale
            style={[styles.boton, desactivado && styles.botonOff]}
            onPress={vm.enviar}
            disabled={desactivado}
            scaleTo={0.97}
            accessibilityRole="button"
          >
            <Ionicons name={vm.enviando ? 'hourglass-outline' : 'cloud-upload-outline'} size={20} color="#FFFFFF" />
            <Text style={styles.botonTexto} maxFontSizeMultiplier={ESCALA}>
              {vm.enviando ? 'Enviando…' : vm.completo ? 'Enviar diseños' : `Faltan ${vm.total - vm.listos} por subir`}
            </Text>
          </PressableScale>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: surface.screen },
  scroll: { padding: space.lg, paddingBottom: space.xl, gap: space.md },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.sm },
  botonAncho: { paddingHorizontal: 28, marginTop: space.sm },

  circulo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: surface.card,
    borderWidth: 1,
    borderColor: surface.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  circuloOk: { backgroundColor: brandColors.accent, borderColor: brandColors.accent },
  titulo: { fontFamily: fontFamily.bold, fontSize: 20, color: textColors.primary, textAlign: 'center' },
  texto: { fontFamily: fontFamily.regular, fontSize: 15, color: textColors.secondary, textAlign: 'center' },

  // Avance
  avance: {
    backgroundColor: surface.card,
    borderRadius: radius.lg,
    padding: space.lg,
    gap: space.sm,
    borderWidth: 1,
    borderColor: surface.border,
  },
  avanceFila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  avanceTitulo: { fontFamily: fontFamily.bold, fontSize: 18, color: textColors.primary },
  avanceContador: { fontFamily: fontFamily.medium, fontSize: 14, color: textColors.secondary },
  pista: { height: 8, borderRadius: radius.pill, backgroundColor: surface.muted, overflow: 'hidden' },
  relleno: { height: '100%', borderRadius: radius.pill, backgroundColor: brandColors.accent },

  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: '#FEF2F2',
    borderRadius: radius.md,
    padding: space.md,
  },
  errorTexto: { flex: 1, fontFamily: fontFamily.medium, fontSize: 14, color: brandColors.error },

  barra: {
    backgroundColor: surface.card,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: surface.border,
  },
  boton: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: brandColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  botonOff: { opacity: 0.5 },
  botonTexto: { fontFamily: fontFamily.semibold, fontSize: 16, color: '#FFFFFF' },
});