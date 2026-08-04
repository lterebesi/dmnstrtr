import type { Metadata } from "next";
import clsx from "clsx";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getUserNotifications } from "@/application/use-cases/get-notifications";
import { markNotificationReadAction } from "@/lib/notifications/actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Notificări" };

const TYPE_LABELS: Record<string, string> = {
  LISTA_GENERATA: "Listă generată",
  RESTANTA: "Restanță",
  SESIZARE_ACTUALIZATA: "Sesizare actualizată",
};

export default async function NotificariPage() {
  const user = await getCurrentUser();
  const notifications = await getUserNotifications(user.id);

  return (
    <Card>
      <h2 className="text-lg font-semibold text-gray-900">Notificări</h2>

      {notifications.length === 0 ? (
        <p className="mt-2 text-sm text-gray-500">Nu ai nicio notificare încă.</p>
      ) : (
        <ul className="mt-4 divide-y divide-gray-100">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={clsx(
                "flex items-start justify-between gap-3 py-3",
                !notification.isRead && "bg-blue-50/50",
              )}
            >
              <div>
                <p className="text-xs font-medium text-blue-600">
                  {TYPE_LABELS[notification.type]}
                </p>
                <p className="font-medium text-gray-900">{notification.title}</p>
                {notification.body && (
                  <p className="text-sm text-gray-600">{notification.body}</p>
                )}
                <p className="text-xs text-gray-400">
                  {new Date(notification.createdAt).toLocaleString("ro-RO")}
                </p>
              </div>
              {!notification.isRead && (
                <form action={markNotificationReadAction}>
                  <input type="hidden" name="notificationId" value={notification.id} />
                  <Button type="submit" variant="ghost" className="text-xs">
                    Marchează citit
                  </Button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
