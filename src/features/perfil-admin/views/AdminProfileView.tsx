import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import { CampoTexto } from '@/features/perfil-cliente/components/CampoTexto';
import { FilaDato } from '@/features/perfil-cliente/components/FilaDato';
import { FilaMenu } from '@/features/perfil-cliente/components/FilaMenu';
import { AdminHeader, AvisoAdmin, PastillaAdmin, SeccionAdmin } from '@/shared/components/admin';
import { FadeInView } from '@/shared/components/FadeInView';
import { Loading } from '@/shared/components/Loading';
import { ModalConfirmacionLogout } from '@/shared/components/ModalConfirmacionLogout';
import { PressableScale } from '@/shared/components/PressableScale';
import { getInitials } from '@/shared/utils/getInitials';
import { useAdminProfileViewModel } from '../viewmodels/useAdminProfileViewModel';

const ESCALA = 1.15;

// Perfil del administrador (el del cliente vive en features/perfil-cliente).
export const AdminProfileView = () => {
  const vm = useAdminProfileViewModel();
  const p = vm.perfil;
  const nombreCompleto = [p?.nombre, p?.apellido_paterno, p?.apellido_materno].filter(Boolean).join(' ');
  // Solo de la pantalla: mostrar u ocultar lo que se escribe en las contraseñas
  const [verTexto, setVerTexto] = useState(false);

  return (
    <View style={styles.pantalla}>
      <AdminHeader titulo="Mi perfil" />

      <ModalConfirmacionLogout visible={vm.logoutVisible} onConfirmar={vm.confirmarLogout} onCancelar={vm.cancelarLogout} />

      {vm.cargando ? (
        <Loading fullScreen />
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {vm.aviso && <AvisoAdmin texto={vm.aviso.texto} ok={vm.aviso.ok} />}

            {/* 1. Tarjeta del administrador */}
            <FadeInView style={styles.usuario}>
              <View style={styles.avatar}>
                <Text style={styles.avatarTexto} maxFontSizeMultiplier={1}>{getInitials(p?.nombre, p?.apellido_paterno)}</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.nombre} numberOfLines={1} maxFontSizeMultiplier={ESCALA}>
                  {[p?.nombre, p?.apellido_paterno].filter(Boolean).join(' ')}
                </Text>
                <Text style={styles.correo} numberOfLines={1} maxFontSizeMultiplier={ESCALA}>{p?.correo_electronico}</Text>
                <View style={styles.pastillas}>
                  <PastillaAdmin texto="Administrador" icono="shield-checkmark" bg="#E6F2EF" fg={brandColors.primary} />
                  <PastillaAdmin texto={vm.esGoogle ? 'Google' : 'Correo'} icono={vm.esGoogle ? 'logo-google' : 'mail-outline'} bg={surface.muted} fg={textColors.secondary} />
                </View>
              </View>
            </FadeInView>

            {/* 2. Datos personales */}
            <FadeInView delay={80}>
              <SeccionAdmin
                titulo={vm.editando ? 'Editar datos' : 'Datos personales'}
                icono="person-outline"
                derecha={
                  !vm.editando ? (
                    <PressableScale style={styles.editar} onPress={vm.iniciarEdicion} scaleTo={0.92} hitSlop={8}>
                      <Ionicons name="create-outline" size={16} color={textColors.primary} />
                      <Text style={styles.editarTexto} maxFontSizeMultiplier={ESCALA}>Editar</Text>
                    </PressableScale>
                  ) : undefined
                }
              >
                {vm.editando ? (
                  <View style={{ gap: space.md }}>
                    <CampoTexto etiqueta="Nombre" icono="person-outline" value={vm.form.nombre} onChangeText={(t) => vm.editarCampo('nombre', t)} />
                    <CampoTexto etiqueta="Apellido paterno" icono="person-outline" value={vm.form.apellido_paterno} onChangeText={(t) => vm.editarCampo('apellido_paterno', t)} />
                    <CampoTexto etiqueta="Apellido materno" icono="person-outline" value={vm.form.apellido_materno} onChangeText={(t) => vm.editarCampo('apellido_materno', t)} />
                    <CampoTexto etiqueta="Nombre de usuario" icono="at-outline" autoCapitalize="none" value={vm.form.nombre_usuario} onChangeText={(t) => vm.editarCampo('nombre_usuario', t)} />
                    <CampoTexto etiqueta="Teléfono" icono="call-outline" keyboardType="phone-pad" value={vm.form.telefono} onChangeText={(t) => vm.editarCampo('telefono', t)} />
                    <CampoTexto etiqueta="Correo electrónico" icono="mail-outline" value={p?.correo_electronico ?? ''} bloqueado />

                    <View style={styles.botones}>
                      <PressableScale style={[styles.boton, styles.botonSecundario]} onPress={vm.cancelarEdicion} disabled={vm.guardando}>
                        <Text style={styles.botonSecundarioTexto} maxFontSizeMultiplier={ESCALA}>Cancelar</Text>
                      </PressableScale>
                      <PressableScale style={[styles.boton, styles.botonPrincipal, vm.guardando && { opacity: 0.6 }]} onPress={vm.guardarPerfil} disabled={vm.guardando}>
                        <Text style={styles.botonPrincipalTexto} maxFontSizeMultiplier={ESCALA}>{vm.guardando ? 'Guardando…' : 'Guardar'}</Text>
                      </PressableScale>
                    </View>
                  </View>
                ) : (
                  <View>
                    <FilaDato icono="person-outline" etiqueta="Nombre completo" valor={nombreCompleto} />
                    <FilaDato icono="at-outline" etiqueta="Usuario" valor={p?.nombre_usuario} />
                    <FilaDato icono="mail-outline" etiqueta="Correo" valor={p?.correo_electronico} />
                    <FilaDato icono="call-outline" etiqueta="Teléfono" valor={p?.telefono} ultima />
                  </View>
                )}
              </SeccionAdmin>
            </FadeInView>

            {/* 3. Cuenta */}
            <FadeInView delay={140}>
              <SeccionAdmin titulo="Cuenta" icono="settings-outline">
                <View>
                  {!vm.esGoogle && (
                    <>
                      <FilaMenu icono="lock-closed-outline" titulo="Cambiar contraseña" flecha={vm.verPw ? 'arriba' : 'abajo'} onPress={vm.alternarPw} />
                      {vm.verPw && (
                        <FadeInView distance={-8} duration={240} style={styles.formPw}>
                          <CampoTexto
                            etiqueta="Contraseña actual"
                            icono="key-outline"
                            secureTextEntry={!verTexto}
                            value={vm.pw.actual}
                            onChangeText={(t) => vm.setPw({ ...vm.pw, actual: t })}
                            onAlternarVer={() => setVerTexto((v) => !v)}
                            visible={verTexto}
                          />
                          <CampoTexto etiqueta="Nueva contraseña" icono="lock-closed-outline" placeholder="Mínimo 6 caracteres" secureTextEntry={!verTexto} value={vm.pw.nueva} onChangeText={(t) => vm.setPw({ ...vm.pw, nueva: t })} />
                          <CampoTexto etiqueta="Confirmar contraseña" icono="lock-closed-outline" secureTextEntry={!verTexto} value={vm.pw.confirmar} onChangeText={(t) => vm.setPw({ ...vm.pw, confirmar: t })} />

                          {vm.pwAviso && (
                            <View style={styles.pwMensaje}>
                              <Ionicons name={vm.pwAviso.ok ? 'checkmark-circle' : 'alert-circle'} size={16} color={vm.pwAviso.ok ? '#166534' : brandColors.error} />
                              <Text style={[styles.pwMensajeTexto, { color: vm.pwAviso.ok ? '#166534' : brandColors.error }]} maxFontSizeMultiplier={ESCALA}>{vm.pwAviso.texto}</Text>
                            </View>
                          )}

                          <PressableScale style={[styles.boton, styles.botonPrincipal, { flex: 0 }, vm.pwGuardando && { opacity: 0.6 }]} onPress={vm.guardarContrasena} disabled={vm.pwGuardando}>
                            <Text style={styles.botonPrincipalTexto} maxFontSizeMultiplier={ESCALA}>{vm.pwGuardando ? 'Guardando…' : 'Guardar contraseña'}</Text>
                          </PressableScale>
                        </FadeInView>
                      )}
                    </>
                  )}
                  <FilaMenu icono="log-out-outline" titulo="Cerrar sesión" flecha="ninguna" peligro onPress={vm.pedirLogout} ultima />
                </View>
              </SeccionAdmin>
            </FadeInView>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: surface.screen },
  scroll: { padding: space.lg, paddingBottom: 40, gap: space.lg },

  usuario: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    backgroundColor: surface.card,
    borderRadius: radius.lg,
    padding: space.lg,
    borderWidth: 1,
    borderColor: surface.border,
  },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: brandColors.primaryDark, alignItems: 'center', justifyContent: 'center' },
  avatarTexto: { fontFamily: fontFamily.bold, fontSize: 22, color: '#FFFFFF' },
  nombre: { fontFamily: fontFamily.bold, fontSize: 18, color: textColors.primary },
  correo: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary },
  pastillas: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },

  editar: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, height: 32, borderRadius: radius.pill, backgroundColor: surface.muted },
  editarTexto: { fontFamily: fontFamily.medium, fontSize: 13, color: textColors.primary },

  formPw: { gap: space.md, paddingBottom: space.md },
  pwMensaje: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pwMensajeTexto: { flex: 1, fontFamily: fontFamily.medium, fontSize: 13 },

  botones: { flexDirection: 'row', gap: space.sm, marginTop: space.xs },
  boton: { flex: 1, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  botonPrincipal: { backgroundColor: brandColors.primary },
  botonPrincipalTexto: { fontFamily: fontFamily.semibold, fontSize: 15, color: '#FFFFFF' },
  botonSecundario: { borderWidth: 1, borderColor: surface.border },
  botonSecundarioTexto: { fontFamily: fontFamily.semibold, fontSize: 15, color: textColors.primary },
});
