import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useClientProfileViewModel } from '../viewmodels/useClientProfileViewModel';
import { ModalConfirmacionLogout } from '@/shared/components/ModalConfirmacionLogout';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { Loading } from '@/shared/components/Loading';
import { FadeInView } from '@/shared/components/FadeInView';
import { PressableScale } from '@/shared/components/PressableScale';
import { getInitials } from '@/shared/utils/getInitials';
import { brandColors, brandTints } from '@/constants/brand';

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
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {vm.toastMsg && (
            <FadeInView distance={-10} duration={250} style={[styles.toast, vm.toastMsg.ok ? styles.toastOk : styles.toastErr]}>
              <Text style={[styles.toastText, vm.toastMsg.ok ? styles.toastTextOk : styles.toastTextErr]}>
                {vm.toastMsg.text}
              </Text>
            </FadeInView>
          )}

          {/* TARJETA DE USUARIO */}
          <FadeInView style={styles.userCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(profile?.nombre, profile?.apellido_paterno)}</Text>
            </View>
            <Text style={styles.userName}>
              {profile?.nombre} {profile?.apellido_paterno}
            </Text>
            <Text style={styles.userEmail}>{profile?.correo_electronico}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{vm.esGoogle ? '🌐 Cuenta Google' : '✉️ Registro tradicional'}</Text>
            </View>
          </FadeInView>

          {/* DIRECCIÓN DE ENVÍO */}
          {!!profile?.domicilio && (
            <FadeInView delay={80} style={styles.bannerAddress}>
            <Text style={styles.addressIcon}>📍</Text>
            <View style={styles.addressInfo}>
              <Text style={styles.addressTitle}>Enviar a {profile?.nombre}</Text>
              <Text style={styles.addressText}>
                {profile?.domicilio || 'Aún no tienes domicilio. Toca "Editar" para agregarlo.'}
              </Text>
            </View>
          </FadeInView>
          )}

          {/* INFORMACIÓN PERSONAL */}
          <FadeInView delay={140} style={styles.card}>
            {vm.editing ? (
              <>
                <Text style={styles.cardTitle}>Editar información personal</Text>
                <Text style={styles.cardSub}>
                  {vm.esGoogle ? 'Cuenta Google — correo no editable' : 'Mantén tus datos actualizados'}
                </Text>

                <Text style={styles.label}>Nombre *</Text>
                <TextInput style={styles.input} value={form.nombre || ''} onChangeText={(t) => setForm({ ...form, nombre: t })} />

                <Text style={styles.label}>Apellido paterno *</Text>
                <TextInput style={styles.input} value={form.apellido_paterno || ''} onChangeText={(t) => setForm({ ...form, apellido_paterno: t })} />

                <Text style={styles.label}>Apellido materno</Text>
                <TextInput style={styles.input} value={form.apellido_materno || ''} onChangeText={(t) => setForm({ ...form, apellido_materno: t })} />

                <Text style={styles.label}>Nombre de usuario *</Text>
                <TextInput style={styles.input} autoCapitalize="none" value={form.nombre_usuario || ''} onChangeText={(t) => setForm({ ...form, nombre_usuario: t })} />

                <Text style={styles.label}>Teléfono</Text>
                <TextInput style={styles.input} keyboardType="phone-pad" value={form.telefono || ''} onChangeText={(t) => setForm({ ...form, telefono: t })} />
                
                <Text style={styles.label}>Domicilio</Text>
                <TextInput style={styles.input} placeholder="Calle, número y colonia" placeholderTextColor={brandTints.textMuted} value={form.domicilio || ''} onChangeText={(t) => setForm({ ...form, domicilio: t })} />

                <Text style={styles.label}>Correo electrónico (no editable)</Text>
                <TextInput style={[styles.input, styles.inputDisabled]} value={profile?.correo_electronico} editable={false} />

                <View style={styles.actionRow}>
                  <PressableScale style={[styles.btn, styles.btnSave, vm.saving && styles.btnDisabled]} onPress={vm.handleSaveProfile} disabled={vm.saving}>
                    <Text style={styles.btnSaveText}>{vm.saving ? 'Guardando…' : 'Guardar'}</Text>
                  </PressableScale>
                  <PressableScale style={[styles.btn, styles.btnCancel]} onPress={() => vm.setEditing(false)}>
                    <Text style={styles.btnCancelText}>Cancelar</Text>
                  </PressableScale>
                </View>
              </>
            ) : (
              <>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Tu información</Text>
                  <PressableScale onPress={() => vm.setEditing(true)} scaleTo={0.9} hitSlop={10}>
                    <Text style={styles.linkText}>Editar</Text>
                  </PressableScale>
                </View>
                <FilaInfo etiqueta="Nombre" valor={nombreCompleto} />
                <FilaInfo etiqueta="Usuario" valor={profile?.nombre_usuario} />
                <FilaInfo etiqueta="Correo" valor={profile?.correo_electronico} />
                <FilaInfo etiqueta="Teléfono" valor={profile?.telefono} />
                <FilaInfo etiqueta="Domicilio" valor={profile?.domicilio} />
              </>
            )}
          </FadeInView>

          {/* SEGURIDAD (solo cuentas tradicionales) */}
          {!vm.esGoogle && (
            <FadeInView delay={200} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Seguridad</Text>
                <PressableScale onPress={vm.alternarPwForm} scaleTo={0.9} hitSlop={10}>
                  <Text style={styles.linkText}>{vm.showPwForm ? 'Ocultar' : 'Cambiar contraseña'}</Text>
                </PressableScale>
              </View>

              {vm.showPwForm && (
                <FadeInView distance={-8} duration={240}>
                  <TextInput style={styles.input} secureTextEntry placeholder="Contraseña actual" placeholderTextColor={brandTints.textMuted} value={pwForm.actual} onChangeText={(t) => setPwForm({ ...pwForm, actual: t })} />
                  <TextInput style={styles.input} secureTextEntry placeholder="Nueva contraseña" placeholderTextColor={brandTints.textMuted} value={pwForm.nueva} onChangeText={(t) => setPwForm({ ...pwForm, nueva: t })} />
                  <TextInput style={styles.input} secureTextEntry placeholder="Confirmar nueva contraseña" placeholderTextColor={brandTints.textMuted} value={pwForm.confirmar} onChangeText={(t) => setPwForm({ ...pwForm, confirmar: t })} />

                  {vm.pwMsg && (
                    <Text style={[styles.msgText, vm.pwMsg.ok ? styles.okText : styles.errText]}>{vm.pwMsg.text}</Text>
                  )}

                  <PressableScale style={[styles.btn, styles.btnSave, styles.btnFull, vm.pwSaving && styles.btnDisabled]} onPress={vm.handleSavePassword} disabled={vm.pwSaving}>
                    <Text style={styles.btnSaveText}>{vm.pwSaving ? 'Guardando…' : 'Guardar contraseña'}</Text>
                  </PressableScale>
                </FadeInView>
              )}
            </FadeInView>
          )}

          {/* CERRAR SESIÓN */}
          <FadeInView delay={260}>
            <PressableScale style={styles.logoutBtn} onPress={vm.pedirLogout}>
              <Text style={styles.logoutBtnText}>Cerrar sesión</Text>
            </PressableScale>
          </FadeInView>
        </ScrollView>
      )}
    </View>
  );
};

