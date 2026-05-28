"use client";

import {
useRouter,
} from "next/navigation";

import {
useRef,
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
)=>Promise<void>;
}){

const router =
useRouter();

const formRef =
useRef<HTMLFormElement>(null);

const [isPending,startTransition] =
useTransition();

return(

<form
ref={formRef}
action={async(formData)=>{

const text =
String(formData.get("text"));

startTransition(async()=>{

await sendMessage(
dealId,
text
);

formRef.current?.reset();

router.refresh();

});

}}
style={{
padding:24,
borderTop:"1px solid rgba(255,255,255,.06)",
display:"flex",
gap:16,
}}
>

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