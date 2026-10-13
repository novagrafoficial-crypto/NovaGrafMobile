import React from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useNosotrosViewModel } from '../viewmodels/useNosotrosViewModel';
import { SectionHeading } from '../components/SectionHeading';
import { PurposeCard } from '../components/PurposeCard';
import { ValueCard } from '../components/ValueCard';
import { TimelineItem } from '../components/TimelineItem';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { Loading } from '@/shared/components/Loading';
import { CustomButton } from '@/shared/components/CustomButton';
import { FadeInView } from '@/shared/components/FadeInView';
import { APP_NAME } from '@/constants/app';
import { brandColors, brandTints } from '@/constants/brand';

export const NosotrosView = () => {
  const vm = useNosotrosViewModel();

  return (
    <View style={styles.pantalla}>
      <ScreenHeader title="Nosotros" onBack={vm.regresar} />

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
          {/* HERO */}
          <FadeInView style={styles.hero}>
            <Text style={styles.heroTitulo}>Nuestra historia</Text>
            <Text style={styles.heroTexto}>
              Conoce quiénes somos, qué nos mueve y el camino que hemos recorrido.
            </Text>
          </FadeInView>

          <View style={styles.contenido}>
            {/* MISIÓN Y VISIÓN */}
            <View>
              <SectionHeading etiqueta="Propósito" titulo="Nuestra misión y visión" />
              <View style={styles.pila}>
                <PurposeCard
                  icono="🎯"
                  titulo="Misión"
                  texto={vm.mision?.descripcion}
                  acento={brandColors.accent}
                />
                <PurposeCard
                  icono="🔭"
                  titulo="Visión"
                  texto={vm.vision?.descripcion}
                  acento={brandColors.primary}
                  delay={100}
                />
              </View>
            </View>

            {/* VALORES (solo si hay) */}
            {vm.valores.length > 0 && (
              <View>
                <SectionHeading
                  etiqueta="Principios"
                  titulo="Nuestros valores"
                  subtitulo="Los pilares que guían cada uno de nuestros proyectos."
                />
                <View style={styles.pila}>
                  {vm.valores.map((valor, i) => (
                    <ValueCard key={`${valor.titulo}-${i}`} titulo={valor.titulo} descripcion={valor.descripcion} index={i} />
                  ))}
                </View>
              </View>
            )}

            {/* LÍNEA DE TIEMPO */}
            <View>
              <SectionHeading
                etiqueta="Recorrido"
                titulo="Nuestro camino"
                subtitulo={`Hitos importantes en el camino de ${APP_NAME}.`}
              />
              {vm.lineaTiempo.length === 0 ? (
                <View style={styles.vacio}>
                  <Text style={styles.vacioTexto}>
                    Pronto compartiremos los momentos más importantes de nuestra historia.
                  </Text>
                </View>
              ) : (
                vm.lineaTiempo.map((item, i) => (
                  <TimelineItem
                    key={`${item.fecha_evento}-${i}`}
                    fechaTexto={item.fechaTexto}
                    descripcion={item.descripcion}
                    index={i}
                    esUltimo={i === vm.lineaTiempo.length - 1}
                  />
                ))
              )}
            </View>
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

  // Continúa el color del ScreenHeader para que se vea como una sola franja
  hero: {
    backgroundColor: brandColors.primaryDark,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroTitulo: { fontSize: 28, fontWeight: '800', color: brandColors.white },
  heroTexto: { fontSize: 14, color: brandTints.accentSoft, marginTop: 6, lineHeight: 20 },

  contenido: { padding: 20, gap: 28 },
  pila: { gap: 12 },

  vacio: { backgroundColor: brandColors.white, borderRadius: 14, padding: 18 },
  vacioTexto: { fontSize: 14, color: brandTints.textMuted, textAlign: 'center', lineHeight: 20 },
});