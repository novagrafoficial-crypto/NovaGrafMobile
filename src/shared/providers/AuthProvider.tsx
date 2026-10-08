import React, { createContext, useState, useEffect } from 'react';
import { SessionStorage } from '@/data/SessionStorage';
import type { User } from '@/features/autenticacion/models/User';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  saveSession: (user: User) => Promise<void>;
  deleteSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      try {
        const storedUser = await SessionStorage.get();
        if (storedUser) setUser(storedUser);
      } catch (e) {
        console.error('Error cargando sesión', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadStorageData();
  }, []);

  const saveSession = async (userData: User) => {
    setUser(userData);
    await SessionStorage.save(userData);
  };

  const deleteSession = async () => {
    setUser(null);
    await SessionStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, saveSession, deleteSession }}>
      {children}
    </AuthContext.Provider>
  );
};
