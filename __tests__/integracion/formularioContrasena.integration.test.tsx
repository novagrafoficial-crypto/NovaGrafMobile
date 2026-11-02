/**
 * Prueba de integración: Formulario de cambio de contraseña (perfil cliente y admin)
 * Flujo: FormularioContrasena → CampoTexto → useCambioContrasena → servicio (simulado)
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { FormularioContrasena } from '../../src/features/perfil-cliente/components/FormularioContrasena';

const mockRouter = { replace: jest.fn() };
const mockDeleteSession = jest.fn(async () => {});
jest.mock('expo-router', () => ({ useRouter: () => mockRouter }));
jest.mock('../../src/shared/hooks/useAuth', () => ({ useAuth: () => ({ deleteSession: mockDeleteSession }) }));


describe('Integración: formulario de cambio de contraseña', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });
  afterEach(() => jest.useRealTimers());

  it('PI-16 · muestra los requisitos y el botón inicia deshabilitado', async () => {
    await render(<FormularioContrasena onGuardar={jest.fn()} />);
    expect(screen.getByText('Mínimo 8 caracteres')).toBeOnTheScreen();
    expect(screen.getByText('Diferente a tu contraseña actual')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Guardar contraseña' })).toBeDisabled();
  });

  it('PI-17 · el ojito muestra y oculta las contraseñas', async () => {
    await render(<FormularioContrasena onGuardar={jest.fn()} />);
    const [primerOjo] = screen.getAllByLabelText('Ver contraseña');
    await fireEvent.press(primerOjo);
    expect(screen.getAllByLabelText('Ocultar contraseña')).toHaveLength(3);
  });

  it('PI-18 · avisa si la confirmación no coincide', async () => {
    await render(<FormularioContrasena onGuardar={jest.fn()} />);
    const actual = screen.getByLabelText('Contraseña actual');
    const nueva = screen.getByLabelText('Nueva contraseña');
    const confirmar = screen.getByLabelText('Confirmar contraseña');
    await fireEvent.changeText(actual, 'vieja1234');
    await fireEvent.changeText(nueva, 'nueva1234');
    await fireEvent.changeText(confirmar, 'otra12345');
    expect(screen.getByText('Las contraseñas no coinciden')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Guardar contraseña' })).toBeDisabled();
  });

  it('PI-19 · con datos válidos guarda, avisa y cierra la sesión', async () => {
    const onGuardar = jest.fn(async () => ({ message: 'ok' }));
    await render(<FormularioContrasena onGuardar={onGuardar} />);
    const actual = screen.getByLabelText('Contraseña actual');
    const nueva = screen.getByLabelText('Nueva contraseña');
    const confirmar = screen.getByLabelText('Confirmar contraseña');
    await fireEvent.changeText(actual, 'vieja1234');
    await fireEvent.changeText(nueva, 'nueva1234');
    await fireEvent.changeText(confirmar, 'nueva1234');
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar contraseña' }));

    expect(onGuardar).toHaveBeenCalledWith('vieja1234', 'nueva1234');
    expect(await screen.findByText(/Contraseña actualizada/)).toBeOnTheScreen();
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(mockDeleteSession).toHaveBeenCalled();
    expect(mockRouter.replace).toHaveBeenCalledWith('/(auth)/login');
  });
});
