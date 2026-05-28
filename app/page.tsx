import Link from "next/link";

export default function HomePage() {

const categories = [

{
title:"Вирты",
count:"12 456 товаров",
icon:"💰",
},

{
title:"Имущество",
count:"8 234 товара",
icon:"🏠",
},

{
title:"Транспорт",
count:"9 876 товаров",
icon:"🚘",
},

{
title:"Аксессуары",
count:"1 234 товара",
icon:"🎒",
},

];

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

● Безопасные сделки между игроками

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

<div
style={{
fontSize:34,
fontWeight:800,
}}
>

12K+

</div>

<div
style={{
marginTop:6,
color:"#7e8796",
}}
>

Объявлений

</div>

</div>

<div>

<div
style={{
fontSize:34,
fontWeight:800,
}}
>

4.9★

</div>

<div
style={{
marginTop:6,
color:"#7e8796",
}}
>

Рейтинг сервиса

</div>

</div>

<div>

<div
style={{
fontSize:34,
fontWeight:800,
}}
>

24/7

</div>

<div
style={{
marginTop:6,
color:"#7e8796",
}}
>

Поддержка

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

Лучшие предложения
для игроков проекта

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

Онлайн продавцов

</div>

<div
style={{
fontSize:30,
fontWeight:800,
}}
>

1 284

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

{categories.map((category)=>(

<div
key={category.title}
className="card"
style={{
padding:28,
minHeight:190,
background:"rgba(255,255,255,.03)",
display:"flex",
flexDirection:"column",
justifyContent:"space-between",
}}
>

<div
style={{
fontSize:42,
}}
>

{category.icon}

</div>

<div>

<h3
style={{
fontSize:28,
fontWeight:700,
marginBottom:10,
}}
>

{category.title}

</h3>

<p
style={{
color:"#7e8796",
marginBottom:16,
lineHeight:1.7,
}}
>

{category.count}

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

Все сделки проходят через систему
защиты покупателей и продавцов.

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

Покупка и продажа происходят
быстро и без лишних действий.

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

Поддержка 24/7

</h3>

<p
style={{
color:"#7e8796",
lineHeight:1.8,
}}
>

Помощь при проблемах,
спорах и вопросах пользователей.

</p>

</div>

</div>

</div>

</section>

</main>

);

}