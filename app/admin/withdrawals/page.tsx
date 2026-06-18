import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { isAdmin }          from "@/lib/admin";
import { prisma }           from "@/lib/prisma";
import { redirect }         from "next/navigation";
import WithdrawalsClient    from "./WithdrawalsClient";

export default async function AdminWithdrawalsPage() {

  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) redirect("/");

  const select = {
    id:         true,
    amount:     true,
    netAmount:  true,
    feeAmount:  true,
    method:     true,
    requisites: true,
    status:     true,
    failReason: true,
    createdAt:  true,
    updatedAt:  true,
    user: { select: { username: true, email: true } },
  } as const;

  const [pending, approved, completed, failed] = await Promise.all([
    prisma.withdrawalRequest.findMany({
      where:   { status: "PENDING"   },
      orderBy: { createdAt: "desc"   },
      select,
    }),
    prisma.withdrawalRequest.findMany({
      where:   { status: "APPROVED"  },
      orderBy: { createdAt: "desc"   },
      select,
    }),
    prisma.withdrawalRequest.findMany({
      where:   { status: "COMPLETED" },
      orderBy: { updatedAt: "desc"   },
      take:    50,
      select,
    }),
    prisma.withdrawalRequest.findMany({
      where:   { status: { in: ["FAILED", "CANCELLED"] } },
      orderBy: { updatedAt: "desc" },
      take:    50,
      select,
    }),
  ]);

  const totalPending = pending.reduce((s, w) => s + w.amount, 0);

  return (
    <main className="container" style={{ paddingTop: 60, paddingBottom: 100 }}>

      <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>
        Заявки на вывод
      </h1>

      <p style={{ color: "#7e8796", marginBottom: 28, fontSize: 14 }}>
        Все финансовые операции обрабатываются вручную.
      </p>

      {/* Сводка */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 30 }}>
        {[
          { label: "Ожидают",    value: pending.length,   color: "#ffb340" },
          { label: "Одобрены",   value: approved.length,  color: "#22c55e" },
          { label: "Сумма (ожидают)", value: `$${totalPending.toFixed(0)}`, color: "#ff9a00" },
          { label: "Выплачено",  value: completed.length, color: "#4ade80" },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: 11, color: "#7e8796", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <WithdrawalsClient
        pending={pending}
        approved={approved}
        completed={completed}
        failed={failed}
      />

    </main>
  );
}
