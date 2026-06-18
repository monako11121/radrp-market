"use client";

import { useActionState } from "react";
import { updateUsername } from "@/app/actions/user";

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

export default function SettingsForm({
username,
email,
}: {
username: string;
email: string;
}){

const [state,formAction,isPending] =
useActionState(updateUsername, null);

return(

<div
className="card"
style={{
padding:32,
}}
>

<div
style={{
display:"flex",
alignItems:"center",
gap:24,
marginBottom:36,
}}
>

<div
style={{
width:100,
height:100,
borderRadius:"50%",
background:
"linear-gradient(180deg,#202938,#121821)",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:34,
fontWeight:800,
flexShrink:0,
}}
>

{username[0].toUpperCase()}

</div>

<div>

<h2
style={{
fontSize:32,
fontWeight:800,
marginBottom:4,
}}
>

{username}

</h2>

<p
style={{
color:"#7e8796",
fontSize:14,
}}
>

{email}

</p>

</div>

</div>

<form
action={formAction}
style={{
display:"flex",
flexDirection:"column",
gap:20,
}}
>

<div
className="settingsGrid"
style={{
display:"grid",
gridTemplateColumns:"repeat(2,1fr)",
gap:20,
}}
>

<div>

<div style={labelStyle}>
Username
</div>

<input
name="username"
defaultValue={username}
required
style={inputStyle}
/>

</div>

<div>

<div style={labelStyle}>
Email
</div>

<input
value={email}
readOnly
style={{
...inputStyle,
opacity:0.5,
cursor:"not-allowed",
}}
/>

</div>

</div>

{state?.error && (

<div
style={{
padding:"12px 16px",
borderRadius:14,
background:"rgba(239,68,68,.12)",
border:"1px solid rgba(239,68,68,.22)",
color:"#ef4444",
fontSize:14,
}}
>

{state.error}

</div>

)}

{state?.success && (

<div
style={{
padding:"12px 16px",
borderRadius:14,
background:"rgba(34,197,94,.10)",
border:"1px solid rgba(34,197,94,.20)",
color:"#22c55e",
fontSize:14,
}}
>

{state.success}

</div>

)}

<div
style={{
display:"flex",
gap:16,
paddingTop:10,
}}
>

<button
type="submit"
className="orangeButton"
disabled={isPending}
style={{
height:58,
padding:"0 32px",
opacity: isPending ? 0.6 : 1,
}}
>

{isPending ? "Сохранение..." : "Сохранить изменения"}

</button>

<a href="/profile">

<button
type="button"
className="darkButton"
style={{
height:58,
padding:"0 32px",
}}
>

Отмена

</button>

</a>

</div>

</form>

</div>

);

}
