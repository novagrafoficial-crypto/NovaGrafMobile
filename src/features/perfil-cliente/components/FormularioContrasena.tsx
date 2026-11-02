import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import { FadeInView } from '@/shared/components/FadeInView';
import { PressableScale } from '@/shared/components/PressableScale';
import { useCambioContrasena } from '@/shared/hooks/useCambioContrasena';
import { CampoTexto } from './CampoTexto';

const ESCALA = 1.15;

interface Props {
  /** Llama al backend para cambiar la contraseña */
  onGuardar: (actual: string, nueva: string) => Promise<{ message?: string }>;
}

// Formulario de cambio de contraseña (cliente y admin): ojito, reglas y validación.
export const FormularioContrasena = ({ onGuardar }: Props) => {
  const f = useCambioContrasena(onGuardar);
  const verProps = { secureTextEntry: !f.ver, onAlternarVer: f.alternarVer, visible: f.ver, autoCapitalize: 'none' as const };

  return (
    <FadeInView distance={-8} duration={240} style={styles.formulario}>
      <CampoTexto
        etiqueta="Contraseña actual"
        icono="key-outline"
        value={f.pw.actual}
        onChangeText={(t) => f.setCampo('actual', t)}
        error={f.errores.actual}
        {...verProps}
      />
      <CampoTexto
        etiqueta="Nueva contraseña"
        icono="lock-closed-outline"
        placeholder="Mínimo 8 caracteres"
        value={f.pw.nueva}
        onChangeText={(t) => f.setCampo('nueva', t)}
        {...verProps}
      />

      {/* Requisitos con palomita, igual que en el registro */}
      <View style={styles.reglas}>
        {f.reglas.map((r) => (
          <View key={r.texto} style={styles.regla}>
            <Ionicons name={r.ok ? 'checkmark-circle' : 'ellipse-outline'} size={16} color={r.ok ? '#166534' : textColors.muted} />
            <Text style={[styles.reglaTexto, r.ok && { color: '#166534' }]} maxFontSizeMultiplier={ESCALA}>{r.texto}</Text>
          </View>
        ))}
      </View>

      <CampoTexto
        etiqueta="Confirmar contraseña"
        icono="lock-closed-outline"
        value={f.pw.confirmar}
        onChangeText={(t) => f.setCampo('confirmar', t)}
        error={f.errores.confirmar}
        {...verProps}
      />

      {f.aviso && (
        <View style={styles.mensaje}>
          <Ionicons name={f.aviso.ok ? 'checkmark-circle' : 'alert-circle'} size={16} color={f.aviso.ok ? '#166534' : brandColors.error} />
          <Text style={[styles.mensajeTexto, { color: f.aviso.ok ? '#166534' : brandColors.error }]} maxFontSizeMultiplier={ESCALA}>
            {f.aviso.texto}
          </Text>
        </View>
      )}

      <PressableScale
        style={[styles.boton, (!f.valido || f.guardando) && styles.deshabilitado]}
        onPress={f.guardar}
        disabled={!f.valido || f.guardando}
        accessibilityRole="button"
      >
        <Text style={styles.botonTexto} maxFontSizeMultiplier={ESCALA}>{f.guardando ? 'Guardando…' : 'Guardar contraseña'}</Text>
      </PressableScale>
    </FadeInView>
  );
};

const styles = StyleSheet.create({
  formulario: { gap: space.md, paddingBottom: space.lg },
  reglas: {
    gap: 4,
    marginTop: -4,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: surface.card,
    borderWidth: 1,
    borderColor: surface.border,
  },
  regla: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reglaTexto: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.secondary },
  mensaje: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mensajeTexto: { flex: 1, fontFamily: fontFamily.medium, fontSize: 13 },
  boton: { height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: brandColors.primary },
  botonTexto: { fontFamily: fontFamily.semibold, fontSize: 15, color: '#FFFFFF' },
  deshabilitado: { opacity: 0.5 },
});
