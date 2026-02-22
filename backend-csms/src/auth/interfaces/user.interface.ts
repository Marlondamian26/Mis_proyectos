export interface UserInterface {
  userId: string;
  email: string;
  roles: string[];
  sub?: string;
}

// Mantener la interfaz User por compatibilidad
export type User = UserInterface; 