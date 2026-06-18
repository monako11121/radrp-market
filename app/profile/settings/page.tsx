import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import SettingsForm from "./SettingsForm";
import Link from "next/link";

export const metadata: Metadata = { title: "Настройки профиля" };

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) redirect("/auth");

  return (
    <main
      className="container"
      style={{ paddingTop: 60, paddingBottom: 100, maxWidth: 720 }}
    >
      <div style={{ marginBottom: 32 }}>
        <Link
          href="/profile"
          style={{ color: "#7e8796", fontSize: 14 }}
        >
          ← Профиль
        </Link>
      </div>

      <div style={{ marginBottom: 36 }}>
        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: 900,
            marginBottom: 10,
          }}
        >
          Настройки профиля
        </h1>
        <p style={{ fontSize: 15, color: "#7e8796", lineHeight: 1.7 }}>
          Управление аккаунтом и данными профиля.
        </p>
      </div>

      <SettingsForm username={user.username} email={user.email} />
    </main>
  );
}
