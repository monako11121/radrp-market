"use client";

import { useActionState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { requestWithdrawal } from "@/app/actions/payments";
import { formatMoney }        from "@/lib/formatMoney";
import Link                   from "next/link";

// Данные баланса подгружаем через /api/balance (клиентский fetch).
// Страница авторизации: если нет сессии — редирект на /auth.

import { useState } from "react";

export default function WithdrawPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [balance,  setBalance]  = useState<number | null>(null);
  const [pending,  setPending]  = useState<number>(0);
  const [loading,  setLoading]  = useState(true);

  const [state, formAction, isPending] = useActionState(requestWithdrawal, null);

  // Перенаправить неавторизованных
  useEffect(() => {
    if (status === "unauthenticated") router.replace("/auth");
  }, [status, router]);

  // Загрузить баланс
  useEffect(() => {
    if (!session?.user?.email) return;
    fetch("/api/balance")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        setBalance(typeof data.availableBalance === "number" ? data.availableBalance : data.balance ?? 0);
        setPending(typeof data.pendingWithdrawalBalance === "number" ? data.pendingWithdrawalBalance : 0);
      })
      .finally(() => setLoading(false));
  }, [session?.user?.email, state]);

  if (status === "loading" || loading) {
    return (
      <main className="container" style={{ paddingTop: 80, paddingBottom: 100 }}>
        <div className="card" style={{ padding: 40, textAlign: "center", color: "#7e8796" }}>
          Загрузка...
        </div>
      </main>
    );
  }

  if (!session?.user) return null;

  return (
    <main className="container" style={{ paddingTop: 60, paddingBottom: 100 }}>

      {/* Хлебные крошки */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 26, fontSize: 14, color: "#7e8796" }}>
        <Link href="/profile">Профиль</Link>
        <span>/</span>
        <span style={{ color: "white" }}>Вывод средств</span>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto" }}>

        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 28 }}>
          Вывод средств
        </h1>

        {/* Карточки баланса */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>

          <div className="card" style={{ padding: "20px 22px" }}>
            <div style={{ fontSize: 12, color: "#7e8796", marginBottom: 6 }}>Доступно для вывода</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#22c55e" }}>
              {formatMoney(balance ?? 0)}
            </div>
          </div>

          <div className="card" style={{ padding: "20px 22px" }}>
            <div style={{ fontSize: 12, color: "#7e8796", marginBottom: 6 }}>В обработке</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#ffb340" }}>
              {formatMoney(pending)}
            </div>
          </div>

        </div>

        {/* Форма */}
        <div className="card" style={{ padding: 28 }}>

          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 22 }}>
            Новая заявка
          </h2>

          {state?.success && (
            <div style={{
              padding: "14px 18px", borderRadius: 12, marginBottom: 20,
              background: "rgba(34,197,94,.10)", border: "1px solid rgba(34,197,94,.25)", color: "#22c55e",
              fontSize: 15, fontWeight: 600,
            }}>
              ✓ {state.success}
            </div>
          )}

          {state?.error && (
            <div style={{
              padding: "14px 18px", borderRadius: 12, marginBottom: 20,
              background: "rgba(239,68,68,.10)", border: "1px solid rgba(239,68,68,.25)", color: "#ef4444",
              fontSize: 14,
            }}>
              {state.error}
            </div>
          )}

          <form action={formAction}>

            {/* Сумма */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 13, color: "#7e8796", marginBottom: 8, display: "block" }}>
                Сумма вывода
              </label>
              <input
                name="amount"
                type="number"
                min="1"
                step="any"
                required
                placeholder={`Доступно: ${formatMoney(balance ?? 0)}`}
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 12,
                  background: "#0d1117", border: "1px solid #1d2734",
                  color: "white", fontSize: 16, outline: "none", boxSizing: "border-box",
                }}
              />
            </div>

            {/* Метод */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 13, color: "#7e8796", marginBottom: 8, display: "block" }}>
                Способ вывода
              </label>
              <select
                name="method"
                defaultValue="card"
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 12,
                  background: "#0d1117", border: "1px solid #1d2734",
                  color: "white", fontSize: 15, outline: "none", boxSizing: "border-box",
                }}
              >
                <option value="card">Банковская карта</option>
                <option value="sbp">СБП (Система быстрых платежей)</option>
                <option value="crypto">Криптовалюта</option>
              </select>
            </div>

            {/* Реквизиты */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, color: "#7e8796", marginBottom: 8, display: "block" }}>
                Реквизиты
              </label>
              <textarea
                name="requisites"
                required
                rows={3}
                placeholder="Номер карты, телефон для СБП или адрес кошелька"
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 12,
                  background: "#0d1117", border: "1px solid #1d2734",
                  color: "white", fontSize: 14, outline: "none", resize: "vertical",
                  boxSizing: "border-box", fontFamily: "inherit",
                }}
              />
              <div style={{ fontSize: 12, color: "#4a5568", marginTop: 6 }}>
                Заявка обрабатывается вручную администратором. Реквизиты передаются только ему.
              </div>
            </div>

            {/* Инфо-блок */}
            <div style={{
              padding: "12px 16px", borderRadius: 12, marginBottom: 22,
              background: "rgba(255,154,0,.06)", border: "1px solid rgba(255,154,0,.15)",
            }}>
              <div style={{ fontSize: 13, color: "#ffb340", fontWeight: 600, marginBottom: 6 }}>
                Как это работает:
              </div>
              {[
                "Средства резервируются до одобрения заявки",
                "Администратор одобряет и переводит вручную",
                "При отклонении средства возвращаются на баланс",
                "Срок обработки: 1–3 рабочих дня",
              ].map(line => (
                <div key={line} style={{ fontSize: 13, color: "#b0bac8", marginBottom: 4 }}>
                  • {line}
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="orangeButton"
              disabled={isPending}
              style={{ width: "100%", opacity: isPending ? 0.7 : 1 }}
            >
              {isPending ? "Создаём заявку..." : "Создать заявку на вывод"}
            </button>

          </form>

        </div>

        {/* Ссылка на историю */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Link href="/transactions" style={{ color: "#7e8796", fontSize: 14 }}>
            История транзакций →
          </Link>
        </div>

      </div>
    </main>
  );
}
