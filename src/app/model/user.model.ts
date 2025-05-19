export interface User {
    id?: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    documento?: string;
    role?: 'USER' | 'ADMIN';
  }
  