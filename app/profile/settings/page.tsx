import {
getServerSession,
} from "next-auth";

import { authOptions }
from "@/lib/auth";

import { redirect }
from "next/navigation";

import { prisma }
from "@/lib/prisma";

import SettingsForm
from "./SettingsForm";

export default async function SettingsPage(){

const session =
await getServerSession(authOptions);

if(!session?.user?.email){
redirect("/auth");
}

const user =
await prisma.user.findUnique({
where:{ email:session.user.email },
});

if(!user){
redirect("/auth");
}

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

Настройки профиля

</h1>

<p
style={{
fontSize:18,
color:"#7e8796",
maxWidth:760,
lineHeight:1.8,
}}
>

Управление аккаунтом
и данными профиля.

</p>

</div>

<div
style={{
display:"grid",
gridTemplateColumns:"320px 1fr",
gap:24,
alignItems:"start",
}}
>

<div
className="card"
style={{
padding:24,
position:"sticky",
top:110,
display:"flex",
flexDirection:"column",
gap:14,
}}
>

<div
className="card"
style={{
padding:"16px 18px",
background:"rgba(255,153,0,.08)",
border:"1px solid rgba(255,153,0,.16)",
}}
>

Основное

</div>

<div
className="card"
style={{
padding:"16px 18px",
color:"#7e8796",
}}
>

Безопасность

</div>

<div
className="card"
style={{
padding:"16px 18px",
color:"#7e8796",
}}
>

Уведомления

</div>

<div
className="card"
style={{
padding:"16px 18px",
color:"#7e8796",
}}
>

Приватность

</div>

</div>

<SettingsForm
username={user.username}
email={user.email}
/>

</div>

</main>

);

}
