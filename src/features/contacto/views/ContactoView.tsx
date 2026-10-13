import React from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useContactoViewModel } from '../viewmodels/useContactoViewModel';
import { QuickAction } from '../components/QuickAction';
import { InfoCard } from '../components/InfoCard';
import { ContactRow } from '../components/ContactRow';
import { SocialChip } from '../components/SocialChip';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { Loading } from '@/shared/components/Loading';
import { CustomButton } from '@/shared/components/CustomButton';
import { FadeInView } from '@/shared/components/FadeInView';
import { PulseView } from '@/shared/components/PulseView';
import { brandColors, brandTints } from '@/constants/brand';

export const ContactoView = () => {
  const vm = useContactoViewModel();

  return (
    <View style={styles.pantalla}>
      <ScreenHeader title="Contacto" onBack={vm.regresar} />

      {vm.aviso && (
        <FadeInView distance={-10} duration={250} style={styles.toast}>
          <Text style={styles.toastTexto}>{vm.aviso}</Text>
        </FadeInView>
      )}

      {vm.loading ? (
        <Loading fullScreen />
      ) : vm.error ? (
        <View style={styles.centrado}>
          <Text style={styles.error}>{vm.error}</Text>
          <CustomButton title="Reintentar" onPress={vm.reintentar} style={styles.botonAncho} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={vm.refrescando}
              onRefresh={vm.refrescar}
              tintColor={brandColors.primary}
              colors={[brandColors.primary]}
            />
          }
        >
          {/* HERO con círculos que "respiran" y botones de acción rápida */}
          <View style={styles.hero}>
            <PulseView style={styles.circuloGrande} scaleTo={1.18} duration={2200} />
            <PulseView style={styles.circuloChico} scaleTo={1.3} duration={1600} />

            <FadeInView>
              <Text style={styles.heroTitulo}>Contáctanos</Text>
              <Text style={styles.heroTexto}>Estamos aquí para ayudarte a materializar tus ideas.</Text>
            </FadeInView>

            {vm.acciones.length > 0 && (
              <View style={styles.acciones}>
                {vm.acciones.map((a, i) => (
                  <QuickAction
                    key={a.clave}
                    icono={a.icono}
                    titulo={a.titulo}
                    delay={200 + i * 110}
                    onPress={() => vm.abrir(a.href)}
                  />
                ))}
              </View>
            )}
          </View>

          <View style={styles.contenido}>
            {vm.sinInformacion && (
              <FadeInView style={styles.vacio}>
                <Text style={styles.vacioTexto}>Aún no hay información de contacto registrada.</Text>
              </FadeInView>
            )}

            {!!vm.horario && (
              <FadeInView delay={150} style={styles.horario}>
                <Text style={styles.horarioIcono}>🕒</Text>
                <View style={styles.horarioInfo}>
                  <Text style={styles.horarioEtiqueta}>HORARIO DE ATENCIÓN</Text>
                  <Text style={styles.horarioTexto}>{vm.horario}</Text>
                </View>
              </FadeInView>
            )}

            {vm.filas.length > 0 && (
              <InfoCard icono="📞" titulo="Contacto directo" delay={250}>
                {vm.filas.map((f, i) => (
                  <ContactRow
                    key={f.id}
                    icono={f.icono}
                    etiqueta={f.etiqueta}
                    valor={f.valor}
                    href={f.href}
                    onPress={() => vm.abrir(f.href)}
                    esUltima={i === vm.filas.length - 1}
                  />
                ))}
              </InfoCard>
            )}

            {vm.redes.length > 0 && (
              <InfoCard icono="🌐" titulo="Síguenos" delay={350}>
                <View style={styles.redes}>
                  {vm.redes.map((r) => (
                    <SocialChip key={r.id} icono={r.icono} nombre={r.nombre} onPress={() => vm.abrir(r.href)} />
                  ))}
                </View>
              </InfoCard>
            )}

            {vm.ubicacionLineas.length > 0 && (
              <InfoCard icono="📍" titulo="Dónde estamos" delay={450}>
                {vm.ubicacionLineas.map((linea, i) => (
                  <Text key={`${linea}-${i}`} style={[styles.direccion, i === 0 && styles.direccionPrincipal]}>
                    {linea}
                  </Text>
                ))}
                {!!vm.mapaHref && (
                  <CustomButton
                    title="Cómo llegar"
                    icon={<Text style={styles.iconoBoton}>🗺️</Text>}
                    onPress={() => vm.abrir(vm.mapaHref)}
                    style={styles.botonMapa}
                  />
                )}
              </InfoCard>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: brandColors.background },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  error: { color: brandColors.error, textAlign: 'center', fontWeight: '500', marginBottom: 14 },
  botonAncho: { paddingHorizontal: 28 },
  scroll: { paddingBottom: 40 },

  toast: { marginHorizontal: 16, marginTop: 10, padding: 12, borderRadius: 12, backgroundColor: brandTints.errorSoft },
  toastTexto: { textAlign: 'center', fontWeight: '600', color: brandColors.error },

  hero: {
    backgroundColor: brandColors.primaryDark,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  circuloGrande: {
    position: 'absolute',
    top: -70,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: brandColors.primary,
    opacity: 0.55,
  },
  circuloChico: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: brandColors.accent,
    opacity: 0.25,
  },
  heroTitulo: { fontSize: 30, fontWeight: '800', color: brandColors.white },
  heroTexto: { fontSize: 14, color: brandTints.accentSoft, marginTop: 6, lineHeight: 20, maxWidth: '85%' },
  acciones: { flexDirection: 'row', justifyContent: 'center', gap: 26, marginTop: 24 },

  contenido: { padding: 20, gap: 16 },

  horario: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: brandColors.primary,
    borderRadius: 18,
    padding: 16,
  },
  horarioIcono: { fontSize: 26 },
  horarioInfo: { flex: 1 },
  horarioEtiqueta: { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: brandColors.accent },
  horarioTexto: { fontSize: 15, fontWeight: '700', color: brandColors.white, marginTop: 2 },

  redes: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  direccion: { fontSize: 14, color: brandTints.textMuted, lineHeight: 21 },
  direccionPrincipal: { fontSize: 16, fontWeight: '700', color: brandColors.primaryDark },
  botonMapa: { marginTop: 16 },
  iconoBoton: { fontSize: 18 },

  vacio: { backgroundColor: brandColors.white, borderRadius: 16, padding: 20 },
  vacioTexto: { textAlign: 'center', color: brandTints.textMuted, fontSize: 14 },
});