"use server";

import { prisma }
from "@/lib/prisma";

import {
getServerSession,
} from "next-auth";

import { authOptions }
from "@/lib/auth";

import { redirect }
from "next/navigation";

import { revalidatePath }
from "next/cache";

import bcrypt from "bcryptjs";

export type SettingsState = {
error?: string;
success?: string;
} | null;

export async function updateUsername(
_prevState: SettingsState,
formData: FormData,
): Promise<SettingsState>{

const session =
await getServerSession(authOptions);

if(!session?.user?.email){
redirect("/auth");
}

const currentUser =
await prisma.user.findUnique({
where:{ email:session.user.email },
});

if(!currentUser){
redirect("/auth");
}

const username =
(formData.get("username") as string ?? "").trim();

if(!username){
return { error: "Username не может быть пустым" };
}

if(username.length < 3){
return { error: "Username должен содержать минимум 3 символа" };
}

if(username.length > 32){
return { error: "Username не должен превышать 32 символа" };
}

if(username === currentUser.username){
return { success: "Username не изменился" };
}

const taken =
await prisma.user.findUnique({
where:{ username },
});

if(taken){
return { error: "Это имя пользователя уже занято" };
}

await prisma.user.update({
where:{ id:currentUser.id },
data:{ username },
});

revalidatePath("/profile");
revalidatePath("/profile/settings");

return { success: "Username успешно обновлён" };

}

export async function changePassword(
_prevState: SettingsState,
formData: FormData,
): Promise<SettingsState>{

const session = await getServerSession(authOptions);
if(!session?.user?.email) redirect("/auth");

const user = await prisma.user.findUnique({ where:{ email:session.user.email } });
if(!user) redirect("/auth");

const current     = (formData.get("currentPassword") as string ?? "").trim();
const next        = (formData.get("newPassword")      as string ?? "").trim();
const confirm     = (formData.get("confirmPassword")  as string ?? "").trim();

if(!current || !next || !confirm)
  return { error: "Заполните все поля" };

if(next.length < 8)
  return { error: "Новый пароль должен содержать минимум 8 символов" };

if(next !== confirm)
  return { error: "Пароли не совпадают" };

const valid = await bcrypt.compare(current, user.password);
if(!valid)
  return { error: "Текущий пароль неверен" };

const hash = await bcrypt.hash(next, 12);
await prisma.user.update({ where:{ id:user.id }, data:{ password:hash } });

revalidatePath("/profile/settings");
return { success: "Пароль успешно изменён" };

}
