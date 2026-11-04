export interface RegistroForm {
  name: string;
  lastNameP: string;
  lastNameM: string;
  username: string;
  birthDate: string;
  address: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegistroResponse {
  id_usuario: number;
  nombre: string;
  correo_electronico: string;
  message: string;
}