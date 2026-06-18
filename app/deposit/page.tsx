"use client";

import { useActionState, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { requestCryptoDeposit } from "@/app/actions/payments";
import { formatMoney } from "@/lib/formatMoney";
import Link from "next/link";

export default function DepositPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(true);

  const [state, formAction, isPending] = useActionState(requestCryptoDeposit, null);

  // Редирект неавторизованных
  useEffect(() => {
    if (status === "unauthenticated") router.replace("/auth");
  }, [status, router]);

  // Загрузить баланс
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/balance")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.availableBalance != null) setBalance(d.availableBalance);
        else if (d?.balance != null) setBalance(d.balance);
      })
      .catch(() => {})
      .finally(() => setLoadingBalance(false));
  }, [status, state]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <main className="container" style={{ paddingTop: 80, textAlign: "center", color: "#7e8796" }}>
        Загрузка...
      </main>
    );
  }

  // После создания заявки — показываем инструкцию
  if (state?.depositId) {
    const walletAddress = state.walletAddress ?? "";
    return (
      <main className="container" style={{ paddingTop: 60, paddingBottom: 100, maxWidth: 620 }}>

        <div style={{ marginBottom: 28 }}>
          <Link href="/profile" style={{ color: "#7e8796", fontSize: 14 }}>← Профиль</Link>
        </div>

        <div className="card" style={{ padding: "36px 40px" }}>

          {/* Заголовок */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>💸</div>
            <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>
              Заявка создана
            </h1>
            <p style={{ color: "#7e8796", fontSize: 15, lineHeight: 1.6 }}>
              Переведите ровно указанную сумму на кошелёк ниже.<br />
              После перевода ожидайте подтверждения администратора.
            </p>
          </div>

          {/* Сумма */}
          <div className="card" style={{ padding: "20px 24px", marginBottom: 16, background: "rgba(34,197,94,.06)", border: "1px solid rgba(34,197,94,.2)" }}>
            <div style={{ fontSize: 12, color: "#7e8796", marginBottom: 6, letterSpacing: 1 }}>СУММА К ПЕРЕВОДУ</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: "#22c55e" }}>
              ${state.amount?.toFixed(2)} USDT
            </div>
            <div style={{ fontSize: 13, color: "#7e8796", marginTop: 4 }}>Переведите ровно эту сумму</div>
          </div>

          {/* Адрес кошелька */}
          <div className="card" style={{ padding: "20px 24px", marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "#7e8796", marginBottom: 6, letterSpacing: 1 }}>АДРЕС КОШЕЛЬКА (USDT TRC20)</div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 14,
                color: "white",
                wordBreak: "break-all",
                lineHeight: 1.6,
                background: "#0d1219",
                border: "1px solid #1d2734",
                borderRadius: 12,
                padding: "12px 16px",
                cursor: "pointer",
              }}
              onClick={() => {
                if (walletAddress) {
                  navigator.clipboard.writeText(walletAddress).catch(() => {});
                }
              }}
              title="Нажмите чтобы скопировать"
            >
              {walletAddress || (
                <span style={{ color: "#ef4444" }}>
                  ⚠ Адрес не настроен. Свяжитесь с поддержкой.
                </span>
              )}
            </div>
            {walletAddress && (
              <div style={{ fontSize: 12, color: "#7e8796", marginTop: 8 }}>
                Нажмите на адрес чтобы скопировать · Сеть: TRC20
              </div>
            )}
          </div>

          {/* ID заявки */}
          <div className="card" style={{ padding: "16px 24px", marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: "#7e8796", marginBottom: 4, letterSpacing: 1 }}>ID ЗАЯВКИ</div>
            <div style={{ fontFamily: "monospace", fontSize: 13, color: "#b0bac8", wordBreak: "break-all" }}>
              {state.depositId}
            </div>
          </div>

          {/* Инструкция */}
          <div style={{
            padding: "16px 20px",
            borderRadius: 14,
            background: "rgba(255,154,0,.06)",
            border: "1px solid rgba(255,154,0,.15)",
            marginBottom: 28,
          }}>
            <div style={{ fontWeight: 700, marginBottom: 8, color: "#ffb340", fontSize: 14 }}>
              📋 Инструкция
            </div>
            <ol style={{ color: "#b0bac8", fontSize: 14, lineHeight: 2, margin: 0, paddingLeft: 20 }}>
              <li>Откройте ваш крипто-кошелёк (Binance, Trust Wallet и др.)</li>
              <li>Выберите сеть <strong style={{ color: "white" }}>TRC20</strong></li>
              <li>Переведите ровно <strong style={{ color: "#22c55e" }}>${state.amount?.toFixed(2)} USDT</strong></li>
              <li>Вставьте адрес кошелька указанный выше</li>
              <li>После перевода администратор подтвердит платёж вручную</li>
              <li>Средства зачислятся в течение <strong style={{ color: "white" }}>1–24 часов</strong></li>
            </ol>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/transactions" style={{ flex: 1 }}>
              <button className="darkButton" style={{ width: "100%", height: 52 }}>
                История операций
              </button>
            </Link>
            <Link href="/profile" style={{ flex: 1 }}>
              <button className="orangeButton" style={{ width: "100%", height: 52 }}>
                В профиль
              </button>
            </Link>
          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ paddingTop: 60, paddingBottom: 100, maxWidth: 560 }}>

      <div style={{ marginBottom: 28 }}>
        <Link href="/profile" style={{ color: "#7e8796", fontSize: 14 }}>← Профиль</Link>
      </div>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8 }}>Пополнение баланса</h1>
        <p style={{ color: "#7e8796", fontSize: 15, lineHeight: 1.6 }}>
          Пополнение через USDT TRC20 с ручным подтверждением администратором.
        </p>
      </div>

      {/* Текущий баланс */}
      <div className="card" style={{ padding: "20px 24px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 13, color: "#7e8796", marginBottom: 4 }}>Текущий баланс</div>
          <div style={{ fontSize: 28, fontWeight: 900 }}>
            {loadingBalance ? "..." : balance != null ? formatMoney(balance) : "$0"}
          </div>
        </div>
        <Link href="/transactions">
          <button className="darkButton" style={{ height: 40, padding: "0 16px", fontSize: 13 }}>
            История →
          </button>
        </Link>
      </div>

      {/* Форма */}
      <div className="card" style={{ padding: "28px 32px" }}>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "#7e8796", marginBottom: 10 }}>Метод пополнения</div>
          <div style={{
            padding: "14px 18px",
            borderRadius: 14,
            background: "rgba(34,197,94,.06)",
            border: "1px solid rgba(34,197,94,.2)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}>
            <span style={{ fontSize: 24 }}>₮</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>USDT TRC20</div>
              <div style={{ fontSize: 12, color: "#7e8796" }}>Tether · Сеть Tron · Ручное подтверждение</div>
            </div>
            <div style={{ marginLeft: "auto", background: "rgba(34,197,94,.15)", color: "#22c55e", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999 }}>
              Активно
            </div>
          </div>
        </div>

        <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          <div>
            <div style={{ fontSize: 13, color: "#7e8796", marginBottom: 10 }}>Сумма пополнения (USD)</div>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)",
                fontSize: 18, color: "#7e8796", pointerEvents: "none",
              }}>$</span>
              <input
                name="amount"
                type="number"
                min="1"
                step="0.01"
                placeholder="0.00"
                required
                style={{
                  width: "100%",
                  height: 58,
                  background: "#0d1219",
                  border: "1px solid #1d2734",
                  borderRadius: 16,
                  padding: "0 18px 0 36px",
                  color: "white",
                  outline: "none",
                  fontSize: 20,
                  fontWeight: 700,
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ fontSize: 12, color: "#7e8796", marginTop: 6 }}>
              Минимум $1 · Без комиссии платформы
            </div>
          </div>

          {state?.error && (
            <div style={{
              padding: "14px 18px",
              borderRadius: 14,
              background: "rgba(239,68,68,.12)",
              border: "1px solid rgba(239,68,68,.22)",
              color: "#ef4444",
              fontSize: 14,
            }}>
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="orangeButton"
            style={{ height: 56, fontSize: 16, opacity: isPending ? 0.6 : 1 }}
          >
            {isPending ? "Создание заявки..." : "Создать заявку на пополнение"}
          </button>

        </form>

        <div style={{ marginTop: 20, padding: "14px 18px", borderRadius: 12, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", fontSize: 13, color: "#7e8796", lineHeight: 1.7 }}>
          💡 После создания заявки вы получите адрес кошелька и ID заявки. Переведите ровно указанную сумму и дождитесь подтверждения администратора (1–24 ч).
        </div>

      </div>
    </main>
  );
}
