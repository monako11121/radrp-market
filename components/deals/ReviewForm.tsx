"use client";

import { useActionState, useState } from "react";
import { createReview } from "@/app/actions/reviews";

type ReviewFormProps = {
  dealId: string;
};

export default function ReviewForm({ dealId }: ReviewFormProps) {

  const [state, formAction, isPending] =
    useActionState(createReview, null);

  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);

  if (state?.success) {
    return (
      <div
        style={{
          padding: "14px 18px",
          borderRadius: 14,
          background: "rgba(34,197,94,.12)",
          border: "1px solid rgba(34,197,94,.25)",
          color: "#22c55e",
          fontWeight: 600,
          fontSize: 15,
        }}
      >
        Спасибо за отзыв!
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px 22px",
        borderRadius: 16,
        background: "rgba(255,154,0,.06)",
        border: "1px solid rgba(255,154,0,.18)",
      }}
    >

      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          marginBottom: 14,
          color: "#ffb340",
        }}
      >
        Оставить отзыв о продавце
      </div>

      <form action={formAction}>

        <input type="hidden" name="dealId" value={dealId} />
        <input type="hidden" name="rating" value={selected || ""} />

        {/* Звёзды */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 14,
          }}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setSelected(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              style={{
                fontSize: 28,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 2,
                color:
                  star <= (hovered || selected)
                    ? "#ff9a00"
                    : "#2d3748",
                transition: "color .12s",
              }}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          name="comment"
          placeholder="Комментарий (необязательно)..."
          rows={3}
          style={{
            width: "100%",
            background: "#0d1219",
            border: "1px solid #1d2734",
            borderRadius: 12,
            padding: "10px 14px",
            color: "white",
            fontSize: 14,
            resize: "vertical",
            outline: "none",
            marginBottom: 12,
            boxSizing: "border-box",
          }}
        />

        {state?.error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              background: "rgba(239,68,68,.12)",
              border: "1px solid rgba(239,68,68,.25)",
              color: "#ef4444",
              fontSize: 13,
              marginBottom: 12,
            }}
          >
            {state.error}
          </div>
        )}

        <button
          type="submit"
          className="orangeButton"
          disabled={isPending || selected === 0}
          style={{
            opacity: isPending || selected === 0 ? 0.5 : 1,
          }}
        >
          {isPending ? "Отправка..." : "Отправить отзыв"}
        </button>

      </form>

    </div>
  );
}
