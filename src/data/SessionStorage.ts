import * as SecureStore from 'expo-secure-store';
import type { User } from '@/features/autenticacion/models/User';

const SESSION_KEY = 'user_session';

// Único lugar que conoce la clave y el formato con el que se guarda la sesión.
export const SessionStorage = {
  async get(): Promise<User | null> {
    const raw = await SecureStore.getItemAsync(SESSION_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  },
  async save(user: User): Promise<void> {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(user));
  },
  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  },
};
