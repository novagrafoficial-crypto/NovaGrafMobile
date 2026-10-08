import { authApi } from '@/data/api/authApi';
import type { User } from '../models/User';

// Adapter: convierte la respuesta del backend en nuestro modelo User.
const normalize = (data: any): User => {
  const user = data.user ?? data;
  return { ...user, token: data.token ?? user.token };
};

// ---- Patrón Factory Method ----
// Producto: cualquier forma de iniciar sesión sabe "authenticate()".
interface LoginMethod {
  authenticate(): Promise<User>;
}

class CredentialsLogin implements LoginMethod {
  constructor(private email: string, private password: string) {}
  async authenticate() {
    return normalize(await authApi.loginWithCredentials(this.email, this.password));
  }
}

class GoogleLogin implements LoginMethod {
  constructor(private idToken: string) {}
  async authenticate() {
    return normalize(await authApi.loginWithGoogleMobile(this.idToken));
  }
}

export type LoginRequest =
  | { type: 'credentials'; email: string; password: string }
  | { type: 'google'; idToken: string };

// Método fábrica: decide QUÉ clase concreta crear según el tipo de login.
const createLoginMethod = (request: LoginRequest): LoginMethod =>
  request.type === 'google'
    ? new GoogleLogin(request.idToken)
    : new CredentialsLogin(request.email, request.password);

export const authService = {
  login: (request: LoginRequest): Promise<User> => createLoginMethod(request).authenticate(),
};
