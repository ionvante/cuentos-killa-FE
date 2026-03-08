import { User } from '../model/user.model';
import { resolveTipoDocumento } from './documento-utils';

type UserApiPayload = Partial<User> & Record<string, any>;

export function normalizeUser(user: UserApiPayload | null | undefined): User {
  const source = user ?? {};

  const documentoNumero = source.documentoNumero
    ?? source['numeroDocumento']
    ?? source['nroDocumento']
    ?? source.documento
    ?? '';

  const documentoTipoRaw = source.documentoTipo
    ?? source['tipoDocumento']
    ?? source['tipo_documento']
    ?? 'DNI';

  return {
    ...source,
    id: toNumber(source.id ?? source['uid'] ?? source['usuarioId']),
    nombre: source.nombre ?? source['nombres'] ?? '',
    apellido: source.apellido ?? source['apellidos'] ?? '',
    email: source.email ?? source['correo'] ?? '',
    telefono: source.telefono ?? source['celular'] ?? '',
    documentoTipo: resolveTipoDocumento(documentoTipoRaw),
    documentoNumero,
    documento: documentoNumero,
    role: source.role ?? source['rol'],
    habilitado: source.habilitado ?? source['activo'],
    direcciones: source.direcciones ?? []
  };
}

function toNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

