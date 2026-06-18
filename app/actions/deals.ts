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

import { formatMoney }
from "@/lib/formatMoney";

import { createNotification } from "@/lib/notifications";

export type DealActionState = {
error: string;
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

// completeDeal — покупатель нажимает «Завершить» (кнопка в DealActions)
// Списывает из frozenBalance покупателя, начисляет продавцу за вычетом комиссии
export async function completeDeal(
_prevState: DealActionState,
formData: FormData,
): Promise<DealActionState>{

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

// Только покупатель может завершить сделку — проверяем и на сервере,
// не полагаясь на клиентские условные кнопки
if(dealCheck.buyerId !== user.id){
return { error: "Завершить сделку может только покупатель" };
}

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

const price = deal.price > 0 ? deal.price : deal.product.price;
const commission = Math.round(price * COMMISSION_RATE * 100) / 100;
const sellerReceives = Math.round((price - commission) * 100) / 100;

// Проверяем frozenBalance: при нормальном флоу деньги уже заморожены
// Если frozen не хватает — проверяем availableBalance (fallback для старых сделок)
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

// Для Вирты — списываем кк со склада
if(deal.product.category === "Вирты" && deal.purchasedAmountKk){
const newStock = Math.max(0, (deal.product.stock ?? 0) - deal.purchasedAmountKk);
await tx.product.update({
where:{ id:deal.productId },
data:{ stock:newStock },
});
}

if(hasFrozen){
// Нормальный флоу: списываем из frozen
await tx.user.update({
where:{ id:deal.buyerId },
data:{ frozenBalance:{ decrement:price } },
});
} else {
// Fallback: старая сделка без заморозки — списываем из available
await tx.user.update({
where:{ id:deal.buyerId },
data:{ availableBalance:{ decrement:price } },
});
}

await tx.user.update({
where:{ id:deal.sellerId },
data:{ availableBalance:{ increment:sellerReceives } },
});

// История транзакций
await tx.transactionHistory.create({
data:{
userId:  deal.buyerId,
type:    "COMPLETE_BUYER",
amount:  price,
description: `Оплата сделки — ${deal.product.title}`,
dealId:  deal.id,
productId: deal.productId,
},
});

await tx.transactionHistory.create({
data:{
userId:  deal.sellerId,
type:    "COMPLETE_SELLER",
amount:  sellerReceives,
description: `Получено за продажу — ${deal.product.title}`,
dealId:  deal.id,
productId: deal.productId,
},
});

await tx.transactionHistory.create({
data:{
userId:  deal.sellerId,
type:    "COMMISSION",
amount:  commission,
description: `Комиссия платформы 5% — ${deal.product.title}`,
dealId:  deal.id,
productId: deal.productId,
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
if(e.code === "ALREADY_DONE"){
return { error: "Сделка уже завершена" };
}
if(e.code === "DEAL_NOT_FOUND"){
return { error: "Сделка не найдена" };
}
if(e.code === "INSUFFICIENT"){
return {
error:
`Недостаточно средств. ` +
`Нужно ${formatMoney(e.price)}, доступно ${formatMoney(e.balance)}`,
};
}
if(e.code === "BUYER_NOT_FOUND"){
return { error: "Покупатель не найден" };
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

revalidatePath("/deals");
revalidatePath("/disputes");
revalidatePath("/profile");
revalidatePath("/transactions");

// Уведомляем продавца — покупатель завершил сделку
await createNotification({
userId:  dealCheck.sellerId,
type:    "DEAL_DONE",
title:   "Покупатель завершил сделку",
message: "Средства зачислены на ваш баланс",
href:    `/deals?id=${dealId}`,
}).catch(()=>{});

return null;

}

export type CreateDealState = { error: string } | null;

// createDeal — покупатель подтверждает покупку в модальном окне
// Замораживает сумму: availableBalance → frozenBalance; isFrozen = true
// Сигнатура useActionState: (_prevState, formData)
export async function createDeal(
_prevState: CreateDealState,
formData: FormData,
): Promise<CreateDealState>{

const productId = formData.get("productId") as string;

if(!productId){
return { error: "Не указан товар" };
}

const session =
await getServerSession(authOptions);

if(!session?.user?.email){
redirect("/auth");
}

const buyer =
await prisma.user.findUnique({
where:{
email:session.user.email,
},
});

if(!buyer){
redirect("/auth");
}

const product =
await prisma.product.findUnique({
where:{
id:productId,
},
});

if(!product){
return { error: "Товар не найден" };
}

if(product.sellerId === buyer.id){
return { error: "Нельзя купить собственный товар" };
}

const isVirty = product.category === "Вирты";

// Для Вирты — определяем количество кк и итоговую цену
let amountKk = 0;
let totalPrice = product.price;

if(isVirty){
amountKk = parseFloat((formData.get("amountKk") as string) || "0");
if(!amountKk || amountKk <= 0){
return { error: "Укажите количество кк" };
}
if(!product.pricePerKK){
return { error: "Товар настроен неверно (нет цены за 1кк)" };
}
totalPrice = Math.round(amountKk * product.pricePerKK * 100) / 100;
}

// Если уже есть активная замороженная сделка (только для не-Вирты)
if(!isVirty){
const existingFrozenDeal =
await prisma.deal.findFirst({
where:{
buyerId:buyer.id,
productId:product.id,
isFrozen:true,
status:{ in:["WAITING","IN_PROGRESS"] },
},
});

if(existingFrozenDeal){
redirect(`/deals?id=${existingFrozenDeal.id}`);
}
}

// Проверяем и замораживаем баланс внутри транзакции
let newDealId: string | null = null;

try{

newDealId = await prisma.$transaction(

async (tx) => {

const freshBuyer =
await tx.user.findUnique({
where:{ id:buyer.id },
});

if(!freshBuyer){
throw new TxError("BUYER_NOT_FOUND");
}

if(freshBuyer.availableBalance < totalPrice){
throw new TxError(
"INSUFFICIENT",
totalPrice,
freshBuyer.availableBalance,
);
}

// Для Вирты — проверяем остаток стока под блокировкой транзакции
if(isVirty){
const freshProduct = await tx.product.findUnique({
where:{ id:product.id },
select:{ stock:true },
});
if(!freshProduct || (freshProduct.stock ?? 0) < amountKk){
throw new TxError("INSUFFICIENT_STOCK");
}
}

let dealId: string;

if(!isVirty){
// Для не-Вирты: используем существующий чат-deal если есть
const existingChatDeal =
await tx.deal.findFirst({
where:{
buyerId:buyer.id,
productId:product.id,
isFrozen:false,
status:{ in:["WAITING","IN_PROGRESS"] },
},
});

if(existingChatDeal){
dealId = existingChatDeal.id;
await tx.deal.update({
where:{ id:dealId },
data:{ isFrozen:true, price:totalPrice },
});
} else {
const deal = await tx.deal.create({
data:{
status:"WAITING",
buyerId:  buyer.id,
sellerId: product.sellerId,
productId:product.id,
price:    totalPrice,
isFrozen: true,
},
});
dealId = deal.id;
}
} else {
// Для Вирты — всегда новая сделка с количеством кк
const deal = await tx.deal.create({
data:{
status:"WAITING",
buyerId:  buyer.id,
sellerId: product.sellerId,
productId:product.id,
price:    totalPrice,
isFrozen: true,
purchasedAmountKk: amountKk,
},
});
dealId = deal.id;
}

// Замораживаем деньги
await tx.user.update({
where:{ id:buyer.id },
data:{
availableBalance:{ decrement:totalPrice },
frozenBalance:   { increment:totalPrice },
},
});

await tx.transactionHistory.create({
data:{
userId:  buyer.id,
type:    "FREEZE",
amount:  totalPrice,
description: `Заморозка средств — ${product.title}`,
dealId,
productId: product.id,
},
});

return dealId;

},

{
isolationLevel:
Prisma.TransactionIsolationLevel.Serializable,
timeout:5000,
},

);

} catch(e){

if(e instanceof TxError){
if(e.code === "INSUFFICIENT"){
return {
error: `Недостаточно средств. Нужно ${formatMoney(e.price)}, доступно ${formatMoney(e.balance)}.`,
};
}
if(e.code === "INSUFFICIENT_STOCK"){
return { error: "Недостаточно кк на складе" };
}
if(e.code === "BUYER_NOT_FOUND"){
return { error: "Пользователь не найден" };
}
}

if(
e instanceof Prisma.PrismaClientKnownRequestError &&
e.code === "P2034"
){
return { error: "Конфликт запросов — попробуйте ещё раз" };
}

throw e;

}

// Уведомляем продавца — покупатель оплатил
await createNotification({
userId:  product.sellerId,
type:    "DEAL_PAID",
title:   "Покупатель оплатил сделку",
message: `${buyer.username} оплатил «${product.title}» — средства заморожены`,
href:    `/deals?id=${newDealId}`,
}).catch(()=>{});

redirect(`/deals?id=${newDealId}`);

}

// contactSeller — покупатель нажимает «Написать продавцу»
// Создаёт сделку БЕЗ заморозки (isFrozen = false), только чат
export async function contactSeller(
productId:string
){

const session =
await getServerSession(authOptions);

if(!session?.user?.email){
redirect("/auth");
}

const buyer =
await prisma.user.findUnique({
where:{
email:session.user.email,
},
});

if(!buyer){
redirect("/auth");
}

const product =
await prisma.product.findUnique({
where:{
id:productId,
},
});

if(!product){
redirect("/catalog");
}

if(product.sellerId === buyer.id){
redirect(`/product/${productId}`);
}

// Если уже есть любая активная сделка — открываем её
const existingDeal =
await prisma.deal.findFirst({
where:{
buyerId:buyer.id,
productId:product.id,
status:{
in:["WAITING","IN_PROGRESS"],
},
},
});

if(existingDeal){
redirect(`/deals?id=${existingDeal.id}`);
}

// Создаём сделку без заморозки
const deal =
await prisma.deal.create({
data:{
status:"WAITING",
buyerId:  buyer.id,
sellerId: product.sellerId,
productId:product.id,
price:    product.price,
isFrozen: false,
},
});

await createNotification({
userId:  product.sellerId,
type:    "NEW_MESSAGE",
title:   "Покупатель хочет написать вам",
message: `${buyer.username} интересуется «${product.title}»`,
href:    `/deals?id=${deal.id}`,
dedupe:  true,
}).catch(()=>{});

redirect(`/deals?id=${deal.id}`);

}

// payForDeal — покупатель нажимает «Оплатить» внутри чат-сделки
// Замораживает деньги для существующей незамороженной сделки
export async function payForDeal(
_prevState: DealActionState,
formData: FormData,
): Promise<DealActionState>{

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

if(deal.buyerId !== user.id){
throw new TxError("NOT_BUYER");
}

if(deal.isFrozen){
throw new TxError("ALREADY_FROZEN");
}

if(deal.status === "DONE" || deal.status === "DISPUTE"){
throw new TxError("WRONG_STATUS");
}

const freshBuyer =
await tx.user.findUnique({
where:{ id:user.id },
});

if(!freshBuyer){
throw new TxError("BUYER_NOT_FOUND");
}

// Всегда используем актуальную цену товара, обновляем deal.price
// чтобы completeDeal и история всегда считали правильную сумму
const price = deal.product.price;

if(freshBuyer.availableBalance < price){
throw new TxError(
"INSUFFICIENT",
price,
freshBuyer.availableBalance,
);
}

await tx.deal.update({
where:{ id:dealId },
data:{ isFrozen:true, price },
});

await tx.user.update({
where:{ id:user.id },
data:{
availableBalance:{ decrement:price },
frozenBalance:   { increment:price },
},
});

await tx.transactionHistory.create({
data:{
userId:  user.id,
type:    "FREEZE",
amount:  price,
description: `Заморозка средств — ${deal.product.title}`,
dealId:  deal.id,
productId: deal.productId,
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
if(e.code === "INSUFFICIENT"){
return {
error:
`Недостаточно средств. ` +
`Нужно $${e.price}, доступно $${e.balance}`,
};
}
if(e.code === "ALREADY_FROZEN"){
return { error: "Средства уже заморожены" };
}
if(e.code === "DEAL_NOT_FOUND"){
return { error: "Сделка не найдена" };
}
if(e.code === "NOT_BUYER"){
return { error: "Только покупатель может оплатить" };
}
if(e.code === "WRONG_STATUS"){
return { error: "Нельзя оплатить завершённую или спорную сделку" };
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

// Уведомляем продавца — покупатель оплатил в чате
const paidDeal = await prisma.deal.findUnique({ where:{ id:dealId } });
if(paidDeal){
await createNotification({
userId:  paidDeal.sellerId,
type:    "DEAL_PAID",
title:   "Покупатель оплатил сделку",
message: "Средства заморожены — передайте товар",
href:    `/deals?id=${dealId}`,
}).catch(()=>{});
}

revalidatePath("/deals");
revalidatePath("/profile");
revalidatePath("/transactions");

return null;

}

// openDispute — покупатель/продавец открывает спор через форму (useActionState)
// Только для замороженных сделок
export async function openDispute(
_prevState: DealActionState,
formData: FormData,
): Promise<DealActionState>{

const dealId = formData.get("dealId") as string;

const session = await getServerSession(authOptions);
if(!session?.user?.email){ redirect("/auth"); }

const user = await prisma.user.findUnique({ where:{ email:session.user.email } });
if(!user){ redirect("/auth"); }

const dealCheck = await prisma.deal.findUnique({ where:{ id:dealId } });
if(!dealCheck){ return { error: "Сделка не найдена" }; }

const isParticipant =
dealCheck.buyerId === user.id || dealCheck.sellerId === user.id;
if(!isParticipant){ return { error: "Нет доступа" }; }

if(!dealCheck.isFrozen){
return { error: "Нельзя открыть спор: средства ещё не заморожены. Сначала оплатите сделку." };
}

if(dealCheck.status === "DONE" || dealCheck.status === "DISPUTE"){
return { error: "Нельзя открыть спор в текущем статусе сделки" };
}

await prisma.deal.update({
where:{ id:dealId },
data:{ status:"DISPUTE", disputedAt: new Date() },
});

const recipientId =
dealCheck.buyerId === user.id ? dealCheck.sellerId : dealCheck.buyerId;

await createNotification({
userId:  recipientId,
type:    "DISPUTE_OPENED",
title:   "Открыт спор по сделке",
message: "Администратор рассмотрит спор в течение 1–3 рабочих дней",
href:    `/disputes`,
}).catch(()=>{});

revalidatePath("/deals");
revalidatePath("/disputes");
revalidatePath("/profile");

return null;

}

// updateDealStatus — продавец принимает (WAITING→IN_PROGRESS) или открывает спор
// Для DONE — делегируем completeDeal
export async function updateDealStatus(
dealId:string,
status:string
){

const session =
await getServerSession(authOptions);

if(!session?.user?.email){
redirect("/auth");
}

const user =
await prisma.user.findUnique({
where:{
email:session.user.email,
},
select:{
id:   true,
role: true,
},
});

if(!user){
redirect("/auth");
}

const dealCheck =
await prisma.deal.findUnique({
where:{ id:dealId },
});

if(!dealCheck){
return;
}

const isParticipant =
dealCheck.buyerId === user.id ||
dealCheck.sellerId === user.id;

if(!isParticipant && !isAdmin(user.role)){
return;
}

// Белый список статусов, допустимых через эту функцию
const ALLOWED_STATUSES = ["DONE", "IN_PROGRESS"];
if(!ALLOWED_STATUSES.includes(status)){
return;
}

// Принять сделку (IN_PROGRESS) может только продавец
if(status === "IN_PROGRESS" && dealCheck.sellerId !== user.id && !isAdmin(user.role)){
return;
}

// IN_PROGRESS требует isFrozen — нельзя принять незамороженную сделку
if(status === "IN_PROGRESS" && !dealCheck.isFrozen){
return;
}

if(status === "DONE"){

const result =
await completeDeal(null, (() => {
const fd = new FormData();
fd.append("dealId", dealId);
return fd;
})());

if(result?.error){
return;
}

} else {

// Спор можно открыть только по оплаченной (замороженной) сделке
if(status === "DISPUTE" && !dealCheck.isFrozen){
return { error: "Нельзя открыть спор: средства ещё не заморожены. Сначала оплатите сделку." };
}

await prisma.deal.update({
where:{ id:dealId },
data:{
status,
...(status === "DISPUTE" ? { disputedAt: new Date() } : {}),
},
});

if(status === "IN_PROGRESS"){
// Продавец принял — уведомляем покупателя
await createNotification({
userId:  dealCheck.buyerId,
type:    "DEAL_ACCEPTED",
title:   "Продавец принял сделку",
message: "Ожидайте передачу товара в игре",
href:    `/deals?id=${dealId}`,
}).catch(()=>{});
}

if(status === "DISPUTE"){
// Спор открыт — уведомляем другую сторону
const recipientId =
dealCheck.buyerId === user.id
? dealCheck.sellerId
: dealCheck.buyerId;
await createNotification({
userId:  recipientId,
type:    "DISPUTE_OPENED",
title:   "Открыт спор по сделке",
message: "Администратор рассмотрит спор в течение 1–3 рабочих дней",
href:    `/disputes`,
}).catch(()=>{});
}

}

revalidatePath("/deals");
revalidatePath("/disputes");
revalidatePath("/profile");

}
