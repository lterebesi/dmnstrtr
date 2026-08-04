import { z } from "zod";

export const createTicketSchema = z.object({
  title: z.string().trim().min(3, "Titlul trebuie să aibă cel puțin 3 caractere"),
  category: z.enum(["APA", "LIFT", "ELECTRICITATE", "CURATENIE", "REPARATII", "ALTCEVA"]),
  description: z.string().trim().min(5, "Descrierea trebuie să aibă cel puțin 5 caractere"),
});

export const updateTicketStatusSchema = z.object({
  ticketId: z.string().uuid(),
  status: z.enum(["NOUA", "IN_LUCRU", "REZOLVATA"]),
});
