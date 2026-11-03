/**
 * Permiso de galería en tiempo de ejecución con diálogo explicativo previo.
 */
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { pedirPermisoGaleria } from '../../src/shared/utils/permisos';

jest.mock('expo-image-picker', () => ({
  getMediaLibraryPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
}));

const picker = ImagePicker as jest.Mocked<typeof ImagePicker>;
const responderDialogo = (boton: 'Continuar' | 'Ahora no') =>
  jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, botones) => {
    botones?.find((b) => b.text === boton)?.onPress?.();
  });

describe('Permiso de galería a demanda', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('PS-07 · si ya hay permiso no muestra diálogo', async () => {
    (picker.getMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
    const alerta = jest.spyOn(Alert, 'alert');
    expect(await pedirPermisoGaleria()).toBe(true);
    expect(alerta).not.toHaveBeenCalled();
  });

  it('PS-08 · explica el motivo ANTES de pedir el permiso del sistema', async () => {
    (picker.getMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false, canAskAgain: true });
    (picker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
    const alerta = responderDialogo('Continuar');
    expect(await pedirPermisoGaleria()).toBe(true);
    expect(alerta).toHaveBeenCalledWith('Acceso a tus fotos', expect.any(String), expect.any(Array), expect.any(Object));
    expect(picker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
  });

  it('PS-09 · si el usuario dice "Ahora no" no se pide el permiso', async () => {
    (picker.getMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false, canAskAgain: true });
    responderDialogo('Ahora no');
    expect(await pedirPermisoGaleria()).toBe(false);
    expect(picker.requestMediaLibraryPermissionsAsync).not.toHaveBeenCalled();
  });
});

describe('Permiso de galería desactivado', () => {
  it('PS-17 · si ya no se puede preguntar, ofrece abrir Ajustes y no abre la galería', async () => {
    const { Linking } = require('react-native');
    const abrirAjustes = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
    (picker.getMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false, canAskAgain: false });
    jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, botones) => {
      botones?.find((b) => b.text === 'Abrir ajustes')?.onPress?.();
    });
    expect(await pedirPermisoGaleria()).toBe(false);
    expect(abrirAjustes).toHaveBeenCalled();
    expect(picker.requestMediaLibraryPermissionsAsync).not.toHaveBeenCalled();
  });
});
