import { adminUsuariosApi } from "@/data/api/adminUsuariosApi";
import type { Cliente } from "../models/Cliente";

// Adapter: respuesta del backend -> nuestro modelo (los opcionales llegan null).
const aCliente = (r: any): Cliente => ({
  id_usuario: Number(r.id_usuario),
  nombre: r.nombre ?? "",
  apellido_paterno: r.apellido_paterno ?? "",
  apellido_materno: r.apellido_materno ?? "",
  nombre_usuario: r.nombre_usuario ?? "",
  correo_electronico: r.correo_electronico ?? "",
  telefono: r.telefono ?? "",
  activo: Boolean(r.activo),
  proveedor: r.proveedor ?? "local",
  fecha_registro: r.fecha_registro ?? null,
});

// Acepta [..] o { usuarios: [..] } según cómo responda el backend.
const extraerLista = (r: any): any[] =>
  Array.isArray(r) ? r : Array.isArray(r?.usuarios) ? r.usuarios : [];

export const clientesAdminService = {
  // HU-21: solo clientes. El endpoint devuelve también administradores.
  getClientes: async (): Promise<Cliente[]> => {
    const data = await adminUsuariosApi.getAll();
    return extraerLista(data)
      .filter((u) => u?.rol === "cliente")
      .map(aCliente);
  },

  // Activar / desactivar cuenta. La eliminación NO existe en la app (solo en la web).
  cambiarActivo: (id: number, activo: boolean) => adminUsuariosApi.cambiarEstado(id, activo),
};
