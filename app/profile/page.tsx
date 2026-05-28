import { prisma } from "@/lib/prisma";

import { getServerSession }
from "next-auth";

import { authOptions }
from "@/lib/auth";

import Link from "next/link";

import { redirect }
from "next/navigation";

import {
deleteProduct,
} from "@/app/actions/products";

import {
categoryIcons,
} from "@/lib/categoryIcons";

export default async function ProfilePage(){

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

include:{
products:true,
},

});

if(!user){

redirect("/auth");

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
className="profileLayout"
style={{
display:"grid",
gridTemplateColumns:"320px 1fr",
gap:24,
alignItems:"start",
}}
>

<div
className="card profileSidebar"
style={{
padding:28,
position:"sticky",
top:110,
}}
>

<div
style={{
display:"flex",
flexDirection:"column",
alignItems:"center",
textAlign:"center",
}}
>

<div
style={{
width:120,
height:120,
borderRadius:"50%",
background:
"linear-gradient(180deg,#202938,#121821)",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:42,
fontWeight:900,
marginBottom:24,
}}
>

{user.username[0]}

</div>

<h1
style={{
fontSize:"clamp(34px,6vw,42px)",
fontWeight:900,
marginBottom:12,
wordBreak:"break-word",
}}
>

{user.username}

</h1>

<p
style={{
color:"#7e8796",
marginBottom:30,
}}
>

На сайте с{" "}

{new Date(user.createdAt)
.getFullYear()}

года

</p>

<div
className="card"
style={{
width:"100%",
padding:24,
marginBottom:24,
}}
>

<div
style={{
fontSize:15,
color:"#7e8796",
marginBottom:10,
}}
>

Баланс

</div>

<div
style={{
fontSize:42,
fontWeight:900,
}}
>

${user.balance}

</div>

</div>

<Link
href="/sell"
style={{
width:"100%",
}}
>

<button
className="orangeButton"
style={{
width:"100%",
marginBottom:14,
}}
>

Добавить товар

</button>

</Link>

<Link
href="/profile/settings"
style={{
width:"100%",
}}
>

<button
className="darkButton"
style={{
width:"100%",
}}
>

Настройки

</button>

</Link>

</div>

</div>

<div
style={{
display:"flex",
flexDirection:"column",
gap:24,
}}
>

<div
className="profileStats"
style={{
display:"grid",
gridTemplateColumns:"repeat(3,1fr)",
gap:18,
}}
>

<div
className="card"
style={{
padding:26,
}}
>

<div
style={{
fontSize:15,
color:"#7e8796",
marginBottom:12,
}}
>

Товаров

</div>

<div
style={{
fontSize:48,
fontWeight:900,
}}
>

{user.products.length}

</div>

</div>

<div
className="card"
style={{
padding:26,
}}
>

<div
style={{
fontSize:15,
color:"#7e8796",
marginBottom:12,
}}
>

Баланс

</div>

<div
style={{
fontSize:48,
fontWeight:900,
}}
>

${user.balance}

</div>

</div>

<div
className="card"
style={{
padding:26,
}}
>

<div
style={{
fontSize:15,
color:"#7e8796",
marginBottom:12,
}}
>

ID пользователя

</div>

<div
style={{
fontSize:22,
fontWeight:800,
wordBreak:"break-all",
}}
>

{user.id.slice(0,8)}

</div>

</div>

</div>

<div
className="card"
style={{
padding:30,
}}
>

<div
style={{
display:"flex",
alignItems:"center",
justifyContent:"space-between",
marginBottom:28,
gap:18,
flexWrap:"wrap",
}}
>

<h2
style={{
fontSize:"clamp(34px,6vw,42px)",
fontWeight:900,
}}
>

Мои товары

</h2>

<Link
href="/sell"
style={{
color:"#ff9a00",
fontWeight:700,
}}
>

Добавить →

</Link>

</div>

{user.products.length === 0 ? (

<div
style={{
textAlign:"center",
padding:"40px 0",
}}
>

<h3
style={{
fontSize:28,
fontWeight:800,
marginBottom:14,
}}
>

У вас пока нет товаров

</h3>

<p
style={{
color:"#7e8796",
marginBottom:24,
}}
>

Создайте первое объявление.

</p>

<Link href="/sell">

<button className="orangeButton">

Создать товар

</button>

</Link>

</div>

) : (

<div
className="profileProducts"
style={{
display:"grid",
gridTemplateColumns:
"repeat(auto-fit,minmax(280px,1fr))",
gap:18,
}}
>

{user.products.map((product)=>(

<div
key={product.id}
className="card"
style={{
padding:22,
minHeight:320,
display:"flex",
flexDirection:"column",
justifyContent:"space-between",
}}
>

<Link
href={`/product/${product.id}`}
style={{
textDecoration:"none",
}}
>

<div
style={{
height:110,
borderRadius:18,
background:
"linear-gradient(180deg,#151b25,#0d1117)",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:54,
marginBottom:22,
}}
>

{
categoryIcons[
product.category as keyof typeof categoryIcons
]
}

</div>

<div>

<h3
style={{
fontSize:28,
fontWeight:700,
marginBottom:12,
color:"white",
wordBreak:"break-word",
}}
>

{product.title}

</h3>

<p
style={{
fontSize:15,
color:"#7e8796",
marginBottom:16,
}}
>

Сервер {product.server}

</p>

<div
style={{
fontSize:24,
fontWeight:800,
color:"#ff9a00",
}}
>

${product.price}

</div>

</div>

</Link>

<div
className="profileProductButtons"
style={{
display:"flex",
gap:12,
marginTop:16,
}}
>

<Link
href={`/product/edit/${product.id}`}
style={{
flex:1,
}}
>

<button
className="darkButton"
style={{
width:"100%",
height:46,
}}
>

Редактировать

</button>

</Link>

<form
action={async()=>{

"use server";

await deleteProduct(
product.id
);

}}
style={{
flex:1,
}}
>

<button
type="submit"
style={{
width:"100%",
height:46,
borderRadius:14,
border:"1px solid rgba(239,68,68,.22)",
background:"rgba(239,68,68,.12)",
color:"#ef4444",
fontWeight:700,
cursor:"pointer",
}}
>

Удалить

</button>

</form>

</div>

</div>

))}

</div>

)}

</div>

</div>

</div>

</main>

);

}