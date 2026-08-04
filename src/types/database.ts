/**
 * Tipuri TypeScript pentru schema PostgreSQL definită în
 * `supabase/migrations/0001_init_schema.sql`.
 *
 * Scrise manual pentru a ține pasul cu migrațiile fără a necesita un proiect
 * Supabase live în CI. Pot fi înlocuite oricând cu tipuri generate
 * (`supabase gen types typescript`) — forma `Database` rămâne compatibilă.
 */

export type UserRole = "ADMINISTRATOR" | "LOCATAR";

export type TicketCategory =
  | "APA"
  | "LIFT"
  | "ELECTRICITATE"
  | "CURATENIE"
  | "REPARATII"
  | "ALTCEVA";

export type TicketStatus = "NOUA" | "IN_LUCRU" | "REZOLVATA";

export type PaymentStatus = "NEPLATIT" | "PARTIAL" | "PLATIT";

export type NotificationType =
  | "LISTA_GENERATA"
  | "RESTANTA"
  | "SESIZARE_ACTUALIZATA";

interface Table<Row, Insert, Update = Partial<Insert>> {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
}

export interface Database {
  public: {
    Tables: {
      users: Table<
        {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          role: UserRole;
          created_at: string;
        },
        {
          id: string;
          name: string;
          email: string;
          phone?: string | null;
          role?: UserRole;
        }
      >;
      blocks: Table<
        {
          id: string;
          name: string;
          address: string;
          created_by: string | null;
          created_at: string;
        },
        { name: string; address: string; created_by?: string | null }
      >;
      block_admins: Table<
        { id: string; block_id: string; user_id: string; created_at: string },
        { block_id: string; user_id: string }
      >;
      staircases: Table<
        { id: string; block_id: string; name: string; created_at: string },
        { block_id: string; name: string }
      >;
      apartments: Table<
        {
          id: string;
          staircase_id: string;
          block_id: string;
          number: string;
          floor: number | null;
          created_at: string;
        },
        { staircase_id: string; number: string; floor?: number | null }
      >;
      residents: Table<
        {
          id: string;
          user_id: string;
          apartment_id: string;
          moved_in_at: string;
          moved_out_at: string | null;
          created_at: string;
        },
        { user_id: string; apartment_id: string; moved_in_at?: string }
      >;
      tariffs: Table<
        {
          id: string;
          block_id: string;
          water_price: number;
          sewage_price: number;
          valid_from: string;
          created_by: string | null;
          created_at: string;
        },
        {
          block_id: string;
          water_price: number;
          sewage_price: number;
          valid_from?: string;
          created_by?: string | null;
        }
      >;
      monthly_costs: Table<
        {
          id: string;
          apartment_id: string;
          month: string;
          cold_water_consumption: number;
          sewage_consumption: number;
          water_price: number;
          sewage_price: number;
          electricity_cost: number;
          cleaning_cost: number;
          garbage_cost: number;
          repairs_cost: number;
          funding_fund_cost: number;
          other_costs: number;
          debt: number;
          penalties: number;
          total_amount: number;
          created_by: string | null;
          created_at: string;
        },
        {
          apartment_id: string;
          month: string;
          cold_water_consumption?: number;
          sewage_consumption?: number;
          water_price?: number;
          sewage_price?: number;
          electricity_cost?: number;
          cleaning_cost?: number;
          garbage_cost?: number;
          repairs_cost?: number;
          funding_fund_cost?: number;
          other_costs?: number;
          debt?: number;
          penalties?: number;
          created_by?: string | null;
        }
      >;
      payments: Table<
        {
          id: string;
          apartment_id: string;
          month: string;
          amount: number;
          status: PaymentStatus;
          payment_date: string | null;
          recorded_by: string | null;
          created_at: string;
        },
        {
          apartment_id: string;
          month: string;
          amount: number;
          status?: PaymentStatus;
          payment_date?: string | null;
          recorded_by?: string | null;
        }
      >;
      tickets: Table<
        {
          id: string;
          apartment_id: string;
          created_by: string;
          title: string;
          category: TicketCategory;
          description: string;
          image_path: string | null;
          status: TicketStatus;
          created_at: string;
          updated_at: string;
        },
        {
          apartment_id: string;
          created_by: string;
          title: string;
          category: TicketCategory;
          description: string;
          image_path?: string | null;
          status?: TicketStatus;
        }
      >;
      notifications: Table<
        {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body: string | null;
          related_entity: string | null;
          related_id: string | null;
          read_at: string | null;
          created_at: string;
        },
        {
          user_id: string;
          type: NotificationType;
          title: string;
          body?: string | null;
          related_entity?: string | null;
          related_id?: string | null;
        },
        { read_at?: string | null }
      >;
      audit_log: Table<
        {
          id: string;
          actor_id: string | null;
          action: string;
          entity: string;
          entity_id: string | null;
          diff: Record<string, unknown> | null;
          created_at: string;
        },
        {
          actor_id?: string | null;
          action: string;
          entity: string;
          entity_id?: string | null;
          diff?: Record<string, unknown> | null;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
