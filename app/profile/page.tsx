import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/formatMoney";
import { isAdmin } from "@/lib/admin";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Профиль",
  description: "Ваш профиль на RADRP Market: баланс, товары, история сделок.",
};

import { getServerSession }
from "next-auth";

import { authOptions }
from "@/lib/auth";

import Link from "next/link";

import { redirect }
from "next/navigation";

import DeleteProductButton
from "@/components/profile/DeleteProductButton";

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

const [reviews, doneDealsCnt] = await Promise.all([
prisma.review.findMany({
where:{ sellerId:user.id },
orderBy:{ createdAt:"desc" },
include:{ buyer:{ select:{ username:true } } },
}),
prisma.deal.count({
where:{ sellerId:user.id, status:"DONE" },
}),
]);

const avgRating =
reviews.length > 0
? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
: null;

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

{user.role !== "USER" && (
<div
style={{
display:"inline-flex",
alignItems:"center",
gap:6,
padding:"4px 14px",
borderRadius:20,
background: user.role === "OWNER" ? "rgba(168,85,247,.12)" : "rgba(239,68,68,.12)",
border: user.role === "OWNER" ? "1px solid rgba(168,85,247,.3)" : "1px solid rgba(239,68,68,.3)",
color: user.role === "OWNER" ? "#a855f7" : "#ef4444",
fontWeight:700,
fontSize:13,
marginBottom:14,
}}
>
{user.role === "OWNER" ? "👑 Владелец" : "⚙ Администратор"}
</div>
)}

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

{/* Статистика продавца */}
<div
style={{
display:"grid",
gridTemplateColumns:"1fr 1fr 1fr",
gap:12,
width:"100%",
marginBottom:20,
}}
>

<div
className="card"
style={{
padding:"14px 12px",
textAlign:"center",
}}
>
<div style={{ fontSize:22, fontWeight:800, color:"#ff9a00" }}>
{avgRating !== null ? avgRating.toFixed(1) : "—"}
</div>
<div style={{ fontSize:12, color:"#7e8796", marginTop:4 }}>
Рейтинг
</div>
</div>

<div
className="card"
style={{
padding:"14px 12px",
textAlign:"center",
}}
>
<div style={{ fontSize:22, fontWeight:800 }}>
{reviews.length}
</div>
<div style={{ fontSize:12, color:"#7e8796", marginTop:4 }}>
Отзывов
</div>
</div>

<div
className="card"
style={{
padding:"14px 12px",
textAlign:"center",
}}
>
<div style={{ fontSize:22, fontWeight:800 }}>
{doneDealsCnt}
</div>
<div style={{ fontSize:12, color:"#7e8796", marginTop:4 }}>
Сделок
</div>
</div>

</div>

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

{formatMoney(user.availableBalance)}

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
href="/deposit"
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

Пополнить

</button>

</Link>

<Link
href="/withdraw"
style={{
width:"100%",
}}
>

<button
className="darkButton"
style={{
width:"100%",
marginBottom:14,
}}
>

Вывести средства

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

Доступный баланс

</div>

<div
style={{
fontSize:48,
fontWeight:900,
}}
>

{formatMoney(user.availableBalance)}

</div>

{user.frozenBalance > 0 && (
<div
style={{
marginTop:10,
fontSize:14,
color:"#ffb340",
}}
>
🔒 Заморожено в сделке: {formatMoney(user.frozenBalance)}
</div>
)}

{user.pendingWithdrawalBalance > 0 && (
<div
style={{
marginTop:8,
fontSize:14,
color:"#a78bfa",
}}
>
⏳ На выводе: {formatMoney(user.pendingWithdrawalBalance)}
</div>
)}

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

{formatMoney(product.price)}

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

<DeleteProductButton productId={product.id} />

</div>

</div>

))}

</div>

)}

</div>

</div>

</div>

{/* Секция отзывов о продавце */}
{reviews.length > 0 && (

<div
style={{
marginTop:40,
}}
>

<div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, marginBottom:20, flexWrap:"wrap" }}>

<h2
style={{
fontSize:28,
fontWeight:800,
margin:0,
}}
>

Отзывы покупателей

</h2>

<Link
href={`/seller/${user.id}/reviews`}
style={{
fontSize:14,
color:"#ff9a00",
textDecoration:"none",
fontWeight:600,
}}
>
Все отзывы →
</Link>

</div>

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",
gap:16,
}}
>

{reviews.map((review)=>(

<div
key={review.id}
className="card"
style={{
padding:20,
}}
>

<div
style={{
display:"flex",
alignItems:"center",
justifyContent:"space-between",
marginBottom:10,
}}
>

<div style={{ display:"flex", gap:3 }}>
{[1,2,3,4,5].map((s)=>(
<span
key={s}
style={{
fontSize:16,
color:s <= review.rating ? "#ff9a00" : "#2d3748",
}}
>
★
</span>
))}
</div>

<span style={{ fontSize:12, color:"#7e8796" }}>
{new Date(review.createdAt).toLocaleDateString()}
</span>

</div>

{review.comment && (
<p
style={{
fontSize:14,
color:"#c0c8d4",
lineHeight:1.7,
marginBottom:10,
}}
>
{review.comment}
</p>
)}

<div style={{ fontSize:12, color:"#7e8796" }}>
{review.buyer.username}
</div>

</div>

))}

</div>

</div>

)}

</main>

);

}