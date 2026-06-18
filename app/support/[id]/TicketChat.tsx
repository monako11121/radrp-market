"use client";

import { useActionState, useEffect, useRef } from "react";
import { sendTicketMessage, updateTicketStatus } from "@/app/actions/support";

type Msg = {
  id:        string;
  message:   string;
  createdAt: string;
  userId:    string;
  username:  string;
  isAdmin:   boolean;
};

const STATUS_OPTIONS = [
  { value: "OPEN",        label: "Открыт"      },
  { value: "IN_PROGRESS", label: "В обработке" },
  { value: "CLOSED",      label: "Закрыт"      },
];

export default function TicketChat({
  ticketId,
  ticketStatus,
  currentUserId,
  isCurrentUserAdmin,
  messages,
}: {
  ticketId:           string;
  ticketStatus:       string;
  currentUserId:      string;
  isCurrentUserAdmin: boolean;
  messages:           Msg[];
}) {
  const isSupportAdmin = isCurrentUserAdmin;
  const bottomRef = useRef<HTMLDivElement>(null);

  const [msgState,    msgAction,    msgPending]    = useActionState(sendTicketMessage, null);
  const [statusState, statusAction, statusPending] = useActionState(updateTicketStatus, null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const closed = ticketStatus === "CLOSED";

  return (
    <div>
      {/* Лента сообщений */}
      <div
        className="card"
        style={{
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          marginBottom: 16,
          minHeight: 220,
          maxHeight: 540,
          overflowY: "auto",
          background: "rgba(10,15,22,.5)",
        }}
      >
        {messages.map(m => {
          const isOwn = m.userId === currentUserId;
          return (
            <div
              key={m.id}
              style={{
                display: "flex",
                flexDirection: isOwn ? "row-reverse" : "row",
                alignItems: "flex-end",
                gap: 10,
              }}
            >
              {/* Аватар */}
              <div style={{
                width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                background: m.isAdmin
                  ? "linear-gradient(135deg,#ef4444,#b91c1c)"
                  : "linear-gradient(135deg,#202938,#121821)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 700,
              }}>
                {m.isAdmin ? "⚙" : m.username[0].toUpperCase()}
              </div>

              <div style={{ maxWidth: "72%" }}>
                {/* Автор + время */}
                <div style={{
                  fontSize: 11, color: "#4a5568", marginBottom: 4,
                  textAlign: isOwn ? "right" : "left",
                }}>
                  {m.isAdmin ? "Поддержка" : m.username}
                  {" · "}
                  {new Date(m.createdAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                  {" "}
                  {new Date(m.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                </div>

                {/* Пузырь */}
                <div style={{
                  padding: "12px 16px",
                  borderRadius: isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: isOwn
                    ? "linear-gradient(135deg,#ff9a00,#ff6000)"
                    : m.isAdmin
                    ? "rgba(239,68,68,.12)"
                    : "rgba(255,255,255,.05)",
                  border: (!isOwn && m.isAdmin) ? "1px solid rgba(239,68,68,.2)" : undefined,
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: "white",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}>
                  {m.message}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Поле ввода */}
      {!closed ? (
        <form action={msgAction}>
          <input type="hidden" name="ticketId" value={ticketId} />
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <textarea
              name="message"
              required
              rows={2}
              placeholder="Написать сообщение..."
              style={{
                flex: 1,
                background: "#0d1219", border: "1px solid #1d2734",
                borderRadius: 14, padding: "12px 16px",
                color: "white", fontSize: 15, outline: "none",
                resize: "none", fontFamily: "inherit", lineHeight: 1.6,
              }}
            />
            <button
              type="submit"
              className="orangeButton"
              disabled={msgPending}
              style={{ height: 50, padding: "0 22px", flexShrink: 0 }}
            >
              {msgPending ? "..." : "↑"}
            </button>
          </div>
          {msgState?.error && (
            <div style={{ color: "#ef4444", fontSize: 13, marginTop: 8 }}>
              {msgState.error}
            </div>
          )}
        </form>
      ) : (
        <div style={{
          padding: "14px 18px", borderRadius: 12, textAlign: "center",
          background: "rgba(126,135,150,.08)", border: "1px solid rgba(126,135,150,.15)",
          color: "#7e8796", fontSize: 14,
        }}>
          Обращение закрыто
        </div>
      )}

      {/* Блок смены статуса — только для админа */}
      {isSupportAdmin && (
        <div className="card" style={{ padding: "18px 22px", marginTop: 16 }}>
          <div style={{ fontSize: 13, color: "#7e8796", marginBottom: 10 }}>Статус обращения</div>
          <form action={statusAction} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <input type="hidden" name="ticketId" value={ticketId} />
            <select
              name="status"
              defaultValue={ticketStatus}
              style={{
                height: 40, padding: "0 14px", borderRadius: 10,
                background: "#0d1219", border: "1px solid #1d2734",
                color: "white", fontSize: 14, outline: "none", cursor: "pointer",
              }}
            >
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              type="submit"
              className="darkButton"
              disabled={statusPending}
              style={{ height: 40, fontSize: 13 }}
            >
              {statusPending ? "Сохранение..." : "Сохранить"}
            </button>
            {statusState?.error   && <span style={{ color: "#ef4444",  fontSize: 13 }}>{statusState.error}</span>}
            {statusState?.success && <span style={{ color: "#22c55e",  fontSize: 13 }}>Сохранено</span>}
          </form>
        </div>
      )}
    </div>
  );
}
