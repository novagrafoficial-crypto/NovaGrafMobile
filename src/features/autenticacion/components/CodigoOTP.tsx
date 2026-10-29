import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';

interface Props {
  valor: string;
  onChange: (v: string) => void;
  largo?: number;
  onCompleto?: () => void;
}

// Código de 6 dígitos en cajitas (como WhatsApp o los bancos).
// Hay un solo TextInput invisible; las cajas solo muestran lo que se escribe.
export const CodigoOTP = ({ valor, onChange, largo = 6, onCompleto }: Props) => {
  const ref = useRef<TextInput>(null);
  const [enfocado, setEnfocado] = useState(false);

  return (
    <Pressable onPress={() => ref.current?.focus()} style={styles.fila} accessibilityLabel="Código de verificación">
      {Array.from({ length: largo }).map((_, i) => {
        const actual = enfocado && (i === valor.length || (i === largo - 1 && valor.length === largo));
        return (
          <View key={i} style={[styles.caja, !!valor[i] && styles.cajaLlena, actual && styles.cajaActual]}>
            <Text style={styles.digito} maxFontSizeMultiplier={1}>{valor[i] ?? ''}</Text>
          </View>
        );
      })}
      <TextInput
        ref={ref}
        value={valor}
        onChangeText={(t) => {
          onChange(t);
          if (t.replace(/\D/g, '').length === largo) onCompleto?.();
        }}
        onFocus={() => setEnfocado(true)}
        onBlur={() => setEnfocado(false)}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={largo}
        style={styles.oculto}
        autoFocus
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', justifyContent: 'space-between', gap: space.sm, marginBottom: space.xl },
  caja: {
    flex: 1,
    maxWidth: 52,
    height: 58,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: surface.border,
    backgroundColor: surface.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cajaLlena: { borderColor: '#9CC9BE' },
  cajaActual: { borderColor: brandColors.primary, borderWidth: 2 },
  digito: { fontFamily: fontFamily.bold, fontSize: 24, color: textColors.primary },
  oculto: { position: 'absolute', opacity: 0, width: 1, height: 1 },
});
