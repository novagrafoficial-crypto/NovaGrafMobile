import { brandColors, brandTints } from "@/constants/brand";
import { FadeInView } from "@/shared/components/FadeInView";
import { Header } from "@/shared/components/Header";
import { PressableScale } from "@/shared/components/PressableScale";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useDashboardViewModel } from "../viewmodels/useDashboardViewModel";

export const AdminDashboardView = () => {
  const router = useRouter();
  const { estadisticas, accesosRapidos } = useDashboardViewModel();

  return (
    <View style={styles.contenedor}>
      <Header subtitle="Panel de Administrador" />

      <ScrollView
        contentContainerStyle={styles.contenidoScroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.tituloSeccion}>Resumen</Text>

        <View style={styles.grid}>
          {estadisticas.map((stat, i) => (
            <FadeInView key={stat.titulo} delay={i * 70} style={styles.celda}>
              <View style={styles.cardStat}>
                <View style={styles.circuloIcono}>
                  <Text style={styles.iconoStat}>{stat.icono}</Text>
                </View>
                <Text style={styles.valorStat}>{stat.valor}</Text>
                <Text style={styles.tituloStat}>{stat.titulo}</Text>
              </View>
            </FadeInView>
          ))}
        </View>

        <Text style={[styles.tituloSeccion, styles.tituloSegundo]}>
          Accesos rápidos
        </Text>

        <View style={styles.grid}>
          {accesosRapidos.map((acceso, i) => (
            <FadeInView
              key={acceso.titulo}
              delay={300 + i * 70}
              style={styles.celda}
            >
              <PressableScale
                style={[styles.cardAcceso, { backgroundColor: acceso.color }]}
                onPress={() => acceso.ruta && router.push(acceso.ruta as any)}
                accessibilityRole="button"
                accessibilityLabel={acceso.titulo}
              >
                <Text style={styles.iconoAcceso}>{acceso.icono}</Text>
                <Text style={styles.tituloAcceso}>{acceso.titulo}</Text>
              </PressableScale>
            </FadeInView>
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
    fontWeight: "800",
    color: brandColors.primaryDark,
    marginBottom: 14,
  },
  tituloSegundo: { marginTop: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -6 },
  celda: { width: "50%", padding: 6 },
  cardStat: {
    backgroundColor: brandColors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  circuloIcono: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: brandTints.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  iconoStat: { fontSize: 22 },
  valorStat: {
    fontSize: 22,
    fontWeight: "800",
    color: brandColors.primaryDark,
  },
  tituloStat: {
    fontSize: 12,
    color: brandTints.textMuted,
    marginTop: 4,
    textAlign: "center",
  },
  cardAcceso: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 104,
  },
  iconoAcceso: { fontSize: 30, marginBottom: 8 },
  tituloAcceso: {
    color: brandColors.white,
    fontWeight: "700",
    fontSize: 13,
    textAlign: "center",
  },
});
