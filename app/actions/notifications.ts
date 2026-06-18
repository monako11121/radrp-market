"use server";

import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { prisma }           from "@/lib/prisma";
import { redirect }         from "next/navigation";
import { revalidatePath }   from "next/cache";

export async function markAllNotificationsRead() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/auth");

  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data:  { read: true },
  });

  revalidatePath("/notifications");
}

export async function markNotificationRead(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return;

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return;

  await prisma.notification.updateMany({
    where: { id, userId: user.id },
    data:  { read: true },
  });

  revalidatePath("/notifications");
}
