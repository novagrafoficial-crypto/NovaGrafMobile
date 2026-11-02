import { Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

/** Muestra un diálogo y espera la respuesta del usuario. */
const preguntar = (titulo: string, mensaje: string, aceptar: string): Promise<boolean> =>
  new Promise((resolve) => {
    Alert.alert(
      titulo,
      mensaje,
      [
        { text: 'Ahora no', style: 'cancel', onPress: () => resolve(false) },
        { text: aceptar, onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });

const MOTIVO_GALERIA =
  'Nova Graf necesita acceder a tus fotos solo para que elijas la imagen que tú selecciones ' +
  '(comprobante de pago o diseño de tu pedido). No vemos ni guardamos ninguna otra foto.';

/**
 * Permiso de galería solicitado A DEMANDA y con explicación previa.
 * Devuelve true si se puede abrir la galería.
 */
export const pedirPermisoGaleria = async (): Promise<boolean> => {
  const actual = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (actual.granted) return true;

  // Ya lo negó y Android no deja volver a preguntar: se ofrece abrir Ajustes.
  if (!actual.canAskAgain) {
    const irAjustes = await preguntar(
      'Permiso de fotos desactivado',
      `${MOTIVO_GALERIA}\n\nPuedes activarlo en los ajustes de la app.`,
      'Abrir ajustes'
    );
    if (irAjustes) await Linking.openSettings();
    return false;
  }

  // Diálogo explicativo ANTES del permiso del sistema.
  const continuar = await preguntar('Acceso a tus fotos', MOTIVO_GALERIA, 'Continuar');
  if (!continuar) return false;

  const respuesta = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return respuesta.granted;
};
