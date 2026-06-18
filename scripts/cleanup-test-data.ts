/**
 * Скрипт очистки тестовых данных перед реальным запуском.
 *
 * Запуск:
 *   npx tsx scripts/cleanup-test-data.ts          — режим preview (ничего не удаляет)
 *   CONFIRM_CLEANUP=true npx tsx scripts/cleanup-test-data.ts  — реальное удаление
 */

import { PrismaClient } from "@prisma/client";
import * as readline from "readline";

const prisma = new PrismaClient();

const CONFIRM = process.env.CONFIRM_CLEANUP === "true";

// Читаем ADMIN_EMAILS из окружения (те же что и на сайте)
const ADMIN_EMAILS: string[] = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function log(msg: string) {
  console.log(msg);
}

function section(title: string) {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`  ${title}`);
  console.log("─".repeat(60));
}

async function confirm(question: string): Promise<boolean> {
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
    console.log(`\nЗащищённые email (не будут удалены): ${ADMIN_EMAILS.join(", ")}`);
  } else {
    console.log("\n⚠  ADMIN_EMAILS не задан в .env — будут защищены только явно заданные администраторы.");
  }

  // ─── Подсчёт ────────────────────────────────────────────────────────────────

  section("Подсчёт данных к удалению");

  // Пользователи не-админы
  const nonAdminUsers = await prisma.user.findMany({
    where: {
      email: ADMIN_EMAILS.length > 0 ? { notIn: ADMIN_EMAILS } : undefined,
    },
    select: { id: true, username: true, email: true, createdAt: true },
  });

  const userIds = nonAdminUsers.map((u) => u.id);

  const [
    messageCount,
    dealCount,
    productCount,
    notificationCount,
    txCount,
    depositCount,
    withdrawalCount,
    reviewCount,
    ticketCount,
    adminDecisionCount,
  ] = await Promise.all([
    prisma.message.count({ where: { senderId: { in: userIds } } }),
    prisma.deal.count({ where: { OR: [{ buyerId: { in: userIds } }, { sellerId: { in: userIds } }] } }),
    prisma.product.count({ where: { sellerId: { in: userIds } } }),
    prisma.notification.count({ where: { userId: { in: userIds } } }),
    prisma.transactionHistory.count({ where: { userId: { in: userIds } } }),
    prisma.depositRequest.count({ where: { userId: { in: userIds } } }),
    prisma.withdrawalRequest.count({ where: { userId: { in: userIds } } }),
    prisma.review.count({ where: { OR: [{ buyerId: { in: userIds } }, { sellerId: { in: userIds } }] } }),
    prisma.supportTicket.count({ where: { userId: { in: userIds } } }),
    prisma.adminDecision.count({
      where: {
        deal: {
          OR: [{ buyerId: { in: userIds } }, { sellerId: { in: userIds } }],
        },
      },
    }),
  ]);

  log(`\nПользователей (не-админов):    ${nonAdminUsers.length}`);
  if (nonAdminUsers.length > 0) {
    nonAdminUsers.slice(0, 20).forEach((u) => {
      log(`  · ${u.username.padEnd(24)} ${u.email.padEnd(36)} ${u.createdAt.toISOString().slice(0, 10)}`);
    });
    if (nonAdminUsers.length > 20) log(`  ... и ещё ${nonAdminUsers.length - 20}`);
  }

  log(`\nСвязанные данные:`);
  log(`  Сообщения:               ${messageCount}`);
  log(`  Сделки:                  ${dealCount}`);
  log(`  Решения по спорам:       ${adminDecisionCount}`);
  log(`  Товары:                  ${productCount}`);
  log(`  Уведомления:             ${notificationCount}`);
  log(`  Транзакции:              ${txCount}`);
  log(`  Заявки на пополнение:    ${depositCount}`);
  log(`  Заявки на вывод:         ${withdrawalCount}`);
  log(`  Отзывы:                  ${reviewCount}`);
  log(`  Тикеты поддержки:        ${ticketCount}`);

  const totalRows =
    messageCount + dealCount + adminDecisionCount + productCount +
    notificationCount + txCount + depositCount + withdrawalCount +
    reviewCount + ticketCount + nonAdminUsers.length;

  log(`\nИТОГО строк к удалению: ${totalRows}`);

  if (totalRows === 0) {
    log("\n✅ База данных уже пуста. Нечего удалять.");
    await prisma.$disconnect();
    return;
  }

  // ─── Подтверждение ───────────────────────────────────────────────────────────

  if (!CONFIRM) {
    log(`\n──────────────────────────────────────────────────────────`);
    log(`  Режим PREVIEW — данные НЕ удалены.`);
    log(`  Для реального удаления запустите:`);
    log(`  CONFIRM_CLEANUP=true npx tsx scripts/cleanup-test-data.ts`);
    log(`──────────────────────────────────────────────────────────\n`);
    await prisma.$disconnect();
    return;
  }

  // Дополнительное подтверждение в интерактивном режиме
  if (process.stdin.isTTY) {
    const ok = await confirm(
      `\n⚠  Вы уверены? Будет удалено ${totalRows} строк. Это действие необратимо.`
    );
    if (!ok) {
      log("Отменено.");
      await prisma.$disconnect();
      return;
    }
  }

  // ─── Удаление (порядок важен: сначала зависимые таблицы) ─────────────────────

  section("Удаление данных...");

  // 1. Сообщения чатов
  const d1 = await prisma.message.deleteMany({ where: { senderId: { in: userIds } } });
  log(`✓ Сообщения:            ${d1.count}`);

  // 2. Сообщения тикетов
  const d2 = await prisma.ticketMessage.deleteMany({ where: { userId: { in: userIds } } });
  log(`✓ Сообщения тикетов:    ${d2.count}`);

  // 3. Тикеты
  const d3 = await prisma.supportTicket.deleteMany({ where: { userId: { in: userIds } } });
  log(`✓ Тикеты:               ${d3.count}`);

  // 4. Решения администратора по спорам (ссылаются на сделки)
  const dealIds = (
    await prisma.deal.findMany({
      where: { OR: [{ buyerId: { in: userIds } }, { sellerId: { in: userIds } }] },
      select: { id: true },
    })
  ).map((d) => d.id);

  const d4 = await prisma.adminDecision.deleteMany({ where: { dealId: { in: dealIds } } });
  log(`✓ Решения по спорам:    ${d4.count}`);

  // 5. Отзывы
  const d5 = await prisma.review.deleteMany({
    where: { OR: [{ buyerId: { in: userIds } }, { sellerId: { in: userIds } }] },
  });
  log(`✓ Отзывы:               ${d5.count}`);

  // 6. История транзакций
  const d6 = await prisma.transactionHistory.deleteMany({ where: { userId: { in: userIds } } });
  log(`✓ Транзакции:           ${d6.count}`);

  // 7. Заявки на пополнение
  const d7 = await prisma.depositRequest.deleteMany({ where: { userId: { in: userIds } } });
  log(`✓ Заявки пополнения:    ${d7.count}`);

  // 8. Заявки на вывод
  const d8 = await prisma.withdrawalRequest.deleteMany({ where: { userId: { in: userIds } } });
  log(`✓ Заявки на вывод:      ${d8.count}`);

  // 9. Уведомления
  const d9 = await prisma.notification.deleteMany({ where: { userId: { in: userIds } } });
  log(`✓ Уведомления:          ${d9.count}`);

  // 10. Сделки
  const d10 = await prisma.deal.deleteMany({
    where: { OR: [{ buyerId: { in: userIds } }, { sellerId: { in: userIds } }] },
  });
  log(`✓ Сделки:               ${d10.count}`);

  // 11. Избранное
  const d11 = await prisma.favorite.deleteMany({ where: { userId: { in: userIds } } });
  log(`✓ Избранное:            ${d11.count}`);

  // 12. Товары
  const d12 = await prisma.product.deleteMany({ where: { sellerId: { in: userIds } } });
  log(`✓ Товары:               ${d12.count}`);

  // 13. Пользователи
  const d13 = await prisma.user.deleteMany({
    where: {
      id: { in: userIds },
    },
  });
  log(`✓ Пользователи:         ${d13.count}`);

  section("Готово ✅");
  log(`Всего удалено строк: ${
    d1.count + d2.count + d3.count + d4.count + d5.count + d6.count +
    d7.count + d8.count + d9.count + d10.count + d11.count + d12.count + d13.count
  }`);
  if (ADMIN_EMAILS.length > 0) {
    log(`Защищены администраторы: ${ADMIN_EMAILS.join(", ")}`);
  }
  log("");

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
