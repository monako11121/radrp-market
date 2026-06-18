"use client";

import { useActionState, useState } from "react";
import { formatMoney } from "@/lib/formatMoney";
import { resolveDisputeBuyer, resolveDisputeSeller } from "@/app/actions/admin";

type Message = {
  id: string;
  text: string;
  createdAt: Date;
  sender: { username: string };
};

type AdminDecisionInfo = {
  decision:   string;
  adminEmail: string;
  amount:     number;
  note:       string | null;
  createdAt:  Date;
} | null;

type Props = {
  dealId:         string;
  productTitle:   string;
  dealPrice:      number;
  buyerUsername:  string;
  buyerEmail:     string;
  sellerUsername: string;
  sellerEmail:    string;
  isFrozen:       boolean;
  dealCreatedAt:  Date;
  disputedAt:     Date | null;
  messages:       Message[];
  resolved:       boolean;
  adminDecision:  AdminDecisionInfo;
};

function fmtDate(d: Date){
  return new Date(d).toLocaleString("ru-RU", {
    day:"2-digit", month:"2-digit", year:"numeric",
    hour:"2-digit", minute:"2-digit",
  });
}

function fmtShort(d: Date){
  return new Date(d).toLocaleString("ru-RU", {
    day:"2-digit", month:"2-digit",
    hour:"2-digit", minute:"2-digit",
  });
}

