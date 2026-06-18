import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { prisma }           from "@/lib/prisma";
import { redirect }         from "next/navigation";
import { isOwner }          from "@/lib/admin";
import type { Metadata }    from "next";
import UsersClient          from "./UsersClient";

export const metadata: Metadata = { title: "Пользователи — Админка | Radmir RP Market" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isOwner(session.user.role)) redirect("/");

  const { q, role } = await searchParams;

  const users = await prisma.user.findMany({
    where: {
      ...(role ? { role } : {}),
      ...(q ? {
        OR: [
          { username: { contains: q, mode: "insensitive" } },
          { email:    { contains: q, mode: "insensitive" } },
        ],
      } : {}),
    },
    orderBy: [
      { role: "asc" },
      { createdAt: "desc" },
    ],
    select: {
      id:        true,
      username:  true,
      email:     true,
      role:      true,
      createdAt: true,
      _count: { select: { products: true } },
    },
  });

  const counts = await prisma.user.groupBy({
    by:     ["role"],
    _count: { _all: true },
  });
  const byRole = Object.fromEntries(counts.map(c => [c.role, c._count._all]));

  return (
    <main className="container" style={{ paddingTop: 60, paddingBottom: 100 }}>

      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 13, color: "#a855f7", fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
          OWNER-ПАНЕЛЬ
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8 }}>Управление пользователями</h1>
        <p style={{ color: "#7e8796", fontSize: 14 }}>
          Назначение ролей ADMIN / USER. Роль OWNER изменить нельзя.
        </p>
      </div>

      {/* Сводка по ролям */}
      <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
        {[
          { label: "Все",            value: "",      color: "#7e8796", count: Object.values(byRole).reduce((a, b) => a + b, 0) },
          { label: "OWNER",          value: "OWNER", color: "#a855f7", count: byRole.OWNER  ?? 0 },
          { label: "ADMIN",          value: "ADMIN", color: "#ef4444", count: byRole.ADMIN  ?? 0 },
          { label: "USER",           value: "USER",  color: "#22c55e", count: byRole.USER   ?? 0 },
        ].map(f => {
          const active = (role ?? "") === f.value;
          return (
            <a key={f.value} href={f.value ? `?role=${f.value}` : "/admin/users"} style={{ textDecoration: "none" }}>
              <div style={{
                padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600,
                background: active ? `${f.color}22` : "rgba(255,255,255,.04)",
                border: `1px solid ${active ? f.color : "rgba(255,255,255,.08)"}`,
                color: active ? f.color : "#7e8796",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                {f.label}
                <span style={{
                  minWidth: 20, height: 18, borderRadius: 999, fontSize: 11, fontWeight: 900,
                  background: active ? `${f.color}33` : "rgba(255,255,255,.06)",
                  color: active ? f.color : "#4a5568",
                  display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 5px",
                }}>
                  {f.count}
                </span>
              </div>
            </a>
          );
        })}
      </div>

      <UsersClient users={users} searchQuery={q ?? ""} />

    </main>
  );
}
