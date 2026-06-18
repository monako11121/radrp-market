"use server";

import { prisma }
from "@/lib/prisma";

import { Prisma }
from "@prisma/client";

import {
getServerSession,
} from "next-auth";

import { authOptions }
from "@/lib/auth";

import { redirect }
from "next/navigation";

import { revalidatePath }
from "next/cache";

export type DisputeState = {
error?: string;
success?: string;
} | null;

const COMMISSION_RATE = 0.05;

class TxError extends Error {
constructor(
public code: string,
public price?: number,
public balance?: number,
){
super(code);
}
}

// finalizeDeal — участник сделки завершает спор с оплатой продавцу
// Списывает frozenBalance покупателя, начисляет продавцу за вычетом комиссии
export async function finalizeDeal(
_prevState: DisputeState,
formData: FormData,
): Promise<DisputeState>{

const session =
await getServerSession(authOptions);

if(!session?.user?.email){
redirect("/auth");
}

const user =
await prisma.user.findUnique({
where:{ email:session.user.email },
});

if(!user){
redirect("/auth");
}

const dealId =
formData.get("dealId") as string;

const dealCheck =
await prisma.deal.findUnique({
where:{ id:dealId },
});

if(!dealCheck){
return { error: "Сделка не найдена" };
}

const isParticipant =
dealCheck.buyerId === user.id ||
dealCheck.sellerId === user.id;

if(!isParticipant){
return { error: "Нет доступа к этой сделке" };
}

let price = 0;

try{

await prisma.$transaction(

async (tx) => {

const deal =
await tx.deal.findUnique({
where:{ id:dealId },
include:{ product:true },
});

if(!deal){
throw new TxError("DEAL_NOT_FOUND");
}

if(deal.status === "DONE"){
throw new TxError("ALREADY_DONE");
}

const buyer =
await tx.user.findUnique({
where:{ id:deal.buyerId },
});

if(!buyer){
throw new TxError("BUYER_NOT_FOUND");
}

price = deal.price > 0 ? deal.price : deal.product.price;
const commission = Math.round(price * COMMISSION_RATE * 100) / 100;
const sellerReceives = Math.round((price - commission) * 100) / 100;

const hasFrozen = buyer.frozenBalance >= price;
const hasAvailable = buyer.availableBalance >= price;

if(!hasFrozen && !hasAvailable){
throw new TxError(
"INSUFFICIENT",
price,
buyer.availableBalance,
);
}

await tx.deal.update({
where:{ id:dealId },
data:{ status:"DONE" },
});

if(hasFrozen){
await tx.user.update({
where:{ id:deal.buyerId },
data:{ frozenBalance:{ decrement:price } },
});
} else {
await tx.user.update({
where:{ id:deal.buyerId },
data:{ availableBalance:{ decrement:price } },
});
}

await tx.user.update({
where:{ id:deal.sellerId },
data:{ availableBalance:{ increment:sellerReceives } },
});

await tx.transactionHistory.createMany({
data:[
{
userId:  deal.buyerId,
type:    "COMPLETE_BUYER",
amount:  price,
description: `Оплата по спору — ${deal.product.title}`,
dealId:  deal.id,
productId: deal.productId,
},
{
userId:  deal.sellerId,
type:    "COMPLETE_SELLER",
amount:  sellerReceives,
description: `Получено по спору — ${deal.product.title}`,
dealId:  deal.id,
productId: deal.productId,
},
{
userId:  deal.sellerId,
type:    "COMMISSION",
amount:  commission,
description: `Комиссия платформы 5% — ${deal.product.title}`,
dealId:  deal.id,
productId: deal.productId,
},
],
});

},

{
isolationLevel:
Prisma.TransactionIsolationLevel.Serializable,
timeout:5000,
},

);

}catch(e){

if(e instanceof TxError){
if(e.code === "ALREADY_DONE"){
return { success: "Сделка уже завершена" };
}
if(e.code === "INSUFFICIENT"){
return {
error:
`Недостаточно средств. ` +
`Нужно $${e.price}, доступно $${e.balance}.`,
};
}
if(e.code === "BUYER_NOT_FOUND"){
return { error: "Покупатель не найден" };
}
if(e.code === "DEAL_NOT_FOUND"){
return { error: "Сделка не найдена" };
}
}

if(
e instanceof
Prisma.PrismaClientKnownRequestError &&
e.code === "P2034"
){
return { error: "Конфликт запросов — попробуйте ещё раз" };
}

throw e;

}

revalidatePath("/disputes");
revalidatePath("/deals");
revalidatePath("/profile");
revalidatePath("/transactions");

return {
success: `Сделка завершена. $${price} переведено продавцу.`,
};

}

// returnToProgress — вернуть сделку из DISPUTE → IN_PROGRESS
// Деньги остаются замороженными
export async function returnToProgress(
_prevState: DisputeState,
formData: FormData,
): Promise<DisputeState>{

const session =
await getServerSession(authOptions);

if(!session?.user?.email){
redirect("/auth");
}

const user =
await prisma.user.findUnique({
where:{ email:session.user.email },
});

if(!user){
redirect("/auth");
}

const dealId =
formData.get("dealId") as string;

const deal =
await prisma.deal.findUnique({
where:{ id:dealId },
});

if(!deal){
return { error: "Сделка не найдена" };
}

const isParticipant =
deal.buyerId === user.id ||
deal.sellerId === user.id;

if(!isParticipant){
return { error: "Нет доступа к этой сделке" };
}

if(deal.status !== "DISPUTE"){
return { error: "Сделка не находится в статусе DISPUTE" };
}

await prisma.deal.update({
where:{ id:dealId },
data:{ status:"IN_PROGRESS" },
});

revalidatePath("/disputes");
revalidatePath("/deals");

return { success: "Сделка возвращена в работу" };

}
