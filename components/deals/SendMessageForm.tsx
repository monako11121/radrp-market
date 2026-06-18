"use client";

import {
useRouter,
} from "next/navigation";

import {
useRef,
useState,
useTransition,
} from "react";

export default function SendMessageForm({
dealId,
sendMessage,
}:{
dealId:string;

sendMessage:(
dealId:string,
text:string,
)=>Promise<{ error: string } | undefined>;
}){

const router =
useRouter();

const formRef =
useRef<HTMLFormElement>(null);

const [isPending,startTransition] =
useTransition();

const [msgError, setMsgError] =
useState<string | null>(null);

return(

<form
ref={formRef}
action={async(formData)=>{

const text =
String(formData.get("text"));

startTransition(async()=>{

setMsgError(null);

const result = await sendMessage(dealId, text);

if(result?.error){
setMsgError(result.error);
return;
}

formRef.current?.reset();

router.refresh();

});

}}
style={{
position:"relative",
padding:24,
borderTop:"1px solid rgba(255,255,255,.06)",
display:"flex",
gap:16,
}}
>

{msgError && (
<div style={{
position:"absolute",
bottom:"100%",
left:24,
right:24,
marginBottom:8,
padding:"10px 16px",
borderRadius:12,
background:"rgba(239,68,68,.12)",
border:"1px solid rgba(239,68,68,.22)",
color:"#ef4444",
fontSize:13,
}}>
{msgError}
</div>
)}

<input
name="text"
placeholder="Введите сообщение..."
style={{
flex:1,
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

<button
type="submit"
className="orangeButton"
style={{
height:56,
width:160,
opacity:isPending ? .7 : 1,
}}
>

{isPending
? "..."
: "Отправить"}

</button>

</form>

);
}