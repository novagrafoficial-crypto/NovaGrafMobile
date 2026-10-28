// ─────────────────────────────────────────────────────────────
// Aviso de privacidad que se muestra en la app (Google Play lo exige).
// REVÍSALO con tu asesor o profesor y ajusta los datos de la empresa.
// ─────────────────────────────────────────────────────────────

export const FECHA_ACTUALIZACION = '28 de octubre de 2026';

export interface SeccionAviso {
  titulo: string;
  icono: string; // nombre de Ionicons
  puntos: string[];
}

export const AVISO_PRIVACIDAD: SeccionAviso[] = [
  {
    titulo: 'Qué datos recopilamos',
    icono: 'person-outline',
    puntos: [
      'Nombre completo, nombre de usuario y fecha de nacimiento.',
      'Correo electrónico, teléfono y domicilio de entrega.',
      'Imágenes y comprobantes de pago que subes en tus pedidos.',
      'Si entras con Google, tu nombre y correo de esa cuenta.',
    ],
  },
  {
    titulo: 'Para qué los usamos',
    icono: 'construct-outline',
    puntos: [
      'Crear y administrar tu cuenta.',
      'Elaborar, cobrar y entregar tus pedidos personalizados.',
      'Enviarte avisos sobre el estado de tus pedidos.',
      'Atender tus dudas por el chat del pedido.',
    ],
  },
  {
    titulo: 'Con quién los compartimos',
    icono: 'people-outline',
    puntos: [
      'No vendemos ni rentamos tus datos.',
      'Solo los usan proveedores necesarios para operar la app: almacenamiento de archivos y envío de correos.',
    ],
  },
  {
    titulo: 'Cómo los protegemos',
    icono: 'shield-checkmark-outline',
    puntos: [
      'Tu contraseña se guarda cifrada.',
      'La comunicación con nuestro servidor es por conexión segura (HTTPS).',
    ],
  },
  {
    titulo: 'Tus derechos',
    icono: 'hand-left-outline',
    puntos: [
      'Puedes ver y corregir tus datos en "Mi perfil".',
      'Puedes solicitar la eliminación de tu cuenta y tus datos personales desde "Eliminar mi cuenta".',
    ],
  },
];
