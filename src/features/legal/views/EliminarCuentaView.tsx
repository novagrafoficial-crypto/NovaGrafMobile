import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import { CustomButton } from '@/shared/components/CustomButton';
import { CustomInput } from '@/shared/components/CustomInput';
import { FadeInView } from '@/shared/components/FadeInView';
import { PressableScale } from '@/shared/components/PressableScale';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { useEliminarCuentaViewModel } from '../viewmodels/useEliminarCuentaViewModel';

const ESCALA = 1.15;

const SE_BORRA = ['Tu cuenta y acceso a la app', 'Nombre, teléfono, domicilio y fecha de nacimiento', 'Tus diseños e imágenes subidas'];
const SE_CONSERVA = ['Registros de pedidos y pagos que la ley obliga a guardar (sin usarlos para nada más)'];

export const EliminarCuentaView = () => {
  const vm = useEliminarCuentaViewModel();

  return (
    <KeyboardAvoidingView style={styles.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Eliminar mi cuenta" onBack={vm.volver} />

      {vm.enviado ? (
        <View style={styles.exito}>
          <View style={styles.exitoIcono}>
            <Ionicons name="checkmark" size={36} color="#FFFFFF" />
          </View>
          <Text style={styles.exitoTitulo} maxFontSizeMultiplier={ESCALA}>Solicitud enviada</Text>
          <Text style={styles.exitoTexto} maxFontSizeMultiplier={ESCALA}>{vm.enviado}</Text>
          <CustomButton title="Volver" onPress={vm.volver} style={{ alignSelf: 'stretch', marginTop: space.md }} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Qué pasa con tus datos */}
          <FadeInView style={styles.card}>
            <Text style={styles.titulo} maxFontSizeMultiplier={ESCALA}>¿Qué pasa al eliminar tu cuenta?</Text>
            <Text style={styles.sub} maxFontSizeMultiplier={ESCALA}>Atendemos tu solicitud en un máximo de 30 días.</Text>

            <Text style={styles.grupo} maxFontSizeMultiplier={ESCALA}>Se elimina</Text>
            {SE_BORRA.map((t) => (
              <View key={t} style={styles.punto}>
                <Ionicons name="trash-outline" size={16} color={brandColors.error} />
                <Text style={styles.puntoTexto} maxFontSizeMultiplier={ESCALA}>{t}</Text>
              </View>
            ))}
            <Text style={styles.grupo} maxFontSizeMultiplier={ESCALA}>Se conserva</Text>
            {SE_CONSERVA.map((t) => (
              <View key={t} style={styles.punto}>
                <Ionicons name="archive-outline" size={16} color={textColors.secondary} />
                <Text style={styles.puntoTexto} maxFontSizeMultiplier={ESCALA}>{t}</Text>
              </View>
            ))}
          </FadeInView>

          {/* Formulario */}
          <FadeInView delay={80} style={styles.card}>
            {!!vm.error && (
              <View style={styles.error}>
                <Ionicons name="alert-circle" size={18} color={brandColors.error} />
                <Text style={styles.errorTexto} maxFontSizeMultiplier={ESCALA}>{vm.error}</Text>
              </View>
            )}

            <CustomInput
              label="Correo de tu cuenta"
              icono="mail-outline"
              placeholder="nombre@correo.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={vm.correo}
              onChangeText={vm.setCorreo}
              editable={!vm.conSesion}
              error={vm.errorCorreo}
              ayuda={vm.conSesion ? 'Es el correo de tu sesión actual' : undefined}
            />
            <CustomInput
              label="Motivo"
              opcional
              icono="chatbox-ellipses-outline"
              placeholder="Cuéntanos por qué te vas (nos ayuda a mejorar)"
              multiline
              value={vm.motivo}
              onChangeText={vm.setMotivo}
            />

            {/* Confirmación */}
            <PressableScale style={styles.confirmar} onPress={vm.alternarConfirmado} scaleTo={0.98} accessibilityRole="checkbox" accessibilityState={{ checked: vm.confirmado }}>
              <Ionicons name={vm.confirmado ? 'checkbox' : 'square-outline'} size={22} color={vm.confirmado ? brandColors.primary : textColors.muted} />
              <Text style={styles.confirmarTexto} maxFontSizeMultiplier={ESCALA}>Entiendo que mi cuenta y mis datos se eliminarán y no se podrán recuperar.</Text>
            </PressableScale>

            <CustomButton title="Solicitar eliminación" variant="danger" onPress={vm.enviar} loading={vm.enviando} />

            {/* Plan B si el servidor no respondió */}
            {!!vm.correoEmpresa && (
              <CustomButton
                title="Enviar la solicitud por correo"
                variant="outline"
                icon={<Ionicons name="mail-outline" size={18} color={textColors.primary} />}
                onPress={vm.enviarPorCorreo}
                style={{ marginTop: space.sm }}
              />
            )}
          </FadeInView>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: surface.screen },
  scroll: { padding: space.lg, gap: space.lg, paddingBottom: 40 },
  card: { backgroundColor: surface.card, borderRadius: radius.lg, padding: space.lg, gap: space.sm, borderWidth: 1, borderColor: surface.border },
  titulo: { fontFamily: fontFamily.bold, fontSize: 17, color: textColors.primary },
  sub: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.secondary },
  grupo: { fontFamily: fontFamily.semibold, fontSize: 14, color: textColors.primary, marginTop: space.sm },
  punto: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  puntoTexto: { flex: 1, fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 20, color: textColors.secondary },
  error: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, borderRadius: radius.md, backgroundColor: '#FEE2E2', marginBottom: space.sm },
  errorTexto: { flex: 1, fontFamily: fontFamily.medium, fontSize: 14, color: textColors.primary },
  confirmar: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, marginBottom: space.lg },
  confirmarTexto: { flex: 1, fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 20, color: textColors.primary },
  exito: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.sm },
  exitoIcono: { width: 72, height: 72, borderRadius: 36, backgroundColor: brandColors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: space.sm },
  exitoTitulo: { fontFamily: fontFamily.bold, fontSize: 20, color: textColors.primary },
  exitoTexto: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary, textAlign: 'center' },
});
