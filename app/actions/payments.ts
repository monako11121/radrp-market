"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/admin";
import {
  createDeposit,
  completeDeposit,
  failDeposit,
  createWithdrawal,
  approveWithdrawal,
  completeWithdrawal,
  failWithdrawal,
} from "@/lib/payments";
import {
  MIN_DEPOSIT_AMOUNT,
  MIN_WITHDRAWAL_AMOUNT,
  WITHDRAWAL_FEE_RATE,
} from "@/types/payments";
import { createNotification } from "@/lib/notifications";

export type PaymentActionState = {
  error?: string;
  success?: string;
  redirectUrl?: string;
} | null;

// ─── Пополнение баланса (ручное / будущий провайдер) ─────────────────────────

export async function requestDeposit(
  _prev: PaymentActionState,
  formData: FormData
): Promise<PaymentActionState> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) redirect("/auth");

  const amountRaw = parseFloat(formData.get("amount") as string);
  if (isNaN(amountRaw) || amountRaw < MIN_DEPOSIT_AMOUNT) {
    return { error: `Минимальная сумма пополнения: $${MIN_DEPOSIT_AMOUNT}` };
  }

  const provider = (formData.get("provider") as string) || "manual";
  const method   = (formData.get("method")   as string) || "manual";

  // Пока комиссия провайдера = 0 (нет реального провайдера)
  const feeAmount = 0;
  const netAmount = amountRaw - feeAmount;

  try {
    const result = await createDeposit({
      userId:    user.id,
      amount:    amountRaw,
      feeAmount,
      netAmount,
      provider:  provider as never,
      method:    method   as never,
    });

    revalidatePath("/transactions");
    revalidatePath("/profile");

    if (result.redirectUrl) {
      return { success: "Перенаправляем на оплату...", redirectUrl: result.redirectUrl };
    }

    return { success: `Баланс пополнен на $${netAmount}` };
  } catch {
    return { error: "Ошибка при создании заявки. Попробуйте позже." };
  }
}

// ─── Вывод средств (ручной запрос) ──────────────────────────────────────────

export async function requestWithdrawal(
  _prev: PaymentActionState,
  formData: FormData
): Promise<PaymentActionState> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) redirect("/auth");

  const amountRaw = parseFloat(formData.get("amount") as string);
  if (isNaN(amountRaw) || amountRaw < MIN_WITHDRAWAL_AMOUNT) {
    return { error: `Минимальная сумма вывода: $${MIN_WITHDRAWAL_AMOUNT}` };
  }

  if (user.availableBalance < amountRaw) {
    return {
      error: `Недостаточно средств: доступно $${user.availableBalance}`,
    };
  }

  const method     = (formData.get("method")     as string) || "card";
  const requisites = (formData.get("requisites") as string) || undefined;

  // Комиссия за вывод: пока 0%, ставка определена в types/payments.ts
  const feeAmount = Math.round(amountRaw * WITHDRAWAL_FEE_RATE * 100) / 100;
  const netAmount = Math.round((amountRaw - feeAmount) * 100) / 100;

  try {
    await createWithdrawal({
      userId:     user.id,
      amount:     amountRaw,
      feeAmount,
      netAmount,
      provider:   "manual",
      method:     method as never,
      requisites,
    });

    revalidatePath("/transactions");
    revalidatePath("/profile");

    await createNotification({
      userId:  user.id,
      type:    "WITHDRAWAL_CREATED",
      title:   "Заявка на вывод создана",
      message: `Заявка на вывод $${netAmount} принята и ожидает обработки`,
      href:    "/transactions",
    }).catch(()=>{});

    return {
      success: `Заявка на вывод $${netAmount} принята. Обрабатывается вручную.`,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    return { error: msg || "Ошибка при создании заявки." };
  }
}

// ─── Админские экшены ────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.role)) redirect("/");
}

