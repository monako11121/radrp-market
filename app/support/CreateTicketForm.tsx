"use client";

import { useActionState, useState } from "react";
import { createTicket } from "@/app/actions/support";

export default function CreateTicketForm() {
  const [open, setOpen]     = useState(false);
  const [state, action, pending] = useActionState(createTicket, null);

  return (
    <div style={{ marginBottom: 28 }}>
      {!open ? (
        <button
          className="orangeButton"
          onClick={() => setOpen(true)}
          style={{ height: 48 }}
        >
          + Создать обращение
        </button>
      ) : (
        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>
            Новое обращение
          </h2>

          <form action={action} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, color: "#7e8796", display: "block", marginBottom: 6 }}>
                Тема
              </label>
              <input
                name="subject"
                required
                placeholder="Кратко опишите проблему"
                style={{
                  width: "100%", height: 48,
                  background: "#0d1219", border: "1px solid #1d2734",
                  borderRadius: 12, padding: "0 16px",
                  color: "white", fontSize: 15, outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, color: "#7e8796", display: "block", marginBottom: 6 }}>
                Описание проблемы
              </label>
              <textarea
                name="message"
                required
                rows={5}
                placeholder="Подробно опишите ситуацию..."
                style={{
                  width: "100%",
                  background: "#0d1219", border: "1px solid #1d2734",
                  borderRadius: 12, padding: "12px 16px",
                  color: "white", fontSize: 15, outline: "none",
                  resize: "vertical", fontFamily: "inherit", lineHeight: 1.6,
                }}
              />
            </div>

            {state?.error && (
              <div style={{
                padding: "12px 16px", borderRadius: 10,
                background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)",
                color: "#ef4444", fontSize: 14,
              }}>
                {state.error}
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="submit"
                className="orangeButton"
                disabled={pending}
                style={{ height: 44 }}
              >
                {pending ? "Отправка..." : "Отправить"}
              </button>
              <button
                type="button"
                className="darkButton"
                onClick={() => setOpen(false)}
                style={{ height: 44 }}
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
