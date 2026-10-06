// src/shared/hooks/useSession.ts
import { useContext } from 'react';
import { SessionContext } from '../providers/SessionProvider';

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession debe usarse dentro de un SessionProvider');
  return context;
};