export default function DisputeCard({
  dealId,
  productTitle,
  dealPrice,
  buyerUsername,
  buyerEmail,
  sellerUsername,
  sellerEmail,
  isFrozen,
  dealCreatedAt,
  disputedAt,
  messages,
  resolved,
  adminDecision,
}: Props){

  const [note, setNote] = useState("");
  const [showAll, setShowAll] = useState(false);

  const [buyerState,  buyerAction,  buyerPending]  = useActionState(resolveDisputeBuyer,  null);
  const [sellerState, sellerAction, sellerPending] = useActionState(resolveDisputeSeller, null);

  const isPending  = buyerPending || sellerPending;
  const isDone     = resolved || !!buyerState?.success || !!sellerState?.success;
  const error      = buyerState?.error ?? sellerState?.error;
  const successMsg = buyerState?.success ?? sellerState?.success;

  const displayedMsgs = showAll ? messages : messages.slice(-5);

  return(
    <div
      className="card"
      style={{
        padding: 0,
        overflow: "hidden",
        border: resolved
          ? "1px solid rgba(255,255,255,.06)"
          : "1px solid rgba(239,68,68,.25)",
      }}
    >

      {/* ── Шапка ── */}
      <div
        style={{
          padding: "18px 28px",
          borderBottom: "1px solid #1d2734",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
          background: resolved ? "rgba(255,255,255,.01)" : "rgba(239,68,68,.04)",
        }}
      >

        <div style={{ display:"flex", alignItems:"center", gap:14 }}>

          <div
            style={{
              width:42, height:42, borderRadius:12, flexShrink:0,
              background: resolved ? "rgba(34,197,94,.12)" : "rgba(239,68,68,.15)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
            }}
          >
            {resolved ? "✓" : "⚠"}
          </div>

          <div>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:3 }}>{productTitle}</div>
            <div style={{ fontSize:12, color:"#7e8796", display:"flex", gap:14, flexWrap:"wrap" }}>
              <span>Сделка: {fmtDate(dealCreatedAt)}</span>
              {disputedAt && <span style={{ color:"#ef4444" }}>Спор: {fmtDate(disputedAt)}</span>}
            </div>
          </div>

        </div>

        <div style={{ display:"flex", alignItems:"center", gap:12 }}>

          {/* Статус заморозки */}
          <div
            style={{
              padding:"5px 12px", borderRadius:999, fontSize:12, fontWeight:700,
              background: isFrozen ? "rgba(255,154,0,.12)" : "rgba(100,100,100,.12)",
              color:       isFrozen ? "#ff9a00"             : "#7e8796",
              border:      isFrozen ? "1px solid rgba(255,154,0,.3)" : "1px solid #1d2734",
            }}
          >
            {isFrozen ? "💰 Заморожено" : "Не заморожено"}
          </div>

          <div
            style={{
              padding:"5px 14px", borderRadius:999, fontSize:12, fontWeight:700,
              background: resolved ? "rgba(34,197,94,.12)" : "rgba(239,68,68,.15)",
              color:       resolved ? "#22c55e"             : "#ef4444",
            }}
          >
            {resolved ? "РЕШЕНО" : "DISPUTE"}
          </div>

          <div style={{ fontSize:26, fontWeight:900, color:"#ff9a00" }}>
            {formatMoney(dealPrice)}
          </div>

        </div>

      </div>

      {/* ── Тело ── */}
      <div style={{ padding:"22px 28px", display:"flex", flexDirection:"column", gap:20 }}>

        {/* Участники */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>

          <div
            style={{
              padding:"14px 18px", borderRadius:14,
              background:"rgba(34,197,94,.06)", border:"1px solid rgba(34,197,94,.15)",
            }}
          >
            <div style={{ fontSize:11, color:"#22c55e", fontWeight:700, marginBottom:6, letterSpacing:.5 }}>
              ПОКУПАТЕЛЬ
            </div>
            <div style={{ fontWeight:700, fontSize:16, marginBottom:2 }}>{buyerUsername}</div>
            <div style={{ fontSize:12, color:"#7e8796" }}>{buyerEmail}</div>
          </div>

          <div
            style={{
              padding:"14px 18px", borderRadius:14,
              background:"rgba(255,154,0,.06)", border:"1px solid rgba(255,154,0,.15)",
            }}
          >
            <div style={{ fontSize:11, color:"#ff9a00", fontWeight:700, marginBottom:6, letterSpacing:.5 }}>
              ПРОДАВЕЦ
            </div>
            <div style={{ fontWeight:700, fontSize:16, marginBottom:2 }}>{sellerUsername}</div>
            <div style={{ fontSize:12, color:"#7e8796" }}>{sellerEmail}</div>
          </div>

        </div>

        {/* История переписки */}
        <div>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
            <div style={{ fontSize:13, fontWeight:600, color:"#7e8796" }}>
              Переписка ({messages.length} сообщ.)
            </div>
            {messages.length > 5 && (
              <button
                type="button"
                onClick={()=>setShowAll(v=>!v)}
                style={{
                  fontSize:12, color:"#ff9a00", background:"none",
                  border:"none", cursor:"pointer", padding:0,
                }}
              >
                {showAll ? "Скрыть" : `Показать все ${messages.length}`}
              </button>
            )}
          </div>

          {messages.length === 0 ? (

            <div
              style={{
                padding:"14px 18px", borderRadius:12,
                background:"rgba(255,255,255,.02)", border:"1px solid #1d2734",
                color:"#4a5568", fontSize:14,
              }}
            >
              Переписки нет.
            </div>

          ) : (

            <div
              style={{
                background:"rgba(255,255,255,.02)", border:"1px solid #1d2734",
                borderRadius:14, padding:"14px 16px",
                display:"flex", flexDirection:"column", gap:12,
                maxHeight: showAll ? 380 : 200,
                overflowY:"auto",
              }}
            >
              {displayedMsgs.map((msg)=>(
                <div key={msg.id}>
                  <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:2 }}>
                    <span style={{ color:"#ff9a00", fontWeight:700, fontSize:13 }}>
                      {msg.sender.username}
                    </span>
                    <span style={{ fontSize:11, color:"#4a5568" }}>
                      {fmtShort(msg.createdAt)}
                    </span>
                  </div>
                  <div style={{ fontSize:14, color:"#b0bac8", lineHeight:1.6, paddingLeft:2 }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

          )}

        </div>

        {/* Решение (показывается только для завершённых из журнала) */}
        {isDone && adminDecision && (
          <div
            style={{
              padding:"16px 20px", borderRadius:14,
              background:"rgba(34,197,94,.06)", border:"1px solid rgba(34,197,94,.2)",
            }}
          >
            <div style={{ fontSize:13, color:"#22c55e", fontWeight:700, marginBottom:8 }}>
              Решение администратора
            </div>
            <div style={{ fontSize:15, fontWeight:800, marginBottom:6 }}>
              {adminDecision.decision === "BUYER"
                ? `↩ Деньги возвращены покупателю — ${buyerUsername}`
                : `↪ Деньги переданы продавцу — ${sellerUsername}`}
            </div>
            <div style={{ fontSize:14, color:"#ff9a00", marginBottom:adminDecision.note ? 6 : 0 }}>
              {formatMoney(adminDecision.amount)}
              {adminDecision.decision === "SELLER" && " (после комиссии 5%)"}
            </div>
            {adminDecision.note && (
              <div style={{ fontSize:14, color:"#b0bac8", marginBottom:8 }}>
                💬 {adminDecision.note}
              </div>
            )}
            <div style={{ fontSize:12, color:"#4a5568" }}>
              {adminDecision.adminEmail} · {fmtDate(adminDecision.createdAt)}
            </div>
          </div>
        )}

        {/* Сообщение об успехе в текущей сессии (до перезагрузки) */}
        {successMsg && !adminDecision && (
          <div
            style={{
              padding:"12px 16px", borderRadius:14,
              background:"rgba(34,197,94,.10)", border:"1px solid rgba(34,197,94,.20)",
              color:"#22c55e", fontSize:14,
            }}
          >
            {successMsg}
          </div>
        )}

        {/* Ошибка */}
        {error && (
          <div
            style={{
              padding:"12px 16px", borderRadius:14,
              background:"rgba(239,68,68,.12)", border:"1px solid rgba(239,68,68,.22)",
              color:"#ef4444", fontSize:14,
            }}
          >
            {error}
          </div>
        )}

        {/* Форма решения (только для открытых споров) */}
        {!isDone && (
          <div style={{ borderTop:"1px solid #1d2734", paddingTop:20 }}>

            <div style={{ fontSize:13, color:"#7e8796", fontWeight:600, marginBottom:12 }}>
              Решение администратора
            </div>

            <textarea
              value={note}
              onChange={e=>setNote(e.target.value)}
              placeholder="Комментарий к решению (необязательно)..."
              rows={2}
              style={{
                width:"100%", background:"#0d1219",
                border:"1px solid #1d2734", borderRadius:12,
                padding:"10px 14px", color:"white",
                fontSize:14, resize:"vertical", outline:"none",
                marginBottom:14, boxSizing:"border-box",
              }}
            />

            <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>

              {/* Вернуть покупателю */}
              <form action={buyerAction}>
                <input type="hidden" name="dealId" value={dealId} />
                <input type="hidden" name="note"   value={note} />
                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    height:52, padding:"0 24px", borderRadius:16,
                    border:"1px solid rgba(34,197,94,.35)",
                    background:"rgba(34,197,94,.12)", color:"#22c55e",
                    fontWeight:700, fontSize:15,
                    cursor: isPending ? "not-allowed" : "pointer",
                    opacity: isPending ? 0.6 : 1,
                    display:"flex", alignItems:"center", gap:8,
                  }}
                >
                  {buyerPending ? "Обработка..." : `↩ Вернуть покупателю ${formatMoney(dealPrice)}`}
                </button>
              </form>

              {/* Передать продавцу */}
              <form action={sellerAction}>
                <input type="hidden" name="dealId" value={dealId} />
                <input type="hidden" name="note"   value={note} />
                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    height:52, padding:"0 24px", borderRadius:16,
                    border:"1px solid rgba(255,154,0,.35)",
                    background:"rgba(255,154,0,.12)", color:"#ff9a00",
                    fontWeight:700, fontSize:15,
                    cursor: isPending ? "not-allowed" : "pointer",
                    opacity: isPending ? 0.6 : 1,
                    display:"flex", alignItems:"center", gap:8,
                  }}
                >
                  {sellerPending ? "Обработка..." : `↪ Передать продавцу ${formatMoney(dealPrice)}`}
                </button>
              </form>

            </div>

            <div style={{ fontSize:12, color:"#4a5568", marginTop:10 }}>
              При решении в пользу продавца будет удержана комиссия 5%.
            </div>

          </div>
        )}

      </div>

    </div>
  );

}
