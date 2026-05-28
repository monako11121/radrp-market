import { prisma } from "@/lib/prisma";

import {
getServerSession,
} from "next-auth";

import { authOptions }
from "@/lib/auth";

import { redirect }
from "next/navigation";

import {
updateProduct,
} from "@/app/actions/products";

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

where:{
id,
},

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

<form
action={updateProduct}
style={{
display:"flex",
flexDirection:"column",
gap:18,
}}
>

<input
type="hidden"
name="id"
value={product.id}
/>

<input
name="title"
defaultValue={product.title}
placeholder="Название"
style={{
height:56,
background:"#0d1219",
border:"1px solid #1d2734",
borderRadius:16,
padding:"0 18px",
color:"white",
fontSize:16,
outline:"none",
}}
/>

<textarea
name="description"
defaultValue={product.description}
placeholder="Описание"
style={{
height:180,
background:"#0d1219",
border:"1px solid #1d2734",
borderRadius:16,
padding:"18px",
color:"white",
fontSize:16,
outline:"none",
resize:"none",
}}
/>

<input
name="price"
type="number"
defaultValue={product.price}
placeholder="Цена"
style={{
height:56,
background:"#0d1219",
border:"1px solid #1d2734",
borderRadius:16,
padding:"0 18px",
color:"white",
fontSize:16,
outline:"none",
}}
/>

<select
name="category"
defaultValue={product.category}
style={{
height:56,
background:"#0d1219",
border:"1px solid #1d2734",
borderRadius:16,
padding:"0 18px",
color:"white",
fontSize:16,
outline:"none",
}}
>

<option value="Транспорт">
Транспорт
</option>

<option value="Имущество">
Имущество
</option>

<option value="Вирты">
Вирты
</option>

<option value="Аксессуары">
Аксессуары
</option>

</select>

<select
name="server"
defaultValue={String(product.server)}
style={{
height:56,
background:"#0d1219",
border:"1px solid #1d2734",
borderRadius:16,
padding:"0 18px",
color:"white",
fontSize:16,
outline:"none",
}}
>

{Array.from({ length:21 },(_,i)=>(

<option
key={i+1}
value={i+1}
>

{String(i+1).padStart(2,"0")}

</option>

))}

</select>

<button
className="orangeButton"
type="submit"
>

Сохранить изменения

</button>

</form>

</div>

</main>

);

}