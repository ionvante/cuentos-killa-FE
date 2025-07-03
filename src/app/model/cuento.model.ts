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
  isbn?: string;
  habilitado?: boolean; // Nuevo campo para estado de habilitación
  categoria?: string;  // Etiqueta emocional (Aventura, Didáctico, Clásico)
  rating?: number;     // Valoración de 1 a 5
  badge?: string;      // Promoción: Nuevo, Top Ventas, Recomendado
}
