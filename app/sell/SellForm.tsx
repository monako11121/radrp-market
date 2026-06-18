"use client";

import { useState, useActionState } from "react";
import {
createProduct,
} from "@/app/actions/products";

export default function SellForm(){

const [category,setCategory] =
useState("Транспорт");

const [state,formAction,isPending] =
useActionState(createProduct, null);

return(

<form
action={formAction}
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

<option>Транспорт</option>
<option>Имущество</option>
<option>Вирты</option>
<option>Аксессуары</option>

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

{category === "Вирты" && (

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

)}

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
placeholder="0"
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

<option key={i+1} value={i+1}>
{String(i+1).padStart(2,"0")}
</option>

))}

</select>

</div>

</div>

{state?.error && (

<div
style={{
padding:"14px 18px",
borderRadius:14,
background:"rgba(239,68,68,.12)",
border:"1px solid rgba(239,68,68,.22)",
color:"#ef4444",
fontSize:15,
marginBottom:20,
}}
>

{state.error}

</div>

)}

<button
type="submit"
className="orangeButton"
disabled={isPending}
style={{
width:"100%",
height:58,
opacity: isPending ? 0.6 : 1,
}}
>

{isPending ? "Публикация..." : "Опубликовать"}

</button>

</form>

);

}
