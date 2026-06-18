import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/formatMoney";

import {
getServerSession,
} from "next-auth";

import { authOptions }
from "@/lib/auth";

import { redirect }
from "next/navigation";

import {
categoryIcons,
} from "@/lib/categoryIcons";


export default async function DisputesPage(){

const session =
await getServerSession(authOptions);

if(!session?.user?.email){
redirect("/auth");
}

const user =
await prisma.user.findUnique({
where:{ email:session.user.email },
});

if(!user){
redirect("/auth");
}

const disputes =
await prisma.deal.findMany({

where:{
status:"DISPUTE",
OR:[
{ buyerId: user.id },
{ sellerId: user.id },
],
},

include:{
product:true,
buyer:true,
seller:true,
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

Споры

</h1>

<p
style={{
fontSize:18,
color:"#7e8796",
maxWidth:720,
lineHeight:1.8,
}}
>

Система решения конфликтов
между игроками Radmir RP.

</p>

</div>

{disputes.length === 0 ? (

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

Активных споров нет

</h2>

<p
style={{
fontSize:18,
color:"#7e8796",
}}
>

Все сделки проходят успешно.

</p>

</div>

) : (

<div
style={{
display:"flex",
flexDirection:"column",
gap:22,
}}
>

{disputes.map((deal)=>{

const isBuyer = deal.buyerId === user.id;

return(

<div
key={deal.id}
className="card"
style={{
padding:28,
}}
>

<div
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"start",
gap:24,
marginBottom:28,
}}
>

<div>

<div
style={{
display:"flex",
alignItems:"center",
gap:16,
marginBottom:18,
}}
>

<div
style={{
width:84,
height:84,
borderRadius:22,
background:
"linear-gradient(180deg,#151b25,#0d1117)",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:42,
}}
>

{
categoryIcons[
deal.product.category as keyof typeof categoryIcons
]
}

</div>

<div>

<h2
style={{
fontSize:34,
fontWeight:900,
marginBottom:10,
}}
>

{deal.product.title}

</h2>

<div
style={{
display:"flex",
flexDirection:"column",
gap:8,
color:"#7e8796",
}}
>

<div>
Покупатель: {deal.buyer.username}
</div>

<div>
Продавец: {deal.seller.username}
</div>

<div>
Цена: {formatMoney(deal.product.price)}
</div>

</div>

</div>

</div>

</div>

<div
style={{
display:"flex",
flexDirection:"column",
alignItems:"flex-end",
gap:10,
}}
>

<div
style={{
padding:"6px 14px",
borderRadius:999,
background:"rgba(239,68,68,.15)",
color:"#ef4444",
fontWeight:700,
fontSize:12,
}}
>
Спор открыт
</div>

<div
style={{
padding:"6px 14px",
borderRadius:999,
background: isBuyer
? "rgba(255,153,0,.12)"
: "rgba(34,197,94,.10)",
color: isBuyer ? "#ff9a00" : "#22c55e",
fontWeight:600,
fontSize:12,
}}
>

{isBuyer ? "Вы покупатель" : "Вы продавец"}

</div>

</div>

</div>

<div
style={{
padding:22,
borderRadius:22,
background:"rgba(239,68,68,.08)",
border:"1px solid rgba(239,68,68,.18)",
marginBottom:22,
}}
>

<div
style={{
fontSize:16,
fontWeight:700,
color:"#ef4444",
marginBottom:12,
}}
>

Причина спора

</div>

<div
style={{
color:"#b7c0cd",
lineHeight:1.8,
}}
>

Игроки открыли спор по сделке.
Требуется проверка выполнения условий
и подтверждение передачи товара.

</div>

</div>

<div
style={{
padding:"14px 18px",
borderRadius:14,
background:"rgba(255,154,0,.06)",
border:"1px solid rgba(255,154,0,.15)",
color:"#ffb340",
fontSize:14,
lineHeight:1.6,
}}
>
⏳ Спор передан администратору. Решение будет принято в течение 1–3 рабочих дней. Вы получите уведомление о результате.
</div>

</div>

);

})}

</div>

)}

</main>

);

}
