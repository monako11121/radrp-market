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

export async function createProduct(
formData: FormData
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

});

if(!user){

redirect("/auth");

}

const title =
formData.get("title") as string;

const description =
formData.get("description") as string;

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

await prisma.product.create({

data:{

title,
description,
price,
category,
server,

stock,
pricePerKK,

sellerId:user.id,

},

});

redirect("/catalog");

}

export async function deleteProduct(
productId:string,
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

});

if(!user){

redirect("/auth");

}

const product =
await prisma.product.findUnique({

where:{
id:productId,
},

});

if(!product){

return;

}

if(product.sellerId !== user.id){

return;

}

await prisma.product.delete({

where:{
id:productId,
},

});

revalidatePath("/profile");
revalidatePath("/catalog");

}

export async function updateProduct(
formData:FormData,
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

});

if(!user){

redirect("/auth");

}

const id =
formData.get("id") as string;

const title =
formData.get("title") as string;

const description =
formData.get("description") as string;

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

const product =
await prisma.product.findUnique({

where:{
id,
},

});

if(!product){

return;

}

if(product.sellerId !== user.id){

return;

}

await prisma.product.update({

where:{
id,
},

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