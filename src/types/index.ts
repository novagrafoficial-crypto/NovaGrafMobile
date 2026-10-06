// molde mapea las respuestas
export type UserRole = 'admin' | 'client';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  token: string;
}
