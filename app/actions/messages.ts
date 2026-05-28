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

export async function sendMessage(
dealId:string,
text:string
){

const session =
await getServerSession(authOptions);

if(!session?.user?.email){

redirect("/auth");

}

if(!text.trim()){

return;

}

const user =
await prisma.user.findUnique({

where:{
email:session.user.email,
},

});

if(!user){

return;

}

await prisma.message.create({

data:{

text,

dealId,

senderId:user.id,

},

});

}