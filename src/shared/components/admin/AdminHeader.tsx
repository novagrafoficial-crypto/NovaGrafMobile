import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from '../PressableScale';
import { brandColors } from '@/constants/brand';
import { fontFamily, space } from '@/constants/theme';
import { useMenuAdminOpcional } from '@/features/menu-admin/providers/MenuAdminProvider';

interface Props {
  titulo: string;
  /** Texto pequeño arriba del título (por defecto "Panel administrativo") */
  etiqueta?: string;
  onBack?: () => void;
  /** Botones a la derecha (íconos) */
  derecha?: React.ReactNode;
  /** Contenido debajo del título: buscador, filtros… */
  children?: React.ReactNode;
}

const ESCALA = 1.15;

// Encabezado del panel admin: mismo verde que el cliente, pero con el título
// alineado a la izquierda y la etiqueta "Panel administrativo" (estilo dashboard).
export const AdminHeader = ({ titulo, etiqueta = 'Panel administrativo', onBack, derecha, children }: Props) => {
  const insets = useSafeAreaInsets();
  // Sin flecha de regreso se muestra el botón ☰ que abre el menú lateral
  const menu = useMenuAdminOpcional();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
      <View style={styles.fila}>
        {onBack ? (
          <PressableScale onPress={onBack} hitSlop={10} style={styles.atras} accessibilityLabel="Regresar">
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </PressableScale>
        ) : menu ? (
          <PressableScale onPress={menu.abrir} hitSlop={10} style={styles.atras} accessibilityLabel="Abrir menú">
            <Ionicons name="menu" size={22} color="#FFFFFF" />
          </PressableScale>
        ) : null}
        <View style={styles.textos}>
          <Text style={styles.etiqueta} numberOfLines={1} maxFontSizeMultiplier={1}>{etiqueta.toUpperCase()}</Text>
          <Text style={styles.titulo} numberOfLines={1} maxFontSizeMultiplier={ESCALA}>{titulo}</Text>
        </View>
        {!!derecha && <View style={styles.derecha}>{derecha}</View>}
      </View>
      {children}
    </View>
  );
};

/** Botón redondo para la derecha del encabezado */
export const BotonHeader = ({
  icono,
  onPress,
  etiqueta,
  contador,
}: {
  icono: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  etiqueta: string;
  contador?: number;
}) => (
  <PressableScale onPress={onPress} hitSlop={8} scaleTo={0.9} style={styles.boton} accessibilityLabel={etiqueta}>
    <Ionicons name={icono} size={22} color="#FFFFFF" />
    {!!contador && (
      <View style={styles.badge}>
        <Text style={styles.badgeTexto} maxFontSizeMultiplier={1}>{contador > 9 ? '9+' : contador}</Text>
      </View>
    )}
  </PressableScale>
);

const styles = StyleSheet.create({
  header: {
    backgroundColor: brandColors.primary,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    gap: space.md,
  },
  fila: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  atras: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: { flex: 1 },
  etiqueta: { fontFamily: fontFamily.medium, fontSize: 11, letterSpacing: 1, color: 'rgba(255,255,255,0.7)' },
  titulo: { fontFamily: fontFamily.bold, fontSize: 20, color: '#FFFFFF' },
  derecha: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  boton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: brandColors.error,
    borderWidth: 1.5,
    borderColor: brandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTexto: { fontFamily: fontFamily.semibold, fontSize: 10, lineHeight: 13, color: '#FFFFFF' },
});
