import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Emailul este obligatoriu").email("Email invalid"),
  password: z.string().min(1, "Parola este obligatorie"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Numele trebuie să aibă cel puțin 2 caractere"),
  email: z.string().trim().min(1, "Emailul este obligatoriu").email("Email invalid"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+()\s-]{6,20}$/, "Număr de telefon invalid")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(8, "Parola trebuie să aibă cel puțin 8 caractere")
    .regex(/[A-Za-z]/, "Parola trebuie să conțină cel puțin o literă")
    .regex(/[0-9]/, "Parola trebuie să conțină cel puțin o cifră"),
  role: z.enum(["ADMINISTRATOR", "LOCATAR"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;
