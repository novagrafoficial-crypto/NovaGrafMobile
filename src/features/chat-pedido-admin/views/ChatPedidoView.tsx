import { brandColors, brandTints } from '@/constants/brand';
import { formatFecha } from '@/features/pedidos-admin/utils/pedidoAdminUtils';
import { FadeInView } from '@/shared/components/FadeInView';
import { PressableScale } from '@/shared/components/PressableScale';
import React, { useRef } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useChatPedidoViewModel } from '../viewmodels/useChatPedidoViewModel';

interface Props {
  pedidoId: number;
  /** Para que la pantalla de detalle baje hasta el chat cuando sale el teclado. */
  onInputFocus?: () => void;
}

export const ChatPedidoView = ({ pedidoId, onInputFocus }: Props) => {
  const vm = useChatPedidoViewModel(pedidoId);
  const listaRef = useRef<ScrollView>(null);
  const puedeEnviar = !!vm.texto.trim() && !vm.enviando;

  return (
    <FadeInView delay={260} style={styles.card}>
      <Text style={styles.titulo}>Chat con el cliente</Text>

      <ScrollView
        ref={listaRef}
        style={styles.lista}
        contentContainerStyle={styles.listaContenido}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => listaRef.current?.scrollToEnd({ animated: true })}
      >
        {vm.cargando ? (
          <ActivityIndicator color={brandColors.primary} />
        ) : vm.mensajes.length === 0 ? (
          <Text style={styles.vacio}>Sin mensajes aún.</Text>
        ) : (
          vm.mensajes.map((m) => {
            const mio = vm.esMio(m);
            return (
              <View key={m.id} style={[styles.fila, mio ? styles.filaMia : styles.filaOtro]}>
                <View style={[styles.burbuja, mio ? styles.burbujaMia : styles.burbujaOtro]}>
                  <Text style={[styles.nombre, mio && styles.textoMio]}>{m.remitente_nombre}</Text>
                  <Text style={[styles.mensaje, mio && styles.textoMio]}>{m.mensaje}</Text>
                  <Text style={[styles.hora, mio && styles.textoMio]}>{formatFecha(m.fecha_envio, true)}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {!!vm.error && <Text style={styles.error}>{vm.error}</Text>}

      <View style={styles.envio}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={brandTints.textMuted}
          value={vm.texto}
          onChangeText={vm.setTexto}
          onFocus={onInputFocus}
          editable={!vm.enviando}
          multiline
          maxLength={1000}
        />
        <PressableScale
          style={[styles.boton, !puedeEnviar && styles.botonOff]}
          onPress={vm.enviar}
          disabled={!puedeEnviar}
          accessibilityRole="button"
          accessibilityLabel="Enviar mensaje"
        >
          <Text style={styles.botonTxt}>{vm.enviando ? '…' : 'Enviar'}</Text>
        </PressableScale>
      </View>
    </FadeInView>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: brandColors.white, borderRadius: 16, padding: 16 },
  titulo: { fontSize: 16, fontWeight: '800', color: brandColors.primaryDark, marginBottom: 10 },

  lista: { maxHeight: 320, marginBottom: 10 },
  listaContenido: { gap: 8, flexGrow: 1 },
  vacio: { color: brandTints.textMuted, fontSize: 13 },

  fila: { flexDirection: 'row' },
  filaMia: { justifyContent: 'flex-end' },
  filaOtro: { justifyContent: 'flex-start' },
  burbuja: { maxWidth: '78%', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14 },
  burbujaMia: { backgroundColor: brandColors.primary },
  burbujaOtro: { backgroundColor: brandTints.surfaceMuted, borderWidth: 1, borderColor: brandTints.border },
  nombre: { fontSize: 11, fontWeight: '700', color: brandTints.textMuted, marginBottom: 2 },
  mensaje: { fontSize: 14, color: brandColors.primaryDark, lineHeight: 19 },
  hora: { fontSize: 10, color: brandTints.textMuted, marginTop: 4, textAlign: 'right' },
  textoMio: { color: brandColors.white },

  error: { color: brandColors.error, fontSize: 12, fontWeight: '600', marginBottom: 8 },

  envio: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  input: {
    flex: 1,
    maxHeight: 110,
    borderWidth: 1,
    borderColor: brandTints.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: brandColors.primaryDark,
  },
  boton: { backgroundColor: brandColors.accent, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
  botonOff: { opacity: 0.5 },
  botonTxt: { color: brandColors.white, fontWeight: '700', fontSize: 14 },
});