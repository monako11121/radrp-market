"use client";

import { useActionState } from "react";
import { finalizeDeal, returnToProgress } from "@/app/actions/disputes";

type UserDisputeActionsProps = {
dealId: string;
};

export default function UserDisputeActions({
dealId,
}: UserDisputeActionsProps){

const [doneState, doneAction, donePending] =
useActionState(finalizeDeal, null);

const [returnState, returnAction, returnPending] =
useActionState(returnToProgress, null);

const isPending = donePending || returnPending;

const success =
doneState?.success || returnState?.success;

return(

<div>

{(doneState?.error || returnState?.error) && (

<div
style={{
padding:"12px 16px",
borderRadius:14,
background:"rgba(239,68,68,.12)",
border:"1px solid rgba(239,68,68,.22)",
color:"#ef4444",
fontSize:14,
marginBottom:16,
}}
>

{doneState?.error ?? returnState?.error}

</div>

)}

{success && (

<div
style={{
padding:"12px 16px",
borderRadius:14,
background:"rgba(34,197,94,.10)",
border:"1px solid rgba(34,197,94,.20)",
color:"#22c55e",
fontSize:14,
marginBottom:16,
}}
>

{success}

</div>

)}

{!success && (

<div
style={{
display:"flex",
gap:14,
flexWrap:"wrap",
}}
>

<form action={doneAction}>

<input
type="hidden"
name="dealId"
value={dealId}
/>

<button
className="orangeButton"
type="submit"
disabled={isPending}
style={{
opacity: isPending ? 0.6 : 1,
}}
>

{donePending ? "Обработка..." : "Завершить и оплатить"}

</button>

</form>

<form action={returnAction}>

<input
type="hidden"
name="dealId"
value={dealId}
/>

<button
className="darkButton"
type="submit"
disabled={isPending}
style={{
opacity: isPending ? 0.6 : 1,
}}
>

{returnPending ? "Обработка..." : "Вернуть в работу"}

</button>

</form>

</div>

)}

</div>

);

}
