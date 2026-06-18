"use client";

import { useActionState } from "react";
import { setUserRole }    from "@/app/actions/roles";
import { useRouter }      from "next/navigation";
import { useEffect, useRef, useState } from "react";

type User = {
  id:        string;
  username:  string;
  email:     string;
  role:      string;
  createdAt: Date;
  _count:    { products: number };
};

const ROLE_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  OWNER: { color: "#a855f7", bg: "rgba(168,85,247,.12)", label: "OWNER" },
  ADMIN: { color: "#ef4444", bg: "rgba(239,68,68,.12)",  label: "ADMIN" },
  USER:  { color: "#7e8796", bg: "rgba(126,135,150,.1)", label: "USER"  },
};

function RoleForm({ user }: { user: User }) {
  const [state, action, isPending] = useActionState(setUserRole, null);
  const router = useRouter();
  const prevSuccess = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (state?.success && state.success !== prevSuccess.current) {
      prevSuccess.current = state.success;
      router.refresh();
    }
  }, [state, router]);

  if (user.role === "OWNER") {
    return (
      <span style={{
        padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700,
        color: "#a855f7", background: "rgba(168,85,247,.12)",
        border: "1px solid rgba(168,85,247,.3)",
      }}>
        👑 OWNER
      </span>
    );
  }

  return (
    <form action={action} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <input type="hidden" name="userId" value={user.id} />
      <select
        name="role"
        defaultValue={user.role}
        disabled={isPending}
        style={{
          background: "#1a2233", border: "1px solid rgba(255,255,255,.12)",
          color: "white", borderRadius: 8, padding: "5px 10px", fontSize: 13,
          cursor: "pointer",
        }}
      >
        <option value="USER">USER</option>
        <option value="ADMIN">ADMIN</option>
      </select>
      <button
        type="submit"
        disabled={isPending}
        style={{
          padding: "5px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: isPending ? "rgba(255,255,255,.06)" : "rgba(255,154,0,.15)",
          border: "1px solid rgba(255,154,0,.3)", color: isPending ? "#4a5568" : "#ff9a00",
          cursor: isPending ? "default" : "pointer",
        }}
      >
        {isPending ? "..." : "Сохранить"}
      </button>
      {state?.error   && <span style={{ fontSize: 12, color: "#ef4444" }}>{state.error}</span>}
      {state?.success && <span style={{ fontSize: 12, color: "#22c55e" }}>✓</span>}
    </form>
  );
}

export default function UsersClient({
  users,
  searchQuery,
}: {
  users: User[];
  searchQuery: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(searchQuery);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    if (q) params.set("q", q); else params.delete("q");
    router.push(`/admin/users?${params}`);
  }

  return (
    <>
      {/* Поиск */}
      <form onSubmit={handleSearch} style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Поиск по имени или email..."
          style={{
            flex: 1, maxWidth: 420, padding: "10px 16px", borderRadius: 10, fontSize: 14,
            background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
            color: "white", outline: "none",
          }}
        />
        <button type="submit" style={{
          padding: "10px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600,
          background: "rgba(255,154,0,.15)", border: "1px solid rgba(255,154,0,.3)",
          color: "#ff9a00", cursor: "pointer",
        }}>
          Найти
        </button>
      </form>

      {users.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center", color: "#7e8796" }}>
          Пользователи не найдены
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {users.map(u => {
            const rs = ROLE_STYLE[u.role] ?? ROLE_STYLE.USER;
            return (
              <div key={u.id} className="card" style={{ padding: "16px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>

                  <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: "linear-gradient(180deg,#202938,#121821)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18, fontWeight: 900, flexShrink: 0,
                    }}>
                      {u.username[0]?.toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{u.username}</div>
                      <div style={{ fontSize: 12, color: "#7e8796", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {u.email}
                      </div>
                      <div style={{ fontSize: 11, color: "#4a5568", marginTop: 2 }}>
                        {u._count.products} товаров ·{" "}
                        с {new Date(u.createdAt).toLocaleDateString("ru-RU", { month: "short", year: "numeric" })}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                      color: rs.color, background: rs.bg,
                    }}>
                      {rs.label}
                    </span>
                    <RoleForm user={u} />
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
