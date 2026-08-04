export type TicketCategory =
  | "APA"
  | "LIFT"
  | "ELECTRICITATE"
  | "CURATENIE"
  | "REPARATII"
  | "ALTCEVA";

export type TicketStatus = "NOUA" | "IN_LUCRU" | "REZOLVATA";

export interface Ticket {
  id: string;
  title: string;
  category: TicketCategory;
  description: string;
  status: TicketStatus;
  createdAt: string;
  imageUrl: string | null;
  /** Populat doar în listele administratorului (vezi getAdminTickets). */
  apartmentLabel: string | null;
}
