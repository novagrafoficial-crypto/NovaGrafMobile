export interface Proposito {
  descripcion: string;
}

export interface Valor {
  titulo: string;
  descripcion: string;
}

export interface Antecedente {
  fecha_evento: string;
  descripcion: string;
}

// Antecedente ya listo para dibujar (la fecha viene formateada por el viewmodel)
export interface AntecedenteConFecha extends Antecedente {
  fechaTexto: string;
}

export interface NosotrosData {
  mision: Proposito | null;
  vision: Proposito | null;
  valores: Valor[];
  antecedentes: Antecedente[];
}