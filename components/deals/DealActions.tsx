"use client";

import { useActionState } from "react";
import {
completeDeal,
updateDealStatus,
payForDeal,
openDispute,
} from "@/app/actions/deals";

type DealActionsProps = {
dealId: string;
status: string;
isBuyer: boolean;
isFrozen: boolean;
};

export default function DealActions({
dealId,
status,
isBuyer,
isFrozen,
}: DealActionsProps){

const [completeState, completeAction, completeIsPending] =
useActionState(completeDeal, null);

const [payState, payAction, payIsPending] =
useActionState(payForDeal, null);

const [disputeState, disputeAction, disputeIsPending] =
useActionState(openDispute, null);

const acceptAction =
updateDealStatus.bind(null, dealId, "IN_PROGRESS") as (formData: FormData) => void;

if(status === "DONE"){
return null;
}

if(status === "DISPUTE"){
return(

<div
style={{
padding:"12px 18px",
borderRadius:14,
background:"rgba(239,68,68,.10)",
border:"1px solid rgba(239,68,68,.20)",
color:"#ef4444",
fontWeight:600,
fontSize:14,
marginBottom:20,
}}
>

Спор открыт. Ожидайте решения администратора.

</div>

);
}

const error = completeState?.error ?? payState?.error ?? disputeState?.error;

return(

<div>

{/* Баннер для покупателя: деньги ещё не заморожены */}
{!isFrozen && isBuyer && (

<div
style={{
padding:"12px 18px",
borderRadius:14,
background:"rgba(255,154,0,.08)",
border:"1px solid rgba(255,154,0,.2)",
color:"#ffb340",
fontSize:14,
marginBottom:16,
}}
>
💬 Вы открыли чат с продавцом. Чтобы продавец принял сделку — нажмите <strong>«Оплатить»</strong> и средства будут заморожены гарантом.
</div>

)}

{/* Баннер для продавца: покупатель в режиме чата, не оплатил */}
{!isFrozen && !isBuyer && (

<div
style={{
padding:"14px 18px",
borderRadius:14,
background:"rgba(100,116,139,.08)",
border:"1px solid rgba(100,116,139,.2)",
color:"#94a3b8",
fontSize:14,
marginBottom:16,
lineHeight:1.6,
}}
>
💬 Покупатель открыл чат, но <strong style={{ color:"#ffb340" }}>ещё не оплатил</strong> сделку. Вы можете общаться, но принять сделку и получить деньги можно только после оплаты покупателем.
</div>

)}

<div
style={{
display:"flex",
gap:14,
marginBottom: error ? 14 : 20,
flexWrap:"wrap",
}}
>

{/* Покупатель: оплатить незамороженную сделку */}
{!isFrozen && isBuyer && (

<form action={payAction}>

<input
type="hidden"
name="dealId"
value={dealId}
/>

<button
type="submit"
className="orangeButton"
disabled={payIsPending}
style={{
opacity: payIsPending ? 0.6 : 1,
}}
>

{payIsPending ? "Оплата..." : "Оплатить"}

</button>

</form>

)}

{/* Продавец: принять замороженную сделку */}
{status === "WAITING" && !isBuyer && isFrozen && (

<form action={acceptAction}>

<button
className="darkButton"
type="submit"
>

Принять

</button>

</form>

)}

{/* Покупатель: завершить сделку в работе */}
{status === "IN_PROGRESS" && isBuyer && (

<form action={completeAction}>

<input
type="hidden"
name="dealId"
value={dealId}
/>

<button
className="orangeButton"
type="submit"
disabled={completeIsPending}
style={{
opacity: completeIsPending ? 0.6 : 1,
}}
>

{completeIsPending ? "Завершение..." : "Завершить"}

</button>

</form>

)}

{/* Спор: только для оплаченных сделок */}
{(status === "WAITING" || status === "IN_PROGRESS") && isFrozen && (

<form action={disputeAction}>

<input type="hidden" name="dealId" value={dealId} />

<button
type="submit"
disabled={disputeIsPending}
style={{
height:52,
padding:"0 22px",
borderRadius:16,
border:"1px solid rgba(239,68,68,.25)",
background:"rgba(239,68,68,.12)",
color:"#ef4444",
fontWeight:700,
cursor:"pointer",
opacity: disputeIsPending ? 0.6 : 1,
}}
>

{disputeIsPending ? "Открытие..." : "Спор"}

</button>

</form>

)}

</div>

{error && (

<div
style={{
padding:"12px 16px",
borderRadius:14,
background:"rgba(239,68,68,.12)",
border:"1px solid rgba(239,68,68,.22)",
color:"#ef4444",
fontSize:14,
marginBottom:20,
}}
>

{error}

</div>

)}

</div>

);

}
