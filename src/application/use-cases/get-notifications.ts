import "server-only";

import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { listNotifications } from "@/infrastructure/supabase/repositories/notifications.repository";
import type { NotificationType } from "@/types/database";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  isRead: boolean;
  createdAt: string;
}

export async function getUserNotifications(userId: string): Promise<NotificationItem[]> {
  if (process.env.DISABLE_AUTH === "true") return [];

  const supabase = await createSupabaseServerClient();
  const notifications = await listNotifications(supabase, userId);

  return notifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    isRead: n.read_at !== null,
    createdAt: n.created_at,
  }));
}
