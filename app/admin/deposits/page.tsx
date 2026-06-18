import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import AdminDepositActions from "@/components/admin/AdminDepositActions";

export const metadata: Metadata = { title: "Пополнения" };

export default async function AdminDepositsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) redirect("/");

  const params = await searchParams;
  const statusFilter = params.status || "PENDING";

  const deposits = await prisma.depositRequest.findMany({
    where: {
      ...(statusFilter === "ALL" ? {} : { status: statusFilter }),
      provider: "crypto_manual",
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { id: true, username: true, email: true } },
    },
  });

  const pendingCount = await prisma.depositRequest.count({
    where: { status: "PENDING", provider: "crypto_manual" },
  });

  return (
    <main className="container" style={{ paddingTop: 60, paddingBottom: 100 }}>

      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
          <h1 style={{ fontSize: 36, fontWeight: 900 }}>Крипто-пополнения</h1>
          {pendingCount > 0 && (
            <div style={{
              background: "rgba(239,68,68,.15)",
              border: "1px solid rgba(239,68,68,.3)",
              color: "#ef4444",
              fontWeight: 700,
              fontSize: 14,
              padding: "4px 14px",
              borderRadius: 999,
            }}>
              {pendingCount} ожидают
            </div>
          )}
        </div>
        <p style={{ color: "#7e8796" }}>USDT TRC20 · Ручное подтверждение</p>
      </div>

      {/* Фильтр статусов */}
      <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
        {[
          { value: "PENDING",  label: "Ожидают", color: "#ffb340" },
          { value: "APPROVED", label: "Подтверждены", color: "#22c55e" },
          { value: "REJECTED", label: "Отклонены", color: "#ef4444" },
          { value: "ALL",      label: "Все", color: "#7e8796" },
        ].map(({ value, label, color }) => (
          <a key={value} href={`?status=${value}`} style={{ textDecoration: "none" }}>
            <div style={{
              padding: "8px 18px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              background: statusFilter === value ? `${color}22` : "rgba(255,255,255,.04)",
              border: `1px solid ${statusFilter === value ? color : "rgba(255,255,255,.1)"}`,
              color: statusFilter === value ? color : "#7e8796",
              cursor: "pointer",
            }}>
              {label}
            </div>
          </a>
        ))}
      </div>

      {deposits.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center", color: "#7e8796" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Заявок нет</div>
          <div style={{ fontSize: 14 }}>
            {statusFilter === "PENDING" ? "Нет новых заявок на пополнение" : "Нет заявок с таким статусом"}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {deposits.map((dep) => (
            <div key={dep.id} className="card" style={{ padding: "24px 28px" }}>

              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontWeight: 800, fontSize: 22 }}>${dep.amount.toFixed(2)} USDT</span>
                    <StatusBadge status={dep.status} />
                  </div>
                  <div style={{ fontSize: 14, color: "#7e8796" }}>
                    <span style={{ color: "#b0bac8", fontWeight: 600 }}>{dep.user.username}</span>
                    {" · "}
                    {dep.user.email}
                  </div>
                  <div style={{ fontSize: 12, color: "#7e8796", marginTop: 4 }}>
                    {new Date(dep.createdAt).toLocaleString("ru")}
                  </div>
                </div>

                <div style={{ fontFamily: "monospace", fontSize: 11, color: "#7e8796", wordBreak: "break-all", maxWidth: 300 }}>
                  ID: {dep.id}
                </div>

              </div>

              {dep.txHash && (
                <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(34,197,94,.06)", border: "1px solid rgba(34,197,94,.15)" }}>
                  <div style={{ fontSize: 11, color: "#7e8796", marginBottom: 2 }}>TX HASH</div>
                  <div style={{ fontFamily: "monospace", fontSize: 13, wordBreak: "break-all", color: "#22c55e" }}>
                    {dep.txHash}
                  </div>
                </div>
              )}

              {dep.adminNote && (
                <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}>
                  <div style={{ fontSize: 11, color: "#7e8796", marginBottom: 2 }}>ЗАМЕТКА АДМИНИСТРАТОРА</div>
                  <div style={{ fontSize: 14, color: "#b0bac8" }}>{dep.adminNote}</div>
                </div>
              )}

              {dep.status === "PENDING" && (
                <AdminDepositActions depositId={dep.id} amount={dep.amount} />
              )}

            </div>
          ))}
        </div>
      )}

    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; label: string }> = {
    PENDING:  { color: "#ffb340", label: "Ожидает" },
    APPROVED: { color: "#22c55e", label: "Подтверждено" },
    REJECTED: { color: "#ef4444", label: "Отклонено" },
    COMPLETED:{ color: "#22c55e", label: "Выполнено" },
    FAILED:   { color: "#ef4444", label: "Ошибка" },
  };
  const s = map[status] ?? { color: "#7e8796", label: status };
  return (
    <span style={{
      padding: "3px 10px",
      borderRadius: 999,
      background: `${s.color}22`,
      border: `1px solid ${s.color}55`,
      color: s.color,
      fontSize: 12,
      fontWeight: 700,
    }}>
      {s.label}
    </span>
  );
}
