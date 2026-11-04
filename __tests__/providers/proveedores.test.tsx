/**
 * Proveedores de contexto (patrón Observer): avisos del cliente, avisos del admin y menús.
 */
import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { NotificacionesProvider, useNotificaciones } from '../../src/features/notificaciones/providers/NotificacionesProvider';
import { NotificacionesAdminProvider, useNotificacionesAdmin } from '../../src/features/notificaciones-admin/providers/NotificacionesAdminProvider';
import { MenuAdminProvider, useMenuAdmin, useMenuAdminOpcional } from '../../src/features/menu-admin/providers/MenuAdminProvider';
import { notificacionesService } from '../../src/features/notificaciones/services/notificacionesService';
import { notificacionesAdminService } from '../../src/features/notificaciones-admin/services/notificacionesAdminService';

let mockUsuario: any = { id_usuario: 7, rol: 'cliente' };
jest.mock('../../src/shared/hooks/useAuth', () => ({ useAuth: () => ({ user: mockUsuario }) }));
jest.mock('../../src/features/notificaciones/services/notificacionesService', () => ({
  notificacionesService: { getAll: jest.fn(), marcarLeida: jest.fn(), marcarTodasLeidas: jest.fn(), eliminar: jest.fn() },
}));
jest.mock('../../src/features/notificaciones-admin/services/notificacionesAdminService', () => ({
  notificacionesAdminService: { getNoLeidas: jest.fn(), marcarLeida: jest.fn(), marcarTodas: jest.fn() },
}));

const cli = notificacionesService as unknown as Record<string, jest.Mock>;
const adm = notificacionesAdminService as unknown as Record<string, jest.Mock>;
let alCambiar: ((estado: string) => void) | null = null;
const quitar = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  mockUsuario = { id_usuario: 7, rol: 'cliente' };
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_e: any, cb: any) => { alCambiar = cb; return { remove: quitar } as any; });
  (AppState as any).currentState = 'active';
});
afterEach(() => jest.useRealTimers());

const aviso = (id: number, leida = false) => ({ id, pedido_id: 15, tipo: 'CHAT', titulo: 'T', mensaje: 'M', leida, creado_en: 'f' });

describe('Avisos del cliente', () => {
  const montar = async () => {
    const h = await renderHook(() => useNotificaciones(), { wrapper: ({ children }) => <NotificacionesProvider>{children}</NotificacionesProvider> });
    await act(async () => {});
    return h;
  };

  it('PPR-01 · carga al iniciar, repite cada 30 s y al volver a la app', async () => {
    cli.getAll.mockResolvedValue({ notificaciones: [aviso(1), aviso(2, true)], noLeidas: 1 });
    const { result, unmount } = await montar();
    expect(result.current.noLeidas).toBe(1);
    expect(result.current.cargando).toBe(false);
    await act(async () => { jest.advanceTimersByTime(30000); });
    await act(async () => { alCambiar?.('active'); alCambiar?.('background'); });
    expect(cli.getAll).toHaveBeenCalledTimes(3);
    await act(async () => { await unmount(); });
    expect(quitar).toHaveBeenCalled();
  });

  it('PPR-02 · marca una, todas y elimina (actualiza el contador al instante)', async () => {
    cli.getAll.mockResolvedValue({ notificaciones: [aviso(1), aviso(2), aviso(3, true)], noLeidas: 2 });
    const { result } = await montar();
    await act(() => result.current.marcarLeida(1));
    expect(result.current.noLeidas).toBe(1);
    await act(() => result.current.eliminar(3));
    expect(result.current.notificaciones).toHaveLength(2);
    expect(result.current.noLeidas).toBe(1);
    await act(() => result.current.eliminar(2));
    expect(result.current.noLeidas).toBe(0);
    await act(() => result.current.marcarTodasLeidas());
    expect(cli.marcarTodasLeidas).toHaveBeenCalled();
  });

  it('PPR-03 · si el servidor falla, vuelve a pedir la lista real', async () => {
    cli.getAll.mockResolvedValue({ notificaciones: [aviso(1)], noLeidas: 1 });
    const { result } = await montar();
    cli.marcarLeida.mockRejectedValueOnce(new Error('x'));
    cli.marcarTodasLeidas.mockRejectedValueOnce(new Error('x'));
    cli.eliminar.mockRejectedValueOnce(new Error('x'));
    await act(() => result.current.marcarLeida(1));
    await act(() => result.current.marcarTodasLeidas());
    await act(() => result.current.eliminar(1));
    cli.getAll.mockRejectedValueOnce(new Error('red'));
    await act(() => result.current.refrescar());
    expect(cli.getAll.mock.calls.length).toBeGreaterThanOrEqual(5);
  });

  it('PPR-04 · un administrador no consulta avisos de cliente', async () => {
    mockUsuario = { id_usuario: 1, rol: 'administrador' };
    const { result } = await montar();
    await act(() => result.current.refrescar());
    expect(cli.getAll).not.toHaveBeenCalled();
    expect(result.current).toMatchObject({ notificaciones: [], noLeidas: 0 });
  });

  it('PPR-05 · usar el hook fuera del proveedor avisa del error', async () => {
    await expect(renderHook(() => useNotificaciones())).rejects.toThrow('dentro de <NotificacionesProvider>');
  });
});

