"use client";

import { useActionState } from "react";
import {
  adminApproveWithdrawal,
  adminCompleteWithdrawal,
  adminFailWithdrawal,
} from "@/app/actions/payments";
import { formatMoney } from "@/lib/formatMoney";
import { useState }    from "react";

type Withdrawal = {
  id:         string;
  amount:     number;
  netAmount:  number;
  feeAmount:  number;
  method:     string;
  requisites: string | null;
  status:     string;
  failReason: string | null;
  createdAt:  Date;
  updatedAt:  Date;
  user: {
    username: string;
    email:    string;
  };
};

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "Ожидает",   color: "#ffb340" },
  APPROVED:  { label: "Одобрена",  color: "#22c55e" },
  COMPLETED: { label: "Выплачено", color: "#4ade80" },
  FAILED:    { label: "Отклонена", color: "#ef4444" },
  CANCELLED: { label: "Отменена",  color: "#6b7280" },
};

const METHOD_LABEL: Record<string, string> = {
  card:   "Карта",
  sbp:    "СБП",
  crypto: "Крипто",
  manual: "Ручной",
};

function ActionRow({ w }: { w: Withdrawal }) {
  const [approveState, approveAction, approvePending] = useActionState(adminApproveWithdrawal, null);
  const [payState,     payAction,     payPending]     = useActionState(adminCompleteWithdrawal, null);
  const [failState,    failAction,    failPending]    = useActionState(adminFailWithdrawal, null);
  const [reason, setReason] = useState("");

  const anyPending = approvePending || payPending || failPending;

  return (
    <div
      className="card"
      style={{ padding: 22, marginBottom: 14 }}
    >
      {/* Шапка карточки */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>{w.user.username}</div>
          <div style={{ fontSize: 13, color: "#7e8796" }}>{w.user.email}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#ff9a00" }}>{formatMoney(w.amount)}</div>
          {w.feeAmount > 0 && (
            <div style={{ fontSize: 12, color: "#7e8796" }}>
              комиссия {formatMoney(w.feeAmount)}, получит {formatMoney(w.netAmount)}
            </div>
          )}
        </div>
      </div>

      {/* Детали */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "8px 20px", marginBottom: 14, fontSize: 13 }}>
        <div>
          <span style={{ color: "#7e8796" }}>Метод: </span>
          <span>{METHOD_LABEL[w.method] ?? w.method}</span>
        </div>
        <div>
          <span style={{ color: "#7e8796" }}>Статус: </span>
          <span style={{ color: STATUS_LABEL[w.status]?.color ?? "white", fontWeight: 600 }}>
            {STATUS_LABEL[w.status]?.label ?? w.status}
          </span>
        </div>
        <div>
          <span style={{ color: "#7e8796" }}>Дата: </span>
          <span>{new Date(w.createdAt).toLocaleString("ru-RU")}</span>
        </div>
        {w.failReason && (
          <div style={{ gridColumn: "1 / -1" }}>
            <span style={{ color: "#7e8796" }}>Причина: </span>
            <span style={{ color: "#ef4444" }}>{w.failReason}</span>
          </div>
        )}
      </div>

      {/* Реквизиты */}
      {w.requisites && (
        <div style={{
          padding: "10px 14px", borderRadius: 10, marginBottom: 14,
          background: "rgba(255,255,255,.04)", border: "1px solid #1d2734",
          fontSize: 14, wordBreak: "break-all",
        }}>
          <span style={{ color: "#7e8796", fontSize: 12 }}>Реквизиты: </span>
          {w.requisites}
        </div>
      )}

      {/* Сообщение об успехе / ошибке */}
      {(approveState?.success || payState?.success || failState?.success) && (
        <div style={{ padding: "10px 14px", borderRadius: 10, marginBottom: 12, background: "rgba(34,197,94,.08)", border: "1px solid rgba(34,197,94,.2)", color: "#22c55e", fontSize: 14 }}>
          ✓ {approveState?.success ?? payState?.success ?? failState?.success}
        </div>
      )}
      {(approveState?.error || payState?.error || failState?.error) && (
        <div style={{ padding: "10px 14px", borderRadius: 10, marginBottom: 12, background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", color: "#ef4444", fontSize: 14 }}>
          {approveState?.error ?? payState?.error ?? failState?.error}
        </div>
      )}

      {/* Кнопки действий */}
      {(w.status === "PENDING" || w.status === "APPROVED") && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Поле причины отклонения */}
          <input
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Причина отклонения (необязательно)"
            style={{
              padding: "9px 14px", borderRadius: 10,
              background: "#0d1117", border: "1px solid #1d2734",
              color: "white", fontSize: 13, outline: "none",
            }}
          />

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>

            {/* Одобрить — только из PENDING */}
            {w.status === "PENDING" && (
              <form action={approveAction}>
                <input type="hidden" name="withdrawalRequestId" value={w.id} />
                <button
                  type="submit"
                  disabled={anyPending}
                  style={{
                    padding: "9px 18px", borderRadius: 10, border: "1px solid rgba(34,197,94,.4)",
                    background: "rgba(34,197,94,.10)", color: "#22c55e",
                    fontWeight: 700, fontSize: 13, cursor: "pointer",
                  }}
                >
                  {approvePending ? "..." : "✓ Одобрить"}
                </button>
              </form>
            )}

            {/* Отметить как выплачено — из PENDING или APPROVED */}
            <form action={payAction}>
              <input type="hidden" name="withdrawalRequestId" value={w.id} />
              <button
                type="submit"
                disabled={anyPending}
                style={{
                  padding: "9px 18px", borderRadius: 10, border: "1px solid rgba(255,154,0,.4)",
                  background: "rgba(255,154,0,.10)", color: "#ff9a00",
                  fontWeight: 700, fontSize: 13, cursor: "pointer",
                }}
              >
                {payPending ? "..." : "💸 Выплачено"}
              </button>
            </form>

            {/* Отклонить */}
            <form action={failAction}>
              <input type="hidden" name="withdrawalRequestId" value={w.id} />
              <input type="hidden" name="reason" value={reason || "Отклонено администратором"} />
              <button
                type="submit"
                disabled={anyPending}
                style={{
                  padding: "9px 18px", borderRadius: 10, border: "1px solid rgba(239,68,68,.4)",
                  background: "rgba(239,68,68,.10)", color: "#ef4444",
                  fontWeight: 700, fontSize: 13, cursor: "pointer",
                }}
              >
                {failPending ? "..." : "✕ Отклонить"}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

type Props = {
  pending:   Withdrawal[];
  approved:  Withdrawal[];
  completed: Withdrawal[];
  failed:    Withdrawal[];
};

type Tab = "pending" | "approved" | "completed" | "failed";

export default function WithdrawalsClient({ pending, approved, completed, failed }: Props) {
  const [tab, setTab] = useState<Tab>("pending");

  const tabs: { key: Tab; label: string; count: number; color: string }[] = [
    { key: "pending",   label: "Ожидают",   count: pending.length,   color: "#ffb340" },
    { key: "approved",  label: "Одобренные", count: approved.length,  color: "#22c55e" },
    { key: "completed", label: "Выплачены", count: completed.length,  color: "#4ade80" },
    { key: "failed",    label: "Отклонены", count: failed.length,     color: "#ef4444" },
  ];

  const items = tab === "pending" ? pending : tab === "approved" ? approved : tab === "completed" ? completed : failed;

  return (
    <div>

      {/* Табы */}
      <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "8px 18px", borderRadius: 12, border: "none", cursor: "pointer",
              background: tab === t.key ? "rgba(255,255,255,.10)" : "rgba(255,255,255,.04)",
              color: tab === t.key ? t.color : "#7e8796",
              fontWeight: tab === t.key ? 700 : 400,
              fontSize: 14,
              outline: tab === t.key ? `1px solid ${t.color}40` : "none",
            }}
          >
            {t.label}
            {t.count > 0 && (
              <span style={{
                marginLeft: 8, padding: "2px 8px", borderRadius: 20,
                background: tab === t.key ? t.color : "#1d2734",
                color: tab === t.key ? "#000" : "#7e8796",
                fontSize: 12, fontWeight: 700,
              }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Список */}
      {items.length === 0 ? (
        <div className="card" style={{ padding: 32, textAlign: "center", color: "#7e8796" }}>
          Заявок нет
        </div>
      ) : (
        items.map(w => <ActionRow key={w.id} w={w} />)
      )}

    </div>
  );
}
