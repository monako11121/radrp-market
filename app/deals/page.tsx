import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/formatMoney";

import Link from "next/link";

import {
getServerSession,
} from "next-auth";

import { authOptions }
from "@/lib/auth";

import { redirect }
from "next/navigation";

import {
sendMessage,
} from "@/app/actions/messages";

import SendMessageForm
from "@/components/deals/SendMessageForm";

import DealActions
from "@/components/deals/DealActions";

import ReviewForm
from "@/components/deals/ReviewForm";

import {
categoryIcons,
} from "@/lib/categoryIcons";

const STATUS_LABELS: Record<string,string> = {
WAITING: "Ожидание",
IN_PROGRESS: "В работе",
DONE: "Завершено",
DISPUTE: "Спор открыт",
};

export default async function DealsPage({
searchParams,
}:{
searchParams:Promise<{
id?:string;
}>;
}){

const { id: dealIdParam } =
await searchParams;

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

const deals =
await prisma.deal.findMany({

where:{

OR:[

{
buyerId:user.id,
},

{
sellerId:user.id,
},

],

},

include:{

product:true,

buyer:true,

seller:true,

messages:{
include:{
sender:true,
},
orderBy:{
createdAt:"asc",
},
},

review:true,

},

orderBy:{
createdAt:"desc",
},

});

const activeDeal =

deals.find(
(deal)=>
deal.id === dealIdParam
)

||

deals[0];

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

Сделки

</h1>

<p
style={{
fontSize:18,
color:"#7e8796",
maxWidth:720,
lineHeight:1.8,
}}
>

Покупки и продажи
между игроками Radmir RP.

</p>

</div>

{deals.length === 0 ? (

<div
className="card"
style={{
padding:80,
textAlign:"center",
}}
>

<h2
style={{
fontSize:42,
fontWeight:900,
marginBottom:18,
}}
>

У вас пока нет сделок

</h2>

<p
style={{
fontSize:18,
color:"#7e8796",
marginBottom:30,
}}
>

Купите или продайте товар
чтобы появилась первая сделка.

</p>

</div>

) : (

<div
className="dealsLayout"
style={{
display:"grid",
gridTemplateColumns:"380px 1fr",
gap:22,
alignItems:"start",
}}
>

<div
className="card dealsList"
style={{
padding:18,
display:"flex",
flexDirection:"column",
gap:14,
}}
>

{deals.map((deal)=>(

<Link
href={`/deals?id=${deal.id}`}
key={deal.id}
style={{
textDecoration:"none",
}}
>

<div
className="card"
style={{
padding:18,

border:
activeDeal.id === deal.id
? "1px solid rgba(255,153,0,.22)"
: "1px solid rgba(255,255,255,.05)",

background:
activeDeal.id === deal.id
? "rgba(255,153,0,.06)"
: "rgba(255,255,255,.015)",

cursor:"pointer",

transition:
".22s ease",

transform:
activeDeal.id === deal.id
? "translateX(4px)"
: "translateX(0px)",

boxShadow:
activeDeal.id === deal.id
? "0 0 30px rgba(255,153,0,.08)"
: "none",
}}
>

<div
style={{
display:"flex",
alignItems:"center",
gap:16,
}}
>

<div
style={{
width:72,
height:72,
borderRadius:18,
background:
"linear-gradient(180deg,#151b25,#0d1117)",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:34,
}}
>

{
categoryIcons[
deal.product.category as keyof typeof categoryIcons
]
}

</div>

<div
style={{
flex:1,
}}
>

<div
style={{
display:"flex",
justifyContent:"space-between",
gap:14,
marginBottom:10,
}}
>

<div
style={{
fontSize:22,
fontWeight:700,
color:"white",
}}
>

{deal.product.title}

</div>

<div
style={{
padding:"6px 10px",
borderRadius:999,
background:
deal.status === "DONE"
? "rgba(34,197,94,.15)"
: deal.status === "DISPUTE"
? "rgba(239,68,68,.15)"
: "rgba(255,153,0,.15)",

color:
deal.status === "DONE"
? "#22c55e"
: deal.status === "DISPUTE"
? "#ef4444"
: "#ff9a00",

fontSize:12,
fontWeight:700,
whiteSpace:"nowrap",
}}
>

{STATUS_LABELS[deal.status] ?? deal.status}

</div>

</div>

<div
style={{
fontSize:14,
color:"#7e8796",
marginBottom:8,
}}
>

Сделка #{deal.id.slice(0,6)}

</div>

<div
style={{
fontSize:15,
color:"#7e8796",
}}
>

{formatMoney(deal.product.price)}

</div>

</div>

</div>

</div>

</Link>

))}

</div>

<div
className="card"
style={{
overflow:"hidden",
}}
>

<div
style={{
padding:"24px 28px",
borderBottom:"1px solid rgba(255,255,255,.06)",
display:"flex",
alignItems:"center",
justifyContent:"space-between",
gap:20,
}}
>

<div>

<h2
style={{
fontSize:32,
fontWeight:800,
marginBottom:10,
}}
>

{activeDeal.product.title}

</h2>

<div
style={{
display:"flex",
gap:18,
color:"#7e8796",
}}
>

<span>

Покупатель:
{" "}
{activeDeal.buyer.username}

</span>

<span>

Продавец:
{" "}
{activeDeal.seller.username}

</span>

<span>

{formatMoney(activeDeal.product.price)}

</span>

</div>

</div>

<div
style={{
padding:"10px 16px",
borderRadius:999,

background:
activeDeal.status === "DONE"
? "rgba(34,197,94,.15)"
: activeDeal.status === "DISPUTE"
? "rgba(239,68,68,.15)"
: "rgba(255,153,0,.15)",

color:
activeDeal.status === "DONE"
? "#22c55e"
: activeDeal.status === "DISPUTE"
? "#ef4444"
: "#ff9a00",

fontWeight:700,
}}
>

{STATUS_LABELS[activeDeal.status] ?? activeDeal.status}

</div>

</div>

<div
style={{
padding:28,
display:"flex",
flexDirection:"column",
gap:18,
minHeight:520,
}}
>

<DealActions
dealId={activeDeal.id}
status={activeDeal.status}
isBuyer={activeDeal.buyerId === user.id}
isFrozen={activeDeal.isFrozen}
/>

{activeDeal.status === "DONE" &&
activeDeal.buyerId === user.id &&
!activeDeal.review && (

<ReviewForm dealId={activeDeal.id} />

)}

{activeDeal.status === "DONE" &&
activeDeal.review && (

<div
style={{
padding:"16px 18px",
borderRadius:14,
background:"rgba(255,255,255,.03)",
border:"1px solid #1d2734",
}}
>

<div
style={{
fontSize:13,
color:"#7e8796",
marginBottom:8,
}}
>
Ваш отзыв
</div>

<div
style={{
display:"flex",
alignItems:"center",
gap:8,
marginBottom: activeDeal.review.comment ? 8 : 0,
}}
>

{[1,2,3,4,5].map((s)=>(
<span
key={s}
style={{
fontSize:18,
color:s <= activeDeal.review!.rating ? "#ff9a00" : "#2d3748",
}}
>
★
</span>
))}

<span style={{ fontSize:14, color:"#7e8796" }}>
{activeDeal.review.rating}/5
</span>

</div>

{activeDeal.review.comment && (
<div style={{ fontSize:14, color:"#c0c8d4" }}>
{activeDeal.review.comment}
</div>
)}

</div>

)}

{activeDeal.messages.length === 0 ? (

<div
style={{
display:"flex",
justifyContent:"flex-start",
}}
>

<div
className="card"
style={{
padding:"16px 18px",
maxWidth:420,
background:"rgba(255,255,255,.03)",
}}
>

Сделка создана.
Начните общение.

</div>

</div>

) : (

activeDeal.messages.map((message)=>(

<div
key={message.id}
style={{
display:"flex",
justifyContent:
message.senderId === user.id
? "flex-end"
: "flex-start",
}}
>

<div
style={{
padding:"16px 18px",
maxWidth:420,

background:
message.senderId === user.id
? "rgba(255,153,0,.12)"
: "rgba(255,255,255,.03)",

border:
message.senderId === user.id
? "1px solid rgba(255,153,0,.16)"
: "1px solid rgba(255,255,255,.04)",

borderRadius:18,
}}
>

<div
style={{
fontSize:13,
color:"#7e8796",
marginBottom:8,
}}
>

{message.sender.username}

</div>

{message.text}

</div>

</div>

))

)}

</div>

<SendMessageForm
dealId={activeDeal.id}
sendMessage={sendMessage}
/>

</div>

</div>

)}

</main>

);

}