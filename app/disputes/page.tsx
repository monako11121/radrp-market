import { prisma } from "@/lib/prisma";

import {
getServerSession,
} from "next-auth";

import { authOptions }
from "@/lib/auth";

import { redirect }
from "next/navigation";

import {
updateDealStatus,
} from "@/app/actions/deals";

import {
categoryIcons,
} from "@/lib/categoryIcons";

export default async function DisputesPage(){

const session =
await getServerSession(authOptions);

if(!session?.user?.email){

redirect("/auth");

}

const disputes =
await prisma.deal.findMany({

where:{
status:"DISPUTE",
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

{disputes.map((deal)=>(

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
Цена: ${deal.product.price}
</div>

</div>

</div>

</div>

</div>

<div
style={{
display:"flex",
gap:14,
}}
>

<form
action={async()=>{

"use server";

await updateDealStatus(
deal.id,
"DONE"
);

}}
>

<button
className="orangeButton"
type="submit"
>

Решить спор

</button>

</form>

<form
action={async()=>{

"use server";

await updateDealStatus(
deal.id,
"IN_PROGRESS"
);

}}
>

<button
className="darkButton"
type="submit"
>

Вернуть сделку

</button>

</form>

</div>

</div>

<div
style={{
padding:22,
borderRadius:22,
background:"rgba(239,68,68,.08)",
border:"1px solid rgba(239,68,68,.18)",
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

</div>

))}

</div>

)}

</main>

);

}