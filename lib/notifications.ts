import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

export type NotifType =
  | "NEW_MESSAGE"
  | "DEAL_PAID"
  | "DEAL_ACCEPTED"
  | "DEAL_DONE"
  | "DISPUTE_OPENED"
  | "DISPUTE_RESOLVED"
  | "REVIEW_RECEIVED"
  | "WITHDRAWAL_CREATED"
  | "WITHDRAWAL_APPROVED"
  | "WITHDRAWAL_REJECTED"
  | "TICKET_CREATED"
  | "TICKET_REPLY";

export async function createNotification(p: {
  userId:     string;
  type:       NotifType;
  title:      string;
  message:    string;
  href:       string;
  /** Пропустить создание, если уже есть непрочитанное уведомление того же type+href для этого userId */
  dedupe?:    boolean;
}) {
  if (p.dedupe) {
    // Атомарная проверка + создание внутри Serializable транзакции,
    // чтобы исключить race condition при параллельных вызовах
    await prisma.$transaction(async (tx) => {
      const exists = await tx.notification.findFirst({
        where: { userId: p.userId, type: p.type, href: p.href, read: false },
      });
      if (exists) return;

      await tx.notification.create({
        data: {
          userId:  p.userId,
          type:    p.type,
          title:   p.title,
          message: p.message,
          href:    p.href,
        },
      });
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
    return;
  }

  await prisma.notification.create({
    data: {
      userId:  p.userId,
      type:    p.type,
      title:   p.title,
      message: p.message,
      href:    p.href,
    },
  });
}
