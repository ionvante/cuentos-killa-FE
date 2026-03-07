import { ValidatorFn, Validators } from '@angular/forms';

export interface DocumentoRule {
  maxLength: number;
  placeholder: string;
  helpText: string;
  validators: ValidatorFn[];
  numericOnly: boolean;
}

const DEFAULT_DOCUMENTO_RULE: DocumentoRule = {
  maxLength: 12,
  placeholder: 'Número de documento',
  helpText: 'Ingresa entre 5 y 12 caracteres.',
  validators: [Validators.required, Validators.minLength(5), Validators.maxLength(12)],
  numericOnly: false
};

const DOCUMENTO_RULES: Record<string, DocumentoRule> = {
  DNI: {
    maxLength: 8,
    placeholder: '12345678',
    helpText: 'DNI: 8 dígitos numéricos.',
    validators: [Validators.required, Validators.pattern(/^\d{8}$/)],
    numericOnly: true
  },
  CE: {
    maxLength: 9,
    placeholder: '123456789',
    helpText: 'CE: 9 dígitos numéricos.',
    validators: [Validators.required, Validators.pattern(/^\d{9}$/)],
    numericOnly: true
  },
  PASAPORTE: {
    maxLength: 12,
    placeholder: 'A12345678',
    helpText: 'Pasaporte: entre 5 y 12 caracteres.',
    validators: [Validators.required, Validators.minLength(5), Validators.maxLength(12)],
    numericOnly: false
  }
};

export function getDocumentoRule(tipo: string | null | undefined): DocumentoRule {
  const tipoNormalizado = (tipo ?? '').toUpperCase();
  return DOCUMENTO_RULES[tipoNormalizado] ?? DEFAULT_DOCUMENTO_RULE;
}

export function getDocumentoErrorMessage(tipo: string | null | undefined): string {
  const tipoNormalizado = (tipo ?? '').toUpperCase();
  if (tipoNormalizado === 'DNI') {
    return 'El DNI debe tener 8 dígitos numéricos';
  }
  if (tipoNormalizado === 'CE') {
    return 'El CE debe tener 9 dígitos numéricos';
  }
  if (tipoNormalizado === 'PASAPORTE') {
    return 'El pasaporte debe tener entre 5 y 12 caracteres';
  }
  return 'El número de documento no cumple el formato esperado';
}

export function getTipoDocumentoLabel(tipo: { codigo?: string; valor?: string; descripcion?: string }): string {
  return tipo.valor ?? tipo.descripcion ?? tipo.codigo ?? '';
}
