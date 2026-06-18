"use client";

import { useActionState } from "react";
import {
updateProduct,
} from "@/app/actions/products";

type Product = {
id: string;
title: string;
description: string;
price: number;
category: string;
server: number;
};

export default function EditProductForm({
product,
}: {
product: Product;
}){

const [state,formAction,isPending] =
useActionState(updateProduct, null);

return(

<form
action={formAction}
style={{
display:"flex",
flexDirection:"column",
gap:18,
}}
>

<input
type="hidden"
name="id"
value={product.id}
/>

<div>

<div
style={{
marginBottom:10,
fontSize:14,
color:"#7e8796",
}}
>

Название

</div>

<input
name="title"
defaultValue={product.title}
placeholder="Название"
style={{
width:"100%",
height:56,
background:"#0d1219",
border:"1px solid #1d2734",
borderRadius:16,
padding:"0 18px",
color:"white",
fontSize:16,
outline:"none",
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

Описание

</div>

<textarea
name="description"
defaultValue={product.description}
placeholder="Описание"
style={{
width:"100%",
height:180,
background:"#0d1219",
border:"1px solid #1d2734",
borderRadius:16,
padding:"18px",
color:"white",
fontSize:16,
outline:"none",
resize:"none",
fontFamily:"inherit",
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

Цена

</div>

<input
name="price"
type="number"
defaultValue={product.price}
placeholder="Цена"
style={{
width:"100%",
height:56,
background:"#0d1219",
border:"1px solid #1d2734",
borderRadius:16,
padding:"0 18px",
color:"white",
fontSize:16,
outline:"none",
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
defaultValue={product.category}
style={{
width:"100%",
height:56,
background:"#0d1219",
border:"1px solid #1d2734",
borderRadius:16,
padding:"0 18px",
color:"white",
fontSize:16,
outline:"none",
}}
>

<option value="Транспорт">Транспорт</option>
<option value="Имущество">Имущество</option>
<option value="Вирты">Вирты</option>
<option value="Аксессуары">Аксессуары</option>

</select>

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
defaultValue={String(product.server)}
style={{
width:"100%",
height:56,
background:"#0d1219",
border:"1px solid #1d2734",
borderRadius:16,
padding:"0 18px",
color:"white",
fontSize:16,
outline:"none",
}}
>

{Array.from({ length:21 },(_,i)=>(

<option key={i+1} value={i+1}>
{String(i+1).padStart(2,"0")}
</option>

))}

</select>

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
}}
>

{state.error}

</div>

)}

<button
className="orangeButton"
type="submit"
disabled={isPending}
style={{
opacity: isPending ? 0.6 : 1,
}}
>

{isPending ? "Сохранение..." : "Сохранить изменения"}

</button>

</form>

);

}
