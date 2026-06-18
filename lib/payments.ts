/**
 * Сервисный слой платёжной системы.
 *
 * Сейчас реализован только ManualProvider (ручное зачисление администратором).
 * Для подключения реального провайдера:
 *   1. Создай класс, реализующий IPaymentProvider (например YookassaProvider).
 *   2. Зарегистрируй его в getProvider() ниже.
 *   3. Добавь вебхук-обработчик в app/api/payments/webhook/[provider]/route.ts.
 */

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  IPaymentProvider,
  DepositRequestData,
  DepositRequestResult,
  WithdrawalRequestData,
  WithdrawalRequestResult,
  ProviderWebhookEvent,
  PLATFORM_COMMISSION_RATE,
} from "@/types/payments";

// ─── ManualProvider ──────────────────────────────────────────────────────────
// Заглушка для ручных операций администратора.
// Deposit сразу помечается COMPLETED, вебхуки не используются.

class ManualProvider implements IPaymentProvider {
  async initiateDeposit(_data: DepositRequestData) {
    return {};
  }
  async initiatePayout(_data: WithdrawalRequestData) {
    // ничего не делаем — администратор переводит вручную
  }
  async verifyWebhook(_rawBody: string, _signature: string): Promise<ProviderWebhookEvent> {
    throw new Error("ManualProvider не поддерживает webhook");
  }
}

// ─── Реестр провайдеров ──────────────────────────────────────────────────────

function getProvider(name: string): IPaymentProvider {
  switch (name) {
    case "manual":
      return new ManualProvider();
    // case "yookassa":
    //   return new YookassaProvider(process.env.YOOKASSA_SHOP_ID!, process.env.YOOKASSA_SECRET_KEY!);
    // case "tinkoff":
    //   return new TinkoffProvider(...);
    default:
      throw new Error(`Провайдер "${name}" не реализован`);
  }
}

// ─── Публичное API сервиса ───────────────────────────────────────────────────

/**
 * Создать заявку на пополнение.
 * Для manual — сразу завершает и зачисляет средства.
 * Для провайдеров с редиректом — возвращает redirectUrl.
 */
export async function createDeposit(
  data: DepositRequestData
): Promise<DepositRequestResult> {
  const provider = getProvider(data.provider);

  // Создаём запись заявки
  const request = await prisma.depositRequest.create({
    data: {
      userId:    data.userId,
      amount:    data.amount,
      feeAmount: data.feeAmount,
      netAmount: data.netAmount,
      status:    "PENDING",
      provider:  data.provider,
      method:    data.method,
    },
  });

  // Инициируем у провайдера (для manual — пустой вызов)
  const { redirectUrl } = await provider.initiateDeposit(data);

  if (redirectUrl) {
    await prisma.depositRequest.update({
      where: { id: request.id },
      data:  { redirectUrl },
    });
    return { depositRequestId: request.id, redirectUrl };
  }

  // ManualProvider: сразу завершаем
  if (data.provider === "manual") {
    await completeDeposit(request.id);
  }

  return { depositRequestId: request.id };
}

/**
 * Завершить пополнение — зачислить netAmount на availableBalance пользователя.
 * Вызывается: вручную администратором или из webhook-обработчика.
 */
export async function completeDeposit(depositRequestId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const req = await tx.depositRequest.findUnique({
      where: { id: depositRequestId },
    });

    if (!req) throw new Error("DepositRequest не найден");
    if (req.status === "COMPLETED") return; // идемпотентность

    await tx.depositRequest.update({
      where: { id: depositRequestId },
      data:  { status: "COMPLETED", completedAt: new Date() },
    });

    await tx.user.update({
      where: { id: req.userId },
      data:  { availableBalance: { increment: req.netAmount } },
    });

    await tx.transactionHistory.create({
      data: {
        userId:           req.userId,
        type:             "DEPOSIT",
        amount:           req.netAmount,
        description:      `Пополнение баланса через ${req.provider} (${req.method})`,
        depositRequestId: req.id,
      },
    });
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    timeout: 5000,
  });
}

/**
 * Отменить / отклонить заявку на пополнение.
 */
export async function failDeposit(
  depositRequestId: string,
  reason: string
): Promise<void> {
  await prisma.depositRequest.update({
    where: { id: depositRequestId },
    data:  { status: "FAILED", failReason: reason },
  });
}

/**
 * Создать заявку на вывод средств.
 * Замораживает сумму (availableBalance → frozenBalance) до одобрения.
 */
