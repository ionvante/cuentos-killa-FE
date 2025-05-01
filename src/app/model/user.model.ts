export interface User {
    id?: number;
    nombre: string;
    correo: string;
    telefono: string;
    documento?: string;
    rol?: 'USER' | 'ADMIN';
  }
  