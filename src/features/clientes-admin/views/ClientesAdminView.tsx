import React from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { brandColors, brandTints } from '@/constants/brand';
import { CustomButton } from '@/shared/components/CustomButton';
import { FadeInView } from '@/shared/components/FadeInView';
import { Header } from '@/shared/components/Header';
import { Loading } from '@/shared/components/Loading';
import { ModalConfirmacion } from '@/shared/components/ModalConfirmacion';
import { PressableScale } from '@/shared/components/PressableScale';
import { getInitials } from '@/shared/utils/getInitials';
import { nombreCompleto, useClientesAdminViewModel } from '../viewmodels/useClientesAdminViewModel';
import type { Cliente } from '../models/Cliente';

const formatFecha = (valor?: string | null): string => {
  if (!valor) return '—';
  const f = new Date(valor);
  if (isNaN(f.getTime())) return '—';
  const dd = String(f.getDate()).padStart(2, '0');
  const mm = String(f.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${f.getFullYear()}`;
};

const EstadoBadge = ({ activo }: { activo: boolean }) => (
  <View style={[styles.badge, { backgroundColor: activo ? brandTints.accentSoft : brandTints.surfaceMuted }]}>
    <Text style={[styles.badgeTxt, { color: activo ? brandColors.primary : brandTints.textMuted }]}>
      {activo ? 'Activo' : 'Inactivo'}
    </Text>
  </View>
);

const FilaInfo = ({ etiqueta, valor }: { etiqueta: string; valor?: string | null }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{etiqueta}</Text>
    <Text style={styles.infoValue} numberOfLines={1}>{valor || '—'}</Text>
  </View>
);

interface ClienteCardProps {
  cliente: Cliente;
  procesando: boolean;
  onPress: () => void;
  onAlternar: () => void;
}

const ClienteCard = ({ cliente, procesando, onPress, onAlternar }: ClienteCardProps) => (
  <PressableScale
    style={[styles.card, !cliente.activo && styles.cardInactivo]}
    onPress={onPress}
    accessibilityRole="button"
  >
    <View style={styles.avatar}>
      <Text style={styles.avatarTxt}>{getInitials(cliente.nombre, cliente.apellido_paterno)}</Text>
    </View>
    <View style={styles.cardCuerpo}>
      <Text style={styles.cardNombre} numberOfLines={1}>
        {[cliente.nombre, cliente.apellido_paterno].filter(Boolean).join(' ')}
      </Text>
      <Text style={styles.cardCorreo} numberOfLines={1}>{cliente.correo_electronico}</Text>
    </View>
    <View style={styles.cardSwitch}>
      <Switch
        value={cliente.activo}
        onValueChange={onAlternar}
        disabled={procesando}
        trackColor={{ false: brandTints.border, true: brandColors.accent }}
        thumbColor={brandColors.white}
        accessibilityLabel={cliente.activo ? 'Desactivar cliente' : 'Activar cliente'}
      />
      <Text style={[styles.switchTxt, { color: cliente.activo ? brandColors.primary : brandTints.textMuted }]}>
        {procesando ? '...' : cliente.activo ? 'Activo' : 'Inactivo'}
      </Text>
    </View>
  </PressableScale>
);

export const ClientesAdminView = () => {
  const vm = useClientesAdminViewModel();
  const c = vm.seleccionado;

  return (
    <View style={styles.pantalla}>
      <Header subtitle="Clientes" />

      <View style={styles.buscador}>
        <TextInput
          style={styles.input}
          placeholder="Buscar por nombre, correo o usuario..."
          placeholderTextColor={brandTints.textMuted}
          value={vm.busqueda}
          onChangeText={vm.setBusqueda}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        {!vm.cargando && !vm.error && (
          <Text style={styles.conteo}>
            {vm.clientesFiltrados.length} de {vm.clientes.length} clientes
          </Text>
        )}
      </View>

      {vm.cargando ? (
        <Loading fullScreen />
      ) : (
        <FlatList
          data={vm.clientesFiltrados}
          keyExtractor={(item) => String(item.id_usuario)}
          renderItem={({ item }) => (
            <ClienteCard
              cliente={item}
              procesando={vm.procesando.includes(item.id_usuario)}
              onPress={() => vm.abrirDetalle(item)}
              onAlternar={() => vm.alternarActivo(item)}
            />
          )}
          contentContainerStyle={styles.lista}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={vm.refrescando}
              onRefresh={vm.refrescar}
              tintColor={brandColors.primary}
              colors={[brandColors.primary]}
            />
          }
          ListHeaderComponent={
            <>
              {vm.aviso && (
                <FadeInView
                  distance={-10}
                  duration={250}
                  style={[styles.aviso, vm.aviso.ok ? styles.avisoOk : styles.avisoErr]}
                >
                  <Text style={[styles.avisoTxt, vm.aviso.ok ? styles.avisoTxtOk : styles.avisoTxtErr]}>
                    {vm.aviso.texto}
                  </Text>
                </FadeInView>
              )}
              {vm.error && (
                <FadeInView style={styles.errorBox}>
                  <Text style={styles.errorTxt}>{vm.error}</Text>
                  <CustomButton title="Reintentar" variant="outline" onPress={vm.reintentar} />
                </FadeInView>
              )}
            </>
          }
          ListEmptyComponent={
            vm.error ? null : (
              <Text style={styles.vacio}>
                {vm.busqueda ? 'Ningún cliente coincide con tu búsqueda.' : 'Aún no hay clientes registrados.'}
              </Text>
            )
          }
        />
      )}

      <ModalConfirmacion
        visible={!!vm.porDesactivar}
        titulo="Desactivar cliente"
        mensaje={`¿Seguro que quieres desactivar a ${vm.porDesactivar ? nombreCompleto(vm.porDesactivar) : ''}?`}
        aviso="Podrás volver a activarlo cuando quieras."
        icono="🚫"
        textoConfirmar="Sí, desactivar"
        onConfirmar={vm.confirmarDesactivar}
        onCancelar={vm.cancelarDesactivar}
      />

      <Modal visible={!!c} transparent animationType="fade" onRequestClose={vm.cerrarDetalle}>
        <Pressable style={styles.fondoModal} onPress={vm.cerrarDetalle}>
          {/* Pressable interno: tocar la tarjeta no cierra el modal */}
          <Pressable style={styles.tarjetaModal} onPress={() => {}}>
            {c && (
              <>
                <View style={styles.modalCabecera}>
                  <View style={[styles.avatar, styles.avatarGrande]}>
                    <Text style={[styles.avatarTxt, styles.avatarTxtGrande]}>
                      {getInitials(c.nombre, c.apellido_paterno)}
                    </Text>
                  </View>
                  <Text style={styles.modalNombre}>{nombreCompleto(c)}</Text>
                  <Text style={styles.modalId}>Cliente #{c.id_usuario}</Text>
                </View>

                <FilaInfo etiqueta="Usuario" valor={c.nombre_usuario} />
                <FilaInfo etiqueta="Correo" valor={c.correo_electronico} />
                <FilaInfo etiqueta="Teléfono" valor={c.telefono} />
                <FilaInfo etiqueta="Registro" valor={c.proveedor === 'google' ? 'Cuenta Google' : 'Tradicional'} />
                <FilaInfo etiqueta="Alta" valor={formatFecha(c.fecha_registro)} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Estado</Text>
                  <EstadoBadge activo={c.activo} />
                </View>

                <View style={{ height: 14 }} />
                <CustomButton title="Cerrar" variant="outline" onPress={vm.cerrarDetalle} />
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: brandColors.background },

  buscador: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  input: {
    backgroundColor: brandColors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: brandColors.primaryDark,
    borderWidth: 1,
    borderColor: brandTints.border,
  },
  conteo: { fontSize: 12, color: brandTints.textMuted, marginTop: 8, marginLeft: 4 },

  lista: { padding: 16, paddingTop: 8, paddingBottom: 32, gap: 10 },
  vacio: { textAlign: 'center', color: brandTints.textMuted, paddingVertical: 32 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: brandColors.white,
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  cardInactivo: { opacity: 0.75 },
  cardCuerpo: { flex: 1 },
  cardSwitch: { alignItems: 'center' },
  switchTxt: { fontSize: 11, fontWeight: '800', marginTop: -2 },
  cardNombre: { fontSize: 15, fontWeight: '800', color: brandColors.primaryDark },
  cardCorreo: { fontSize: 12, color: brandTints.textMuted, marginTop: 2 },

  avatar: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: brandColors.accent,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarTxt: { color: brandColors.white, fontSize: 15, fontWeight: '800' },
  avatarGrande: { width: 64, height: 64, borderRadius: 32, marginBottom: 10 },
  avatarTxtGrande: { fontSize: 22 },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeTxt: { fontSize: 11, fontWeight: '800' },

  aviso: { padding: 12, borderRadius: 12, marginBottom: 10 },
  avisoOk: { backgroundColor: brandTints.accentSoft },
  avisoErr: { backgroundColor: brandTints.errorSoft },
  avisoTxt: { textAlign: 'center', fontWeight: '600' },
  avisoTxtOk: { color: brandColors.primary },
  avisoTxtErr: { color: brandColors.error },

  errorBox: { backgroundColor: brandTints.errorSoft, borderRadius: 12, padding: 12, marginBottom: 10, gap: 10 },
  errorTxt: { color: brandColors.error, fontWeight: '600', textAlign: 'center' },

  fondoModal: {
    flex: 1, backgroundColor: 'rgba(10, 43, 44, 0.55)',
    justifyContent: 'center', padding: 20,
  },
  tarjetaModal: { backgroundColor: brandColors.white, borderRadius: 20, padding: 20 },
  modalCabecera: { alignItems: 'center', marginBottom: 12 },
  modalNombre: { fontSize: 18, fontWeight: '800', color: brandColors.primaryDark, textAlign: 'center' },
  modalId: { fontSize: 12, color: brandTints.textMuted, marginTop: 2 },

  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, gap: 12,
    borderBottomWidth: 1, borderBottomColor: brandTints.surfaceMuted,
  },
  infoLabel: { color: brandTints.textMuted, fontSize: 13 },
  infoValue: { color: brandColors.primaryDark, fontWeight: '600', fontSize: 13, flexShrink: 1 },
});