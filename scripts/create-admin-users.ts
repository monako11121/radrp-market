/**
 * Скрипт создания стартовых администраторов.
 *
 * Настройте массив ADMIN_SEED_USERS ниже, затем запустите:
 *   npx tsx scripts/create-admin-users.ts
 *
 * Пароли хешируются bcrypt. Существующие пользователи (по email) не дублируются.
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── Настройте администраторов здесь ────────────────────────────────────────
const ADMIN_SEED_USERS: { username: string; email: string; password: string }[] = [
  // { username: "admin", email: "admin@example.com", password: "change_me_123" },
];
// ────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n👤 RADRP Market — создание администраторов");
  console.log("─".repeat(60));

  if (ADMIN_SEED_USERS.length === 0) {
    console.log("\n⚠  Список ADMIN_SEED_USERS пуст.");
    console.log("   Откройте scripts/create-admin-users.ts и добавьте пользователей.");
    await prisma.$disconnect();
    return;
  }

  const ADMIN_EMAILS: string[] = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  let created = 0;
  let skipped = 0;

  for (const seed of ADMIN_SEED_USERS) {
    const emailLower = seed.email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: emailLower } });
    if (existing) {
      console.log(`⏭  Пропущен (уже существует): ${seed.username} <${emailLower}>`);
      skipped++;
      continue;
    }

    // Проверка username на уникальность
    const existingUsername = await prisma.user.findUnique({ where: { username: seed.username } });
    if (existingUsername) {
      console.log(`⚠  Пропущен (username занят): ${seed.username} — задайте другой`);
      skipped++;
      continue;
    }

    if (!seed.password || seed.password.length < 8) {
      console.log(`⚠  Пропущен (пароль < 8 символов): ${seed.username}`);
      skipped++;
      continue;
    }

    const hashed = await bcrypt.hash(seed.password, 12);

    const user = await prisma.user.create({
      data: {
        username: seed.username,
        email:    emailLower,
        password: hashed,
      },
      select: { id: true, username: true, email: true, createdAt: true },
    });

    const isInAdminEmails = ADMIN_EMAILS.includes(emailLower);
    const adminMark = isInAdminEmails ? " ✓ в ADMIN_EMAILS" : " ⚠  добавьте в ADMIN_EMAILS!";

    console.log(`✅ Создан: ${user.username.padEnd(24)} ${user.email.padEnd(36)}${adminMark}`);
    console.log(`   ID: ${user.id}`);
    created++;
  }

  console.log("\n" + "─".repeat(60));
  console.log(`Создано: ${created}  Пропущено: ${skipped}`);

  if (created > 0 && ADMIN_EMAILS.length === 0) {
    console.log("\n⚠  Убедитесь что ADMIN_EMAILS в .env содержит email администраторов.");
    console.log("   Пример: ADMIN_EMAILS=\"admin@example.com,admin2@example.com\"");
  }

  console.log("");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
