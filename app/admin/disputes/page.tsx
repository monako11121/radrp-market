export default function AdminDisputesPage(){

const disputes=[

{
id:"#991",
title:"BMW M5 F90",
buyer:"Player123",
seller:"TOPDealer",
reason:"Продавец не передал транспорт",
status:"Открыт",
color:"#ef4444",
},

{
id:"#990",
title:"Вирты",
buyer:"MoneyBoy",
seller:"RichPlayer",
reason:"Не совпала сумма перевода",
status:"На рассмотрении",
color:"#ff9a00",
},

{
id:"#989",
title:"Дом в Рублёвке",
buyer:"Dimon",
seller:"LuxuryHouse",
reason:"Подозрение на обман",
status:"Проверка",
color:"#3b82f6",
},

];

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
justifyContent:"space-between",
gap:20,
marginBottom:40,
flexWrap:"wrap",
}}
>

<div>

<h1
style={{
fontSize:56,
fontWeight:900,
marginBottom:18,
}}
>

Админка споров

</h1>

<p
style={{
fontSize:18,
color:"#7e8796",
maxWidth:760,
lineHeight:1.8,
}}
>

Управление спорами
между покупателями и продавцами.

</p>

</div>

<div
className="card"
style={{
padding:"18px 22px",
}}
>

<div
style={{
fontSize:13,
color:"#7e8796",
marginBottom:8,
}}
>

Активных споров

</div>

<div
style={{
fontSize:34,
fontWeight:900,
}}
>

23

</div>

</div>

</div>

<div
style={{
display:"flex",
gap:14,
marginBottom:28,
flexWrap:"wrap",
}}
>

<div
className="card"
style={{
padding:"12px 18px",
background:"rgba(255,153,0,.10)",
border:"1px solid rgba(255,153,0,.18)",
color:"#ffb340",
}}
>

Все

</div>

<div
className="card"
style={{
padding:"12px 18px",
}}
>

Открытые

</div>

<div
className="card"
style={{
padding:"12px 18px",
}}
>

На рассмотрении

</div>

<div
className="card"
style={{
padding:"12px 18px",
}}
>

Закрытые

</div>

</div>

<div
style={{
display:"flex",
flexDirection:"column",
gap:20,
}}
>

{disputes.map((dispute)=>(

<div
key={dispute.id}
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
marginBottom:24,
flexWrap:"wrap",
}}
>

<div>

<div
style={{
fontSize:14,
color:"#7e8796",
marginBottom:12,
}}
>

Спор {dispute.id}

</div>

<h2
style={{
fontSize:34,
fontWeight:800,
marginBottom:16,
}}
>

{dispute.title}

</h2>

<div
style={{
display:"flex",
flexDirection:"column",
gap:10,
color:"#7e8796",
}}
>

<div>
Покупатель: {dispute.buyer}
</div>

<div>
Продавец: {dispute.seller}
</div>

</div>

</div>

<div
style={{
padding:"12px 18px",
borderRadius:999,
background:`${dispute.color}15`,
color:dispute.color,
fontWeight:700,
whiteSpace:"nowrap",
}}
>

{dispute.status}

</div>

</div>

<div
className="card"
style={{
padding:22,
marginBottom:24,
background:"rgba(255,255,255,.02)",
}}
>

<div
style={{
fontSize:14,
color:"#7e8796",
marginBottom:12,
}}
>

Причина спора

</div>

<div
style={{
fontSize:17,
lineHeight:1.8,
}}
>

{dispute.reason}

</div>

</div>

<div
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
gap:20,
flexWrap:"wrap",
}}
>

<div
style={{
color:"#7e8796",
}}
>

Последнее обновление: 15 минут назад

</div>

<div
style={{
display:"flex",
gap:14,
flexWrap:"wrap",
}}
>

<button
className="darkButton"
style={{
height:50,
}}
>

Открыть чат

</button>

<button
className="darkButton"
style={{
height:50,
}}
>

Покупатель прав

</button>

<button
className="darkButton"
style={{
height:50,
}}
>

Продавец прав

</button>

<button
className="orangeButton"
style={{
height:50,
}}
>

Закрыть спор

</button>

</div>

</div>

</div>

))}

</div>

</main>

);

}