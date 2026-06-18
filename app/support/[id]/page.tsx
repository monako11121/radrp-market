import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { prisma }           from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link                 from "next/link";
import { isAdmin }          from "@/lib/admin";
import TicketChat           from "./TicketChat";

export const metadata = { title: "Обращение — Radmir RP Market" };

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  OPEN:        { label: "Открыт",      color: "#22c55e" },
  IN_PROGRESS: { label: "В обработке", color: "#ffb340" },
  CLOSED:      { label: "Закрыт",      color: "#7e8796" },
};

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/auth");

  const ticket = await prisma.supportTicket.findUnique({
    where:   { id },
    include: {
      user:     { select: { username: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { id: true, username: true, email: true } } },
      },
    },
  });

  if (!ticket) notFound();

  const canAccess = ticket.userId === user.id || isAdmin(user.email);
  if (!canAccess) redirect("/support");

  const st = STATUS_LABEL[ticket.status] ?? STATUS_LABEL.OPEN;

  return (
    <main className="container" style={{ paddingTop: 60, paddingBottom: 100, maxWidth: 820 }}>

      {/* Хлебные крошки */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, fontSize: 14, color: "#7e8796" }}>
        <Link href="/support" style={{ color: "#7e8796" }}>Поддержка</Link>
        <span>/</span>
        <span style={{ color: "white", maxWidth: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {ticket.subject}
        </span>
      </div>

      {/* Шапка */}
      <div className="card" style={{ padding: "20px 24px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{ticket.subject}</h1>
          <div style={{ fontSize: 13, color: "#7e8796" }}>
            Открыт {new Date(ticket.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
            {isAdmin(user.email) && ` · ${ticket.user.username}`}
          </div>
        </div>
        <span style={{
          padding: "6px 14px", borderRadius: 999, fontSize: 13, fontWeight: 700,
          color: st.color, background: `${st.color}18`,
        }}>
          {st.label}
        </span>
      </div>

      {/* Чат */}
      <TicketChat
        ticketId={ticket.id}
        ticketStatus={ticket.status}
        currentUserId={user.id}
        isCurrentUserAdmin={isAdmin(user.email)}
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