// Подтвердить пополнение вручную (администратор)
export async function adminCompleteDeposit(
  _prev: PaymentActionState,
  formData: FormData
): Promise<PaymentActionState> {
  await requireAdmin();
  const depositRequestId = formData.get("depositRequestId") as string;

  try {
    await completeDeposit(depositRequestId);
    revalidatePath("/admin/deposits");
    revalidatePath("/transactions");
    return { success: "Пополнение подтверждено" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    return { error: msg || "Ошибка при подтверждении" };
  }
}

// Отклонить пополнение (администратор)
export async function adminFailDeposit(
  _prev: PaymentActionState,
  formData: FormData
): Promise<PaymentActionState> {
  await requireAdmin();
  const depositRequestId = formData.get("depositRequestId") as string;
  const reason = (formData.get("reason") as string) || "Отклонено администратором";

  try {
    await failDeposit(depositRequestId, reason);
    revalidatePath("/admin/deposits");
    return { success: "Заявка отклонена" };
  } catch {
    return { error: "Ошибка при отклонении заявки" };
  }
}

// Одобрить заявку на вывод (без финансового движения)
export async function adminApproveWithdrawal(
  _prev: PaymentActionState,
  formData: FormData
): Promise<PaymentActionState> {
  await requireAdmin();
  const withdrawalRequestId = formData.get("withdrawalRequestId") as string;
  try {
    await approveWithdrawal(withdrawalRequestId);
    revalidatePath("/admin/withdrawals");

    const wr = await prisma.withdrawalRequest.findUnique({ where: { id: withdrawalRequestId } });
    if (wr) {
      await createNotification({
        userId:  wr.userId,
        type:    "WITHDRAWAL_APPROVED",
        title:   "Заявка на вывод одобрена",
        message: "Ваша заявка одобрена — ожидайте выплату",
        href:    "/transactions",
      }).catch(()=>{});
    }

    return { success: "Заявка одобрена" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    return { error: msg || "Ошибка при одобрении" };
  }
}

// Отметить вывод как выплаченный (деньги ушли)
export async function adminCompleteWithdrawal(
  _prev: PaymentActionState,
  formData: FormData
): Promise<PaymentActionState> {
  await requireAdmin();
  const withdrawalRequestId = formData.get("withdrawalRequestId") as string;

  try {
    const wr = await prisma.withdrawalRequest.findUnique({ where: { id: withdrawalRequestId } });
    await completeWithdrawal(withdrawalRequestId);
    revalidatePath("/admin/withdrawals");
    revalidatePath("/transactions");

    if (wr) {
      await createNotification({
        userId:  wr.userId,
        type:    "WITHDRAWAL_APPROVED",
        title:   "Вывод выплачен",
        message: `$${wr.netAmount} отправлены по вашим реквизитам`,
        href:    "/transactions",
      }).catch(()=>{});
    }

    return { success: "Вывод подтверждён" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    return { error: msg || "Ошибка при подтверждении" };
  }
}

// Отклонить вывод — вернуть деньги пользователю (администратор)
export async function adminFailWithdrawal(
  _prev: PaymentActionState,
  formData: FormData
): Promise<PaymentActionState> {
  await requireAdmin();
  const withdrawalRequestId = formData.get("withdrawalRequestId") as string;
  const reason = (formData.get("reason") as string) || "Отклонено администратором";

  try {
    const wr = await prisma.withdrawalRequest.findUnique({ where: { id: withdrawalRequestId } });
    await failWithdrawal(withdrawalRequestId, reason);
    revalidatePath("/admin/withdrawals");
    revalidatePath("/transactions");

    if (wr) {
      await createNotification({
        userId:  wr.userId,
        type:    "WITHDRAWAL_REJECTED",
        title:   "Заявка на вывод отклонена",
        message: "Средства возвращены на ваш баланс",
        href:    "/transactions",
      }).catch(()=>{});
    }

    return { success: "Вывод отклонён, средства возвращены" };
  } catch {
    return { error: "Ошибка при отклонении вывода" };
  }
}

// ─── Крипто-пополнение (USDT TRC20, ручное подтверждение) ────────────────────

export type CryptoDepositState = {
  error?: string;
  depositId?: string;
  amount?: number;
  walletAddress?: string;
} | null;

// Создать заявку на крипто-пополнение — баланс НЕ трогаем
export async function requestCryptoDeposit(
  _prev: CryptoDepositState,
  formData: FormData,
): Promise<CryptoDepositState> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/auth");

  const amountRaw = parseFloat(formData.get("amount") as string);
  if (isNaN(amountRaw) || amountRaw <= 0) {
    return { error: "Введите корректную сумму" };
  }
  if (amountRaw < 1) {
    return { error: "Минимальная сумма пополнения: $1" };
  }
  if (amountRaw > 100000) {
    return { error: "Максимальная сумма за один перевод: $100 000" };
  }

  const deposit = await prisma.depositRequest.create({
    data: {
      userId:    user.id,
      amount:    amountRaw,
      feeAmount: 0,
      netAmount: amountRaw,
      status:    "PENDING",
      provider:  "crypto_manual",
      method:    "usdt_trc20",
    },
  });

  const walletAddress = process.env.CRYPTO_USDT_TRC20_ADDRESS ?? "";
  return { depositId: deposit.id, amount: amountRaw, walletAddress };
}

// Подтвердить крипто-пополнение (администратор) — зачислить баланс
export async function adminApproveCryptoDeposit(
  _prev: PaymentActionState,
  formData: FormData,
): Promise<PaymentActionState> {
  await requireAdmin();

  const depositId = formData.get("depositId") as string;
  const txHash    = (formData.get("txHash") as string)?.trim() || null;
  const adminNote = (formData.get("adminNote") as string)?.trim() || null;

  const deposit = await prisma.depositRequest.findUnique({ where: { id: depositId } });
  if (!deposit) return { error: "Заявка не найдена" };
  if (deposit.status !== "PENDING") return { error: "Заявка уже обработана" };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.depositRequest.update({
        where: { id: depositId },
        data: {
          status:      "APPROVED",
          completedAt: new Date(),
          txHash:      txHash  ?? undefined,
          adminNote:   adminNote ?? undefined,
        },
      });

      await tx.user.update({
        where: { id: deposit.userId },
        data:  { availableBalance: { increment: deposit.netAmount } },
      });

      await tx.transactionHistory.create({
        data: {
          userId:           deposit.userId,
          type:             "DEPOSIT",
          amount:           deposit.netAmount,
          description:      `Пополнение USDT TRC20 — подтверждено администратором`,
          depositRequestId: deposit.id,
        },
      });
    }, { isolationLevel: "Serializable", timeout: 5000 });

    await createNotification({
      userId:  deposit.userId,
      type:    "WITHDRAWAL_APPROVED",
      title:   "Пополнение подтверждено",
      message: `$${deposit.netAmount} зачислены на ваш баланс`,
      href:    "/transactions",
    }).catch(() => {});

    revalidatePath("/admin/deposits");
    revalidatePath("/transactions");
    revalidatePath("/profile");

    return { success: `Пополнение $${deposit.netAmount} подтверждено и зачислено` };
  } catch {
    return { error: "Ошибка при подтверждении. Попробуйте ещё раз." };
  }
}

// Отклонить крипто-пополнение (администратор) — баланс не трогаем
export async function adminRejectCryptoDeposit(
  _prev: PaymentActionState,
  formData: FormData,
): Promise<PaymentActionState> {
  await requireAdmin();

  const depositId = formData.get("depositId") as string;
  const adminNote = (formData.get("adminNote") as string)?.trim() || "Отклонено администратором";

  const deposit = await prisma.depositRequest.findUnique({ where: { id: depositId } });
  if (!deposit) return { error: "Заявка не найдена" };
  if (deposit.status !== "PENDING") return { error: "Заявка уже обработана" };

  await prisma.depositRequest.update({
    where: { id: depositId },
    data:  { status: "REJECTED", adminNote, updatedAt: new Date() },
  });

  await createNotification({
    userId:  deposit.userId,
    type:    "WITHDRAWAL_REJECTED",
    title:   "Пополнение отклонено",
    message: adminNote,
    href:    "/deposit",
  }).catch(() => {});

  revalidatePath("/admin/deposits");

  return { success: "Заявка отклонена" };
}
