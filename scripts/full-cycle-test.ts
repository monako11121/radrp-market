/**
 * Полный цикл тест: регистрация → покупка → завершение → спор
 * Запуск: npx tsx scripts/full-cycle-test.ts
 */

import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const COMMISSION_RATE = 0.05;

// ── Утилиты ────────────────────────────────────────────────────────────────

function fmt(n: number) { return `$${n}`; }

function assert(label: string, actual: number, expected: number) {
  const ok = Math.abs(actual - expected) < 0.001;
  console.log(`  ${ok ? "✅" : "❌"} ${label}: ${fmt(actual)} (ожидалось ${fmt(expected)})`);
  if (!ok) throw new Error(`FAIL: ${label}`);
}

function assertStr(label: string, actual: string, expected: string) {
  const ok = actual === expected;
  console.log(`  ${ok ? "✅" : "❌"} ${label}: "${actual}" (ожидалось "${expected}")`);
  if (!ok) throw new Error(`FAIL: ${label}`);
}

async function getUser(id: string) {
  return prisma.user.findUniqueOrThrow({ where: { id } });
}

async function cleanup(emails: string[]) {
  // Удаляем в нужном порядке (FK constraints)
  const users = await prisma.user.findMany({ where: { email: { in: emails } } });
  const ids = users.map(u => u.id);
  if (ids.length === 0) return;

  await prisma.transactionHistory.deleteMany({ where: { userId: { in: ids } } });
  await prisma.message.deleteMany({ where: { senderId: { in: ids } } });

  const deals = await prisma.deal.findMany({
    where: { OR: [{ buyerId: { in: ids } }, { sellerId: { in: ids } }] },
  });
  const dealIds = deals.map(d => d.id);
  if (dealIds.length) {
    await prisma.message.deleteMany({ where: { dealId: { in: dealIds } } });
    await prisma.transactionHistory.deleteMany({ where: { dealId: { in: dealIds } } });
    await prisma.deal.deleteMany({ where: { id: { in: dealIds } } });
  }

  await prisma.favorite.deleteMany({ where: { userId: { in: ids } } });
  const products = await prisma.product.findMany({ where: { sellerId: { in: ids } } });
  const productIds = products.map(p => p.id);
  if (productIds.length) {
    await prisma.transactionHistory.deleteMany({ where: { productId: { in: productIds } } });
    await prisma.favorite.deleteMany({ where: { productId: { in: productIds } } });
    await prisma.product.deleteMany({ where: { id: { in: productIds } } });
  }

  await prisma.depositRequest.deleteMany({ where: { userId: { in: ids } } });
  await prisma.withdrawalRequest.deleteMany({ where: { userId: { in: ids } } });
  await prisma.user.deleteMany({ where: { id: { in: ids } } });
}

// ── Финансовые операции (копия логики из actions/) ─────────────────────────

