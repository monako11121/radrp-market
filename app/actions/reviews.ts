"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications";

export type ReviewActionState = {
  error?: string;
  success?: boolean;
} | null;

export async function createReview(
  _prevState: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: "Необходимо войти в аккаунт" };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return { error: "Пользователь не найден" };
  }

  const dealId  = formData.get("dealId")  as string;
  const ratingRaw = formData.get("rating") as string;
  const comment = (formData.get("comment") as string)?.trim() || null;

  const rating = parseInt(ratingRaw, 10);
  if (!rating || rating < 1 || rating > 5) {
    return { error: "Оценка должна быть от 1 до 5" };
  }

  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
  });

  if (!deal) {
    return { error: "Сделка не найдена" };
  }

  if (deal.status !== "DONE") {
    return { error: "Отзыв можно оставить только после завершения сделки" };
  }

  if (deal.buyerId !== user.id) {
    return { error: "Только покупатель может оставить отзыв" };
  }

  const existing = await prisma.review.findUnique({
    where: { dealId },
  });
  if (existing) {
    return { error: "Вы уже оставили отзыв по этой сделке" };
  }

  await prisma.review.create({
    data: {
      dealId,
      buyerId:  user.id,
      sellerId: deal.sellerId,
      rating,
      comment,
    },
  });

  await createNotification({
    userId:  deal.sellerId,
    type:    "REVIEW_RECEIVED",
    title:   "Новый отзыв",
    message: `${user.username} оставил отзыв ★${rating}`,
    href:    `/seller/${deal.sellerId}/reviews`,
  }).catch(()=>{});

  revalidatePath("/deals");
  revalidatePath("/profile");
  revalidatePath(`/seller/${deal.sellerId}`);
  revalidatePath(`/seller/${deal.sellerId}/reviews`);

  return { success: true };
}
