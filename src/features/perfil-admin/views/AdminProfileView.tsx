import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useAdminProfileViewModel } from '../viewmodels/useAdminProfileViewModel';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { Loading } from '@/shared/components/Loading';
import { FadeInView } from '@/shared/components/FadeInView';
import { PressableScale } from '@/shared/components/PressableScale';
import { CustomButton } from '@/shared/components/CustomButton';
import { CustomInput } from '@/shared/components/CustomInput';
import { ModalConfirmacionLogout } from '@/shared/components/ModalConfirmacionLogout';
import { getInitials } from '@/shared/utils/getInitials';
import { brandColors, brandTints } from '@/constants/brand';

const FilaInfo = ({ etiqueta, valor }: { etiqueta: string; valor?: string | null }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{etiqueta}</Text>
    <Text style={styles.infoValue} numberOfLines={1}>{valor || '—'}</Text>
  </View>
);

// Perfil del administrador (el del cliente vive en features/perfil-cliente).
export const AdminProfileView = () => {
  const vm = useAdminProfileViewModel();
  const p = vm.perfil;
  const nombreCompleto = [p?.nombre, p?.apellido_paterno, p?.apellido_materno].filter(Boolean).join(' ');

  return (
    <View style={styles.pantalla}>
      <ScreenHeader title="Mi perfil" />

      <ModalConfirmacionLogout
        visible={vm.logoutVisible}
        onConfirmar={vm.confirmarLogout}
        onCancelar={vm.cancelarLogout}
      />

      {vm.cargando ? (
        <Loading fullScreen />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {vm.aviso && (
            <FadeInView distance={-10} duration={250} style={[styles.aviso, vm.aviso.ok ? styles.avisoOk : styles.avisoErr]}>
              <Text style={[styles.avisoTxt, vm.aviso.ok ? styles.avisoTxtOk : styles.avisoTxtErr]}>
                {vm.aviso.texto}
              </Text>
            </FadeInView>
          )}

          <FadeInView style={styles.userCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTxt}>{getInitials(p?.nombre, p?.apellido_paterno)}</Text>
            </View>
            <Text style={styles.userName}>{[p?.nombre, p?.apellido_paterno].filter(Boolean).join(' ')}</Text>
            <Text style={styles.userEmail}>{p?.correo_electronico}</Text>
            <View style={styles.badges}>
              <View style={styles.badge}><Text style={styles.badgeTxt}>Administrador</Text></View>
              <View style={styles.badge}>
                <Text style={styles.badgeTxt}>{vm.esGoogle ? '🌐 Cuenta Google' : '✉️ Registro tradicional'}</Text>
              </View>
            </View>
          </FadeInView>

          <FadeInView delay={100} style={styles.card}>
            {vm.editando ? (
              <>
                <Text style={styles.cardTitle}>Editar información</Text>
                <View style={{ height: 12 }} />
                <CustomInput label="Nombre *" value={vm.form.nombre} onChangeText={(t) => vm.editarCampo('nombre', t)} />
                <CustomInput label="Apellido paterno *" value={vm.form.apellido_paterno} onChangeText={(t) => vm.editarCampo('apellido_paterno', t)} />
                <CustomInput label="Apellido materno" value={vm.form.apellido_materno} onChangeText={(t) => vm.editarCampo('apellido_materno', t)} />
                <CustomInput label="Nombre de usuario *" autoCapitalize="none" value={vm.form.nombre_usuario} onChangeText={(t) => vm.editarCampo('nombre_usuario', t)} />
                <CustomInput label="Teléfono" keyboardType="phone-pad" value={vm.form.telefono} onChangeText={(t) => vm.editarCampo('telefono', t)} />

                <View style={styles.acciones}>
                  <CustomButton title={vm.guardando ? 'Guardando…' : 'Guardar'} onPress={vm.guardarPerfil} disabled={vm.guardando} style={styles.flex} />
                  <CustomButton title="Cancelar" variant="outline" onPress={vm.cancelarEdicion} disabled={vm.guardando} style={styles.flex} />
                </View>
              </>
            ) : (
              <>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Tu información</Text>
                  <PressableScale onPress={vm.iniciarEdicion} scaleTo={0.9} hitSlop={10}>
                    <Text style={styles.link}>Editar</Text>
                  </PressableScale>
                </View>
                <FilaInfo etiqueta="Nombre" valor={nombreCompleto} />
                <FilaInfo etiqueta="Usuario" valor={p?.nombre_usuario} />
                <FilaInfo etiqueta="Correo" valor={p?.correo_electronico} />
                <FilaInfo etiqueta="Teléfono" valor={p?.telefono} />
              </>
            )}
          </FadeInView>

          {!vm.esGoogle && (
            <FadeInView delay={160} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Seguridad</Text>
                <PressableScale onPress={vm.alternarPw} scaleTo={0.9} hitSlop={10}>
                  <Text style={styles.link}>{vm.verPw ? 'Ocultar' : 'Cambiar contraseña'}</Text>
                </PressableScale>
              </View>

              {vm.verPw && (
                <FadeInView distance={-8} duration={240}>
                  <CustomInput label="Contraseña actual" isPassword value={vm.pw.actual} onChangeText={(t) => vm.setPw({ ...vm.pw, actual: t })} />
                  <CustomInput label="Nueva contraseña" isPassword value={vm.pw.nueva} onChangeText={(t) => vm.setPw({ ...vm.pw, nueva: t })} />
                  <CustomInput label="Confirmar nueva contraseña" isPassword value={vm.pw.confirmar} onChangeText={(t) => vm.setPw({ ...vm.pw, confirmar: t })} />

                  {vm.pwAviso && (
                    <Text style={[styles.pwMsg, vm.pwAviso.ok ? styles.avisoTxtOk : styles.avisoTxtErr]}>
                      {vm.pwAviso.texto}
                    </Text>
                  )}

                  <CustomButton
                    title={vm.pwGuardando ? 'Guardando…' : 'Guardar contraseña'}
                    onPress={vm.guardarContrasena}
                    disabled={vm.pwGuardando}
                  />
                </FadeInView>
              )}
            </FadeInView>
          )}

          <FadeInView delay={220}>
            <CustomButton title="Cerrar sesión" variant="danger" onPress={vm.pedirLogout} />
          </FadeInView>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: brandColors.background },
  scroll: { padding: 16, paddingBottom: 32, gap: 14 },
  flex: { flex: 1 },

  aviso: { padding: 12, borderRadius: 12 },
  avisoOk: { backgroundColor: brandTints.accentSoft },
  avisoErr: { backgroundColor: brandTints.errorSoft },
  avisoTxt: { textAlign: 'center', fontWeight: '600' },
  avisoTxtOk: { color: brandColors.primary },
  avisoTxtErr: { color: brandColors.error },

  userCard: { backgroundColor: brandColors.white, padding: 20, borderRadius: 18, alignItems: 'center' },
  avatar: {
    width: 68, height: 68, borderRadius: 34, backgroundColor: brandColors.accent,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  avatarTxt: { color: brandColors.white, fontSize: 24, fontWeight: '800' },
  userName: { fontSize: 19, fontWeight: '800', color: brandColors.primaryDark },
  userEmail: { fontSize: 13, color: brandTints.textMuted, marginTop: 2, marginBottom: 10 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  badge: { backgroundColor: brandTints.accentSoft, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  badgeTxt: { fontSize: 12, color: brandColors.primary, fontWeight: '700' },

  card: { backgroundColor: brandColors.white, borderRadius: 16, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: brandColors.primaryDark },
  link: { color: brandColors.primary, fontWeight: '700', fontSize: 13 },
  acciones: { flexDirection: 'row', gap: 10 },

  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, gap: 12,
    borderBottomWidth: 1, borderBottomColor: brandTints.surfaceMuted,
  },
  infoLabel: { color: brandTints.textMuted, fontSize: 13 },
  infoValue: { color: brandColors.primaryDark, fontWeight: '600', fontSize: 13, flexShrink: 1 },

  pwMsg: { fontSize: 12, marginBottom: 10, textAlign: 'center', fontWeight: '600' },
});
