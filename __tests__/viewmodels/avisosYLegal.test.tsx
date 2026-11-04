/**
 * Pantallas de avisos (cliente y admin), eliminar cuenta, políticas y menú público.
 */
import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { useNotificacionesViewModel } from '../../src/features/notificaciones/viewmodels/useNotificacionesViewModel';
import { useNotificacionesAdminViewModel } from '../../src/features/notificaciones-admin/viewmodels/useNotificacionesAdminViewModel';
import { useEliminarCuentaViewModel } from '../../src/features/legal/viewmodels/useEliminarCuentaViewModel';
import { usePoliticasViewModel } from '../../src/features/legal/viewmodels/usePoliticasViewModel';
import { MenuPublicoProvider, useMenuPublico } from '../../src/features/menu-publico/providers/MenuPublicoProvider';
import { legalService } from '../../src/features/legal/services/legalService';

const mockRouter = { push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn(() => true) };
let mockUsuario: any = null;
const mockAvisos = { notificaciones: [] as any[], noLeidas: 0, cargando: false, refrescar: jest.fn(async () => {}), marcarLeida: jest.fn(async () => {}), marcarTodasLeidas: jest.fn(), eliminar: jest.fn() };
const mockAvisosAdmin = { notificaciones: [] as any[], noLeidas: 0, cargando: false, error: null, refrescar: jest.fn(async () => {}), marcarLeida: jest.fn(async () => {}), marcarTodas: jest.fn() };
jest.mock('expo-router', () => {
  const React = require('react');
  return { useRouter: () => mockRouter, useFocusEffect: (cb: () => void) => React.useEffect(cb, [cb]) };
});
jest.mock('../../src/shared/hooks/useAuth', () => ({ useAuth: () => ({ user: mockUsuario }) }));
jest.mock('../../src/features/notificaciones/providers/NotificacionesProvider', () => ({ useNotificaciones: () => mockAvisos }));
jest.mock('../../src/features/notificaciones-admin/providers/NotificacionesAdminProvider', () => ({ useNotificacionesAdmin: () => mockAvisosAdmin }));
jest.mock('../../src/features/legal/services/legalService', () => ({ legalService: { getPoliticas: jest.fn(), solicitarEliminacion: jest.fn(), correoEmpresa: jest.fn() } }));

const legal = legalService as unknown as Record<string, jest.Mock>;
const dias = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
const aviso = (id: number, creado_en: string, extra: object = {}) => ({ id, pedido_id: 15, tipo: 'CHAT', titulo: 'T', mensaje: 'M', leida: false, creado_en, ...extra });

beforeEach(() => {
  jest.clearAllMocks();
  mockUsuario = null;
});

describe('Avisos del cliente', () => {
  it('PVN-01 · agrupa por Hoy, Esta semana y Anteriores, y filtra las no leídas', async () => {
    mockAvisos.notificaciones = [aviso(1, new Date().toISOString()), aviso(2, dias(3), { leida: true }), aviso(3, dias(30))];
    const { result } = await renderHook(() => useNotificacionesViewModel());
    expect(result.current.secciones.map((s) => s.title)).toEqual(['Hoy', 'Esta semana', 'Anteriores']);
    await act(() => result.current.elegirFiltro('NO_LEIDAS'));
    expect(result.current.secciones.flatMap((s) => s.data).map((n) => n.id)).toEqual([1, 3]);
    expect(result.current.total).toBe(3);
  });

  it('PVN-02 · abrir marca como leída y lleva al pedido; refrescar y volver', async () => {
    mockAvisos.notificaciones = [];
    const { result } = await renderHook(() => useNotificacionesViewModel());
    result.current.abrir(aviso(1, dias(0)) as any);
    expect(mockAvisos.marcarLeida).toHaveBeenCalledWith(1);
    expect(mockRouter.push).toHaveBeenCalledWith('/(cliente)/pedido/15');
    result.current.abrir(aviso(2, dias(0), { leida: true, pedido_id: null }) as any);
    expect(mockAvisos.marcarLeida).toHaveBeenCalledTimes(1);
    await act(() => result.current.onRefresh());
    expect(result.current.refrescando).toBe(false);
    result.current.volver();
    mockRouter.canGoBack.mockReturnValueOnce(false);
    result.current.volver();
    expect(mockRouter.replace).toHaveBeenCalledWith('/(cliente)/inicio');
  });
});

