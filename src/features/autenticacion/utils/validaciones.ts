import type { RegistroForm } from '../models/Registro';

const REQUERIDO = 'Este campo es obligatorio';
const LETRAS = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?: [A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/;
// Usuario @ dominio(s) separados por punto: sin partes que se traslapen (evita backtracking)
const CORREO = /^[^\s@]+@(?:[^\s@.]+\.)+[^\s@.]{2,}$/;

export const EDAD_MINIMA = 13;

// ── Contraseña: mín. 8, una letra y un número (igual que la recuperación) ──
export const PASSWORD_RULE = 'Mínimo 8 caracteres, con una letra y un número';

/** Lista para mostrar las reglas con palomita mientras se escribe */
export const reglasPassword = (pwd: string) => [
  { texto: 'Mínimo 8 caracteres', ok: pwd.length >= 8 },
  { texto: 'Al menos una letra', ok: /[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(pwd) },
  { texto: 'Al menos un número', ok: /\d/.test(pwd) },
];

export const isValidPassword = (pwd: string) => reglasPassword(pwd).every((r) => r.ok);
export const isValidEmail = (email: string) => CORREO.test(email.trim());

// ── Limpieza mientras se escribe: el campo no deja escribir lo que no va ──
export const limpiarCampo = (campo: keyof RegistroForm, valor: string): string => {
  switch (campo) {
    case 'name':
    case 'lastNameP':
    case 'lastNameM':
      // Solo letras (con acentos y ñ) y un espacio entre palabras
      return valor.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]/g, '').replace(/ {2,}/g, ' ').replace(/^ /, '').slice(0, 40);
    case 'username':
      return valor.replace(/[^A-Za-z0-9_.]/g, '').slice(0, 20);
    case 'phone':
      // Solo números y máximo 10
      return valor.replace(/\D/g, '').slice(0, 10);
    case 'birthDate':
      return formatFecha(valor);
    case 'email':
      return valor.replace(/\s/g, '');
    case 'address':
      return valor.slice(0, 150);
    default:
      return valor;
  }
};

/** Pone las diagonales solas: 05032001 → 05/03/2001 */
export const formatFecha = (value: string): string => {
  const d = value.replace(/\D/g, '').slice(0, 8);
  if (d.length > 4) return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
  if (d.length > 2) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return d;
};

/** DD/MM/AAAA → AAAA-MM-DD (lo que espera el backend) */
export const fechaAISO = (value: string): string => {
  const [d, m, y] = value.split('/');
  return `${y}-${m}-${d}`;
};

const edadDe = (y: number, m: number, d: number) => {
  const hoy = new Date();
  let edad = hoy.getFullYear() - y;
  if (hoy.getMonth() + 1 < m || (hoy.getMonth() + 1 === m && hoy.getDate() < d)) edad--;
  return edad;
};

const validarFecha = (value: string): string => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return 'Escribe la fecha completa (DD/MM/AAAA)';
  const [d, m, y] = value.split('/').map(Number);
  const fecha = new Date(y, m - 1, d);
  const existe = fecha.getFullYear() === y && fecha.getMonth() === m - 1 && fecha.getDate() === d;
  if (!existe || y < 1900) return 'Esa fecha no existe';
  if (fecha > new Date()) return 'La fecha no puede ser futura';
  if (edadDe(y, m, d) < EDAD_MINIMA) return `Debes tener al menos ${EDAD_MINIMA} años`;
  return '';
};

// Devuelve el mensaje de error del campo, o '' si está bien.
export const validar = (campo: keyof RegistroForm, value: string, form: RegistroForm): string => {
  const v = value.trim();
  switch (campo) {
    case 'name':
    case 'lastNameP':
      if (!v) return REQUERIDO;
      if (v.length < 2) return 'Escribe al menos 2 letras';
      return LETRAS.test(v) ? '' : 'Solo letras y espacios';
    case 'lastNameM':
      // Opcional: solo se valida si escribió algo
      if (!v) return '';
      return LETRAS.test(v) ? '' : 'Solo letras y espacios';
    case 'username':
      if (!v) return REQUERIDO;
      if (v.length < 4) return 'Mínimo 4 caracteres';
      return /^[A-Za-z0-9_.]+$/.test(v) ? '' : 'Solo letras, números, punto y guion bajo';
    case 'birthDate':
      if (!v) return REQUERIDO;
      return validarFecha(v);
    case 'address':
      if (!v) return REQUERIDO;
      return v.length >= 10 ? '' : 'Escribe calle, número y colonia';
    case 'phone':
      if (!v) return REQUERIDO;
      return /^\d{10}$/.test(v) ? '' : `Debe tener 10 dígitos (llevas ${v.length})`;
    case 'email':
      if (!v) return REQUERIDO;
      return isValidEmail(v) ? '' : 'Escribe un correo válido (ej. nombre@correo.com)';
    case 'password':
      if (!value) return REQUERIDO;
      return isValidPassword(value) ? '' : PASSWORD_RULE;
    case 'confirmPassword':
      if (!value) return REQUERIDO;
      return value === form.password ? '' : 'Las contraseñas no coinciden';
    default:
      return '';
  }
};
