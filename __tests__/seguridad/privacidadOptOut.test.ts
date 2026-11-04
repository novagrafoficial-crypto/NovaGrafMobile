/**
 * Derecho ARCO de Oposición (Opt-Out): lógica del switch de privacidad.
 */
import { renderHook, act } from '@testing-library/react-native';
import {
  usePreferenciasPrivacidad,
  MSG_PRIVACIDAD_CARGA,
  MSG_PRIVACIDAD_GUARDAR,
} from '../../src/features/perfil-cliente/viewmodels/usePreferenciasPrivacidad';
import { clientProfileService } from '../../src/features/perfil-cliente/services/clientProfileService';

jest.mock('../../src/features/perfil-cliente/services/clientProfileService', () => ({
  clientProfileService: { getPrivacidad: jest.fn(), updatePrivacidad: jest.fn() },
}));

const servicio = clientProfileService as unknown as Record<'getPrivacidad' | 'updatePrivacidad', jest.Mock>;

describe('Privacidad: switch Opt-Out', () => {
  beforeEach(() => jest.clearAllMocks());

  it('PS-21 · carga la preferencia guardada en el backend', async () => {
    servicio.getPrivacidad.mockResolvedValue({ recibe_avisos: false });
    const { result } = await renderHook(() => usePreferenciasPrivacidad(7));
    await act(async () => {});
    expect(servicio.getPrivacidad).toHaveBeenCalledWith(7);
    expect(result.current.prefs).toEqual({ recibe_avisos: false });
    expect(result.current.cargando).toBe(false);
  });

  it('PS-22 · al apagar el switch se guarda en el backend', async () => {
    servicio.getPrivacidad.mockResolvedValue({ recibe_avisos: true });
    servicio.updatePrivacidad.mockResolvedValue({ recibe_avisos: false });
    const { result } = await renderHook(() => usePreferenciasPrivacidad(7));
    await act(async () => {});
    await act(async () => {
      await result.current.cambiar('recibe_avisos', false);
    });
    expect(servicio.updatePrivacidad).toHaveBeenCalledWith(7, { recibe_avisos: false });
    expect(result.current.prefs.recibe_avisos).toBe(false);
    expect(result.current.guardando).toBeNull();
  });

  it('PS-23 · si el servidor falla, el switch regresa a su valor y avisa', async () => {
    servicio.getPrivacidad.mockResolvedValue({ recibe_avisos: true });
    servicio.updatePrivacidad.mockRejectedValue(new Error('500'));
    const { result } = await renderHook(() => usePreferenciasPrivacidad(7));
    await act(async () => {});
    await act(async () => {
      await result.current.cambiar('recibe_avisos', false);
    });
    expect(result.current.prefs.recibe_avisos).toBe(true);
    expect(result.current.error).toBe(MSG_PRIVACIDAD_GUARDAR);
  });

  it('PS-24 · si no se puede cargar, avisa y deja el valor por defecto (activado)', async () => {
    servicio.getPrivacidad.mockRejectedValue(new Error('red'));
    const { result } = await renderHook(() => usePreferenciasPrivacidad(7));
    await act(async () => {});
    expect(result.current.error).toBe(MSG_PRIVACIDAD_CARGA);
    expect(result.current.prefs).toEqual({ recibe_avisos: true });
  });

  it('PS-25 · sin sesión no consulta ni guarda nada', async () => {
    const { result } = await renderHook(() => usePreferenciasPrivacidad(undefined));
    await act(async () => {
      await result.current.cambiar('recibe_avisos', false);
    });
    expect(servicio.getPrivacidad).not.toHaveBeenCalled();
    expect(servicio.updatePrivacidad).not.toHaveBeenCalled();
    expect(result.current.cargando).toBe(false);
  });
});
