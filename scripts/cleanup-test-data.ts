/**
 * Скрипт очистки тестовых данных перед реальным запуском.
 *
 * Запуск (preview — ничего не удаляет):
 *   npx tsx scripts/cleanup-test-data.ts
 *
 * Реальное удаление:
 *   CONFIRM_CLEANUP=true npx tsx scripts/cleanup-test-data.ts
 *
 * Порядок удаления выведен из FK-графа prisma/schema.prisma:
 *   Message        → Deal, User
 *   TicketMessage  → SupportTicket, User
 *   AdminDecision  → Deal
 *   Review         → Deal, User
 *   TransactionHistory → User, Deal?, Product?, DepositRequest?, WithdrawalRequest?
 *   Notification   → User
 *   Favorite       → User, Product
 *   DepositRequest → User
 *   WithdrawalRequest → User
 *   SupportTicket  → User
 *   Deal           → User, Product
 *   Product        → User
 *   User
 */

import { PrismaClient } from "@prisma/client";
import * as readline from "readline";

const prisma = new PrismaClient();

const CONFIRM = process.env.CONFIRM_CLEANUP === "true";

const ADMIN_EMAILS: string[] = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function log(msg: string) { console.log(msg); }

function section(title: string) {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`  ${title}`);
  console.log("─".repeat(60));
}

