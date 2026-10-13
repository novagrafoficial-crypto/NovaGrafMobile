export interface ContactoItem {
  id: number;
  tipo: string; // telefono, email, whatsapp, horario...
  valor: string;
}

export interface RedSocial {
  id: number;
  nombre: string;
  url: string;
}

export interface Ubicacion {
  direccion: string;
  ciudad: string;
  estado: string;
  pais: string;
  codigo_postal: string;
}

export interface ContactoData {
  contactos: ContactoItem[];
  redes: RedSocial[];
  ubicacion: Ubicacion | null;
}

// ── Tipos "ya listos para dibujar" que arma el viewmodel ──
export interface FilaContacto {
  id: number;
  tipo: string;
  icono: string;
  etiqueta: string;
  valor: string;
  href: string | null;
}

export interface AccionRapida {
  clave: string;
  icono: string;
  titulo: string;
  href: string;
}

export interface RedVista {
  id: number;
  nombre: string;
  icono: string;
  href: string;
}