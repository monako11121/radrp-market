import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RADRP Market",
  description: "Безопасный маркетплейс для покупки и продажи игровых ценностей Radmir RP.",
};

const CATEGORIES = [
{
title: "Вирты",
icon: "💰",
slug: "Вирты",
},
{
title: "Имущество",
icon: "🏠",
slug: "Имущество",
},
{
title: "Транспорт",
icon: "🚘",
slug: "Транспорт",
},
{
title: "Аксессуары",
icon: "🎒",
slug: "Аксессуары",
},
] as const;

function formatCount(n: number): string {
if(n === 0) return "0 товаров";
const mod10 = n % 10;
const mod100 = n % 100;
if(mod10 === 1 && mod100 !== 11) return `${n} товар`;
if(mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} товара`;
return `${n} товаров`;
}

export default async function HomePage(){

const [
virtyCnt,
propertyCnt,
transportCnt,
accessoriesCnt,
totalCnt,
userCnt,
doneCnt,
] = await Promise.all([
prisma.product.count({ where:{ category:"Вирты" } }),
prisma.product.count({ where:{ category:"Имущество" } }),
prisma.product.count({ where:{ category:"Транспорт" } }),
prisma.product.count({ where:{ category:"Аксессуары" } }),
prisma.product.count(),
prisma.user.count(),
prisma.deal.count({ where:{ status:"DONE" } }),
]);

const counts: Record<string, number> = {
"Вирты":       virtyCnt,
"Имущество":   propertyCnt,
"Транспорт":   transportCnt,
"Аксессуары":  accessoriesCnt,
};

return(

<main>

<section
className="container"
style={{
paddingTop:80,
paddingBottom:100,
}}
>

<div
style={{
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:28,
alignItems:"stretch",
}}
>

<div
style={{
display:"flex",
flexDirection:"column",
justifyContent:"center",
}}
>

<div
style={{
display:"inline-flex",
alignItems:"center",
gap:10,
padding:"10px 18px",
borderRadius:999,
background:"rgba(255,153,0,.08)",
border:"1px solid rgba(255,153,0,.18)",
marginBottom:28,
fontSize:14,
color:"#ffb340",
width:"fit-content",
}}
>

● Маркетплейс для игроков Radmir RP

</div>

<h1
style={{
fontSize:92,
fontWeight:900,
lineHeight:.92,
letterSpacing:-5,
maxWidth:720,
}}
>

Покупай и
<br/>

продавай
<br/>

на{" "}

<span style={{color:"#ff9a00"}}>
Radmir RP
</span>

<br/>

Market

</h1>

<p
style={{
marginTop:30,
fontSize:19,
color:"#7e8796",
maxWidth:620,
lineHeight:1.8,
}}
>

Игровая валюта, транспорт,
имущество и аксессуары
для игроков проекта Radmir RP.

</p>

<div
style={{
display:"flex",
gap:16,
marginTop:42,
}}
>

<Link href="/catalog">

<button className="orangeButton">
Перейти в каталог
</button>

</Link>

<Link href="/sell">

<button className="darkButton">
Начать продавать
</button>

</Link>

</div>

<div
style={{
display:"flex",
gap:48,
marginTop:56,
}}
>

<div>
<div style={{ fontSize:34, fontWeight:800 }}>
{totalCnt}
</div>
<div style={{ marginTop:6, color:"#7e8796" }}>
{formatCount(totalCnt)}
</div>
</div>

<div>
<div style={{ fontSize:34, fontWeight:800 }}>
{userCnt}
</div>
<div style={{ marginTop:6, color:"#7e8796" }}>
{userCnt === 1 ? "Пользователь" : userCnt >= 2 && userCnt <= 4 ? "Пользователя" : "Пользователей"}
</div>
</div>

<div>
<div style={{ fontSize:34, fontWeight:800 }}>
{doneCnt}
</div>
<div style={{ marginTop:6, color:"#7e8796" }}>
{doneCnt === 1 ? "Сделка" : doneCnt >= 2 && doneCnt <= 4 ? "Сделки" : "Сделок"} завершено
</div>
</div>

</div>

</div>

<div
className="card"
style={{
padding:28,
display:"flex",
flexDirection:"column",
justifyContent:"space-between",
background:
"linear-gradient(180deg, rgba(18,22,30,.96), rgba(8,10,14,.98))",
position:"relative",
overflow:"hidden",
minHeight:620,
}}
>

<div
style={{
position:"absolute",
top:-120,
right:-120,
width:300,
height:300,
borderRadius:"50%",
background:"rgba(255,153,0,.10)",
filter:"blur(70px)",
}}
/>

<div
style={{
position:"absolute",
bottom:-80,
left:-80,
width:220,
height:220,
borderRadius:"50%",
background:"rgba(255,153,0,.08)",
filter:"blur(70px)",
}}
/>

<div
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"flex-start",
position:"relative",
zIndex:2,
}}
>

<div>

<div
style={{
fontSize:14,
color:"#7e8796",
marginBottom:14,
}}
>

Маркетплейс Radmir RP

</div>

<h2
style={{
fontSize:42,
fontWeight:800,
lineHeight:1.1,
maxWidth:340,
}}
>

Предложения игроков
Radmir RP

</h2>

</div>

<div
className="card"
style={{
padding:"16px 20px",
background:"rgba(255,255,255,.03)",
}}
>

<div
style={{
fontSize:13,
color:"#7e8796",
marginBottom:8,
}}
>

Завершённых сделок

</div>

<div
style={{
fontSize:30,
fontWeight:800,
}}
>

{doneCnt}

</div>

</div>

</div>

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(2,1fr)",
gap:18,
marginTop:40,
position:"relative",
zIndex:2,
}}
>

{CATEGORIES.map((cat)=>(

<Link
key={cat.slug}
href={`/catalog?category=${encodeURIComponent(cat.slug)}`}
style={{
textDecoration:"none",
display:"block",
}}
>

<div
className="card"
style={{
padding:28,
minHeight:190,
background:"rgba(255,255,255,.03)",
display:"flex",
flexDirection:"column",
justifyContent:"space-between",
cursor:"pointer",
transition:"border-color .18s, background .18s",
}}
>

<div
style={{
fontSize:42,
}}
>

{cat.icon}

</div>

<div>

<h3
style={{
fontSize:28,
fontWeight:700,
marginBottom:10,
}}
>

{cat.title}

</h3>

<p
style={{
color:"#7e8796",
marginBottom:16,
lineHeight:1.7,
}}
>

{formatCount(counts[cat.slug])}

</p>

<div
style={{
display:"inline-flex",
alignItems:"center",
gap:8,
color:"#ff9a00",
fontWeight:600,
}}
>

Перейти →

</div>

</div>

</div>

</Link>

))}

</div>

</div>

</div>

</section>

<section
className="container"
style={{
paddingBottom:100,
}}
>

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(3,1fr)",
gap:20,
}}
>

<div
className="card"
style={{
padding:32,
display:"flex",
alignItems:"flex-start",
gap:18,
}}
>

<div
style={{
fontSize:42,
color:"#ff9a00",
}}
>

🛡

</div>

<div>

<h3
style={{
fontSize:22,
fontWeight:700,
marginBottom:12,
}}
>

Безопасные сделки

</h3>

<p
style={{
color:"#7e8796",
lineHeight:1.8,
}}
>

Сделки со встроенным арбитражем —
при конфликте открывай спор.

</p>

</div>

</div>

<div
className="card"
style={{
padding:32,
display:"flex",
alignItems:"flex-start",
gap:18,
}}
>

<div
style={{
fontSize:42,
color:"#ff9a00",
}}
>

⚡

</div>

<div>

<h3
style={{
fontSize:22,
fontWeight:700,
marginBottom:12,
}}
>

Моментальные сделки

</h3>

<p
style={{
color:"#7e8796",
lineHeight:1.8,
}}
>

Три шага: создать сделку,
принять и завершить.

</p>

</div>

</div>

<div
className="card"
style={{
padding:32,
display:"flex",
alignItems:"flex-start",
gap:18,
}}
>

<div
style={{
fontSize:42,
color:"#ff9a00",
}}
>

☏

</div>

<div>

<h3
style={{
fontSize:22,
fontWeight:700,
marginBottom:12,
}}
>

Система споров

</h3>

<p
style={{
color:"#7e8796",
lineHeight:1.8,
}}
>

Открой спор — администратор
рассмотрит ситуацию и примет решение.

</p>

</div>

</div>

</div>

</section>

</main>

);

}
