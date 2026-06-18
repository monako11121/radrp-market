"use client";

import { useActionState } from "react";
import { deleteProduct } from "@/app/actions/products";

export default function DeleteProductButton({
productId,
}: {
productId: string;
}){

const [state,formAction,isPending] =
useActionState(deleteProduct, null);

return(

<div style={{ flex:1 }}>

<form action={formAction}>

<input
type="hidden"
name="productId"
value={productId}
/>

<button
type="submit"
disabled={isPending}
style={{
width:"100%",
height:46,
borderRadius:14,
border:"1px solid rgba(239,68,68,.22)",
background:"rgba(239,68,68,.12)",
color:"#ef4444",
fontWeight:700,
cursor: isPending ? "not-allowed" : "pointer",
opacity: isPending ? 0.6 : 1,
}}
>

{isPending ? "Удаление..." : "Удалить"}

</button>

</form>

{state?.error && (

<div
style={{
marginTop:10,
padding:"10px 14px",
borderRadius:12,
background:"rgba(239,68,68,.10)",
border:"1px solid rgba(239,68,68,.20)",
color:"#ef4444",
fontSize:13,
lineHeight:1.5,
}}
>

{state.error}

</div>

)}

</div>

);

}