describe('Avisos del administrador', () => {
  const montar = async () => {
    const h = await renderHook(() => useNotificacionesAdmin(), { wrapper: ({ children }) => <NotificacionesAdminProvider>{children}</NotificacionesAdminProvider> });
    await act(async () => {});
    return h;
  };

  it('PPR-06 · carga, repite cada 30 s y al volver a la app', async () => {
    mockUsuario = { id_usuario: 1, rol: 'administrador' };
    adm.getNoLeidas.mockResolvedValue([aviso(1), aviso(2)]);
    const { result } = await montar();
    expect(result.current.noLeidas).toBe(2);
    await act(async () => { jest.advanceTimersByTime(30000); });
    await act(async () => { alCambiar?.('active'); alCambiar?.('inactive'); });
    expect(adm.getNoLeidas).toHaveBeenCalledTimes(3);
  });

  it('PPR-07 · marca una y todas; si falla recarga; error visible', async () => {
    mockUsuario = { id_usuario: 1, rol: 'administrador' };
    adm.getNoLeidas.mockResolvedValue([aviso(1), aviso(2), aviso(3)]);
    const { result } = await montar();
    await act(() => result.current.marcarLeida(1));
    expect(result.current.noLeidas).toBe(2);
    adm.marcarLeida.mockRejectedValueOnce(new Error('x'));
    await act(() => result.current.marcarLeida(2));
    adm.marcarTodas.mockRejectedValueOnce(new Error('x'));
    await act(() => result.current.marcarTodas());
    adm.getNoLeidas.mockResolvedValueOnce([]);
    await act(() => result.current.refrescar(false));
    await act(() => result.current.marcarTodas());
    expect(adm.marcarTodas).toHaveBeenCalledTimes(1);
    adm.getNoLeidas.mockRejectedValueOnce({ response: { data: { error: 'Sin sesión' } } });
    await act(() => result.current.refrescar());
    expect(result.current.error).toBe('Sin sesión');
    adm.getNoLeidas.mockRejectedValueOnce({});
    await act(() => result.current.refrescar());
    expect(result.current.error).toBe('No se pudieron cargar las notificaciones.');
  });

  it('PPR-08 · sin usuario no consulta; fuera del proveedor avisa', async () => {
    mockUsuario = null;
    await montar();
    expect(adm.getNoLeidas).not.toHaveBeenCalled();
    await expect(renderHook(() => useNotificacionesAdmin())).rejects.toThrow('dentro de NotificacionesAdminProvider');
  });
});

describe('Menú lateral del admin', () => {
  it('PPR-09 · abre y cierra; el opcional regresa null fuera del proveedor', async () => {
    const { result } = await renderHook(() => useMenuAdmin(), { wrapper: ({ children }) => <MenuAdminProvider>{children}</MenuAdminProvider> });
    await act(() => result.current.abrir());
    expect(result.current.abierto).toBe(true);
    await act(() => result.current.cerrar());
    expect(result.current.abierto).toBe(false);
    const opcional = await renderHook(() => useMenuAdminOpcional());
    expect(opcional.result.current).toBeNull();
    await expect(renderHook(() => useMenuAdmin())).rejects.toThrow('dentro de <MenuAdminProvider>');
  });
});
