"use client";

import { createProduct } from "../actions/products";

import { getServerSession }
from "next-auth";

import { authOptions }
from "@/lib/auth";

import { redirect }
from "next/navigation";

import { useState }
from "react";

export default function SellPage(){

const [category,setCategory] =
useState("Транспорт");

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

Создание объявления

</h1>

<p
style={{
fontSize:18,
color:"#7e8796",
maxWidth:720,
lineHeight:1.8,
}}
>

Размести объявление
на маркетплейсе Radmir RP.

</p>

</div>

<div
style={{
display:"grid",
gridTemplateColumns:"1fr 340px",
gap:24,
alignItems:"start",
}}
>

<form
action={createProduct}
className="card"
style={{
padding:32,
}}
>

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(2,1fr)",
gap:20,
marginBottom:20,
}}
>

<div>

<div
style={{
marginBottom:10,
fontSize:14,
color:"#7e8796",
}}
>

Название товара

</div>

<input
name="title"
placeholder="Например: BMW M5 F90"
required
style={{
width:"100%",
height:56,
background:"#0d1219",
border:"1px solid #1d2734",
borderRadius:16,
padding:"0 18px",
color:"white",
outline:"none",
fontSize:15,
}}
/>

</div>

<div>

<div
style={{
marginBottom:10,
fontSize:14,
color:"#7e8796",
}}
>

Категория

</div>

<select
name="category"
value={category}
onChange={(e)=>
setCategory(e.target.value)
}
style={{
width:"100%",
height:56,
background:"#0d1219",
border:"1px solid #1d2734",
borderRadius:16,
padding:"0 18px",
color:"white",
outline:"none",
fontSize:15,
}}
>

<option>
Транспорт
</option>

<option>
Имущество
</option>

<option>
Вирты
</option>

<option>
Аксессуары
</option>

</select>

</div>

</div>

<div
style={{
marginBottom:20,
}}
>

<div
style={{
marginBottom:10,
fontSize:14,
color:"#7e8796",
}}
>

Описание

</div>

<textarea
name="description"
placeholder="Подробно опишите товар..."
required
style={{
width:"100%",
height:180,
resize:"none",
background:"#0d1219",
border:"1px solid #1d2734",
borderRadius:16,
padding:"18px",
color:"white",
outline:"none",
fontSize:15,
fontFamily:"inherit",
}}
/>

</div>

{
category === "Вирты" && (

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(2,1fr)",
gap:20,
marginBottom:20,
}}
>

<div>

<div
style={{
marginBottom:10,
fontSize:14,
color:"#7e8796",
}}
>

Количество кк

</div>

<input
name="stock"
type="number"
placeholder="100"
style={{
width:"100%",
height:56,
background:"#0d1219",
border:"1px solid #1d2734",
borderRadius:16,
padding:"0 18px",
color:"white",
outline:"none",
fontSize:15,
}}
/>

</div>

<div>

<div
style={{
marginBottom:10,
fontSize:14,
color:"#7e8796",
}}
>

Цена за 1кк

</div>

<input
name="pricePerKK"
type="number"
placeholder="2"
style={{
width:"100%",
height:56,
background:"#0d1219",
border:"1px solid #1d2734",
borderRadius:16,
padding:"0 18px",
color:"white",
outline:"none",
fontSize:15,
}}
/>

</div>

</div>

)
}

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(2,1fr)",
gap:20,
marginBottom:30,
}}
>

<div>

<div
style={{
marginBottom:10,
fontSize:14,
color:"#7e8796",
}}
>

Цена

</div>

<input
name="price"
type="number"
placeholder="0 ₽"
required
style={{
width:"100%",
height:56,
background:"#0d1219",
border:"1px solid #1d2734",
borderRadius:16,
padding:"0 18px",
color:"white",
outline:"none",
fontSize:15,
}}
/>

</div>

<div>

<div
style={{
marginBottom:10,
fontSize:14,
color:"#7e8796",
}}
>

Сервер

</div>

<select
name="server"
style={{
width:"100%",
height:56,
background:"#0d1219",
border:"1px solid #1d2734",
borderRadius:16,
padding:"0 18px",
color:"white",
outline:"none",
fontSize:15,
}}
>

{Array.from({ length: 21 }, (_, i) => (

<option
key={i + 1}
value={i + 1}
>

{String(i + 1).padStart(2, "0")}

</option>

))}

</select>

</div>

</div>

<button
type="submit"
className="orangeButton"
style={{
width:"100%",
height:58,
}}
>

Опубликовать

</button>

</form>

<div
style={{
display:"flex",
flexDirection:"column",
gap:20,
position:"sticky",
top:110,
}}
>

<div
className="card"
style={{
padding:26,
}}
>

<h2
style={{
fontSize:24,
fontWeight:800,
marginBottom:18,
}}
>

Информация

</h2>

<div
style={{
display:"flex",
flexDirection:"column",
gap:16,
color:"#7e8796",
lineHeight:1.7,
}}
>

<p>
• Объявление автоматически появится в каталоге
</p>

<p>
• Общение между игроками происходит внутри сайта
</p>

<p>
• Все сделки проходят через систему споров
</p>

</div>

</div>

</div>

</div>

</main>

);

}