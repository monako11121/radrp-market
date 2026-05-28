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

export async function createDeal(
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

return;

}

if(product.sellerId === buyer.id){

return;

}

await prisma.deal.create({

data:{

status:"WAITING",

buyerId:buyer.id,
sellerId:product.sellerId,

productId:product.id,

},

});

redirect("/deals");

}

export async function updateDealStatus(
dealId:string,
status:string
){

await prisma.deal.update({

where:{
id:dealId,
},

data:{
status,
},

});

}