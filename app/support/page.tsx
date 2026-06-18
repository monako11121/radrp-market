import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { prisma }           from "@/lib/prisma";
import { redirect }         from "next/navigation";
import Link                 from "next/link";
import CreateTicketForm     from "./CreateTicketForm";

export const metadata = {
  title: "Поддержка — Radmir RP Market",
};

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  OPEN:        { label: "Открыт",      color: "#22c55e", bg: "rgba(34,197,94,.1)"  },
  IN_PROGRESS: { label: "В обработке", color: "#ffb340", bg: "rgba(255,179,64,.1)" },
  CLOSED:      { label: "Закрыт",      color: "#7e8796", bg: "rgba(126,135,150,.1)"},
};

export default async function SupportPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/auth");

  const tickets = await prisma.supportTicket.findMany({
    where:   { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count:   { select: { messages: true } },
    },
  });

  return (
    <main className="container" style={{ paddingTop: 60, paddingBottom: 100, maxWidth: 820 }}>

      {/* Заголовок */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 42, fontWeight: 900, letterSpacing: -1.5, marginBottom: 12 }}>
          Поддержка
        </h1>
        <p style={{ color: "#7e8796", fontSize: 16, lineHeight: 1.7 }}>
          Создайте обращение — администратор ответит в течение 1–3 рабочих дней.
          По спорам в сделках используйте раздел{" "}
          <Link href="/disputes" style={{ color: "#ff9a00" }}>Споры</Link>.
        </p>
      </div>

      <CreateTicketForm />

      {/* Список тикетов */}
      {tickets.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>📭</div>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>
            Обращений пока нет
          </div>
          <div style={{ fontSize: 14, color: "#7e8796" }}>
            Создайте первое обращение, если нужна помощь.
          </div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 13, color: "#7e8796", marginBottom: 14 }}>
            Всего обращений: {tickets.length}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tickets.map(t => {
              const st = STATUS_LABEL[t.status] ?? STATUS_LABEL.OPEN;
              const lastMsg = t.messages[0];
              return (
                <Link key={t.id} href={`/support/${t.id}`} style={{ textDecoration: "none" }}>
                  <div className="card" style={{ padding: "18px 22px", cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 5, wordBreak: "break-word" }}>
                          {t.subject}
                        </div>
                        {lastMsg && (
                          <div style={{ fontSize: 13, color: "#7e8796", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 480 }}>
                            {lastMsg.message}
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                        <span style={{
                          padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700,
                          color: st.color, background: st.bg,
                        }}>
                          {st.label}
                        </span>
                        <span style={{ fontSize: 11, color: "#4a5568" }}>
                          {new Date(t.updatedAt).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}

    </main>
  );
}
