"use server";

import bcrypt from "bcrypt";

import { prisma }
from "@/lib/prisma";

import { redirect }
from "next/navigation";

type RegisterState = {
error: string;
} | null;

export async function registerUser(
_prevState: RegisterState,
formData: FormData,
): Promise<RegisterState>{

const username =
(formData.get("username") as string)?.trim();

const email =
(formData.get("email") as string)?.trim();

const password =
formData.get("password") as string;

if(!username || !email || !password){
return { error: "Заполните все поля" };
}

if(password.length < 8){
return { error: "Пароль должен содержать минимум 8 символов" };
}

const existingEmail =
await prisma.user.findUnique({
where:{ email },
});

if(existingEmail){
return {
error: "Пользователь с таким email уже зарегистрирован",
};
}

const existingUsername =
await prisma.user.findUnique({
where:{ username },
});

if(existingUsername){
return {
error: "Это имя пользователя уже занято",
};
}

const hashedPassword =
await bcrypt.hash(password, 10);

await prisma.user.create({

data:{
username,
email,
password: hashedPassword,
},

});

redirect("/auth?registered=1");

}