export async function createWithdrawal(
  data: WithdrawalRequestData
): Promise<WithdrawalRequestResult> {
  let requestId = "";

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: data.userId } });
    if (!user) throw new Error("Пользователь не найден");

    if (user.availableBalance < data.amount) {
      throw new Error(
        `Недостаточно средств: доступно $${user.availableBalance}, запрошено $${data.amount}`
      );
    }

    const req = await tx.withdrawalRequest.create({
      data: {
        userId:     data.userId,
        amount:     data.amount,
        feeAmount:  data.feeAmount,
        netAmount:  data.netAmount,
        status:     "PENDING",
        provider:   data.provider,
        method:     data.method,
        requisites: data.requisites,
      },
    });

    requestId = req.id;

    // Резервируем сумму: availableBalance → pendingWithdrawalBalance
    await tx.user.update({
      where: { id: data.userId },
      data:  {
        availableBalance:         { decrement: data.amount },
        pendingWithdrawalBalance: { increment: data.amount },
      },
    });

    await tx.transactionHistory.create({
      data: {
        userId:              data.userId,
        type:                "WITHDRAWAL_PENDING",
        amount:              data.amount,
        description:         `Заявка на вывод создана (${data.method})`,
        withdrawalRequestId: req.id,
      },
    });
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    timeout: 5000,
  });

  return { withdrawalRequestId: requestId };
}

/**
 * Завершить вывод — снять из frozenBalance (средства ушли пользователю).
 * Вызывается администратором или из webhook-обработчика провайдера.
 */
export async function completeWithdrawal(withdrawalRequestId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const req = await tx.withdrawalRequest.findUnique({
      where: { id: withdrawalRequestId },
    });

    if (!req) throw new Error("WithdrawalRequest не найден");
    if (req.status === "COMPLETED") return; // идемпотентность

    await tx.withdrawalRequest.update({
      where: { id: withdrawalRequestId },
      data:  { status: "COMPLETED", completedAt: new Date() },
    });

    // Средства выплачены: списываем из pendingWithdrawalBalance
    await tx.user.update({
      where: { id: req.userId },
      data:  { pendingWithdrawalBalance: { decrement: req.amount } },
    });

    await tx.transactionHistory.create({
      data: {
        userId:              req.userId,
        type:                "WITHDRAWAL",
        amount:              req.netAmount,
        description:         `Вывод средств через ${req.provider} (${req.method})`,
        withdrawalRequestId: req.id,
      },
    });

    // Если была комиссия за вывод — отдельная запись
    if (req.feeAmount > 0) {
      await tx.transactionHistory.create({
        data: {
          userId:              req.userId,
          type:                "COMMISSION",
          amount:              req.feeAmount,
          description:         `Комиссия за вывод (${req.method})`,
          withdrawalRequestId: req.id,
        },
      });
    }
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    timeout: 5000,
  });
}

/**
 * Одобрить заявку на вывод (без финансового движения).
 * Финансы фиксируются при вызове completeWithdrawal.
 */
export async function approveWithdrawal(withdrawalRequestId: string): Promise<void> {
  const req = await prisma.withdrawalRequest.findUnique({
    where: { id: withdrawalRequestId },
  });
  if (!req || req.status !== "PENDING") return;

  await prisma.withdrawalRequest.update({
    where: { id: withdrawalRequestId },
    data:  { status: "APPROVED" },
  });
}

/**
 * Отклонить вывод — вернуть средства на availableBalance.
 */
export async function failWithdrawal(
  withdrawalRequestId: string,
  reason: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const req = await tx.withdrawalRequest.findUnique({
      where: { id: withdrawalRequestId },
    });

    if (!req || req.status !== "PENDING") return;

    await tx.withdrawalRequest.update({
      where: { id: withdrawalRequestId },
      data:  { status: "FAILED", failReason: reason },
    });

    // Возвращаем средства: pendingWithdrawalBalance → availableBalance
    await tx.user.update({
      where: { id: req.userId },
      data:  {
        pendingWithdrawalBalance: { decrement: req.amount },
        availableBalance:         { increment: req.amount },
      },
    });

    await tx.transactionHistory.create({
      data: {
        userId:              req.userId,
        type:                "UNFREEZE",
        amount:              req.amount,
        description:         `Возврат: вывод отклонён (${reason})`,
        withdrawalRequestId: req.id,
      },
    });
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    timeout: 5000,
  });
}

/**
 * Обработчик webhook от провайдера.
 * Верифицирует подпись и завершает/отклоняет заявку.
 */
export async function handleProviderWebhook(
  providerName: string,
  rawBody: string,
  signature: string
): Promise<void> {
  const provider = getProvider(providerName);
  const event = await provider.verifyWebhook(rawBody, signature);

  if (event.status === "COMPLETED") {
    // Ищем заявку по providerPaymentId
    const req = await prisma.depositRequest.findFirst({
      where: { providerPaymentId: event.providerPaymentId },
    });
    if (req && req.status === "PENDING") {
      await completeDeposit(req.id);
    }
  } else if (event.status === "FAILED" || event.status === "CANCELLED") {
    const req = await prisma.depositRequest.findFirst({
      where: { providerPaymentId: event.providerPaymentId },
    });
    if (req) {
      await failDeposit(req.id, `Провайдер: ${event.status}`);
    }
  }
}

// Реэкспортируем константу чтобы экшены импортировали из одного места
export { PLATFORM_COMMISSION_RATE };