describe('Avisos del administrador', () => {
  it('PVN-03 · actualiza al entrar; abrir lleva al pedido o al chat', async () => {
    const { result } = await renderHook(() => useNotificacionesAdminViewModel());
    expect(mockAvisosAdmin.refrescar).toHaveBeenCalledWith(true);
    result.current.abrir(aviso(1, dias(0), { tipo: 'NUEVO_MENSAJE' }) as any);
    expect(mockRouter.push).toHaveBeenLastCalledWith('/(admin)/pedido/15?chat=1');
    result.current.abrir(aviso(2, dias(0), { tipo: 'PAGO' }) as any);
    expect(mockRouter.push).toHaveBeenLastCalledWith('/(admin)/pedido/15');
    result.current.abrir(aviso(3, dias(0), { pedido_id: null }) as any);
    expect(mockRouter.push).toHaveBeenCalledTimes(2);
    await act(() => result.current.onRefresh());
    await act(() => result.current.reintentar());
    expect(mockAvisosAdmin.refrescar).toHaveBeenLastCalledWith(false);
  });
});

describe('Eliminar mi cuenta', () => {
  it('PVE-01 · con sesión el correo ya viene; valida correo y confirmación', async () => {
    mockUsuario = { correo_electronico: 'ana@correo.com' };
    const { result } = await renderHook(() => useEliminarCuentaViewModel());
    expect(result.current.conSesion).toBe(true);
    expect(result.current.correo).toBe('ana@correo.com');
    await act(() => result.current.enviar());
    expect(result.current.error).toMatch(/Marca la casilla/);
    await act(() => result.current.setCorreo('ana @ correo'));
    await act(() => result.current.enviar());
    expect(result.current.errorCorreo).toBe('Escribe el correo con el que te registraste');
  });

  it('PVE-02 · envía la solicitud con el motivo', async () => {
    const { result } = await renderHook(() => useEliminarCuentaViewModel());
    expect(result.current.conSesion).toBe(false);
    await act(() => result.current.setCorreo(' Ana@Correo.com '));
    await act(() => result.current.setMotivo('x'.repeat(600)));
    expect(result.current.motivo).toHaveLength(500);
    await act(() => result.current.alternarConfirmado());
    legal.solicitarEliminacion.mockResolvedValueOnce('Recibimos tu solicitud.');
    await act(() => result.current.enviar());
    expect(legal.solicitarEliminacion).toHaveBeenCalledWith('ana@correo.com', 'x'.repeat(500));
    expect(result.current.enviado).toBe('Recibimos tu solicitud.');
  });

  it('PVE-03 · si el servidor falla ofrece enviarlo por correo', async () => {
    const abrir = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    const { result } = await renderHook(() => useEliminarCuentaViewModel());
    result.current.enviarPorCorreo();
    expect(abrir).not.toHaveBeenCalled();
    await act(() => result.current.setCorreo('ana@correo.com'));
    await act(() => result.current.alternarConfirmado());
    legal.solicitarEliminacion.mockRejectedValueOnce(new Error('500'));
    legal.correoEmpresa.mockResolvedValueOnce('novagraf@gmail.com');
    await act(() => result.current.enviar());
    expect(result.current.error).toBe('No pudimos enviar la solicitud en este momento.');
    expect(result.current.correoEmpresa).toBe('novagraf@gmail.com');
    result.current.enviarPorCorreo();
    expect(abrir.mock.calls[0][0]).toMatch(/^mailto:novagraf@gmail\.com\?subject=.+No%20especificado/);
    result.current.volver();
    mockRouter.canGoBack.mockReturnValueOnce(false);
    result.current.volver();
    expect(mockRouter.replace).toHaveBeenCalledWith('/');
  });
});

describe('Políticas y menú público', () => {
  it('PVE-04 · carga las políticas; si falla deja la lista vacía', async () => {
    legal.getPoliticas.mockResolvedValueOnce([{ id: 1, descripcion: 'P' }]);
    let r = (await renderHook(() => usePoliticasViewModel())).result;
    await act(async () => {});
    expect(r.current.politicas).toHaveLength(1);
    legal.getPoliticas.mockRejectedValueOnce(new Error('red'));
    r = (await renderHook(() => usePoliticasViewModel())).result;
    await act(async () => {});
    expect(r.current).toMatchObject({ politicas: [], cargando: false });
    r.current.irAEliminar();
    expect(mockRouter.push).toHaveBeenCalledWith('/eliminar-cuenta');
    r.current.volver();
    mockRouter.canGoBack.mockReturnValueOnce(false);
    r.current.volver();
    expect(mockRouter.replace).toHaveBeenCalledWith('/');
  });

  it('PVE-05 · el menú público abre y cierra; fuera del proveedor avisa', async () => {
    const { result } = await renderHook(() => useMenuPublico(), { wrapper: ({ children }) => <MenuPublicoProvider>{children}</MenuPublicoProvider> });
    await act(() => result.current.abrir());
    expect(result.current.abierto).toBe(true);
    await act(() => result.current.cerrar());
    expect(result.current.abierto).toBe(false);
    await expect(renderHook(() => useMenuPublico())).rejects.toThrow('dentro de <MenuPublicoProvider>');
  });
});
