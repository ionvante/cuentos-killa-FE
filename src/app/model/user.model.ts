export interface User {
    id?: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    documentoTipo?: string;
    documentoNumero?: string;
    direcciones?: any[];
    role?: 'USER' | 'ADMIN';
    habilitado?: boolean;
}
