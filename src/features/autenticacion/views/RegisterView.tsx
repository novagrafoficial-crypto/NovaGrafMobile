import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRegisterViewModel } from '../viewmodels/useRegisterViewModel';
import { AuthScreen, EnlaceAuth } from '../components/AuthScreen';
import { BotonGoogle } from '../components/BotonGoogle';
import type { RegistroForm } from '../models/Registro';
import { CustomButton } from '@/shared/components/CustomButton';
import { CustomInput } from '@/shared/components/CustomInput';
import { FadeInView } from '@/shared/components/FadeInView';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';

const PASOS = ['Tus datos', 'Tu cuenta'];

export const RegisterView = () => {
  const vm = useRegisterViewModel();

  // Props comunes de cada campo: valor, cambio, salida del campo y error
  const campo = (nombre: keyof RegistroForm) => ({
    value: vm.form[nombre],
    onChangeText: (v: string) => vm.setField(nombre, v),
    onBlur: () => vm.tocar(nombre),
    error: vm.errores[nombre] || null,
  });

  return (
    <AuthScreen
      title="Crea tu cuenta"
      subtitle={vm.paso === 1 ? 'Primero, cuéntanos quién eres.' : 'Ahora crea tu usuario y contraseña.'}
      icono="person-add-outline"
      etiqueta={`PASO ${vm.paso} DE 2`}
      onBack={vm.volver}
      error={vm.error}
      pie={<EnlaceAuth texto="¿Ya tienes cuenta?" accion="Inicia sesión" onPress={vm.irALogin} />}
    >
      {/* Indicador de pasos */}
      <View style={styles.pasos}>
        {PASOS.map((p, i) => {
          const n = i + 1;
          const hecho = vm.paso > n;
          const actual = vm.paso === n;
          return (
            <View key={p} style={styles.paso}>
              <View style={[styles.pasoBarra, (hecho || actual) && styles.pasoBarraActiva]} />
              <View style={styles.pasoFila}>
                <Ionicons
                  name={hecho ? 'checkmark-circle' : actual ? 'ellipse' : 'ellipse-outline'}
                  size={14}
                  color={hecho || actual ? brandColors.primary : textColors.muted}
                />
                <Text style={[styles.pasoTexto, (hecho || actual) && styles.pasoTextoActivo]} maxFontSizeMultiplier={1.15}>{p}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {vm.paso === 1 ? (
        <FadeInView key="paso1">
          <CustomInput label="Nombre(s)" icono="person-outline" placeholder="Ej. María Fernanda" autoCapitalize="words" textContentType="givenName" {...campo('name')} />
          <View style={styles.dos}>
            <View style={{ flex: 1 }}>
              <CustomInput label="Apellido paterno" placeholder="Ej. López" autoCapitalize="words" textContentType="familyName" {...campo('lastNameP')} />
            </View>
            <View style={{ flex: 1 }}>
              <CustomInput label="Apellido materno" opcional placeholder="Ej. Ruiz" autoCapitalize="words" {...campo('lastNameM')} />
            </View>
          </View>
          <CustomInput
            label="Fecha de nacimiento"
            icono="calendar-outline"
            placeholder="DD/MM/AAAA"
            keyboardType="number-pad"
            maxLength={10}
            {...campo('birthDate')}
          />
          <CustomInput
            label="Teléfono"
            icono="call-outline"
            placeholder="10 dígitos"
            keyboardType="number-pad"
            textContentType="telephoneNumber"
            maxLength={10}
            ayuda={vm.form.phone ? `${vm.form.phone.length}/10 dígitos` : 'Solo números, sin espacios'}
            {...campo('phone')}
          />
          <CustomInput
            label="Domicilio"
            icono="location-outline"
            placeholder="Calle, número y colonia"
            textContentType="fullStreetAddress"
            {...campo('address')}
          />
          <CustomButton
            title="Continuar"
            icon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
            onPress={vm.siguiente}
          />
          <BotonGoogle
            separador="o regístrate con"
            onPress={vm.registrarConGoogle}
            loading={vm.isGoogleLoading}
          />
        </FadeInView>
      ) : (
        <FadeInView key="paso2">
          <CustomInput
            label="Nombre de usuario"
            icono="at-outline"
            placeholder="Ej. maria_lopez"
            autoCapitalize="none"
            autoCorrect={false}
            ayuda="Letras, números, punto o guion bajo"
            {...campo('username')}
          />
          <CustomInput
            label="Correo electrónico"
            icono="mail-outline"
            placeholder="nombre@correo.com"
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            {...campo('email')}
          />
          <CustomInput
            label="Contraseña"
            icono="lock-closed-outline"
            placeholder="Crea una contraseña"
            isPassword
            textContentType="newPassword"
            {...campo('password')}
          />

          {/* Reglas de la contraseña con palomita */}
          <View style={styles.reglas}>
            {vm.reglas.map((r) => (
              <View key={r.texto} style={styles.regla}>
                <Ionicons
                  name={r.ok ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={r.ok ? '#166534' : textColors.muted}
                />
                <Text style={[styles.reglaTexto, r.ok && { color: '#166534' }]} maxFontSizeMultiplier={1.15}>{r.texto}</Text>
              </View>
            ))}
          </View>

          <CustomInput
            label="Confirmar contraseña"
            icono="lock-closed-outline"
            placeholder="Escríbela otra vez"
            isPassword
            textContentType="newPassword"
            {...campo('confirmPassword')}
          />

          <CustomButton title="Crear mi cuenta" onPress={vm.registrar} loading={vm.isLoading} />
          <CustomButton title="Atrás" variant="outline" onPress={vm.atras} disabled={vm.isLoading} style={{ marginTop: space.sm }} />
        </FadeInView>
      )}
    </AuthScreen>
  );
};

const styles = StyleSheet.create({
  pasos: { flexDirection: 'row', gap: space.sm, marginBottom: space.xl },
  paso: { flex: 1, gap: 6 },
  pasoBarra: { height: 4, borderRadius: 2, backgroundColor: surface.border },
  pasoBarraActiva: { backgroundColor: brandColors.primary },
  pasoFila: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pasoTexto: { fontFamily: fontFamily.medium, fontSize: 12, color: textColors.muted },
  pasoTextoActivo: { color: textColors.primary },
  dos: { flexDirection: 'row', gap: space.md },
  reglas: {
    gap: 4,
    marginTop: -8,
    marginBottom: space.lg,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: surface.card,
    borderWidth: 1,
    borderColor: surface.border,
  },
  regla: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reglaTexto: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.secondary },
});
