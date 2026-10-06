//controlan la sesion
import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  saveSession: (user: User) => Promise<void>;
  deleteSession: () => Promise<void>;
}

export const SessionContext = createContext<AuthContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      try {
        const storedUser = await SecureStore.getItemAsync('user_session');
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error cargando sesión", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadStorageData();
  }, []);

  const saveSession = async (userData: User) => {
    setUser(userData);
    await SecureStore.setItemAsync('user_session', JSON.stringify(userData));
  };

  const deleteSession = async () => {
    setUser(null);
    await SecureStore.deleteItemAsync('user_session');
  };

  return (
    <SessionContext.Provider value={{ user, isLoading, saveSession, deleteSession }}>
      {children}
    </SessionContext.Provider>
  );
};
