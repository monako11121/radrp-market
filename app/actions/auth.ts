"use server";

import bcrypt from "bcrypt";

import { prisma }
from "@/lib/prisma";

import { redirect }
from "next/navigation";

export async function registerUser(
formData:FormData
){

const username =
formData.get("username") as string;

const email =
formData.get("email") as string;

const password =
formData.get("password") as string;

const existingUser =
await prisma.user.findUnique({

where:{
email,
},

});

if(existingUser){

return;

}

const hashedPassword =
await bcrypt.hash(password,10);

await prisma.user.create({

data:{

username,
email,
password:hashedPassword,

},

});

redirect("/auth");

}