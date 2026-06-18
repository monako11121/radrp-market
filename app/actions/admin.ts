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

import { isAdmin }
from "@/lib/admin";

import { createNotification } from "@/lib/notifications";

export type DisputeResolveState = {
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

async function getAdminOrRedirect(){

const session =
await getServerSession(authOptions);

if(
!session?.user?.email ||
!isAdmin(session.user.role)
){
redirect("/");
}

return session.user.email;

}


// Решить спор в пользу покупателя:
// Возвращаем frozenBalance покупателю (unfreeze)
export async function resolveDisputeBuyer(
_prevState: DisputeResolveState,
formData: FormData,
): Promise<DisputeResolveState>{

const adminEmail = await getAdminOrRedirect();

const dealId  = formData.get("dealId")  as string;
const note    = (formData.get("note") as string)?.trim() || null;

const deal =
await prisma.deal.findUnique({
where:{ id:dealId },
include:{ product:true },
});

if(!deal){
return { error: "Сделка не найдена" };
}

if(deal.status !== "DISPUTE"){
return { error: "Сделка не находится в статусе DISPUTE" };
}

const price = deal.price > 0 ? deal.price : deal.product.price;

try{

await prisma.$transaction(

async (tx) => {

// Внутри транзакции: полная повторная проверка (atomically)
const freshDeal = await tx.deal.findUnique({ where:{ id:dealId } });

if(!freshDeal || freshDeal.status !== "DISPUTE"){
throw new TxError("ALREADY_DONE");
}

// Guard: нельзя трогать frozenBalance если сделка не была заморожена
if(!freshDeal.isFrozen){
throw new TxError("NOT_FROZEN");
}

// Проверяем что решение ещё не вынесено (внутри tx — атомарно)
const existingDecision = await tx.adminDecision.findUnique({ where:{ dealId } });
if(existingDecision){
throw new TxError("ALREADY_DECIDED");
}

await tx.deal.update({
where:{ id:dealId },
data:{ status:"DONE" },
});

await tx.user.update({
where:{ id:deal.buyerId },
data:{
frozenBalance:   { decrement:price },
availableBalance:{ increment:price },
},
});

await tx.transactionHistory.create({
data:{
userId:  deal.buyerId,
type:    "UNFREEZE",
amount:  price,
description: `Возврат по спору (решение администратора) — ${deal.product.title}`,
dealId:  deal.id,
productId: deal.productId,
},
});

await tx.adminDecision.create({
data:{
dealId,
adminEmail,
decision: "BUYER",
amount:   price,
note,
},
});

},

{
isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
timeout: 5000,
},

);

}catch(e){

if(e instanceof TxError){
if(e.code === "ALREADY_DONE" || e.code === "ALREADY_DECIDED"){
return { success: "Спор уже был разрешён ранее." };
}
if(e.code === "NOT_FROZEN"){
return { error: "Невозможно решить спор: средства по этой сделке не были заморожены." };
}
}

if(
e instanceof Prisma.PrismaClientKnownRequestError &&
(e.code === "P2034" || e.code === "P2002")
){
return { error: "Конфликт запросов — попробуйте ещё раз" };
}

throw e;

}

revalidatePath("/admin/disputes");
revalidatePath("/deals");
revalidatePath("/transactions");

// Уведомляем обе стороны
await createNotification({
userId:  deal.buyerId,
type:    "DISPUTE_RESOLVED",
title:   "Спор решён в вашу пользу",
message: `$${price} возвращены на ваш баланс`,
href:    `/deals?id=${dealId}`,
}).catch(()=>{});

await createNotification({
userId:  deal.sellerId,
type:    "DISPUTE_RESOLVED",
title:   "Спор решён не в вашу пользу",
message: "Средства возвращены покупателю",
href:    `/deals?id=${dealId}`,
}).catch(()=>{});

return {
success:`Спор решён в пользу покупателя. $${price} возвращено.`,
};

}

// Решить спор в пользу продавца:
// Списываем frozenBalance покупателя, начисляем продавцу минус комиссия
export async function resolveDisputeSeller(
_prevState: DisputeResolveState,
formData: FormData,
): Promise<DisputeResolveState>{

const adminEmail = await getAdminOrRedirect();

const dealId = formData.get("dealId") as string;
const note   = (formData.get("note") as string)?.trim() || null;

const dealCheck =
await prisma.deal.findUnique({
where:{ id:dealId },
});

if(!dealCheck){
return { error: "Сделка не найдена" };
}

if(dealCheck.status !== "DISPUTE"){
return { error: "Сделка не находится в статусе DISPUTE" };
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

if(deal.status !== "DISPUTE"){
throw new TxError("ALREADY_DONE");
}

// Guard: нельзя двигать frozenBalance если сделка не была заморожена
if(!deal.isFrozen){
throw new TxError("NOT_FROZEN");
}

// Проверяем что решение ещё не вынесено (внутри tx — атомарно)
const existingDecision = await tx.adminDecision.findUnique({ where:{ dealId } });
if(existingDecision){
throw new TxError("ALREADY_DECIDED");
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
description: `Списание по спору (решение администратора) — ${deal.product.title}`,
dealId:  deal.id,
productId: deal.productId,
},
{
userId:  deal.sellerId,
type:    "COMPLETE_SELLER",
amount:  sellerReceives,
description: `Получено по спору (решение администратора) — ${deal.product.title}`,
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

await tx.adminDecision.create({
data:{
dealId,
adminEmail,
decision: "SELLER",
amount:   price,
note,
},
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
if(e.code === "ALREADY_DONE" || e.code === "ALREADY_DECIDED"){
return { success: "Спор уже был разрешён ранее." };
}
if(e.code === "NOT_FROZEN"){
return { error: "Невозможно решить спор: средства по этой сделке не были заморожены." };
}
if(e.code === "INSUFFICIENT"){
return {
error:
`Недостаточно средств у покупателя. ` +
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
(e.code === "P2034" || e.code === "P2002")
){
return {
error: "Конфликт запросов — попробуйте ещё раз",
};
}

throw e;

}

revalidatePath("/admin/disputes");
revalidatePath("/deals");
revalidatePath("/profile");
revalidatePath("/transactions");

// Уведомляем обе стороны
await createNotification({
userId:  dealCheck.sellerId,
type:    "DISPUTE_RESOLVED",
title:   "Спор решён в вашу пользу",
message: `Средства зачислены на ваш баланс (минус комиссия 5%)`,
href:    `/deals?id=${dealId}`,
}).catch(()=>{});

await createNotification({
userId:  dealCheck.buyerId,
type:    "DISPUTE_RESOLVED",
title:   "Спор решён не в вашу пользу",
message: "Средства переведены продавцу",
href:    `/deals?id=${dealId}`,
}).catch(()=>{});

return {
success:`Спор решён в пользу продавца. $${price} переведено (минус комиссия 5%).`,
};

}
