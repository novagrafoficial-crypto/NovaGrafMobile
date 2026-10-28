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
import { Ionicons } from '@expo/vector-icons';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';

export const ContactoView = () => {
  const vm = useContactoViewModel();

  return (
    <View style={styles.pantalla}>
      <ScreenHeader title="Contacto" />

      {vm.aviso && (
        <FadeInView distance={-10} duration={250} style={styles.toast}>
          <Text style={styles.toastTexto}>{vm.aviso}</Text>
        </FadeInView>
      )}

      {vm.loading ? (
        <Loading fullScreen />
      ) : vm.error ? (
        <View style={styles.centrado}>
          <Ionicons name="cloud-offline-outline" size={40} color={textColors.muted} />
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

            <FadeInView>
              <Text style={styles.heroTitulo} maxFontSizeMultiplier={1.15}>¿Hablamos?</Text>
              <Text style={styles.heroTexto} maxFontSizeMultiplier={1.15}>Estamos para ayudarte con tu pedido o tu idea.</Text>
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
                <View style={styles.horarioIcono}>
                  <Ionicons name="time-outline" size={22} color={brandColors.primary} />
                </View>
                <View style={styles.horarioInfo}>
                  <Text style={styles.horarioEtiqueta}>Horario de atención</Text>
                  <Text style={styles.horarioTexto}>{vm.horario}</Text>
                </View>
              </FadeInView>
            )}

            {vm.filas.length > 0 && (
              <InfoCard icono="call-outline" titulo="Contacto directo" delay={250}>
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
              <InfoCard icono="share-social-outline" titulo="Síguenos" delay={350}>
                <View style={styles.redes}>
                  {vm.redes.map((r) => (
                    <SocialChip key={r.id} icono={r.icono} nombre={r.nombre} onPress={() => vm.abrir(r.href)} />
                  ))}
                </View>
              </InfoCard>
            )}

            {vm.ubicacionLineas.length > 0 && (
              <InfoCard icono="location-outline" titulo="Dónde estamos" delay={450}>
                {vm.ubicacionLineas.map((linea, i) => (
                  <Text key={`${linea}-${i}`} style={[styles.direccion, i === 0 && styles.direccionPrincipal]}>
                    {linea}
                  </Text>
                ))}
                {!!vm.mapaHref && (
                  <CustomButton
                    title="Cómo llegar"
                    icon={<Ionicons name="navigate-outline" size={18} color="#FFFFFF" />}
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
  pantalla: { flex: 1, backgroundColor: surface.screen },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  error: { fontFamily: fontFamily.medium, fontSize: 15, color: textColors.primary, textAlign: 'center' },
  botonAncho: { paddingHorizontal: 28 },
  scroll: { paddingBottom: 40 },

  toast: { marginHorizontal: space.lg, marginTop: 10, padding: space.md, borderRadius: radius.md, backgroundColor: '#FEE2E2' },
  toastTexto: { fontFamily: fontFamily.medium, fontSize: 14, textAlign: 'center', color: brandColors.error },

  // Continúa el verde del encabezado
  hero: {
    backgroundColor: brandColors.primary,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 26,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroTitulo: { fontFamily: fontFamily.bold, fontSize: 24, color: '#FFFFFF' },
  heroTexto: { fontFamily: fontFamily.regular, fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 4, lineHeight: 20 },
  acciones: { flexDirection: 'row', justifyContent: 'center', gap: 28, marginTop: 22 },

  contenido: { padding: 20, gap: 16 },

  horario: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: surface.card,
    borderRadius: radius.lg,
    padding: space.lg,
    borderWidth: 1,
    borderColor: surface.border,
  },
  horarioIcono: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#E6F2EF', alignItems: 'center', justifyContent: 'center' },
  horarioInfo: { flex: 1 },
  horarioEtiqueta: { fontFamily: fontFamily.medium, fontSize: 12, color: textColors.muted },
  horarioTexto: { fontFamily: fontFamily.semibold, fontSize: 15, color: textColors.primary, marginTop: 2 },

  redes: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: space.sm },

  direccion: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary, lineHeight: 21 },
  direccionPrincipal: { fontFamily: fontFamily.semibold, fontSize: 15, color: textColors.primary, marginTop: space.sm },
  botonMapa: { marginTop: space.lg },

  vacio: { backgroundColor: surface.card, borderRadius: radius.lg, padding: 20, borderWidth: 1, borderColor: surface.border },
  vacioTexto: { fontFamily: fontFamily.regular, textAlign: 'center', color: textColors.secondary, fontSize: 14 },
});
