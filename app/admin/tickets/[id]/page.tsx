import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { prisma }           from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { isAdmin }          from "@/lib/admin";
import Link                 from "next/link";
import TicketChat           from "@/app/support/[id]/TicketChat";

export const metadata = { title: "Тикет — Админка | Radmir RP Market" };

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  OPEN:        { label: "Открыт",      color: "#22c55e" },
  IN_PROGRESS: { label: "В обработке", color: "#ffb340" },
  CLOSED:      { label: "Закрыт",      color: "#7e8796" },
};

export default async function AdminTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) redirect("/");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/");

  const ticket = await prisma.supportTicket.findUnique({
    where:   { id },
    include: {
      user:     { select: { username: true, email: true, createdAt: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { id: true, username: true, email: true } } },
      },
    },
  });

  if (!ticket) notFound();

  const st = STATUS_LABEL[ticket.status] ?? STATUS_LABEL.OPEN;

  return (
    <main className="container" style={{ paddingTop: 60, paddingBottom: 100, maxWidth: 860 }}>

      {/* Хлебные крошки */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, fontSize: 14, color: "#7e8796" }}>
        <Link href="/admin/tickets" style={{ color: "#7e8796" }}>Тикеты</Link>
        <span>/</span>
        <span style={{ color: "white", maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {ticket.subject}
        </span>
      </div>

      {/* Шапка */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 20, alignItems: "start", marginBottom: 20 }} className="ticketAdminLayout">

        <div className="card" style={{ padding: "20px 24px" }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{ticket.subject}</h1>
          <div style={{ fontSize: 13, color: "#7e8796", lineHeight: 1.8 }}>
            <div>👤 <strong style={{ color: "white" }}>{ticket.user.username}</strong> ({ticket.user.email})</div>
            <div>🗓 Создан: {new Date(ticket.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}</div>
            <div>🔄 Обновлён: {new Date(ticket.updatedAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}</div>
          </div>
        </div>

        <div className="card" style={{ padding: "20px 22px", textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#7e8796", marginBottom: 8, letterSpacing: 1 }}>СТАТУС</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: st.color, marginBottom: 4 }}>
            {st.label}
          </div>
          <div style={{ fontSize: 12, color: "#4a5568" }}>
            {ticket.messages.length} сообщений
          </div>
        </div>

      </div>

      {/* Чат с поддержкой */}
      <TicketChat
        ticketId={ticket.id}
        ticketStatus={ticket.status}
        currentUserId={user.id}
        isCurrentUserAdmin={true}
        messages={ticket.messages.map(m => ({
          id:        m.id,
          message:   m.message,
          createdAt: m.createdAt.toISOString(),
          userId:    m.userId,
          username:  m.user.username,
          isAdmin:   isAdmin(m.user.email ?? ""),
        }))}
      />

    </main>
  );
}
