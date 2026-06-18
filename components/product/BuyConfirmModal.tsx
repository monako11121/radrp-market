"use client";

import { useActionState, useState, useEffect } from "react";
import { createDeal } from "@/app/actions/deals";
import { formatMoney } from "@/lib/formatMoney";

type Props = {
  productId:    string;
  productTitle: string;
  productPrice: number;
};

export default function BuyConfirmModal({
  productId,
  productTitle,
  productPrice,
}: Props){

  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createDeal, null);

  // Закрыть по Escape
  useEffect(()=>{
    if(!open) return;
    const handler = (e: KeyboardEvent) => {
      if(e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Блокировать скролл страницы когда модалка открыта
  useEffect(()=>{
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return(
    <>

      {/* Кнопка-триггер */}
      <button
        type="button"
        className="orangeButton"
        style={{ width:"100%" }}
        onClick={()=>setOpen(true)}
      >
        Купить
      </button>

      {/* Оверлей + модалка */}
      {open && (
        <div
          onClick={()=>setOpen(false)}
          style={{
            position:"fixed",
            inset:0,
            zIndex:1000,
            background:"rgba(0,0,0,.72)",
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            padding:"16px",
          }}
        >
          <div
            onClick={e=>e.stopPropagation()}
            style={{
              background:"#121821",
              border:"1px solid #1d2734",
              borderRadius:24,
              padding:"32px 28px",
              width:"100%",
              maxWidth:460,
              boxShadow:"0 24px 80px rgba(0,0,0,.6)",
            }}
          >

            {/* Заголовок */}
            <div
              style={{
                display:"flex",
                alignItems:"center",
                justifyContent:"space-between",
                marginBottom:24,
              }}
            >
              <h2 style={{ fontSize:22, fontWeight:900, margin:0 }}>
                Подтверждение покупки
              </h2>
              <button
                type="button"
                onClick={()=>setOpen(false)}
                style={{
                  width:36, height:36, borderRadius:10,
                  background:"rgba(255,255,255,.06)",
                  border:"none", color:"#7e8796",
                  fontSize:18, cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  flexShrink:0,
                }}
              >
                ✕
              </button>
            </div>

            {/* Карточка товара */}
            <div
              style={{
                padding:"16px 18px",
                borderRadius:14,
                background:"rgba(255,255,255,.03)",
                border:"1px solid #1d2734",
                marginBottom:20,
              }}
            >
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
                <div>
                  <div style={{ fontSize:12, color:"#7e8796", marginBottom:4 }}>Товар</div>
                  <div style={{ fontWeight:700, fontSize:16 }}>{productTitle}</div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:12, color:"#7e8796", marginBottom:4 }}>Цена</div>
                  <div style={{ fontSize:22, fontWeight:900, color:"#ff9a00" }}>
                    {formatMoney(productPrice)}
                  </div>
                </div>
              </div>
            </div>

            {/* Гарантии */}
            <div
              style={{
                padding:"14px 18px",
                borderRadius:14,
                background:"rgba(34,197,94,.05)",
                border:"1px solid rgba(34,197,94,.15)",
                marginBottom:24,
              }}
            >
              <div style={{ fontSize:13, color:"#22c55e", fontWeight:700, marginBottom:10 }}>
                После оплаты:
              </div>
              {[
                "деньги будут заморожены гарантом",
                "продавец не получит их сразу",
                "деньги будут храниться до завершения сделки",
                "при проблеме можно открыть спор",
              ].map((line)=>(
                <div
                  key={line}
                  style={{
                    display:"flex", alignItems:"flex-start", gap:8,
                    fontSize:14, color:"#b0bac8", marginBottom:6, lineHeight:1.5,
                  }}
                >
                  <span style={{ color:"#22c55e", flexShrink:0, marginTop:1 }}>✓</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>

            {/* Ошибка */}
            {state?.error && (
              <div
                style={{
                  padding:"12px 16px",
                  borderRadius:12,
                  background:"rgba(239,68,68,.12)",
                  border:"1px solid rgba(239,68,68,.25)",
                  color:"#ef4444",
                  fontSize:14,
                  marginBottom:18,
                }}
              >
                {state.error}
              </div>
            )}

            {/* Кнопки */}
            <div style={{ display:"flex", gap:12, flexDirection:"column" }}>

              <form action={formAction} style={{ width:"100%" }}>
                <input type="hidden" name="productId" value={productId} />
                <button
                  type="submit"
                  className="orangeButton"
                  disabled={isPending}
                  style={{
                    width:"100%",
                    opacity: isPending ? 0.7 : 1,
                  }}
                >
                  {isPending ? "Обработка..." : `Подтвердить и заморозить ${formatMoney(productPrice)}`}
                </button>
              </form>

              <button
                type="button"
                className="darkButton"
                style={{ width:"100%" }}
                onClick={()=>setOpen(false)}
                disabled={isPending}
              >
                Отмена
              </button>

            </div>

          </div>
        </div>
      )}

    </>
  );
}
