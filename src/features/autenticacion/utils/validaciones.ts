import type { RegistroForm } from '../models/Registro';

const REQUIRED = 'Campo obligatorio';

// Reglas de contraseña: mismas que la recuperación (mín. 8, una letra y un número)
export const PASSWORD_RULE = 'Mínimo 8 caracteres, con una letra y un número';
export const isValidPassword = (pwd: string) =>
  pwd.length >= 8 && /\d/.test(pwd) && /[a-zA-Z]/.test(pwd);

// Convierte lo que escribe el usuario en AAAA-MM-DD (agrega los guiones solo)
export const formatFecha = (value: string): string => {
  const d = value.replace(/\D/g, '').slice(0, 8);
  if (d.length > 6) return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}`;
  if (d.length > 4) return `${d.slice(0, 4)}-${d.slice(4)}`;
  return d;
};

const isValidDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const sameDay =
    date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  return sameDay && date <= new Date() && y >= 1900;
};

// Devuelve el mensaje de error del campo, o '' si está bien.
export const validar = (
  field: keyof RegistroForm,
  value: string,
  form: RegistroForm,
): string => {
  switch (field) {
    case 'name':
    case 'lastNameP':
    case 'lastNameM':
      if (!value.trim()) return REQUIRED;
      return /^[A-Za-záéíóúüñÁÉÍÓÚÜÑ\s]+$/.test(value.trim()) ? '' : 'Solo letras y espacios';
    case 'username':
      if (!value.trim()) return REQUIRED;
      return /^[A-Za-z0-9_]+$/.test(value.trim()) ? '' : 'Solo letras, números y _';
    case 'birthDate':
      if (!value) return REQUIRED;
      return isValidDate(value) ? '' : 'Fecha inválida (AAAA-MM-DD)';
    case 'address':
      return value.trim() ? '' : REQUIRED;
    case 'phone':
      if (!value.trim()) return REQUIRED;
      return /^\d{7,15}$/.test(value.trim()) ? '' : 'Debe tener entre 7 y 15 dígitos';
    case 'email':
      if (!value.trim()) return REQUIRED;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'Correo inválido';
    case 'password':
      if (!value) return REQUIRED;
      return isValidPassword(value) ? '' : PASSWORD_RULE;
    case 'confirmPassword':
      if (!value) return REQUIRED;
      return value === form.password ? '' : 'Las contraseñas no coinciden';
    default:
      return '';
  }
};

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());