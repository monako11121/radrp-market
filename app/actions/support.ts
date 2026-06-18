"use server";

import { getServerSession }   from "next-auth";
import { authOptions }        from "@/lib/auth";
import { prisma }             from "@/lib/prisma";
import { redirect }           from "next/navigation";
import { revalidatePath }     from "next/cache";
import { isAdmin }            from "@/lib/admin";
import { createNotification } from "@/lib/notifications";

export type TicketActionState = { error?: string; success?: boolean } | null;

async function getUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/auth");
  return user;
}

// ─── Создать обращение ──────────────────────────────────────────────────────
export async function createTicket(
  _prev: TicketActionState,
  formData: FormData,
): Promise<TicketActionState> {
  const user    = await getUser();
  const subject = (formData.get("subject") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();

  if (!subject || subject.length < 3)
    return { error: "Тема должна содержать не менее 3 символов" };
  if (!message || message.length < 10)
    return { error: "Опишите проблему подробнее (минимум 10 символов)" };

  const ticket = await prisma.supportTicket.create({
    data: {
      userId:  user.id,
      subject,
      status:  "OPEN",
      messages: { create: { userId: user.id, message } },
    },
  });

  // Уведомляем всех администраторов
  const admins = await prisma.user.findMany({ where: { role: { in: ["ADMIN", "OWNER"] } } });
  await Promise.all(admins.map(a =>
    createNotification({
      userId:  a.id,
      type:    "TICKET_CREATED",
      title:   "Новое обращение в поддержку",
      message: `${user.username}: ${subject}`,
      href:    `/admin/tickets/${ticket.id}`,
    }).catch(()=>{})
  ));

  revalidatePath("/support");
  redirect(`/support/${ticket.id}`);
}

// ─── Отправить сообщение в тикет ────────────────────────────────────────────
export async function sendTicketMessage(
  _prev: TicketActionState,
  formData: FormData,
): Promise<TicketActionState> {
  const user     = await getUser();
  const ticketId = formData.get("ticketId") as string;
  const message  = (formData.get("message") as string)?.trim();

  if (!message) return { error: "Сообщение не может быть пустым" };

  const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
  if (!ticket) return { error: "Обращение не найдено" };

  const canAccess = ticket.userId === user.id || isAdmin(user.role);
  if (!canAccess) return { error: "Нет доступа" };

  if (ticket.status === "CLOSED") return { error: "Обращение закрыто" };

  await prisma.ticketMessage.create({
    data: { ticketId, userId: user.id, message },
  });

  // Если пишет не владелец тикета (т.е. администратор) — уведомляем владельца
  if (ticket.userId !== user.id) {
    await createNotification({
      userId:  ticket.userId,
      type:    "TICKET_REPLY",
      title:   "Ответ от поддержки",
      message: `По обращению «${ticket.subject}»`,
      href:    `/support/${ticketId}`,
      dedupe:  true,
    }).catch(()=>{});
  } else {
    // Пишет владелец — уведомляем администраторов
    const admins = await prisma.user.findMany({ where: { role: { in: ["ADMIN", "OWNER"] } } });
    await Promise.all(admins.map(a =>
      createNotification({
        userId:  a.id,
        type:    "TICKET_REPLY",
        title:   "Новое сообщение в тикете",
        message: `${user.username}: ${ticket.subject}`,
        href:    `/admin/tickets/${ticketId}`,
        dedupe:  true,
      }).catch(()=>{})
    ));
  }

  revalidatePath(`/support/${ticketId}`);
  revalidatePath(`/admin/tickets/${ticketId}`);
  return { success: true };
}

// ─── Изменить статус тикета (только админ) ──────────────────────────────────
export async function updateTicketStatus(
  _prev: TicketActionState,
  formData: FormData,
): Promise<TicketActionState> {
  const user     = await getUser();
  if (!isAdmin(user.role)) return { error: "Нет доступа" };

  const ticketId = formData.get("ticketId") as string;
  const status   = formData.get("status")   as string;

  const allowed = ["OPEN", "IN_PROGRESS", "CLOSED"];
  if (!allowed.includes(status)) return { error: "Неверный статус" };

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data:  { status },
  });

  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath("/admin/tickets");
  return { success: true };
}
