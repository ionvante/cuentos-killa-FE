import { Maestro } from '../model/maestro.model';

export const CUENTO_MAESTRO_GRUPOS = {
  categoria: 'CATEGORIA_CUENTO',
  categoriaLegacy: 'CATEGORIA_CUENTO',
  edad: 'RANGO_EDAD',
  tipoEdicion: 'TIPO_EDICION'
} as const;

const LEGACY_CATEGORIA_TO_CODIGO: Record<string, string> = {
  aventura: 'CAT_AVENTURA',
  didactico: 'CAT_DIDACTICO',
  clasico: 'CAT_CLASICO',
  fantasia: 'CAT_FANTASIA',
  valores: 'CAT_VALORES'
};

const LEGACY_RANGO_EDAD_TO_CODIGO: Record<string, string> = {
  '0 3 anos': 'EDAD_0_3',
  '4 6 anos': 'EDAD_4_6',
  '7 9 anos': 'EDAD_7_9',
  '10 12 anos': 'EDAD_10_12',
  '13 anos a mas': 'EDAD_13_MAS'
};

const LEGACY_TIPO_EDICION_TO_CODIGO: Record<string, string> = {
  'tapa dura': 'EDICION_TAPA_DURA',
  'tapa blanda': 'EDICION_TAPA_BLANDA',
  'ilustrado': 'EDICION_ILUSTRADO',
  'bilingue': 'EDICION_BILINGUE',
  'coleccion': 'EDICION_COLECCION'
};

function normalizarValor(valor?: string | null): string {
  return (valor ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function matchCodigoPorMaestro(valor: string, maestros: Maestro[]): string | null {
  if (!valor) return null;

  const porCodigo = maestros.find((m) => m.codigo === valor);
  if (porCodigo) return porCodigo.codigo;

  const normalized = normalizarValor(valor);
  const porValor = maestros.find((m) => normalizarValor(m.valor) === normalized);
  return porValor?.codigo ?? null;
}

function mapearConDiccionario(
  valor: string,
  maestros: Maestro[],
  legacyMap: Record<string, string>
): string | null {
  const normalized = normalizarValor(valor);
  const codigoLegacy = legacyMap[normalized];
  if (!codigoLegacy) return null;

  const existeCodigo = maestros.some((m) => m.codigo === codigoLegacy);
  return existeCodigo ? codigoLegacy : null;
}

export function normalizarCodigoCategoria(valor: string | null | undefined, maestros: Maestro[]): string {
  if (!valor) return '';
  return (
    matchCodigoPorMaestro(valor, maestros) ??
    mapearConDiccionario(valor, maestros, LEGACY_CATEGORIA_TO_CODIGO) ??
    ''
  );
}

export function normalizarCodigoEdad(valor: string | null | undefined, maestros: Maestro[]): string {
  if (!valor) return '';
  return (
    matchCodigoPorMaestro(valor, maestros) ??
    mapearConDiccionario(valor, maestros, LEGACY_RANGO_EDAD_TO_CODIGO) ??
    ''
  );
}

export function normalizarCodigoTipoEdicion(valor: string | null | undefined, maestros: Maestro[]): string {
  if (!valor) return '';
  return (
    matchCodigoPorMaestro(valor, maestros) ??
    mapearConDiccionario(valor, maestros, LEGACY_TIPO_EDICION_TO_CODIGO) ??
    ''
  );
}

export const CUENTO_LEGACY_MAPPING_DOC = {
  categoria: LEGACY_CATEGORIA_TO_CODIGO,
  edadRecomendada: LEGACY_RANGO_EDAD_TO_CODIGO,
  tipoEdicion: LEGACY_TIPO_EDICION_TO_CODIGO
} as const;
