"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { markNotificationRead } from "@/infrastructure/supabase/repositories/notifications.repository";

export async function markNotificationReadAction(formData: FormData) {
  const notificationId = formData.get("notificationId");
  if (typeof notificationId !== "string") return;

  const supabase = await createSupabaseServerClient();
  await markNotificationRead(supabase, notificationId);
  revalidatePath("/notificari");
}
