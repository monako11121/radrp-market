import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { prisma }           from "@/lib/prisma";
import { redirect }         from "next/navigation";
import Link                 from "next/link";
import { markAllNotificationsRead } from "@/app/actions/notifications";

export const metadata = {
  title: "Уведомления — Radmir RP Market",
};

const TYPE_ICONS: Record<string, string> = {
  NEW_MESSAGE:          "💬",
  DEAL_PAID:            "💰",
  DEAL_ACCEPTED:        "✅",
  DEAL_DONE:            "🎉",
  DISPUTE_OPENED:       "⚠️",
  DISPUTE_RESOLVED:     "⚖️",
  REVIEW_RECEIVED:      "⭐",
  WITHDRAWAL_CREATED:   "📤",
  WITHDRAWAL_APPROVED:  "✔️",
  WITHDRAWAL_REJECTED:  "❌",
  TICKET_CREATED:       "🎫",
  TICKET_REPLY:         "💌",
};

function safeHref(href: string): string {
  return href.startsWith("/") ? href : "/notifications";
}

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) redirect("/auth");

  const notifications = await prisma.notification.findMany({
    where:   { userId: user.id },
    orderBy: [{ read: "asc" }, { createdAt: "desc" }],
    take:    100,
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <main className="container" style={{ paddingTop: 60, paddingBottom: 100, maxWidth: 740 }}>

      {/* Заголовок */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 6 }}>
            Уведомления
          </h1>
          {unreadCount > 0 && (
            <div style={{ fontSize: 14, color: "#7e8796" }}>
              {unreadCount} непрочитанных
            </div>
          )}
        </div>

        {unreadCount > 0 && (
          <form action={markAllNotificationsRead}>
            <button
              type="submit"
              className="darkButton"
              style={{ fontSize: 13, height: 40, padding: "0 16px" }}
            >
              Отметить все прочитанными
            </button>
          </form>
        )}
      </div>

      {/* Список */}
      {notifications.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Уведомлений нет</div>
          <div style={{ fontSize: 14, color: "#7e8796" }}>
            Здесь будут появляться уведомления о сделках, сообщениях и статусе выводов.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {notifications.map(n => (
            <Link key={n.id} href={safeHref(n.href)} style={{ textDecoration: "none" }}>
              <div
                className="card"
                style={{
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  opacity: n.read ? 0.6 : 1,
                  borderLeft: n.read ? undefined : "3px solid #ff9a00",
                  transition: "opacity .15s",
                  cursor: "pointer",
                }}
              >
                {/* Иконка */}
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: n.read ? "rgba(255,255,255,.04)" : "rgba(255,154,0,.10)",
                  border: n.read ? "1px solid rgba(255,255,255,.06)" : "1px solid rgba(255,154,0,.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18,
                }}>
                  {TYPE_ICONS[n.type] ?? "🔔"}
                </div>

                {/* Текст */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 15,
                    fontWeight: n.read ? 500 : 700,
                    color: n.read ? "#b0bac8" : "white",
                    marginBottom: 3,
                  }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: 13, color: "#7e8796", lineHeight: 1.5 }}>
                    {n.message}
                  </div>
                </div>

                {/* Время + точка непрочитанного */}
                <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <div style={{ fontSize: 11, color: "#4a5568" }}>
                    {new Date(n.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                    {" "}
                    {new Date(n.createdAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  {!n.read && (
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%", background: "#ff9a00",
                    }} />
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

    </main>
  );
}