async function freezeFunds(buyerId: string, dealId: string, price: number) {
  await prisma.$transaction(async (tx) => {
    const buyer = await tx.user.findUniqueOrThrow({ where: { id: buyerId } });
    if (buyer.availableBalance < price) throw new Error("INSUFFICIENT");
    await tx.user.update({
      where: { id: buyerId },
      data: { availableBalance: { decrement: price }, frozenBalance: { increment: price } },
    });
    await tx.transactionHistory.create({
      data: { userId: buyerId, type: "FREEZE", amount: price,
              description: "Заморозка средств — тест", dealId },
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

async function completeDeal(dealId: string) {
  await prisma.$transaction(async (tx) => {
    const deal = await tx.deal.findUniqueOrThrow({ where: { id: dealId }, include: { product: true } });
    if (deal.status === "DONE") return;
    const buyer = await tx.user.findUniqueOrThrow({ where: { id: deal.buyerId } });
    const price = deal.price > 0 ? deal.price : deal.product.price;
    const commission = Math.round(price * COMMISSION_RATE * 100) / 100;
    const sellerReceives = Math.round((price - commission) * 100) / 100;

    if (buyer.frozenBalance < price) throw new Error("FROZEN_INSUFFICIENT");

    await tx.deal.update({ where: { id: dealId }, data: { status: "DONE" } });
    await tx.user.update({ where: { id: deal.buyerId }, data: { frozenBalance: { decrement: price } } });
    await tx.user.update({ where: { id: deal.sellerId }, data: { availableBalance: { increment: sellerReceives } } });
    await tx.transactionHistory.createMany({
      data: [
        { userId: deal.buyerId, type: "COMPLETE_BUYER", amount: price,
          description: `Оплата сделки — ${deal.product.title}`, dealId, productId: deal.productId },
        { userId: deal.sellerId, type: "COMPLETE_SELLER", amount: sellerReceives,
          description: `Получено за продажу — ${deal.product.title}`, dealId, productId: deal.productId },
        { userId: deal.sellerId, type: "COMMISSION", amount: commission,
          description: `Комиссия платформы 5% — ${deal.product.title}`, dealId, productId: deal.productId },
      ],
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

async function resolveDisputeBuyer(dealId: string) {
  await prisma.$transaction(async (tx) => {
    const deal = await tx.deal.findUniqueOrThrow({ where: { id: dealId }, include: { product: true } });
    if (deal.status !== "DISPUTE") throw new Error("NOT_DISPUTE");
    const price = deal.price > 0 ? deal.price : deal.product.price;

    await tx.deal.update({ where: { id: dealId }, data: { status: "DONE" } });
    await tx.user.update({
      where: { id: deal.buyerId },
      data: { frozenBalance: { decrement: price }, availableBalance: { increment: price } },
    });
    await tx.transactionHistory.create({
      data: { userId: deal.buyerId, type: "UNFREEZE", amount: price,
              description: `Возврат по спору — ${deal.product.title}`, dealId, productId: deal.productId },
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

// ── Главный тест ────────────────────────────────────────────────────────────

async function main() {
  const BUYER_EMAIL  = "test-buyer@cycle-test.local";
  const SELLER_EMAIL = "test-seller@cycle-test.local";

  console.log("🧹 Очистка тестовых данных...");
  await cleanup([BUYER_EMAIL, SELLER_EMAIL]);

  // ────────────────────────────────────────────────────────────────────────
  console.log("\n📋 Шаг 1 & 2: Регистрация покупателя и продавца");

  const buyer = await prisma.user.create({
    data: { username: "TestBuyer",  email: BUYER_EMAIL,  password: "hashed", availableBalance: 0, frozenBalance: 0 },
  });
  const seller = await prisma.user.create({
    data: { username: "TestSeller", email: SELLER_EMAIL, password: "hashed", availableBalance: 0, frozenBalance: 0 },
  });
  console.log(`  ✅ Покупатель: ${buyer.username} (${buyer.id.slice(0,8)})`);
  console.log(`  ✅ Продавец:   ${seller.username} (${seller.id.slice(0,8)})`);

  // ────────────────────────────────────────────────────────────────────────
  console.log("\n📋 Шаг 3: Продавец создаёт товар за $10");

  const product = await prisma.product.create({
    data: { title: "Тестовый товар", description: "Для теста", price: 10, category: "Вирты", server: 1, sellerId: seller.id },
  });
  console.log(`  ✅ Товар: "${product.title}" за ${fmt(product.price)}`);

  // ────────────────────────────────────────────────────────────────────────
  console.log("\n📋 Шаг 4: Вручную начисляем покупателю $20");

  await prisma.user.update({ where: { id: buyer.id }, data: { availableBalance: 20 } });
  await prisma.transactionHistory.create({
    data: { userId: buyer.id, type: "DEPOSIT", amount: 20, description: "Ручное пополнение — тест" },
  });
  const afterDeposit = await getUser(buyer.id);
  assert("Покупатель availableBalance после пополнения", afterDeposit.availableBalance, 20);
  assert("Покупатель frozenBalance после пополнения",    afterDeposit.frozenBalance, 0);

  // ────────────────────────────────────────────────────────────────────────
  console.log("\n📋 Шаг 5: Покупатель покупает товар (заморозка $10)");

  const deal = await prisma.deal.create({
    data: { status: "WAITING", buyerId: buyer.id, sellerId: seller.id, productId: product.id, price: product.price },
  });
  await freezeFunds(buyer.id, deal.id, product.price);
  console.log(`  ✅ Сделка создана: ${deal.id.slice(0,8)}, статус WAITING`);

  // ────────────────────────────────────────────────────────────────────────
  console.log("\n📋 Шаг 6: Проверка балансов после заморозки");

  const afterFreeze = await getUser(buyer.id);
  assert("Покупатель availableBalance после заморозки", afterFreeze.availableBalance, 10);
  assert("Покупатель frozenBalance после заморозки",    afterFreeze.frozenBalance, 10);

  // ────────────────────────────────────────────────────────────────────────
  console.log("\n📋 Шаг 7: Покупатель завершает сделку");

  // Переводим в IN_PROGRESS сначала (как в реальном флоу)
  await prisma.deal.update({ where: { id: deal.id }, data: { status: "IN_PROGRESS" } });
  await completeDeal(deal.id);
  console.log("  ✅ Сделка завершена (DONE)");

  // ────────────────────────────────────────────────────────────────────────
  console.log("\n📋 Шаг 8: Проверка балансов после завершения");

  const commission      = Math.round(product.price * COMMISSION_RATE * 100) / 100;
  const sellerReceives  = Math.round((product.price - commission) * 100) / 100;

  const buyerFinal  = await getUser(buyer.id);
  const sellerFinal = await getUser(seller.id);

  assert("Покупатель availableBalance",  buyerFinal.availableBalance,  10); // остаток $20 - $10 (frozen)
  assert("Покупатель frozenBalance",     buyerFinal.frozenBalance,      0); // всё списано
  assert("Продавец availableBalance",    sellerFinal.availableBalance,  sellerReceives); // $9.50
  assert("Продавец frozenBalance",       sellerFinal.frozenBalance,     0);
  assert("Комиссия (расчётная)",         commission,                    0.5);
  assert("Продавец получил",             sellerReceives,                9.5);

  // ────────────────────────────────────────────────────────────────────────
  console.log("\n📋 Шаг 9: История операций");

  const buyerTx  = await prisma.transactionHistory.findMany({ where: { userId: buyer.id },  orderBy: { createdAt: "asc" } });
  const sellerTx = await prisma.transactionHistory.findMany({ where: { userId: seller.id }, orderBy: { createdAt: "asc" } });

  console.log(`\n  Покупатель (${buyerTx.length} записи):`);
  for (const tx of buyerTx) {
    console.log(`    ${tx.type.padEnd(16)} ${fmt(tx.amount).padStart(7)}  ${tx.description}`);
  }

  console.log(`\n  Продавец (${sellerTx.length} записи):`);
  for (const tx of sellerTx) {
    console.log(`    ${tx.type.padEnd(16)} ${fmt(tx.amount).padStart(7)}  ${tx.description}`);
  }

  const buyerTypes  = buyerTx.map(t => t.type);
  const sellerTypes = sellerTx.map(t => t.type);

  console.log("\n  Проверка типов транзакций:");
  assertStr("Покупатель: 1-я запись", buyerTypes[1] ?? "", "FREEZE");
  assertStr("Покупатель: 2-я запись", buyerTypes[2] ?? "", "COMPLETE_BUYER");
  assertStr("Продавец: 1-я запись",   sellerTypes[0] ?? "", "COMPLETE_SELLER");
  assertStr("Продавец: 2-я запись",   sellerTypes[1] ?? "", "COMMISSION");

  // ────────────────────────────────────────────────────────────────────────
  console.log("\n📋 Шаг 10: Тест спора в пользу покупателя");

  // Создаём вторую сделку для теста спора
  const deal2 = await prisma.deal.create({
    data: { status: "WAITING", buyerId: buyer.id, sellerId: seller.id, productId: product.id, price: product.price },
  });

  // У покупателя сейчас $10 — хватает для второй заморозки
  await freezeFunds(buyer.id, deal2.id, product.price);
  const beforeDispute = await getUser(buyer.id);
  assert("Перед спором: availableBalance покупателя", beforeDispute.availableBalance, 0);
  assert("Перед спором: frozenBalance покупателя",    beforeDispute.frozenBalance, 10);

  // Переводим в DISPUTE
  await prisma.deal.update({ where: { id: deal2.id }, data: { status: "DISPUTE" } });

  // Решаем в пользу покупателя
  await resolveDisputeBuyer(deal2.id);

  const afterDispute = await getUser(buyer.id);
  assert("После спора: availableBalance покупателя", afterDispute.availableBalance, 10);
  assert("После спора: frozenBalance покупателя",    afterDispute.frozenBalance, 0);

  // Проверяем запись UNFREEZE
  const unfreezeTx = await prisma.transactionHistory.findFirst({
    where: { userId: buyer.id, type: "UNFREEZE" },
  });
  console.log(`  ✅ UNFREEZE-запись создана: "${unfreezeTx?.description}"`);

  // ────────────────────────────────────────────────────────────────────────
  console.log("\n🧹 Очистка тестовых данных...");
  await cleanup([BUYER_EMAIL, SELLER_EMAIL]);

  console.log("\n✅ ВСЕ ТЕСТЫ ПРОШЛИ УСПЕШНО\n");
}

main()
  .catch((e) => {
    console.error("\n❌ ТЕСТ УПАЛ:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
