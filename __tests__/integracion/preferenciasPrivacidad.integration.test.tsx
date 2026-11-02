/**
 * Prueba de integración: Privacidad (derecho ARCO de Oposición)
 * Flujo: PreferenciasPrivacidad → usePreferenciasPrivacidad → clientProfileService
 *        → profileApi → ApiClient (simulado) → GET/PUT /users/profile/:id/privacidad
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { PreferenciasPrivacidad } from '../../src/features/perfil-cliente/components/PreferenciasPrivacidad';
import { usePreferenciasPrivacidad } from '../../src/features/perfil-cliente/viewmodels/usePreferenciasPrivacidad';
import apiClient from '../../src/data/api/ApiClient';

jest.mock('../../src/data/api/ApiClient', () => {
  const cliente = { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() };
  return { __esModule: true, default: cliente, apiClient: cliente };
});

const api = apiClient as unknown as Record<'get' | 'put', jest.Mock>;

const Pantalla = () => {
  const p = usePreferenciasPrivacidad(7);
  return (
    <PreferenciasPrivacidad prefs={p.prefs} cargando={p.cargando} guardando={p.guardando} error={p.error} onCambiar={p.cambiar} />
  );
};

describe('Integración: switch de privacidad (Opt-Out)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('PI-20 · el switch muestra lo que tiene guardado el backend', async () => {
    api.get.mockResolvedValue({ data: { recibe_avisos: false } });
    await render(<Pantalla />);
    await act(async () => {});
    expect(api.get).toHaveBeenCalledWith('/users/profile/7/privacidad');
    expect(screen.getByLabelText('Avisos en la app')).toHaveProp('value', false);
  });

  it('PI-21 · apagar "Avisos en la app" envía el PUT al backend', async () => {
    api.get.mockResolvedValue({ data: { recibe_avisos: true } });
    api.put.mockResolvedValue({ data: { recibe_avisos: false } });
    await render(<Pantalla />);
    await act(async () => {});
    await act(async () => {
      fireEvent(screen.getByLabelText('Avisos en la app'), 'valueChange', false);
    });
    expect(api.put).toHaveBeenCalledWith('/users/profile/7/privacidad', { recibe_avisos: false });
    expect(screen.getByLabelText('Avisos en la app')).toHaveProp('value', false);
  });

  it('PI-22 · si el backend falla, el switch regresa y se muestra el error', async () => {
    api.get.mockResolvedValue({ data: { recibe_avisos: true } });
    api.put.mockRejectedValue(new Error('500'));
    await render(<Pantalla />);
    await act(async () => {});
    await act(async () => {
      fireEvent(screen.getByLabelText('Avisos en la app'), 'valueChange', false);
    });
    expect(screen.getByLabelText('Avisos en la app')).toHaveProp('value', true);
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo guardar el cambio. Inténtalo de nuevo.');
  });
});
