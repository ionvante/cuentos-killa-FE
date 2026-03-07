export interface Cuento {
  id: number;
  titulo: string;
  autor: string;
  descripcionCorta: string;
  editorial: string;
  /** Código de maestro TIPO_EDICION */
  tipoEdicion: string;
  nroPaginas: number;
  fechaPublicacion: string;
  fechaIngreso: string;
  /** Código de maestro RANGO_EDAD */
  edadRecomendada: string;
  stock: number;
  precio: number;
  imagenUrl: string;
  isbn?: string;
  habilitado?: boolean; // Nuevo campo para estado de habilitación
  /** Código de maestro CUENTO_CATEGORIA */
  categoria?: string;
  rating?: number;     // Valoración de 1 a 5
  badge?: string;      // Promoción: Nuevo, Top Ventas, Recomendado
  /** Cantidad de reseñas que respaldan el rating */
  ratingCount?: number;
  /** Porcentaje de descuento (0-100) */
  descuento?: number;
  /** Indica si el cuento califica para envío gratis */
  envioGratis?: boolean;
  /** Galería de imágenes adicionales */
  galeria?: string[];
}
