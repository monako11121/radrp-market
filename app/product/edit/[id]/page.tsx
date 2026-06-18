import { prisma } from "@/lib/prisma";

import {
getServerSession,
} from "next-auth";

import { authOptions }
from "@/lib/auth";

import { redirect }
from "next/navigation";

import EditProductForm
from "./EditProductForm";

export default async function EditProductPage({
params,
}:{
params:Promise<{
id:string;
}>;
}){

const { id } =
await params;

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
where:{ id },
});

if(!product){
redirect("/profile");
}

if(product.sellerId !== user.id){
redirect("/profile");
}

return(

<main
className="container"
style={{
paddingTop:60,
paddingBottom:100,
maxWidth:760,
}}
>

<div
className="card"
style={{
padding:34,
}}
>

<h1
style={{
fontSize:48,
fontWeight:900,
marginBottom:28,
}}
>

Редактировать товар

</h1>

<EditProductForm product={product} />

</div>

</main>

);

}
