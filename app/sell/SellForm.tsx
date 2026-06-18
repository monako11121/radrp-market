"use client";

import { useState, useActionState } from "react";
import {
createProduct,
} from "@/app/actions/products";

import { formatMoney } from "@/lib/formatMoney";

const inputStyle = {
width:"100%",
height:56,
background:"#0d1219",
border:"1px solid #1d2734",
borderRadius:16,
padding:"0 18px",
color:"white",
outline:"none",
fontSize:15,
} as const;

const labelStyle = {
marginBottom:10,
fontSize:14,
color:"#7e8796",
} as const;

export default function SellForm(){

const [category,setCategory] = useState("Транспорт");
const [stockKk,setStockKk]   = useState("");
const [pricePer,setPricePer] = useState("");

const [state,formAction,isPending] =
useActionState(createProduct, null);

const isVirty = category === "Вирты";

const totalPreview =
isVirty && stockKk && pricePer
? Math.round(parseFloat(stockKk) * parseFloat(pricePer) * 100) / 100
: null;

return(

<form
action={formAction}
className="card"
style={{ padding:32 }}
>

{/* Название + Категория */}
<div
style={{
display:"grid",
gridTemplateColumns:"repeat(2,1fr)",
gap:20,
marginBottom:20,
}}
>

<div>
<div style={labelStyle}>Название товара</div>
<input
name="title"
placeholder="Например: BMW M5 F90"
required
style={inputStyle}
/>
</div>

<div>
<div style={labelStyle}>Категория</div>
<select
name="category"
value={category}
onChange={(e)=>{
setCategory(e.target.value);
setStockKk("");
setPricePer("");
}}
style={inputStyle}
>
<option>Транспорт</option>
<option>Имущество</option>
<option>Вирты</option>
<option>Аксессуары</option>
</select>
</div>

</div>

{/* Описание */}
<div style={{ marginBottom:20 }}>
<div style={labelStyle}>Описание</div>
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

{/* Поля для Вирты */}
{isVirty && (
<>
<div
style={{
display:"grid",
gridTemplateColumns:"repeat(2,1fr)",
gap:20,
marginBottom:12,
}}
>
<div>
<div style={labelStyle}>Количество кк</div>
<input
name="stock"
type="number"
placeholder="100"
min="1"
step="1"
value={stockKk}
onChange={(e)=>setStockKk(e.target.value)}
style={inputStyle}
/>
</div>

<div>
<div style={labelStyle}>Цена за 1кк</div>
<input
name="pricePerKK"
type="number"
placeholder="0.01"
min="0.01"
step="0.01"
value={pricePer}
onChange={(e)=>setPricePer(e.target.value)}
style={inputStyle}
/>
</div>
</div>

{/* Итого — readonly preview */}
<div
style={{
display:"flex",
alignItems:"center",
justifyContent:"space-between",
padding:"14px 20px",
borderRadius:14,
background:"rgba(255,154,0,.06)",
border:"1px solid rgba(255,154,0,.18)",
marginBottom:20,
}}
>
<span style={{ fontSize:14, color:"#7e8796" }}>Итого стоимость листинга</span>
<span style={{ fontSize:18, fontWeight:800, color:"#ff9a00" }}>
{totalPreview !== null && !isNaN(totalPreview)
? formatMoney(totalPreview)
: "—"}
</span>
</div>
</>
)}

{/* Цена + Сервер */}
<div
style={{
display:"grid",
gridTemplateColumns: isVirty ? "1fr" : "repeat(2,1fr)",
gap:20,
marginBottom:30,
}}
>

{!isVirty && (
<div>
<div style={labelStyle}>Цена</div>
<input
name="price"
type="number"
placeholder="0"
required
style={inputStyle}
/>
</div>
)}

<div>
<div style={labelStyle}>Сервер</div>
<select name="server" style={inputStyle}>
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
