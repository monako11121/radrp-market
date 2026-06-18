"use server";

import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { prisma }           from "@/lib/prisma";
import { redirect }         from "next/navigation";
import { revalidatePath }   from "next/cache";
import { isOwner }          from "@/lib/admin";

export type RoleActionState = { error?: string; success?: string } | null;

const ALLOWED_ROLES = ["USER", "ADMIN"] as const;

export async function setUserRole(
  _prev: RoleActionState,
  formData: FormData,
): Promise<RoleActionState> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isOwner(session.user.role)) redirect("/");

  const userId = formData.get("userId") as string;
  const role   = formData.get("role")   as string;

  if (!ALLOWED_ROLES.includes(role as never)) {
    return { error: "Недопустимая роль" };
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { error: "Пользователь не найден" };
  if (target.role === "OWNER") return { error: "Нельзя изменить роль владельца" };

  await prisma.user.update({ where: { id: userId }, data: { role } });

  revalidatePath("/admin/users");
  return { success: `Роль обновлена: ${target.username} → ${role}` };
}
