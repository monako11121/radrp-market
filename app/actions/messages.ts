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

import { createNotification } from "@/lib/notifications";

export type SendMessageResult = { error: string } | undefined;

export async function sendMessage(
dealId:string,
text:string
): Promise<SendMessageResult>{

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

const deal =
await prisma.deal.findUnique({
where:{
id:dealId,
},
});

if(!deal){
return { error: "Сделка не найдена" };
}

const isParticipant =
deal.buyerId === user.id ||
deal.sellerId === user.id;

if(!isParticipant){
return { error: "Нет доступа" };
}

if(deal.status === "DONE"){
return { error: "Чат закрыт: сделка завершена" };
}

await prisma.message.create({

data:{

text,

dealId,

senderId:user.id,

},

});

// Уведомляем собеседника (один раз на непрочитанный диалог)
const recipientId =
deal.buyerId === user.id ? deal.sellerId : deal.buyerId;

await createNotification({
userId:  recipientId,
type:    "NEW_MESSAGE",
title:   "Новое сообщение",
message: `${user.username} написал вам в сделку`,
href:    `/deals?id=${dealId}`,
dedupe:  true,
}).catch(()=>{});

revalidatePath("/deals");

}