async function promptConfirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${question} [y/N] `, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "y");
    });
  });
}

async function main() {
  console.log("\n🧹 RADRP Market — очистка тестовых данных");
  console.log(`Режим: ${CONFIRM ? "🔴 РЕАЛЬНОЕ УДАЛЕНИЕ" : "👁  PREVIEW (только подсчёт)"}`);

  if (ADMIN_EMAILS.length > 0) {
    log(`\nЗащищённые email (не будут удалены): ${ADMIN_EMAILS.join(", ")}`);
  } else {
    log("\n⚠  ADMIN_EMAILS не задан — защита по email отключена. Будут удалены ВСЕ пользователи.");
  }

  // ─── 1. Собираем ID тест-пользователей ──────────────────────────────────────

  section("Анализ данных...");

  const nonAdminUsers = await prisma.user.findMany({
    where: ADMIN_EMAILS.length > 0
      ? { email: { notIn: ADMIN_EMAILS } }
      : undefined,
    select: { id: true, username: true, email: true, createdAt: true },
  });

  const userIds = nonAdminUsers.map((u) => u.id);

  if (nonAdminUsers.length === 0) {
    log("\n✅ Нет пользователей для удаления.");
    await prisma.$disconnect();
    return;
  }

  // ─── 2. Собираем ID зависимых сущностей ──────────────────────────────────────

  // Все сделки тест-юзеров (по любой стороне)
  const deals = await prisma.deal.findMany({
    where: { OR: [{ buyerId: { in: userIds } }, { sellerId: { in: userIds } }] },
    select: { id: true },
  });
  const dealIds = deals.map((d) => d.id);

  // Все тикеты тест-юзеров
  const tickets = await prisma.supportTicket.findMany({
    where: { userId: { in: userIds } },
    select: { id: true },
  });
  const ticketIds = tickets.map((t) => t.id);

  // ─── 3. Подсчёт к удалению ───────────────────────────────────────────────────

  const [
    msgCount,
    ticketMsgCount,
    adminDecisionCount,
    reviewCount,
    txCount,
    notifCount,
    favoriteCount,
    depositCount,
    withdrawalCount,
    productCount,
  ] = await Promise.all([
    // Message по dealId — ловим ВСЕ сообщения в тест-сделках (не только от тест-юзеров)
    prisma.message.count({ where: { dealId: { in: dealIds } } }),
    // TicketMessage по ticketId — ловим все ответы в тест-тикетах
    prisma.ticketMessage.count({ where: { ticketId: { in: ticketIds } } }),
    prisma.adminDecision.count({ where: { dealId: { in: dealIds } } }),
    prisma.review.count({ where: { dealId: { in: dealIds } } }),
    prisma.transactionHistory.count({ where: { userId: { in: userIds } } }),
    prisma.notification.count({ where: { userId: { in: userIds } } }),
    prisma.favorite.count({ where: { userId: { in: userIds } } }),
    prisma.depositRequest.count({ where: { userId: { in: userIds } } }),
    prisma.withdrawalRequest.count({ where: { userId: { in: userIds } } }),
    prisma.product.count({ where: { sellerId: { in: userIds } } }),
  ]);

  log(`\nПользователей (не-админов):    ${nonAdminUsers.length}`);
  nonAdminUsers.slice(0, 20).forEach((u) => {
    log(`  · ${u.username.padEnd(24)} ${u.email.padEnd(36)} ${u.createdAt.toISOString().slice(0, 10)}`);
  });
  if (nonAdminUsers.length > 20) log(`  ... и ещё ${nonAdminUsers.length - 20}`);

  log(`\nСвязанные данные:`);
  log(`  Сообщения в сделках:         ${msgCount}`);
  log(`  Сообщения в тикетах:         ${ticketMsgCount}`);
  log(`  Решения администратора:      ${adminDecisionCount}`);
  log(`  Отзывы:                      ${reviewCount}`);
  log(`  Транзакции:                  ${txCount}`);
  log(`  Уведомления:                 ${notifCount}`);
  log(`  Избранное:                   ${favoriteCount}`);
  log(`  Заявки на пополнение:        ${depositCount}`);
  log(`  Заявки на вывод:             ${withdrawalCount}`);
  log(`  Сделки:                      ${dealIds.length}`);
  log(`  Тикеты:                      ${ticketIds.length}`);
  log(`  Товары:                      ${productCount}`);

  const totalRows =
    msgCount + ticketMsgCount + adminDecisionCount + reviewCount +
    txCount + notifCount + favoriteCount + depositCount + withdrawalCount +
    dealIds.length + ticketIds.length + productCount + nonAdminUsers.length;

  log(`\nИТОГО строк к удалению: ${totalRows}`);

  if (!CONFIRM) {
    log(`\n${"─".repeat(60)}`);
    log(`  Режим PREVIEW — данные НЕ удалены.`);
    log(`  Для реального удаления:`);
    log(`  CONFIRM_CLEANUP=true npx tsx scripts/cleanup-test-data.ts`);
    log(`${"─".repeat(60)}\n`);
    await prisma.$disconnect();
    return;
  }

  // ─── 4. Дополнительное интерактивное подтверждение ───────────────────────────

  if (process.stdin.isTTY) {
    const ok = await promptConfirm(
      `\n⚠  Удалить ${totalRows} строк? Это необратимо.`
    );
    if (!ok) {
      log("Отменено.");
      await prisma.$disconnect();
      return;
    }
  }

  // ─── 5. Удаление в правильном порядке по FK-графу ────────────────────────────

  section("Удаление...");

  // Шаг 1 — Message (→ Deal, → User)
  // Фильтруем по dealId чтобы поймать сообщения от любых отправителей в тест-сделках
  const s1 = await prisma.message.deleteMany({
    where: { dealId: { in: dealIds } },
  });
  log(`✓  Message (сообщения сделок):          ${s1.count}`);

  // Шаг 2 — TicketMessage (→ SupportTicket, → User)
  // Фильтруем по ticketId чтобы поймать ответы от любых пользователей (включая админов)
  const s2 = await prisma.ticketMessage.deleteMany({
    where: { ticketId: { in: ticketIds } },
  });
  log(`✓  TicketMessage (сообщения тикетов):   ${s2.count}`);

  // Шаг 3 — AdminDecision (→ Deal)
  const s3 = await prisma.adminDecision.deleteMany({
    where: { dealId: { in: dealIds } },
  });
  log(`✓  AdminDecision (решения по спорам):   ${s3.count}`);

  // Шаг 4 — Review (→ Deal, → User)
  const s4 = await prisma.review.deleteMany({
    where: { dealId: { in: dealIds } },
  });
  log(`✓  Review (отзывы):                     ${s4.count}`);

  // Шаг 5 — TransactionHistory (→ User, → Deal?, → Product?, → DepositRequest?, → WithdrawalRequest?)
  // Удаляем по userId — транзакции не принадлежат другим пользователям
  const s5 = await prisma.transactionHistory.deleteMany({
    where: { userId: { in: userIds } },
  });
  log(`✓  TransactionHistory (транзакции):     ${s5.count}`);

  // Шаг 6 — Notification (→ User)
  const s6 = await prisma.notification.deleteMany({
    where: { userId: { in: userIds } },
  });
  log(`✓  Notification (уведомления):          ${s6.count}`);

  // Шаг 7 — Favorite (→ User, → Product)
  const s7 = await prisma.favorite.deleteMany({
    where: { userId: { in: userIds } },
  });
  log(`✓  Favorite (избранное):                ${s7.count}`);

  // Шаг 8 — DepositRequest (→ User) — TransactionHistory уже удалена
  const s8 = await prisma.depositRequest.deleteMany({
    where: { userId: { in: userIds } },
  });
  log(`✓  DepositRequest (заявки пополнения):  ${s8.count}`);

  // Шаг 9 — WithdrawalRequest (→ User) — TransactionHistory уже удалена
  const s9 = await prisma.withdrawalRequest.deleteMany({
    where: { userId: { in: userIds } },
  });
  log(`✓  WithdrawalRequest (заявки вывода):   ${s9.count}`);

  // Шаг 10 — SupportTicket (→ User) — TicketMessage уже удалена
  const s10 = await prisma.supportTicket.deleteMany({
    where: { userId: { in: userIds } },
  });
  log(`✓  SupportTicket (тикеты):              ${s10.count}`);

  // Шаг 11 — Deal (→ User, → Product) — Message/AdminDecision/Review/Tx уже удалены
  const s11 = await prisma.deal.deleteMany({
    where: { OR: [{ buyerId: { in: userIds } }, { sellerId: { in: userIds } }] },
  });
  log(`✓  Deal (сделки):                       ${s11.count}`);

  // Шаг 12 — Product (→ User) — Deal/Favorite/Tx уже удалены
  const s12 = await prisma.product.deleteMany({
    where: { sellerId: { in: userIds } },
  });
  log(`✓  Product (товары):                    ${s12.count}`);

  // Шаг 13 — User — всё связанное удалено
  const s13 = await prisma.user.deleteMany({
    where: { id: { in: userIds } },
  });
  log(`✓  User (пользователи):                 ${s13.count}`);

  const deleted =
    s1.count + s2.count + s3.count + s4.count + s5.count + s6.count +
    s7.count + s8.count + s9.count + s10.count + s11.count + s12.count + s13.count;

  section(`Готово ✅  Удалено строк: ${deleted}`);
  if (ADMIN_EMAILS.length > 0) {
    log(`Защищены: ${ADMIN_EMAILS.join(", ")}`);
  }
  log("");

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
