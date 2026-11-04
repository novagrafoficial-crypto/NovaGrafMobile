import React, { useState } from 'react';
import { LayoutAnimation, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { FadeInView } from '@/shared/components/FadeInView';
import { PressableScale } from '@/shared/components/PressableScale';
import { CORREO_PRIVACIDAD, FECHA_ACTUALIZACION, POLITICA_PRIVACIDAD } from '../constants/avisoPrivacidad';
import { usePoliticasViewModel } from '../viewmodels/usePoliticasViewModel';

const ESCALA = 1.15;

export const PoliticasView = () => {
  const vm = usePoliticasViewModel();
  // Secciones que se abren y cierran 
  const [abiertas, setAbiertas] = useState<Record<number, boolean>>({ 0: true });
  const alternar = (i: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAbiertas((a) => ({ ...a, [i]: !a[i] }));
  };

  return (
    <View style={styles.pantalla}>
      <ScreenHeader title="Políticas y privacidad" onBack={vm.volver} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <FadeInView style={styles.intro}>
          <View style={styles.introIcono}>
            <Ionicons name="lock-closed-outline" size={22} color={brandColors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.introTitulo} maxFontSizeMultiplier={ESCALA}>Política de Privacidad</Text>
            <Text style={styles.sub} maxFontSizeMultiplier={ESCALA}>Nova Graf Mobile · Actualizada el {FECHA_ACTUALIZACION}</Text>
          </View>
        </FadeInView>

        {/* Secciones de la política (mismo texto que la página web /privacidad) */}
        <View style={styles.card}>
          {POLITICA_PRIVACIDAD.map((s, i) => {
            const abierta = !!abiertas[i];
            return (
              <View key={s.titulo} style={[styles.seccion, i < POLITICA_PRIVACIDAD.length - 1 && styles.linea]}>
                <PressableScale style={styles.seccionCabecera} onPress={() => alternar(i)} scaleTo={0.99}>
                  <View style={styles.icono}>
                    <Ionicons name={s.icono as any} size={17} color={brandColors.primary} />
                  </View>
                  <Text style={styles.seccionTitulo} maxFontSizeMultiplier={ESCALA}>{s.titulo}</Text>
                  <Ionicons name={abierta ? 'chevron-up' : 'chevron-down'} size={18} color={textColors.muted} />
                </PressableScale>

                {abierta && (
                  <View style={styles.seccionCuerpo}>
                    {s.bloques.map((b, j) =>
                      b.t === 'p' ? (
                        <Text key={j} style={styles.parrafo} maxFontSizeMultiplier={ESCALA}>{b.x}</Text>
                      ) : (
                        <View key={j} style={styles.punto}>
                          <View style={styles.vineta} />
                          <Text style={styles.parrafo} maxFontSizeMultiplier={ESCALA}>{b.x}</Text>
                        </View>
                      )
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Políticas de la tienda que captura el admin en la web (si hay) */}
        {vm.politicas.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.introTitulo} maxFontSizeMultiplier={ESCALA}>Políticas de la tienda</Text>
            {vm.politicas.map((p, i) => (
              <View key={p.id} style={styles.punto}>
                <Text style={styles.numero} maxFontSizeMultiplier={1}>{i + 1}.</Text>
                <Text style={styles.parrafo} maxFontSizeMultiplier={ESCALA}>{p.descripcion}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.contacto} maxFontSizeMultiplier={ESCALA}>Dudas sobre tus datos: {CORREO_PRIVACIDAD}</Text>

        {/* Eliminar cuenta */}
        <PressableScale style={styles.eliminar} onPress={vm.irAEliminar} scaleTo={0.98}>
          <View style={[styles.icono, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="trash-outline" size={17} color={brandColors.error} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.seccionTitulo} maxFontSizeMultiplier={ESCALA}>Eliminar mi cuenta</Text>
            <Text style={styles.sub} maxFontSizeMultiplier={ESCALA}>Solicita que borremos tus datos personales</Text>
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
  intro: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  introIcono: { width: 46, height: 46, borderRadius: 14, backgroundColor: '#E6F2EF', alignItems: 'center', justifyContent: 'center' },
  introTitulo: { fontFamily: fontFamily.bold, fontSize: 18, color: textColors.primary },
  sub: { fontFamily: fontFamily.regular, fontSize: 12, color: textColors.muted },
  card: { backgroundColor: surface.card, borderRadius: radius.lg, paddingHorizontal: space.lg, paddingVertical: space.xs, borderWidth: 1, borderColor: surface.border, gap: space.sm },
  seccion: { paddingVertical: space.sm },
  linea: { borderBottomWidth: 1, borderBottomColor: surface.muted },
  seccionCabecera: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 4 },
  icono: { width: 32, height: 32, borderRadius: 9, backgroundColor: '#E6F2EF', alignItems: 'center', justifyContent: 'center' },
  seccionTitulo: { flex: 1, fontFamily: fontFamily.semibold, fontSize: 15, color: textColors.primary },
  seccionCuerpo: { gap: 6, paddingTop: space.sm, paddingLeft: 4 },
  parrafo: { flex: 1, fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 21, color: textColors.secondary },
  punto: { flexDirection: 'row', gap: space.sm },
  vineta: { width: 5, height: 5, borderRadius: 3, backgroundColor: brandColors.primary, marginTop: 8 },
  numero: { fontFamily: fontFamily.semibold, fontSize: 14, color: textColors.primary, lineHeight: 21 },
  contacto: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.secondary, textAlign: 'center' },
  eliminar: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderRadius: radius.lg, backgroundColor: surface.card, borderWidth: 1, borderColor: surface.border },
});