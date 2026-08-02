export type UserRole = "ADMINISTRATOR" | "LOCATAR";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
}
