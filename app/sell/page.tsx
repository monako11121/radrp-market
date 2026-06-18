import { getServerSession }
from "next-auth";

import { authOptions }
from "@/lib/auth";

import { redirect }
from "next/navigation";

import SellForm
from "./SellForm";

export default async function SellPage(){

const session =
await getServerSession(authOptions);

if(!session?.user?.email){
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

<SellForm />

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
