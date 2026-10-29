import React, { useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import { formatFecha } from '@/features/pedidos-admin/utils/pedidoAdminUtils';
import { SeccionAdmin } from '@/shared/components/admin';
import { PressableScale } from '@/shared/components/PressableScale';
import { useChatPedidoViewModel } from '../viewmodels/useChatPedidoViewModel';

interface Props {
  pedidoId: number;
  /** Para que la pantalla de detalle baje hasta el chat cuando sale el teclado. */
  onInputFocus?: () => void;
}

const ESCALA = 1.15;

export const ChatPedidoView = ({ pedidoId, onInputFocus }: Props) => {
  const vm = useChatPedidoViewModel(pedidoId);
  const listaRef = useRef<ScrollView>(null);
  const [enfocado, setEnfocado] = useState(false);
  const puedeEnviar = !!vm.texto.trim() && !vm.enviando;

  return (
    <SeccionAdmin titulo="Chat con el cliente" icono="chatbubbles-outline" derecha={vm.mensajes.length ? `${vm.mensajes.length}` : undefined}>
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
          <View style={styles.vacio}>
            <Ionicons name="chatbubble-ellipses-outline" size={30} color={textColors.muted} />
            <Text style={styles.vacioTexto} maxFontSizeMultiplier={ESCALA}>Aún no hay mensajes. Escríbele al cliente si necesitas algo.</Text>
          </View>
        ) : (
          vm.mensajes.map((m) => {
            const mio = vm.esMio(m);
            return (
              <View key={m.id} style={[styles.fila, mio ? styles.filaMia : styles.filaOtro]}>
                <View style={[styles.burbuja, mio ? styles.burbujaMia : styles.burbujaOtro]}>
                  {!mio && <Text style={styles.nombre} maxFontSizeMultiplier={ESCALA}>{m.remitente_nombre}</Text>}
                  <Text style={[styles.mensaje, mio && styles.textoMio]} maxFontSizeMultiplier={ESCALA}>{m.mensaje}</Text>
                  <Text style={[styles.hora, mio && styles.horaMia]} maxFontSizeMultiplier={ESCALA}>{formatFecha(m.fecha_envio, true)}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {!!vm.error && (
        <View style={styles.error}>
          <Ionicons name="alert-circle-outline" size={15} color={brandColors.error} />
          <Text style={styles.errorTexto} maxFontSizeMultiplier={ESCALA}>{vm.error}</Text>
        </View>
      )}

      <View style={styles.envio}>
        <TextInput
          style={[styles.input, enfocado && styles.inputEnfocado]}
          placeholder="Escribe un mensaje…"
          placeholderTextColor={textColors.muted}
          value={vm.texto}
          onChangeText={vm.setTexto}
          onFocus={() => { setEnfocado(true); onInputFocus?.(); }}
          onBlur={() => setEnfocado(false)}
          editable={!vm.enviando}
          multiline
          maxLength={1000}
          maxFontSizeMultiplier={ESCALA}
        />
        <PressableScale
          style={[styles.boton, !puedeEnviar && styles.botonOff]}
          onPress={vm.enviar}
          disabled={!puedeEnviar}
          scaleTo={0.9}
          accessibilityRole="button"
          accessibilityLabel="Enviar mensaje"
        >
          {vm.enviando ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Ionicons name="send" size={18} color="#FFFFFF" />}
        </PressableScale>
      </View>
    </SeccionAdmin>
  );
};

const styles = StyleSheet.create({
  lista: { maxHeight: 340 },
  listaContenido: { gap: space.sm, flexGrow: 1 },
  vacio: { alignItems: 'center', gap: space.sm, paddingVertical: space.md },
  vacioTexto: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary, textAlign: 'center' },

  fila: { flexDirection: 'row' },
  filaMia: { justifyContent: 'flex-end' },
  filaOtro: { justifyContent: 'flex-start' },
  burbuja: { maxWidth: '80%', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, gap: 2 },
  burbujaMia: { backgroundColor: brandColors.primary, borderBottomRightRadius: 4 },
  burbujaOtro: { backgroundColor: surface.muted, borderBottomLeftRadius: 4 },
  nombre: { fontFamily: fontFamily.semibold, fontSize: 12, color: brandColors.primary },
  mensaje: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 20, color: textColors.primary },
  textoMio: { color: '#FFFFFF' },
  hora: { fontFamily: fontFamily.regular, fontSize: 11, color: textColors.muted, textAlign: 'right' },
  horaMia: { color: 'rgba(255,255,255,0.75)' },

  error: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  errorTexto: { flex: 1, fontFamily: fontFamily.medium, fontSize: 13, color: brandColors.error },

  envio: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    borderWidth: 1,
    borderColor: surface.border,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: 10,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: textColors.primary,
  },
  inputEnfocado: { borderColor: brandColors.primary, borderWidth: 1.5 },
  boton: { width: 44, height: 44, borderRadius: 22, backgroundColor: brandColors.primary, alignItems: 'center', justifyContent: 'center' },
  botonOff: { opacity: 0.45 },
});
