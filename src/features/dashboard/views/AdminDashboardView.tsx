import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Header } from '@/shared/components/Header';
import { useDashboardViewModel } from '../viewmodels/useDashboardViewModel';
import { brandColors } from '@/constants/brand';

export const AdminDashboardView = () => {
  const { estadisticas, accesosRapidos } = useDashboardViewModel();

  return (
    <View style={styles.contenedor}>
      <Header subtitle="Panel de Administrador" profileRoute="/(admin)/perfil" />

      <ScrollView contentContainerStyle={styles.contenidoScroll}>
        <Text style={styles.tituloSeccion}>Resumen</Text>

        <View style={styles.gridStats}>
          {estadisticas.map((stat, i) => (
            <View key={i} style={styles.cardStat}>
              <Text style={styles.iconoStat}>{stat.icono}</Text>
              <Text style={styles.valorStat}>{stat.valor}</Text>
              <Text style={styles.tituloStat}>{stat.titulo}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.tituloSeccion}>Accesos rápidos</Text>

        <View style={styles.gridAccesos}>
          {accesosRapidos.map((acceso, i) => (
            <View key={i} style={[styles.cardAcceso, { backgroundColor: acceso.color }]}>
              <Text style={styles.iconoAcceso}>{acceso.icono}</Text>
              <Text style={styles.tituloAcceso}>{acceso.titulo}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: brandColors.background },
  contenidoScroll: { padding: 20, paddingBottom: 40 },
  tituloSeccion: {
    fontSize: 18,
    fontWeight: '700',
    color: brandColors.primaryDark,
    marginBottom: 16,
    marginTop: 8,
  },
  gridStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  cardStat: {
    width: '47%',
    backgroundColor: brandColors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  iconoStat: { fontSize: 28, marginBottom: 8 },
  valorStat: {
    fontSize: 22,
    fontWeight: '700',
    color: brandColors.primaryDark,
  },
  tituloStat: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  gridAccesos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cardAcceso: {
    width: '47%',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  iconoAcceso: { fontSize: 32, marginBottom: 8 },
  tituloAcceso: {
    color: brandColors.white,
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
  },
});