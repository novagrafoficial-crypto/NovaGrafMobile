import React from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useClientProfileViewModel } from '../viewmodels/useClientProfileViewModel';
import { ModalConfirmacionLogout } from '@/shared/components/ModalConfirmacionLogout';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { Loading } from '@/shared/components/Loading';
import { FadeInView } from '@/shared/components/FadeInView';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import { TarjetaUsuario } from '../components/TarjetaUsuario';
import { FilaDato } from '../components/FilaDato';
import { FilaMenu } from '../components/FilaMenu';
import { CampoTexto } from '../components/CampoTexto';

const ESCALA = 1.15;

export const ClientProfileView = () => {
  const vm = useClientProfileViewModel();
  const { profile, form, setForm, pwForm, setPwForm } = vm;

  const nombreCompleto = [profile?.nombre, profile?.apellido_paterno, profile?.apellido_materno]
    .filter(Boolean)
    .join(' ');

  return (
    <View style={styles.pantalla}>
      <ScreenHeader title="Mi perfil" />

      <ModalConfirmacionLogout
        visible={vm.logoutVisible}
        onConfirmar={vm.confirmarLogout}
        onCancelar={vm.cancelarLogout}
      />

      {vm.loading ? (
        <Loading fullScreen />
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* AVISO (guardado / error) */}
            {vm.toastMsg && (
              <FadeInView distance={-10} duration={250} style={[styles.aviso, vm.toastMsg.ok ? styles.avisoOk : styles.avisoError]}>
                <Ionicons
                  name={vm.toastMsg.ok ? 'checkmark-circle' : 'alert-circle'}
                  size={20}
                  color={vm.toastMsg.ok ? '#166534' : brandColors.error}
                />
                <Text style={styles.avisoTexto} maxFontSizeMultiplier={ESCALA}>{vm.toastMsg.text}</Text>
              </FadeInView>
            )}

            {/* 1. USUARIO */}
            <FadeInView>
              <TarjetaUsuario
                nombre={profile?.nombre}
                apellido={profile?.apellido_paterno}
                correo={profile?.correo_electronico}
                esGoogle={vm.esGoogle}
              />
            </FadeInView>

            {/* 2. ACCESOS RÁPIDOS */}
            <FadeInView delay={60} style={styles.card}>
              <FilaMenu icono="notifications-outline" titulo="Notificaciones" contador={vm.noLeidas} onPress={vm.irANotificaciones} />
              <FilaMenu icono="receipt-outline" titulo="Mis pedidos" onPress={vm.irAPedidos} ultima />
            </FadeInView>

            {/* 3. DATOS PERSONALES */}
            <FadeInView delay={120} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitulo} maxFontSizeMultiplier={ESCALA}>
                  {vm.editing ? 'Editar datos' : 'Datos personales'}
                </Text>
                {!vm.editing && (
                  <PressableScale style={styles.botonEditar} onPress={() => vm.setEditing(true)} scaleTo={0.92} hitSlop={8}>
                    <Ionicons name="create-outline" size={16} color={textColors.primary} />
                    <Text style={styles.botonEditarTexto} maxFontSizeMultiplier={ESCALA}>Editar</Text>
                  </PressableScale>
                )}
              </View>

              {vm.editing ? (
                <View style={styles.formulario}>
                  <CampoTexto etiqueta="Nombre" icono="person-outline" value={form.nombre || ''} onChangeText={(t) => setForm({ ...form, nombre: t })} />
                  <CampoTexto etiqueta="Apellido paterno" icono="person-outline" value={form.apellido_paterno || ''} onChangeText={(t) => setForm({ ...form, apellido_paterno: t })} />
                  <CampoTexto etiqueta="Apellido materno" icono="person-outline" value={form.apellido_materno || ''} onChangeText={(t) => setForm({ ...form, apellido_materno: t })} />
                  <CampoTexto etiqueta="Nombre de usuario" icono="at-outline" autoCapitalize="none" value={form.nombre_usuario || ''} onChangeText={(t) => setForm({ ...form, nombre_usuario: t })} />
                  <CampoTexto etiqueta="Teléfono" icono="call-outline" keyboardType="phone-pad" value={form.telefono || ''} onChangeText={(t) => setForm({ ...form, telefono: t })} />
                  <CampoTexto etiqueta="Domicilio" icono="location-outline" placeholder="Calle, número y colonia" value={form.domicilio || ''} onChangeText={(t) => setForm({ ...form, domicilio: t })} />
                  <CampoTexto etiqueta="Correo electrónico" icono="mail-outline" value={profile?.correo_electronico || ''} bloqueado />

                  <View style={styles.botones}>
                    <PressableScale style={[styles.boton, styles.botonSecundario]} onPress={vm.cancelarEdicion} disabled={vm.saving}>
                      <Text style={styles.botonSecundarioTexto} maxFontSizeMultiplier={ESCALA}>Cancelar</Text>
                    </PressableScale>
                    <PressableScale
                      style={[styles.boton, styles.botonPrincipal, vm.saving && styles.deshabilitado]}
                      onPress={vm.handleSaveProfile}
                      disabled={vm.saving}
                    >
                      <Text style={styles.botonPrincipalTexto} maxFontSizeMultiplier={ESCALA}>{vm.saving ? 'Guardando…' : 'Guardar'}</Text>
                    </PressableScale>
                  </View>
                </View>
              ) : (
                <>
                  <FilaDato icono="person-outline" etiqueta="Nombre completo" valor={nombreCompleto} />
                  <FilaDato icono="at-outline" etiqueta="Usuario" valor={profile?.nombre_usuario} />
                  <FilaDato icono="mail-outline" etiqueta="Correo" valor={profile?.correo_electronico} />
                  <FilaDato icono="call-outline" etiqueta="Teléfono" valor={profile?.telefono} />
                  <FilaDato icono="location-outline" etiqueta="Domicilio de envío" valor={profile?.domicilio} ultima />
                </>
              )}
            </FadeInView>

            {/* 4. CUENTA: contraseña (solo cuentas con correo) + cerrar sesión */}
            <FadeInView delay={180} style={styles.card}>
              {!vm.esGoogle && (
                <>
                  <FilaMenu
                    icono="lock-closed-outline"
                    titulo="Cambiar contraseña"
                    flecha={vm.showPwForm ? 'arriba' : 'abajo'}
                    onPress={vm.alternarPwForm}
                  />

                  {vm.showPwForm && (
                    <FadeInView distance={-8} duration={240} style={styles.formularioPw}>
                      <CampoTexto
                        etiqueta="Contraseña actual"
                        icono="key-outline"
                        secureTextEntry={!vm.verPw}
                        value={pwForm.actual}
                        onChangeText={(t) => setPwForm({ ...pwForm, actual: t })}
                        onAlternarVer={vm.alternarVerPw}
                        visible={vm.verPw}
                      />
                      <CampoTexto
                        etiqueta="Nueva contraseña"
                        icono="lock-closed-outline"
                        placeholder="Mínimo 6 caracteres"
                        secureTextEntry={!vm.verPw}
                        value={pwForm.nueva}
                        onChangeText={(t) => setPwForm({ ...pwForm, nueva: t })}
                      />
                      <CampoTexto
                        etiqueta="Confirmar contraseña"
                        icono="lock-closed-outline"
                        secureTextEntry={!vm.verPw}
                        value={pwForm.confirmar}
                        onChangeText={(t) => setPwForm({ ...pwForm, confirmar: t })}
                      />

                      {vm.pwMsg && (
                        <View style={styles.pwMensaje}>
                          <Ionicons
                            name={vm.pwMsg.ok ? 'checkmark-circle' : 'alert-circle'}
                            size={16}
                            color={vm.pwMsg.ok ? '#166534' : brandColors.error}
                          />
                          <Text style={[styles.pwMensajeTexto, { color: vm.pwMsg.ok ? '#166534' : brandColors.error }]} maxFontSizeMultiplier={ESCALA}>
                            {vm.pwMsg.text}
                          </Text>
                        </View>
                      )}

                      <PressableScale
                        style={[styles.boton, styles.botonCompleto, styles.botonPrincipal, vm.pwSaving && styles.deshabilitado]}
                        onPress={vm.handleSavePassword}
                        disabled={vm.pwSaving}
                      >
                        <Text style={styles.botonPrincipalTexto} maxFontSizeMultiplier={ESCALA}>
                          {vm.pwSaving ? 'Guardando…' : 'Guardar contraseña'}
                        </Text>
                      </PressableScale>
                    </FadeInView>
                  )}
                </>
              )}

              <FilaMenu icono="document-text-outline" titulo="Políticas y privacidad" onPress={vm.irAPoliticas} />
              <FilaMenu icono="trash-outline" titulo="Eliminar mi cuenta" onPress={vm.irAEliminarCuenta} />
              <FilaMenu icono="log-out-outline" titulo="Cerrar sesión" flecha="ninguna" peligro onPress={vm.pedirLogout} ultima />
            </FadeInView>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: surface.screen },
  scroll: { padding: space.lg, paddingBottom: 40, gap: space.md },

  // Aviso arriba
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.md,
  },
  avisoOk: { backgroundColor: '#DCFCE7' },
  avisoError: { backgroundColor: '#FEE2E2' },
  avisoTexto: { flex: 1, fontFamily: fontFamily.medium, fontSize: 14, color: textColors.primary },

  // Tarjetas
  card: {
    backgroundColor: surface.card,
    borderRadius: radius.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.xs,
    borderWidth: 1,
    borderColor: surface.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: space.md,
    paddingBottom: space.xs,
  },
  cardTitulo: { fontFamily: fontFamily.semibold, fontSize: 16, color: textColors.primary },
  botonEditar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: surface.muted,
  },
  botonEditarTexto: { fontFamily: fontFamily.medium, fontSize: 13, color: textColors.primary },

  // Formularios
  formulario: { gap: space.md, paddingTop: space.sm, paddingBottom: space.lg },
  formularioPw: { gap: space.md, paddingBottom: space.lg },
  pwMensaje: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pwMensajeTexto: { fontFamily: fontFamily.medium, fontSize: 13 },

  // Botones
  botones: { flexDirection: 'row', gap: space.sm, marginTop: space.xs },
  boton: { flex: 1, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  botonCompleto: { flex: 0 },
  botonPrincipal: { backgroundColor: brandColors.primary },
  botonPrincipalTexto: { fontFamily: fontFamily.semibold, fontSize: 15, color: '#FFFFFF' },
  botonSecundario: { borderWidth: 1, borderColor: surface.border, backgroundColor: surface.card },
  botonSecundarioTexto: { fontFamily: fontFamily.semibold, fontSize: 15, color: textColors.primary },
  deshabilitado: { opacity: 0.6 },
});