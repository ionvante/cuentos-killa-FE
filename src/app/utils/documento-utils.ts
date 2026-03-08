import { ValidatorFn, Validators } from '@angular/forms';

export interface DocumentoRule {
  maxLength: number;
  placeholder: string;
  helpText: string;
  validators: ValidatorFn[];
  numericOnly: boolean;
}

type DocumentoTipoCanonico = 'DNI' | 'CE' | 'PASAPORTE' | 'OTRO';

const DOCUMENTO_ALIAS: Record<string, DocumentoTipoCanonico> = {
  '1': 'DNI',
  DNI: 'DNI',
  DOC_DNI: 'DNI',
  DOCUMENTO_NACIONAL_IDENTIDAD: 'DNI',
  DOCUMENTO_NACIONAL_DE_IDENTIDAD: 'DNI',

  '4': 'CE',
  CE: 'CE',
  DOC_CE: 'CE',
  CARNET_EXTRANJERIA: 'CE',
  CARNET_DE_EXTRANJERIA: 'CE',
  CARNETEXTRANJERIA: 'CE',

  '7': 'PASAPORTE',
  PASAPORTE: 'PASAPORTE',
  DOC_PASAPORTE: 'PASAPORTE',
  PASSPORT: 'PASAPORTE'
};

function normalizarTipoDocumento(tipo: string | null | undefined): string {
  return (tipo ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .toUpperCase()
    .trim();
}

export function resolveTipoDocumento(tipo: string | null | undefined): DocumentoTipoCanonico {
  const normalizado = normalizarTipoDocumento(tipo);
  return DOCUMENTO_ALIAS[normalizado] ?? 'OTRO';
}

const DEFAULT_DOCUMENTO_RULE: DocumentoRule = {
  maxLength: 12,
  placeholder: 'Numero de documento',
  helpText: 'Ingresa el numero segun el tipo de documento seleccionado.',
  validators: [Validators.required],
  numericOnly: false
};

const DOCUMENTO_RULES: Record<string, DocumentoRule> = {
  DNI: {
    maxLength: 8,
    placeholder: '12345678',
    helpText: 'DNI: 8 digitos numericos.',
    validators: [Validators.required, Validators.pattern(/^\d{8}$/)],
    numericOnly: true
  },
  CE: {
    maxLength: 9,
    placeholder: '123456789',
    helpText: 'CE: 9 digitos numericos.',
    validators: [Validators.required, Validators.pattern(/^\d{9}$/)],
    numericOnly: true
  },
  PASAPORTE: {
    maxLength: 9,
    placeholder: '123456789',
    helpText: 'Pasaporte: 9 digitos numericos.',
    validators: [Validators.required, Validators.pattern(/^\d{9}$/)],
    numericOnly: true
  }
};

export function getDocumentoRule(tipo: string | null | undefined): DocumentoRule {
  const tipoCanonico = resolveTipoDocumento(tipo);
  return DOCUMENTO_RULES[tipoCanonico] ?? DEFAULT_DOCUMENTO_RULE;
}

export function getDocumentoErrorMessage(tipo: string | null | undefined): string {
  const tipoCanonico = resolveTipoDocumento(tipo);
  if (tipoCanonico === 'DNI') {
    return 'El DNI debe tener 8 digitos numericos';
  }
  if (tipoCanonico === 'CE') {
    return 'El CE debe tener 9 digitos numericos';
  }
  if (tipoCanonico === 'PASAPORTE') {
    return 'El pasaporte debe tener 9 digitos numericos';
  }
  return 'El numero de documento no cumple el formato esperado';
}

export function getTipoDocumentoLabel(tipo: { codigo?: string; valor?: string; descripcion?: string }): string {
  if (tipo.valor) return tipo.valor;
  if (tipo.descripcion) return tipo.descripcion;

  const canonico = resolveTipoDocumento(tipo.codigo);
  if (canonico === 'DNI') return 'DNI';
  if (canonico === 'CE') return 'CE';
  if (canonico === 'PASAPORTE') return 'PASAPORTE';

  return tipo.codigo ?? '';
}
