import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin, isOwner } from "@/lib/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id:                       true,
      role:                     true,
      availableBalance:         true,
      frozenBalance:            true,
      pendingWithdrawalBalance: true,
    },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, read: false },
  });

  return NextResponse.json({
    balance:                  user.availableBalance,
    availableBalance:         user.availableBalance,
    frozenBalance:            user.frozenBalance,
    pendingWithdrawalBalance: user.pendingWithdrawalBalance,
    role:                     user.role,
    isAdmin:                  isAdmin(user.role),
    isOwner:                  isOwner(user.role),
    unreadCount,
  });
}
