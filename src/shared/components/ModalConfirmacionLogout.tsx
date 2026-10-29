import React from 'react';
import { ModalConfirmacion } from './ModalConfirmacion';

interface Props {
  visible: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

// Compartido por el perfil del cliente y el del administrador.
export const ModalConfirmacionLogout: React.FC<Props> = ({ visible, onConfirmar, onCancelar }) => (
  <ModalConfirmacion
    visible={visible}
    icono="log-out-outline"
    titulo="Cerrar sesión"
    mensaje="¿Estás seguro de que deseas cerrar sesión?"
    textoConfirmar="Sí, salir"
    onConfirmar={onConfirmar}
    onCancelar={onCancelar}
  />
);