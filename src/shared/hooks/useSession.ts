// src/shared/hooks/useSession.ts
import { useContext } from 'react';
import { SessionContext } from '../providers/SessionProvider';

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession debe ser utilizado dentro de un SessionProvider');
  }
  return context; // Esto retorna { user, isLoading, saveSession, deleteSession }
};
