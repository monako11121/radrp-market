import { prisma } from "@/lib/prisma";

import Link from "next/link";

import { createDeal }
from "@/app/actions/deals";

import {
toggleFavorite,
} from "@/app/actions/favorites";

import {
categoryIcons,
} from "@/lib/categoryIcons";

import {
getServerSession,
} from "next-auth";

import { authOptions }
from "@/lib/auth";

export default async function ProductPage({
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

const currentUser =
session?.user?.email
? await prisma.user.findUnique({
where:{
email:session.user.email,
},
})
: null;

const product =
await prisma.product.findUnique({

where:{
id,
},

include:{
seller:true,
favorites:true,
},

});

if(!product){

return(

<main
className="container"
style={{
paddingTop:80,
paddingBottom:100,
}}
>

<div
className="card"
style={{
padding:40,
textAlign:"center",
}}
>

<h1
style={{
fontSize:42,
fontWeight:900,
marginBottom:18,
}}
>

Товар не найден

</h1>

<Link href="/catalog">

<button className="orangeButton">

Вернуться в каталог

</button>

</Link>

</div>

</main>

);

}

return(

<main
className="container"
style={{
paddingTop:60,
paddingBottom:100,
}}
>

<div
style={{
display:"flex",
alignItems:"center",
gap:10,
marginBottom:26,
fontSize:14,
color:"#7e8796",
flexWrap:"wrap",
}}
>

<Link href="/catalog">
Каталог
</Link>

<span>
/
</span>

<span style={{color:"white"}}>
{product.title}
</span>

</div>

<div
className="productLayout"
style={{
display:"grid",
gridTemplateColumns:"1fr 420px",
gap:24,
alignItems:"start",
}}
>

<div>

<div
className="card"
style={{
height:"clamp(320px,50vw,520px)",
borderRadius:28,
overflow:"hidden",
background:
"linear-gradient(180deg,#151b25,#0d1117)",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:"clamp(90px,12vw,160px)",
marginBottom:22,
}}
>

{
categoryIcons[
product.category as keyof typeof categoryIcons
]
}

</div>

<div
className="card"
style={{
padding:28,
}}
>

<h2
style={{
fontSize:"clamp(24px,4vw,28px)",
fontWeight:800,
marginBottom:20,
}}
>

Описание

</h2>

<p
style={{
fontSize:17,
lineHeight:1.9,
color:"#7e8796",
}}
>

{product.description}

</p>

</div>

</div>

<div
className="productSidebar"
style={{
position:"sticky",
top:110,
}}
>

<div
className="card"
style={{
padding:30,
marginBottom:20,
}}
>

<div
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"start",
gap:20,
marginBottom:24,
}}
>

<div
style={{
flex:1,
}}
>

<h1
style={{
fontSize:"clamp(30px,5vw,42px)",
fontWeight:900,
lineHeight:1.1,
marginBottom:16,
wordBreak:"break-word",
}}
>

{product.title}

</h1>

{
product.category === "Вирты"
? (

<div
style={{
display:"flex",
flexDirection:"column",
gap:14,
}}
>

<div
style={{
fontSize:18,
color:"#7e8796",
}}
>

Наличие:
{" "}
<span
style={{
color:"white",
fontWeight:700,
}}
>

{product.stock}кк

</span>

</div>

<div
style={{
fontSize:18,
color:"#7e8796",
}}
>

Цена за 1кк:
{" "}
<span
style={{
color:"#ff9a00",
fontWeight:800,
fontSize:28,
}}
>

${product.pricePerKK}

</span>

</div>

</div>

)
: (

<div
style={{
fontSize:"clamp(30px,5vw,40px)",
fontWeight:900,
color:"#ff9a00",
}}
>

${product.price}

</div>

)
}

</div>

<form
action={async()=>{

"use server";

await toggleFavorite(
product.id
);

}}
>

<button
type="submit"
style={{
width:48,
height:48,
borderRadius:14,
background:"#11161f",
border:"1px solid #1d2734",
color:
product.favorites.some(
(f)=>
f.userId === currentUser?.id
)
? "#ff9a00"
: "white",
fontSize:20,
cursor:"pointer",
flexShrink:0,
}}
>

♥

</button>

</form>

</div>

<div
style={{
display:"flex",
flexDirection:"column",
gap:18,
marginBottom:28,
}}
>

<div
style={{
display:"flex",
justifyContent:"space-between",
gap:16,
}}
>

<span style={{color:"#7e8796"}}>
Категория
</span>

<span>
{product.category}
</span>

</div>

<div
style={{
display:"flex",
justifyContent:"space-between",
gap:16,
}}
>

<span style={{color:"#7e8796"}}>
Сервер
</span>

<span>
{String(product.server).padStart(2,"0")}
</span>

</div>

<div
style={{
display:"flex",
justifyContent:"space-between",
gap:16,
}}
>

<span style={{color:"#7e8796"}}>
Дата публикации
</span>

<span>
{new Date(product.createdAt)
.toLocaleDateString()}
</span>

</div>

</div>

<div
className="productButtons"
style={{
display:"flex",
gap:14,
}}
>

<form
action={async()=>{

"use server";

await createDeal(product.id);

}}
style={{
flex:1,
}}
>

<button
type="submit"
className="orangeButton"
style={{
width:"100%",
}}
>

Купить

</button>

</form>

<button
className="darkButton"
style={{
flex:1,
}}
>

Написать

</button>

</div>

</div>

<div
className="card"
style={{
padding:24,
}}
>

<div
style={{
display:"flex",
alignItems:"center",
gap:16,
marginBottom:20,
}}
>

<div
style={{
width:58,
height:58,
borderRadius:"50%",
background:
"linear-gradient(180deg,#202938,#121821)",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:22,
fontWeight:700,
flexShrink:0,
}}
>

{product.seller.username[0]}

</div>

<div>

<div
style={{
fontSize:20,
fontWeight:700,
marginBottom:6,
wordBreak:"break-word",
}}
>

{product.seller.username}

</div>

<div
style={{
color:"#7e8796",
}}
>

Продавец

</div>

</div>

</div>

<Link href="/profile">

<button
className="darkButton"
style={{
width:"100%",
}}
>

Смотреть профиль

</button>

</Link>

</div>

</div>

</div>

</main>

);

}