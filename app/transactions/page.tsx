import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatMoney } from "@/lib/formatMoney";

export const metadata = {
  title: "История операций — Radmir RP Market",
};

const TYPE_LABELS: Record<string, { label: string; sign: "+" | "−"; color: string }> = {
  FREEZE:              { label: "Заморозка",          sign: "−", color: "#ffb340" },
  COMPLETE_BUYER:      { label: "Оплата сделки",      sign: "−", color: "#ef4444" },
  COMPLETE_SELLER:     { label: "Получено",           sign: "+", color: "#22c55e" },
  COMMISSION:          { label: "Комиссия",           sign: "−", color: "#7e8796" },
  UNFREEZE:            { label: "Возврат средств",    sign: "+", color: "#22c55e" },
  DEPOSIT:             { label: "Пополнение",         sign: "+", color: "#22c55e" },
  WITHDRAWAL:          { label: "Вывод средств",      sign: "−", color: "#a78bfa" },
  WITHDRAWAL_PENDING:  { label: "Заявка на вывод",    sign: "−", color: "#a78bfa" },
};

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day:    "2-digit",
    month:  "2-digit",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      availableBalance: true,
      frozenBalance: true,
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 100,
      },
    },
  });

  if (!user) redirect("/auth");

  const txList = user.transactions;

  return (
    <main className="container" style={{ paddingTop: 60, paddingBottom: 100 }}>

      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 42, fontWeight: 900, letterSpacing: -1.5, marginBottom: 8 }}>
          История операций
        </h1>
        <p style={{ color: "#7e8796", fontSize: 16 }}>
          Последние 100 операций по вашему счёту
        </p>
      </div>

      {/* Баланс-саммари */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 36,
        }}
      >
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 13, color: "#7e8796", marginBottom: 10 }}>Доступный баланс</div>
          <div style={{ fontSize: 36, fontWeight: 900 }}>{formatMoney(user.availableBalance)}</div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 13, color: "#7e8796", marginBottom: 10 }}>Заморожено</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#ffb340" }}>
            {formatMoney(user.frozenBalance)}
          </div>
          {user.frozenBalance > 0 && (
            <div style={{ fontSize: 13, color: "#7e8796", marginTop: 6 }}>
              средства заморожены до завершения сделки
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 13, color: "#7e8796", marginBottom: 10 }}>Итого операций</div>
          <div style={{ fontSize: 36, fontWeight: 900 }}>{txList.length}</div>
        </div>
      </div>

      {/* Список операций */}
      {txList.length === 0 ? (
        <div
          className="card"
          style={{ padding: 48, textAlign: "center", color: "#7e8796" }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>💳</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            Операций пока нет
          </div>
          <div style={{ fontSize: 15 }}>
            Они появятся после первой покупки или продажи
          </div>
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden", padding: 0 }}>
          {txList.map((tx, i) => {
            const meta = TYPE_LABELS[tx.type] ?? {
              label: tx.type,
              sign: "+",
              color: "#7e8796",
            };

            return (
              <div
                key={tx.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "18px 24px",
                  borderBottom:
                    i < txList.length - 1
                      ? "1px solid rgba(255,255,255,.05)"
                      : "none",
                }}
              >
                {/* Иконка типа */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `${meta.color}18`,
                    border: `1px solid ${meta.color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  {tx.type === "FREEZE"             && "🔒"}
                  {tx.type === "COMPLETE_BUYER"   && "💸"}
                  {tx.type === "COMPLETE_SELLER"  && "💰"}
                  {tx.type === "COMMISSION"       && "📊"}
                  {tx.type === "UNFREEZE"         && "🔓"}
                  {tx.type === "DEPOSIT"          && "💎"}
                  {tx.type === "WITHDRAWAL"       && "📤"}
                  {tx.type === "WITHDRAWAL_PENDING" && "⏳"}
                </div>

                {/* Описание */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 15,
                      marginBottom: 4,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {tx.description}
                  </div>
                  <div style={{ fontSize: 13, color: "#7e8796", display: "flex", gap: 12 }}>
                    <span>{meta.label}</span>
                    <span>·</span>
                    <span>{formatDate(tx.createdAt)}</span>
                    {tx.dealId && (
                      <>
                        <span>·</span>
                        <Link
                          href={`/deals?id=${tx.dealId}`}
                          style={{ color: "#ff9a00" }}
                        >
                          Сделка
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                {/* Сумма */}
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: meta.color,
                    flexShrink: 0,
                  }}
                >
                  {meta.sign}{formatMoney(tx.amount)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
