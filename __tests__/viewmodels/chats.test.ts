/**
 * Chat del pedido (admin y cliente): carga, consulta periódica y envío de mensajes.
 */
import { renderHook, act } from '@testing-library/react-native';
import { useChatPedidoViewModel } from '../../src/features/chat-pedido-admin/viewmodels/useChatPedidoViewModel';
import { useChatClienteViewModel } from '../../src/features/chat-pedido-cliente/viewmodels/useChatClienteViewModel';
import { chatPedidoService } from '../../src/features/chat-pedido-admin/services/chatPedidoService';
import { chatClienteService } from '../../src/features/chat-pedido-cliente/services/chatClienteService';

let mockUsuario: any = { id_usuario: 1 };
jest.mock('expo-router', () => {
  const React = require('react');
  return { useFocusEffect: (cb: () => void) => React.useEffect(cb, [cb]) };
});
jest.mock('../../src/shared/hooks/useAuth', () => ({ useAuth: () => ({ user: mockUsuario }) }));
jest.mock('../../src/features/chat-pedido-admin/services/chatPedidoService', () => ({ chatPedidoService: { getMensajes: jest.fn(), enviar: jest.fn() } }));
jest.mock('../../src/features/chat-pedido-cliente/services/chatClienteService', () => ({ chatClienteService: { getMensajes: jest.fn(), enviar: jest.fn() } }));

const msg = (id: number, remitente_id: number) => ({ id, remitente_id, remitente_nombre: 'X', mensaje: `m${id}`, fecha_envio: null });

const CASOS = [
  ['admin', useChatPedidoViewModel, chatPedidoService],
  ['cliente', useChatClienteViewModel, chatClienteService],
] as const;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  mockUsuario = { id_usuario: 1 };
});
afterEach(() => jest.useRealTimers());

describe.each(CASOS)('Chat del pedido (%s)', (_quien, useVM, servicio) => {
  const s = servicio as unknown as Record<'getMensajes' | 'enviar', jest.Mock>;

  it('PCH-01 · carga los mensajes, distingue los míos y consulta cada 8 s', async () => {
    s.getMensajes.mockResolvedValue([msg(1, 1), msg(2, 9)]);
    const { result } = await renderHook(() => useVM(15));
    await act(async () => {});
    expect(result.current.cargando).toBe(false);
    expect(result.current.esMio(result.current.mensajes[0])).toBe(true);
    expect(result.current.esMio(result.current.mensajes[1])).toBe(false);
    const antes = result.current.mensajes;
    await act(async () => { jest.advanceTimersByTime(8000); });
    expect(s.getMensajes).toHaveBeenCalledTimes(2);
    expect(result.current.mensajes).toBe(antes);
    s.getMensajes.mockResolvedValueOnce([msg(1, 1), msg(2, 9), msg(3, 1)]);
    await act(async () => { jest.advanceTimersByTime(8000); });
    expect(result.current.mensajes).toHaveLength(3);
  });

  it('PCH-02 · envía el texto, lo limpia y recarga; ignora mensajes vacíos', async () => {
    s.getMensajes.mockResolvedValue([]);
    const { result } = await renderHook(() => useVM(15));
    await act(async () => {});
    await act(() => result.current.enviar());
    expect(s.enviar).not.toHaveBeenCalled();
    await act(() => result.current.setTexto('  Hola  '));
    await act(() => result.current.enviar());
    expect(s.enviar).toHaveBeenCalled();
    expect(result.current.texto).toBe('');
    expect(result.current.enviando).toBe(false);
  });

  it('PCH-03 · si falla al enviar conserva el texto y muestra el error', async () => {
    s.getMensajes.mockResolvedValue([]);
    const { result } = await renderHook(() => useVM(15));
    await act(async () => {});
    s.enviar.mockRejectedValueOnce({ response: { data: { error: 'Pedido cerrado' } } });
    await act(() => result.current.setTexto('Hola'));
    await act(() => result.current.enviar());
    expect(result.current.error).toBe('Pedido cerrado');
    expect(result.current.texto).toBe('Hola');
  });

  it('PCH-04 · errores al cargar y pedido sin id', async () => {
    s.getMensajes.mockRejectedValueOnce({ response: { data: { message: 'Sin acceso' } } });
    const { result } = await renderHook(() => useVM(15));
    await act(async () => {});
    expect(result.current.error).toBe('Sin acceso');
    s.getMensajes.mockRejectedValueOnce(new Error('red'));
    await act(async () => { jest.advanceTimersByTime(8000); });
    expect(result.current.error).toBe('red');
    s.getMensajes.mockRejectedValueOnce({});
    await act(async () => { jest.advanceTimersByTime(8000); });
    expect(result.current.error).toBe('Ocurrió un error.');
    s.getMensajes.mockClear();
    await renderHook(() => useVM(0));
    expect(s.getMensajes).not.toHaveBeenCalled();
  });
});

describe('Chat del admin sin sesión', () => {
  it('PCH-05 · no envía si no identifica al administrador', async () => {
    mockUsuario = null;
    (chatPedidoService.getMensajes as jest.Mock).mockResolvedValue([]);
    const { result } = await renderHook(() => useChatPedidoViewModel(15));
    await act(async () => {});
    await act(() => result.current.setTexto('Hola'));
    await act(() => result.current.enviar());
    expect(result.current.error).toMatch(/No se pudo identificar tu sesión/);
    expect(chatPedidoService.enviar).not.toHaveBeenCalled();
  });
});
