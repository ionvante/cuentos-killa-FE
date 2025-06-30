export interface Cuento {
    id: number;
    titulo: string;
    autor: string;
    descripcionCorta: string;
    editorial: string;
    tipoEdicion: string;
    nroPaginas: number;
    fechaPublicacion: string;
    fechaIngreso: string;
    edadRecomendada: string;
    stock: number;
    precio: number;
    imagenUrl: string;
    habilitado?: boolean; // Nuevo campo para estado de habilitación
  }
  