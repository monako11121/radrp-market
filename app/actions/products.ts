"use server";

import { prisma }
from "@/lib/prisma";

import { redirect }
from "next/navigation";

import {
getServerSession,
} from "next-auth";

import { authOptions }
from "@/lib/auth";

import { revalidatePath }
from "next/cache";

const ALLOWED_CATEGORIES =
["Транспорт","Имущество","Вирты","Аксессуары"] as const;

export type ProductState = {
error: string;
} | null;

function validateProduct(
title: string,
description: string,
price: number,
category: string,
server: number,
): string | null {

if(!title.trim()){
return "Введите название товара";
}

if(!description.trim()){
return "Введите описание товара";
}

if(isNaN(price) || price <= 0){
return "Цена должна быть больше 0";
}

if(!(ALLOWED_CATEGORIES as readonly string[]).includes(category)){
return "Выберите допустимую категорию";
}

if(isNaN(server) || server < 1 || server > 21){
return "Сервер должен быть от 1 до 21";
}

return null;

}

export async function createProduct(
_prevState: ProductState,
formData: FormData,
): Promise<ProductState>{

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
});

if(!user){
redirect("/auth");
}

const title =
(formData.get("title") as string ?? "").trim();

const description =
(formData.get("description") as string ?? "").trim();

const price =
Number(formData.get("price"));

const category =
formData.get("category") as string;

const server =
Number(formData.get("server"));

const stock =
formData.get("stock")
? Number(formData.get("stock"))
: null;

const pricePerKK =
formData.get("pricePerKK")
? Number(formData.get("pricePerKK"))
: null;

const isVirty = category === "Вирты";

if(isVirty){
if(!stock || isNaN(stock) || stock < 1 || !Number.isInteger(stock)){
return { error: "Количество кк должно быть целым числом ≥ 1" };
}
if(!pricePerKK || isNaN(pricePerKK) || pricePerKK < 0.01){
return { error: "Цена за 1кк должна быть ≥ 0.01" };
}
}

// Гарантируем неотрицательность перед записью в БД
const safeStock    = stock    !== null ? Math.max(1, stock)    : null;
const safePriceKK  = pricePerKK !== null ? Math.max(0.01, pricePerKK) : null;

const effectivePrice = isVirty
? Math.round((safeStock ?? 0) * (safePriceKK ?? 0) * 100) / 100
: Math.max(0.01, price);

const validationError =
validateProduct(title,description,effectivePrice,category,server);

if(validationError){
return { error: validationError };
}

await prisma.product.create({

data:{
title,
description,
price:effectivePrice,
category,
server,
stock:safeStock,
pricePerKK:safePriceKK,
sellerId:user.id,
},

});

revalidatePath("/catalog");
revalidatePath("/");
revalidatePath("/profile");

redirect("/catalog");

}

export type DeleteProductState = {
error: string;
} | null;

export async function deleteProduct(
_prevState: DeleteProductState,
formData: FormData,
): Promise<DeleteProductState>{

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
});

if(!user){
redirect("/auth");
}

const productId =
formData.get("productId") as string;

const product =
await prisma.product.findUnique({
where:{
id:productId,
},
});

if(!product){
return { error: "Товар не найден" };
}

if(product.sellerId !== user.id){
return { error: "Нет доступа к этому товару" };
}

// Сначала проверяем активные сделки — понятное сообщение пользователю
const activeDeal = await prisma.deal.findFirst({
where:{
productId,
status:{ in:["WAITING","IN_PROGRESS","DISPUTE"] },
},
select:{ id:true },
});

if(activeDeal){
return {
error:
"Нельзя удалить товар: по нему есть активная сделка. " +
"Дождитесь завершения или откройте спор.",
};
}

// Deal.productId — обязательный FK (не nullable).
// Если есть любые завершённые сделки — Product удалить нельзя без потери истории.
const anyDeal = await prisma.deal.findFirst({
where:{ productId },
select:{ id:true },
});

if(anyDeal){
return {
error:
"Нельзя удалить товар: по нему есть история сделок. " +
"Обратитесь в поддержку для архивирования.",
};
}

// Нет сделок — безопасно удаляем зависимые записи, затем Product.
// Favorite.productId — обязательный FK, удаляем вручную.
// TransactionHistory.productId — nullable FK, Prisma обнулит автоматически.
await prisma.$transaction([
prisma.favorite.deleteMany({ where:{ productId } }),
prisma.product.delete({ where:{ id:productId } }),
]);

revalidatePath("/profile");
revalidatePath("/catalog");
revalidatePath("/");

return null;

}

export async function updateProduct(
_prevState: ProductState,
formData: FormData,
): Promise<ProductState>{

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
});

if(!user){
redirect("/auth");
}

const id =
formData.get("id") as string;

const title =
(formData.get("title") as string ?? "").trim();

const description =
(formData.get("description") as string ?? "").trim();

const price =
Number(formData.get("price"));

const category =
formData.get("category") as string;

const server =
Number(formData.get("server"));

const stock =
formData.get("stock")
? Number(formData.get("stock"))
: null;

const pricePerKK =
formData.get("pricePerKK")
? Number(formData.get("pricePerKK"))
: null;

const validationError =
validateProduct(title,description,price,category,server);

if(validationError){
return { error: validationError };
}

const product =
await prisma.product.findUnique({
where:{ id },
});

if(!product){
return { error: "Товар не найден" };
}

if(product.sellerId !== user.id){
return { error: "Нет доступа к этому товару" };
}

await prisma.product.update({

where:{ id },

data:{
title,
description,
price,
category,
server,
stock,
pricePerKK,
},

});

revalidatePath("/profile");
revalidatePath("/catalog");
revalidatePath(`/product/${id}`);

redirect("/profile");

}
