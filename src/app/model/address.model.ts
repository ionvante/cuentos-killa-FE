export interface Address {
    id?: number;
    calle: string;
    ciudad: string;
    departamento: string;
    provincia: string;
    distrito: string;
    referencia?: string;
    codigoPostal?: string;
    esPrincipal: boolean;
    esFacturacion: boolean;
    usuarioId?: number;
}