const FilaInfo = ({ etiqueta, valor, ultima }: { etiqueta: string; valor?: string | null; ultima?: boolean }) => (
  <View style={[styles.infoRow, ultima && styles.infoRowLast]}>
    <Text style={styles.infoLabel}>{etiqueta}</Text>
    <Text style={styles.infoValue} numberOfLines={1}>
      {valor || '—'}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: brandColors.background },
  scroll: { padding: 16, paddingBottom: 32, gap: 14 },

  toast: { padding: 12, borderRadius: 12 },
  toastOk: { backgroundColor: brandTints.accentSoft },
  toastErr: { backgroundColor: brandTints.errorSoft },
  toastText: { textAlign: 'center', fontWeight: '600' },
  toastTextOk: { color: brandColors.primary },
  toastTextErr: { color: brandColors.error },

  userCard: { backgroundColor: brandColors.white, padding: 20, borderRadius: 18, alignItems: 'center' },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: brandColors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: { color: brandColors.white, fontSize: 24, fontWeight: '800' },
  userName: { fontSize: 19, fontWeight: '800', color: brandColors.primaryDark },
  userEmail: { fontSize: 13, color: brandTints.textMuted, marginTop: 2, marginBottom: 10 },
  badge: { backgroundColor: brandTints.accentSoft, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  badgeText: { fontSize: 12, color: brandColors.primary, fontWeight: '700' },

  bannerAddress: {
    backgroundColor: brandColors.primary,
    padding: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressIcon: { fontSize: 20 },
  addressInfo: { flex: 1, marginLeft: 10 },
  addressTitle: { fontWeight: '700', color: brandColors.white },
  addressText: { color: brandTints.accentSoft, fontSize: 13, marginTop: 2 },

  card: { backgroundColor: brandColors.white, borderRadius: 16, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: brandColors.primaryDark },
  cardSub: { fontSize: 12, color: brandTints.textMuted, marginTop: 2, marginBottom: 8 },
  linkText: { color: brandColors.primary, fontWeight: '700', fontSize: 13 },

  label: { fontSize: 12, fontWeight: '700', color: brandTints.textMuted, marginTop: 10, marginBottom: 4 },
  input: {
    backgroundColor: brandTints.surfaceMuted,
    borderWidth: 1.5,
    borderColor: brandTints.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: brandColors.primaryDark,
    marginBottom: 8,
  },
  inputDisabled: { opacity: 0.6 },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnFull: { flex: 0, marginTop: 4 },
  btnDisabled: { opacity: 0.5 },
  btnSave: { backgroundColor: brandColors.primary },
  btnSaveText: { color: brandColors.white, fontWeight: '700' },
  btnCancel: { backgroundColor: brandTints.surfaceMuted },
  btnCancelText: { color: brandColors.primaryDark, fontWeight: '600' },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: brandTints.surfaceMuted,
    gap: 12,
  },
  infoRowLast: { borderBottomWidth: 0 },
  infoLabel: { color: brandTints.textMuted, fontSize: 13 },
  infoValue: { color: brandColors.primaryDark, fontWeight: '600', fontSize: 13, flexShrink: 1 },

  msgText: { fontSize: 12, marginBottom: 6, textAlign: 'center', fontWeight: '600' },
  okText: { color: brandColors.primary },
  errText: { color: brandColors.error },

  logoutBtn: {
    backgroundColor: brandColors.white,
    borderWidth: 1.5,
    borderColor: brandColors.error,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutBtnText: { color: brandColors.error, fontWeight: '800' },
});
