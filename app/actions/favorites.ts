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

export async function toggleFavorite(
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

const existing =
await prisma.favorite.findUnique({

where:{

userId_productId:{

userId:user.id,
productId,

},

},

});

if(existing){

await prisma.favorite.delete({

where:{
id:existing.id,
},

});

}else{

await prisma.favorite.create({

data:{

userId:user.id,
productId,

},

});

}

revalidatePath("/catalog");
revalidatePath(`/product/${productId}`);
revalidatePath("/favorites");

}