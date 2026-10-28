import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { FadeInView } from '@/shared/components/FadeInView';
import { PressableScale } from '@/shared/components/PressableScale';
import { AVISO_PRIVACIDAD, FECHA_ACTUALIZACION } from '../constants/avisoPrivacidad';
import { usePoliticasViewModel } from '../viewmodels/usePoliticasViewModel';

const ESCALA = 1.15;

export const PoliticasView = () => {
  const vm = usePoliticasViewModel();

  return (
    <View style={styles.pantalla}>
      <ScreenHeader title="Políticas y privacidad" onBack={vm.volver} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 1. Aviso de privacidad (texto fijo, lo pide Google Play) */}
        <FadeInView style={styles.card}>
          <View style={styles.encabezado}>
            <View style={styles.icono}>
              <Ionicons name="lock-closed-outline" size={18} color={brandColors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.titulo} maxFontSizeMultiplier={ESCALA}>Aviso de privacidad</Text>
              <Text style={styles.fecha} maxFontSizeMultiplier={ESCALA}>Actualizado el {FECHA_ACTUALIZACION}</Text>
            </View>
          </View>

          {AVISO_PRIVACIDAD.map((s) => (
            <View key={s.titulo} style={styles.bloque}>
              <View style={styles.bloqueFila}>
                <Ionicons name={s.icono as any} size={17} color={textColors.primary} />
                <Text style={styles.bloqueTitulo} maxFontSizeMultiplier={ESCALA}>{s.titulo}</Text>
              </View>
              {s.puntos.map((p) => (
                <View key={p} style={styles.punto}>
                  <View style={styles.vineta} />
                  <Text style={styles.puntoTexto} maxFontSizeMultiplier={ESCALA}>{p}</Text>
                </View>
              ))}
            </View>
          ))}
        </FadeInView>

        {/* 2. Políticas de la empresa (las captura el admin en la web) */}
        {vm.politicas.length > 0 && (
          <FadeInView delay={80} style={styles.card}>
            <View style={styles.encabezado}>
              <View style={styles.icono}>
                <Ionicons name="document-text-outline" size={18} color={brandColors.primary} />
              </View>
              <Text style={[styles.titulo, { flex: 1 }]} maxFontSizeMultiplier={ESCALA}>Políticas de Nova Graf</Text>
            </View>
            {vm.politicas.map((p, i) => (
              <View key={p.id} style={[styles.politica, i < vm.politicas.length - 1 && styles.linea]}>
                <View style={styles.numero}>
                  <Text style={styles.numeroTexto} maxFontSizeMultiplier={1}>{i + 1}</Text>
                </View>
                <Text style={styles.puntoTexto} maxFontSizeMultiplier={ESCALA}>{p.descripcion}</Text>
              </View>
            ))}
          </FadeInView>
        )}

        {/* 3. Eliminar cuenta */}
        <PressableScale style={styles.eliminar} onPress={vm.irAEliminar} scaleTo={0.98}>
          <View style={[styles.icono, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="trash-outline" size={18} color={brandColors.error} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bloqueTitulo} maxFontSizeMultiplier={ESCALA}>Eliminar mi cuenta</Text>
            <Text style={styles.fecha} maxFontSizeMultiplier={ESCALA}>Solicita que borremos tu cuenta y tus datos</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={textColors.muted} />
        </PressableScale>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: surface.screen },
  scroll: { padding: space.lg, gap: space.lg, paddingBottom: 40 },
  card: { backgroundColor: surface.card, borderRadius: radius.lg, padding: space.lg, gap: space.md, borderWidth: 1, borderColor: surface.border },
  encabezado: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  icono: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#E6F2EF', alignItems: 'center', justifyContent: 'center' },
  titulo: { fontFamily: fontFamily.bold, fontSize: 17, color: textColors.primary },
  fecha: { fontFamily: fontFamily.regular, fontSize: 12, color: textColors.muted },
  bloque: { gap: 6 },
  bloqueFila: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  bloqueTitulo: { fontFamily: fontFamily.semibold, fontSize: 15, color: textColors.primary },
  punto: { flexDirection: 'row', gap: space.sm, paddingLeft: 4 },
  vineta: { width: 5, height: 5, borderRadius: 3, backgroundColor: brandColors.primary, marginTop: 8 },
  puntoTexto: { flex: 1, fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 21, color: textColors.secondary },
  politica: { flexDirection: 'row', gap: space.md, paddingVertical: space.sm },
  linea: { borderBottomWidth: 1, borderBottomColor: surface.muted },
  numero: { width: 24, height: 24, borderRadius: 12, backgroundColor: surface.muted, alignItems: 'center', justifyContent: 'center' },
  numeroTexto: { fontFamily: fontFamily.semibold, fontSize: 12, color: textColors.primary },
  eliminar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: surface.card,
    borderWidth: 1,
    borderColor: surface.border,
  },
});
