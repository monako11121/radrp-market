import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { prisma }           from "@/lib/prisma";
import { redirect }         from "next/navigation";
import { isAdmin }          from "@/lib/admin";
import Link                 from "next/link";

export const metadata = { title: "Тикеты — Adminка | Radmir RP Market" };

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  OPEN:        { label: "Открыт",      color: "#22c55e", bg: "rgba(34,197,94,.1)"  },
  IN_PROGRESS: { label: "В обработке", color: "#ffb340", bg: "rgba(255,179,64,.1)" },
  CLOSED:      { label: "Закрыт",      color: "#7e8796", bg: "rgba(126,135,150,.1)"},
};

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) redirect("/");

  const { status } = await searchParams;

  const tickets = await prisma.supportTicket.findMany({
    where:   status ? { status } : undefined,
    orderBy: { updatedAt: "desc" },
    include: {
      user:     { select: { username: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count:   { select: { messages: true } },
    },
  });

  const counts = await prisma.supportTicket.groupBy({
    by:     ["status"],
    _count: { _all: true },
  });
  const byStatus = Object.fromEntries(counts.map(c => [c.status, c._count._all]));

  const FILTERS = [
    { label: "Все",          value: "",            count: Object.values(byStatus).reduce((a,b)=>a+b,0) },
    { label: "Открытые",     value: "OPEN",        count: byStatus.OPEN        ?? 0 },
    { label: "В обработке",  value: "IN_PROGRESS", count: byStatus.IN_PROGRESS ?? 0 },
    { label: "Закрытые",     value: "CLOSED",      count: byStatus.CLOSED      ?? 0 },
  ];

  return (
    <main className="container" style={{ paddingTop: 60, paddingBottom: 100 }}>

      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 13, color: "#ef4444", fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
          АДМИН-ПАНЕЛЬ
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 900 }}>Обращения в поддержку</h1>
      </div>

      {/* Фильтры */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {FILTERS.map(f => {
          const active = (status ?? "") === f.value;
          return (
            <Link key={f.value} href={f.value ? `?status=${f.value}` : "/admin/tickets"} style={{ textDecoration: "none" }}>
              <div style={{
                padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer",
                background: active ? "rgba(255,154,0,.12)" : "rgba(255,255,255,.04)",
                border:     active ? "1px solid rgba(255,154,0,.3)" : "1px solid rgba(255,255,255,.08)",
                color:      active ? "#ffb340" : "#7e8796",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                {f.label}
                <span style={{
                  minWidth: 20, height: 18, borderRadius: 999, fontSize: 11, fontWeight: 900,
                  background: active ? "rgba(255,154,0,.2)" : "rgba(255,255,255,.06)",
                  color: active ? "#ff9a00" : "#4a5568",
                  display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 5px",
                }}>
                  {f.count}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Таблица тикетов */}
      {tickets.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "#7e8796" }}>
          Нет обращений
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tickets.map(t => {
            const st      = STATUS_LABEL[t.status] ?? STATUS_LABEL.OPEN;
            const lastMsg = t.messages[0];
            return (
              <Link key={t.id} href={`/admin/tickets/${t.id}`} style={{ textDecoration: "none" }}>
                <div className="card" style={{ padding: "16px 22px", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{t.subject}</span>
                        <span style={{
                          padding: "2px 9px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                          color: st.color, background: st.bg,
                        }}>
                          {st.label}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: "#7e8796", marginBottom: 2 }}>
                        👤 {t.user.username} · {t._count.messages} сообщ.
                      </div>
                      {lastMsg && (
                        <div style={{ fontSize: 12, color: "#4a5568", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 520 }}>
                          {lastMsg.message}
                        </div>
                      )}
                    </div>

                    <div style={{ fontSize: 11, color: "#4a5568", flexShrink: 0 }}>
                      {new Date(t.updatedAt).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
