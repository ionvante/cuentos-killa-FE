export interface Maestro {
    id?: number;
    grupo: string;
    codigo: string;
    valor: string;
    descripcion?: string;
    estado: boolean;
    enUso?: boolean;
}

export interface MaestroAuditLog {
    id?: number;
    maestroId?: number;
    usuario: string;
    fecha: string;
    operacion: 'CREATE' | 'UPDATE' | 'ACTIVATE' | 'INACTIVATE' | 'DELETE' | string;
    valorPrevio?: string;
    valorNuevo?: string;
}
