import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import DisputeCard from "./DisputeCard";

export default async function AdminDisputesPage(){

const session = await getServerSession(authOptions);

if(!session?.user?.email || !isAdmin(session.user.email)){
redirect("/");
}

const dealInclude = {
product: true,
buyer:   true,
seller:  true,
messages:{
include:{ sender:true },
orderBy:{ createdAt:"asc" as const },
},
adminDecision: true,
} as const;

const [disputes, resolved] = await Promise.all([

prisma.deal.findMany({
where:{ status:"DISPUTE" },
include: dealInclude,
orderBy:{ disputedAt:"asc" },
}),

prisma.deal.findMany({
where:{
status:"DONE",
adminDecision:{ isNot:null },
},
include: dealInclude,
orderBy:{ adminDecision:{ createdAt:"desc" } },
take: 50,
}),

]);

return(

<main
className="container"
style={{ paddingTop:60, paddingBottom:100 }}
>

{/* Заголовок */}
<div
style={{
display:"flex",
alignItems:"center",
justifyContent:"space-between",
gap:20,
marginBottom:40,
flexWrap:"wrap",
}}
>

<div>
<h1 style={{ fontSize:56, fontWeight:900, marginBottom:18 }}>
Арбитраж споров
</h1>
<p style={{ fontSize:18, color:"#7e8796", maxWidth:760, lineHeight:1.8 }}>
Рассмотрение конфликтов между покупателями и продавцами.
</p>
</div>

<div style={{ display:"flex", gap:16 }}>

<div className="card" style={{ padding:"18px 26px", textAlign:"center" }}>
<div style={{ fontSize:13, color:"#ef4444", marginBottom:8 }}>Открытых</div>
<div style={{ fontSize:34, fontWeight:900 }}>{disputes.length}</div>
</div>

<div className="card" style={{ padding:"18px 26px", textAlign:"center" }}>
<div style={{ fontSize:13, color:"#7e8796", marginBottom:8 }}>Решено</div>
<div style={{ fontSize:34, fontWeight:900 }}>{resolved.length}</div>
</div>

</div>

</div>

{/* Открытые споры */}
{disputes.length === 0 ? (

<div className="card" style={{ padding:60, textAlign:"center", marginBottom:40 }}>
<div style={{ fontSize:48, marginBottom:16 }}>✅</div>
<h2 style={{ fontSize:28, fontWeight:800, marginBottom:12 }}>Открытых споров нет</h2>
<p style={{ color:"#7e8796" }}>Все сделки проходят без конфликтов.</p>
</div>

) : (

<div style={{ display:"flex", flexDirection:"column", gap:24, marginBottom:60 }}>

{disputes.map((deal)=>(

<DisputeCard
key={deal.id}
dealId={deal.id}
productTitle={deal.product.title}
dealPrice={deal.price > 0 ? deal.price : deal.product.price}
buyerUsername={deal.buyer.username}
buyerEmail={deal.buyer.email}
sellerUsername={deal.seller.username}
sellerEmail={deal.seller.email}
isFrozen={deal.isFrozen}
dealCreatedAt={deal.createdAt}
disputedAt={deal.disputedAt}
messages={deal.messages}
resolved={false}
adminDecision={null}
/>

))}

</div>

)}

{/* Журнал решений */}
{resolved.length > 0 && (

<>

<h2 style={{ fontSize:32, fontWeight:800, marginBottom:20, color:"#7e8796" }}>
Журнал решений
</h2>

<div style={{ display:"flex", flexDirection:"column", gap:16 }}>

{resolved.map((deal)=>(

<DisputeCard
key={deal.id}
dealId={deal.id}
productTitle={deal.product.title}
dealPrice={deal.price > 0 ? deal.price : deal.product.price}
buyerUsername={deal.buyer.username}
buyerEmail={deal.buyer.email}
sellerUsername={deal.seller.username}
sellerEmail={deal.seller.email}
isFrozen={deal.isFrozen}
dealCreatedAt={deal.createdAt}
disputedAt={deal.disputedAt}
messages={deal.messages}
resolved={true}
adminDecision={deal.adminDecision ? {
decision:   deal.adminDecision.decision,
adminEmail: deal.adminDecision.adminEmail,
amount:     deal.adminDecision.amount,
note:       deal.adminDecision.note,
createdAt:  deal.adminDecision.createdAt,
} : null}
/>

))}

</div>

</>

)}

</main>

);

}
