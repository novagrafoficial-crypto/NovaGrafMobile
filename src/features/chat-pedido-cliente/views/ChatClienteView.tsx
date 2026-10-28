import React, { useRef } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors, brandTints } from '@/constants/brand';
import { useChatClienteViewModel } from '../viewmodels/useChatClienteViewModel';

const hora = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? ''
    : d.toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

interface Props {
  pedidoId: number;
  onInputFocus?: () => void;
  /** true = ocupa toda la pantalla (pantalla de chat propia), sin límite de alto. */
  pantallaCompleta?: boolean;
}

export const ChatClienteView = ({ pedidoId, onInputFocus, pantallaCompleta }: Props) => {

  const vm = useChatClienteViewModel(pedidoId);
  const listaRef = useRef<ScrollView>(null);
  const puedeEnviar = !!vm.texto.trim() && !vm.enviando;

  return (
    <View style={[styles.card, pantallaCompleta && styles.cardCompleta]}>
      <ScrollView
        ref={listaRef}
        style={[styles.lista, pantallaCompleta && styles.listaCompleta]}
        contentContainerStyle={styles.listaContenido}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => listaRef.current?.scrollToEnd({ animated: true })}
      >
        {vm.cargando ? (
          <ActivityIndicator color={brandColors.primary} />
        ) : vm.mensajes.length === 0 ? (
          <Text style={styles.vacio}>Aún no hay mensajes. Escríbele al equipo sobre tu pedido.</Text>
        ) : (
          vm.mensajes.map((m) => {
            const mio = vm.esMio(m);
            return (
              <View key={m.id} style={[styles.fila, mio ? styles.filaMia : styles.filaOtro]}>
                <View style={[styles.burbuja, mio ? styles.burbujaMia : styles.burbujaOtro]}>
                  <Text style={[styles.nombre, mio && styles.textoMio]}>{mio ? 'Tú' : m.remitente_nombre}</Text>
                  <Text style={[styles.mensaje, mio && styles.textoMio]}>{m.mensaje}</Text>
                  <Text style={[styles.hora, mio && styles.textoMio]}>{hora(m.fecha_envio)}</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: brandColors.white, borderRadius: 14, padding: 14 },
  cardCompleta: { flex: 1, borderRadius: 0 },
  listaCompleta: { flex: 1, maxHeight: undefined },
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
    flex: 1, maxHeight: 110, borderWidth: 1, borderColor: brandTints.border, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: brandColors.primaryDark,
  },
  boton: { backgroundColor: brandColors.accent, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
  botonOff: { opacity: 0.5 },
  botonTxt: { color: brandColors.white, fontWeight: '700', fontSize: 14 },
});
