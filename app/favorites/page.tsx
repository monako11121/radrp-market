import { prisma } from "@/lib/prisma";

import {
getServerSession,
} from "next-auth";

import { authOptions }
from "@/lib/auth";

import { redirect }
from "next/navigation";

import Link from "next/link";

import {
categoryIcons,
} from "@/lib/categoryIcons";

export default async function FavoritesPage(){

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

const favorites =
await prisma.favorite.findMany({

where:{
userId:user.id,
},

include:{
product:true,
},

orderBy:{
createdAt:"desc",
},

});

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
marginBottom:40,
}}
>

<h1
style={{
fontSize:56,
fontWeight:900,
marginBottom:18,
}}
>

Избранное

</h1>

<p
style={{
fontSize:18,
color:"#7e8796",
maxWidth:700,
lineHeight:1.7,
}}
>

Сохранённые товары
маркетплейса Radmir RP.

</p>

</div>

{favorites.length === 0 ? (

<div
className="card"
style={{
padding:60,
textAlign:"center",
}}
>

<h2
style={{
fontSize:38,
fontWeight:900,
marginBottom:18,
}}
>

Избранное пусто

</h2>

<p
style={{
color:"#7e8796",
marginBottom:28,
fontSize:17,
}}
>

Добавляйте товары в избранное,
чтобы быстро вернуться к ним позже.

</p>

<Link href="/catalog">

<button className="orangeButton">

Перейти в каталог

</button>

</Link>

</div>

) : (

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(3,1fr)",
gap:18,
}}
>

{favorites.map((favorite)=>(

<Link
href={`/product/${favorite.product.id}`}
key={favorite.id}
>

<div
className="card"
style={{
padding:22,
minHeight:280,
display:"flex",
flexDirection:"column",
justifyContent:"space-between",
cursor:"pointer",
}}
>

<div
style={{
height:120,
borderRadius:18,
background:
"linear-gradient(180deg,#151b25,#0d1117)",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:54,
marginBottom:24,
}}
>

{
categoryIcons[
favorite.product.category as keyof typeof categoryIcons
]
}

</div>

<div>

<h3
style={{
fontSize:28,
fontWeight:700,
marginBottom:12,
}}
>

{favorite.product.title}

</h3>

<p
style={{
fontSize:15,
color:"#7e8796",
marginBottom:18,
}}
>

Сервер {favorite.product.server}

</p>

{
favorite.product.category === "Вирты"
? (

<div
style={{
display:"flex",
flexDirection:"column",
gap:10,
marginBottom:18,
}}
>

<div
style={{
display:"flex",
justifyContent:"space-between",
fontSize:14,
}}
>

<span
style={{
color:"#7e8796",
}}
>

Наличие

</span>

<span
style={{
fontWeight:700,
}}
>

{favorite.product.stock}кк

</span>

</div>

<div
style={{
display:"flex",
justifyContent:"space-between",
fontSize:14,
}}
>

<span
style={{
color:"#7e8796",
}}
>

Цена за 1кк

</span>

<span
style={{
fontWeight:700,
color:"#ff9a00",
}}
>

${favorite.product.pricePerKK}

</span>

</div>

</div>

)
: (

<div
style={{
fontSize:24,
fontWeight:800,
color:"#ff9a00",
marginBottom:18,
}}
>

${favorite.product.price}

</div>

)
}

<div
style={{
display:"flex",
justifyContent:"flex-end",
}}
>

<div
style={{
color:"#ff9a00",
fontWeight:700,
fontSize:20,
}}
>

♥

</div>

</div>

</div>

</div>

</Link>

))}

</div>

)}

</main>

);

}