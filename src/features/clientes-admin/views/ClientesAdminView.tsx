import React from 'react';
import { FlatList, Modal, Pressable, RefreshControl, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import { AdminHeader, AvisoAdmin, FilaAdmin, PastillaAdmin } from '@/shared/components/admin';
import { CustomButton } from '@/shared/components/CustomButton';
import { Loading } from '@/shared/components/Loading';
import { ModalConfirmacion } from '@/shared/components/ModalConfirmacion';
import { PressableScale } from '@/shared/components/PressableScale';
import { getInitials } from '@/shared/utils/getInitials';
import { nombreCompleto, useClientesAdminViewModel } from '../viewmodels/useClientesAdminViewModel';
import type { Cliente } from '../models/Cliente';

const ESCALA = 1.15;

const formatFecha = (valor?: string | null): string => {
  if (!valor) return '—';
  const f = new Date(valor);
  if (Number.isNaN(f.getTime())) return '—';
  return `${String(f.getDate()).padStart(2, '0')}/${String(f.getMonth() + 1).padStart(2, '0')}/${f.getFullYear()}`;
};

const PastillaActivo = ({ activo }: { activo: boolean }) => (
  <PastillaAdmin
    texto={activo ? 'Activo' : 'Inactivo'}
    icono={activo ? 'checkmark-circle' : 'remove-circle'}
    bg={activo ? '#DCFCE7' : '#F4F4F5'}
    fg={activo ? '#166534' : '#52525B'}
  />
);

const ClienteFila = ({ cliente, procesando, onPress, onAlternar }: { cliente: Cliente; procesando: boolean; onPress: () => void; onAlternar: () => void }) => (
  <PressableScale style={[styles.card, !cliente.activo && styles.cardInactivo]} onPress={onPress} scaleTo={0.98} accessibilityRole="button">
    <View style={[styles.avatar, !cliente.activo && { backgroundColor: '#A1A1AA' }]}>
      <Text style={styles.avatarTexto} maxFontSizeMultiplier={1}>{getInitials(cliente.nombre, cliente.apellido_paterno)}</Text>
    </View>
    <View style={{ flex: 1, gap: 2 }}>
      <Text style={styles.nombre} numberOfLines={1} maxFontSizeMultiplier={ESCALA}>
        {[cliente.nombre, cliente.apellido_paterno].filter(Boolean).join(' ')}
      </Text>
      <Text style={styles.correo} numberOfLines={1} maxFontSizeMultiplier={ESCALA}>{cliente.correo_electronico}</Text>
      <View style={styles.meta}>
        <Ionicons name={cliente.proveedor === 'google' ? 'logo-google' : 'mail-outline'} size={12} color={textColors.muted} />
        <Text style={styles.metaTexto} maxFontSizeMultiplier={ESCALA}>Desde {formatFecha(cliente.fecha_registro)}</Text>
      </View>
    </View>
    <Switch
      value={cliente.activo}
      onValueChange={onAlternar}
      disabled={procesando}
      trackColor={{ false: surface.border, true: brandColors.accent }}
      thumbColor="#FFFFFF"
      accessibilityLabel={cliente.activo ? 'Desactivar cliente' : 'Activar cliente'}
    />
  </PressableScale>
);

export const ClientesAdminView = () => {
  const vm = useClientesAdminViewModel();
  const c = vm.seleccionado;

  const filtros = [
    { valor: 'TODOS' as const, etiqueta: 'Todos', cantidad: vm.clientes.length },
    { valor: 'ACTIVOS' as const, etiqueta: 'Activos', cantidad: vm.activos },
    { valor: 'INACTIVOS' as const, etiqueta: 'Inactivos', cantidad: vm.inactivos },
  ];

  return (
    <View style={styles.pantalla}>
      <AdminHeader titulo="Clientes">
        <View style={styles.buscador}>
          <Ionicons name="search-outline" size={18} color={textColors.muted} />
          <TextInput
            style={styles.input}
            placeholder="Buscar por nombre, correo o usuario"
            placeholderTextColor={textColors.muted}
            value={vm.busqueda}
            onChangeText={vm.setBusqueda}
            autoCapitalize="none"
            autoCorrect={false}
            maxFontSizeMultiplier={ESCALA}
          />
          {!!vm.busqueda && (
            <PressableScale onPress={() => vm.setBusqueda('')} hitSlop={8} accessibilityLabel="Borrar búsqueda">
              <Ionicons name="close-circle" size={18} color={textColors.muted} />
            </PressableScale>
          )}
        </View>
      </AdminHeader>

      {/* Filtros: Todos / Activos / Inactivos */}
      <View style={styles.filtros}>
        {filtros.map((f) => {
          const activo = vm.filtro === f.valor;
          return (
            <PressableScale key={f.valor} style={[styles.filtro, activo && styles.filtroActivo]} onPress={() => vm.setFiltro(f.valor)} scaleTo={0.95}>
              <Text style={[styles.filtroTexto, activo && { color: '#FFFFFF' }]} maxFontSizeMultiplier={ESCALA}>{f.etiqueta}</Text>
              <Text style={[styles.filtroNumero, activo && { color: 'rgba(255,255,255,0.85)' }]} maxFontSizeMultiplier={1}>{f.cantidad}</Text>
            </PressableScale>
          );
        })}
      </View>

      {vm.cargando ? (
        <Loading fullScreen />
      ) : (
        <FlatList
          data={vm.clientesFiltrados}
          keyExtractor={(item) => String(item.id_usuario)}
          renderItem={({ item }) => (
            <ClienteFila
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
            <RefreshControl refreshing={vm.refrescando} onRefresh={vm.refrescar} tintColor={brandColors.primary} colors={[brandColors.primary]} />
          }
          ListHeaderComponent={
            <>
              {vm.aviso && <AvisoAdmin texto={vm.aviso.texto} ok={vm.aviso.ok} />}
              {vm.error && (
                <View style={styles.error}>
                  <Ionicons name="cloud-offline-outline" size={22} color={brandColors.error} />
                  <Text style={styles.errorTexto}>{vm.error}</Text>
                  <CustomButton title="Reintentar" variant="outline" onPress={vm.reintentar} />
                </View>
              )}
            </>
          }
          ListEmptyComponent={
            vm.error ? null : (
              <View style={styles.vacio}>
                <Ionicons name="people-outline" size={40} color={textColors.muted} />
                <Text style={styles.vacioTexto} maxFontSizeMultiplier={ESCALA}>
                  {vm.busqueda || vm.filtro !== 'TODOS' ? 'Ningún cliente coincide con el filtro.' : 'Aún no hay clientes registrados.'}
                </Text>
              </View>
            )
          }
        />
      )}

      <ModalConfirmacion
        visible={!!vm.porDesactivar}
        titulo="Desactivar cliente"
        mensaje={`¿Seguro que quieres desactivar a ${vm.porDesactivar ? nombreCompleto(vm.porDesactivar) : ''}? No podrá iniciar sesión.`}
        aviso="Podrás volver a activarlo cuando quieras."
        icono="person-remove-outline"
        textoConfirmar="Sí, desactivar"
        onConfirmar={vm.confirmarDesactivar}
        onCancelar={vm.cancelarDesactivar}
      />

      {/* Ficha del cliente */}
      <Modal visible={!!c} transparent animationType="slide" onRequestClose={vm.cerrarDetalle}>
        <Pressable style={styles.fondoModal} onPress={vm.cerrarDetalle}>
          <Pressable style={styles.hoja} onPress={() => {}}>
            {c && (
              <>
                <View style={styles.agarradera} />
                <View style={styles.fichaCabecera}>
                  <View style={[styles.avatar, styles.avatarGrande]}>
                    <Text style={[styles.avatarTexto, { fontSize: 22 }]} maxFontSizeMultiplier={1}>{getInitials(c.nombre, c.apellido_paterno)}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.fichaNombre} maxFontSizeMultiplier={ESCALA}>{nombreCompleto(c)}</Text>
                    <Text style={styles.metaTexto} maxFontSizeMultiplier={ESCALA}>Cliente #{c.id_usuario}</Text>
                    <PastillaActivo activo={c.activo} />
                  </View>
                  <PressableScale style={styles.cerrar} onPress={vm.cerrarDetalle} hitSlop={8} accessibilityLabel="Cerrar">
                    <Ionicons name="close" size={20} color={textColors.primary} />
                  </PressableScale>
                </View>

                <View>
                  <FilaAdmin etiqueta="Usuario" valor={c.nombre_usuario} />
                  <FilaAdmin etiqueta="Correo" valor={c.correo_electronico} />
                  <FilaAdmin etiqueta="Teléfono" valor={c.telefono} />
                  <FilaAdmin etiqueta="Tipo de cuenta" valor={c.proveedor === 'google' ? 'Google' : 'Correo y contraseña'} />
                  <FilaAdmin etiqueta="Registro" valor={formatFecha(c.fecha_registro)} ultima />
                </View>

                <PressableScale
                  style={[styles.botonEstado, c.activo ? styles.botonDesactivar : styles.botonActivar]}
                  onPress={() => vm.alternarActivo(c)}
                  disabled={vm.procesando.includes(c.id_usuario)}
                  scaleTo={0.97}
                >
                  <Ionicons name={c.activo ? 'person-remove-outline' : 'person-add-outline'} size={18} color={c.activo ? brandColors.error : '#FFFFFF'} />
                  <Text style={[styles.botonEstadoTexto, { color: c.activo ? brandColors.error : '#FFFFFF' }]} maxFontSizeMultiplier={ESCALA}>
                    {c.activo ? 'Desactivar cliente' : 'Activar cliente'}
                  </Text>
                </PressableScale>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: surface.screen },

  buscador: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: surface.card,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
  },
  input: { flex: 1, height: '100%', fontFamily: fontFamily.regular, fontSize: 14, color: textColors.primary, paddingVertical: 0 },

  filtros: {
    flexDirection: 'row',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingVertical: 10,
    backgroundColor: surface.card,
    borderBottomWidth: 1,
    borderBottomColor: surface.border,
  },
  filtro: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: surface.border,
  },
  filtroActivo: { backgroundColor: brandColors.primary, borderColor: brandColors.primary },
  filtroTexto: { fontFamily: fontFamily.medium, fontSize: 13, color: textColors.primary },
  filtroNumero: { fontFamily: fontFamily.semibold, fontSize: 12, color: textColors.muted },

  lista: { padding: space.lg, paddingBottom: 40, gap: space.sm, flexGrow: 1 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: surface.card,
    borderRadius: radius.md,
    padding: space.md,
    borderWidth: 1,
    borderColor: surface.border,
  },
  cardInactivo: { opacity: 0.7 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: brandColors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarGrande: { width: 60, height: 60, borderRadius: 30 },
  avatarTexto: { fontFamily: fontFamily.bold, fontSize: 15, color: '#FFFFFF' },
  nombre: { fontFamily: fontFamily.semibold, fontSize: 15, color: textColors.primary },
  correo: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.secondary },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaTexto: { fontFamily: fontFamily.regular, fontSize: 12, color: textColors.muted },

  error: { alignItems: 'center', gap: space.sm, padding: space.lg, backgroundColor: surface.card, borderRadius: radius.lg },
  errorTexto: { fontFamily: fontFamily.medium, fontSize: 14, color: textColors.primary, textAlign: 'center' },
  vacio: { alignItems: 'center', gap: space.sm, paddingTop: 48 },
  vacioTexto: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary, textAlign: 'center' },

  // Ficha
  fondoModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  hoja: {
    backgroundColor: surface.card,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: space.lg,
    paddingBottom: 32,
    gap: space.md,
  },
  agarradera: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: surface.border },
  fichaCabecera: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  fichaNombre: { fontFamily: fontFamily.bold, fontSize: 18, color: textColors.primary },
  cerrar: { width: 34, height: 34, borderRadius: 17, backgroundColor: surface.muted, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  botonEstado: { height: 48, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm },
  botonDesactivar: { borderWidth: 1, borderColor: '#FECACA' },
  botonActivar: { backgroundColor: brandColors.primary },
  botonEstadoTexto: { fontFamily: fontFamily.semibold, fontSize: 15 },
});
