import { APP_NAME } from "@/constants/app";
import { brandColors } from "@/constants/brand";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HeaderProps {
  /* Texto pequeño bajo la marca (ej. "Carrito", "Panel de Administrador") */
  subtitle?: string;
}

// Un solo header para cliente y administrador.
export const Header = ({ subtitle }: HeaderProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.encabezado, { paddingTop: insets.top + 12 }]}>
      <Text style={styles.marca}>{APP_NAME}</Text>
      {subtitle && <Text style={styles.subtitulo}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  encabezado: {
    backgroundColor: brandColors.primaryDark,
    paddingHorizontal: 20,
    paddingBottom: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  marca: {
    color: brandColors.white,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitulo: {
    color: "rgba(255,255,255,0.75)", 
    fontSize: 13,
    marginTop: 2,
    fontWeight: "500",
    textAlign: "center",
  },
});
