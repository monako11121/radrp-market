import Link from "next/link";

export const metadata = { title: "Страница не найдена — Radmir RP Market" };

export default function NotFound() {
  return (
    <main
      className="container"
      style={{
        paddingTop: 120,
        paddingBottom: 100,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 80, marginBottom: 24, lineHeight: 1 }}>🔍</div>

      <h1
        style={{
          fontSize: 48,
          fontWeight: 900,
          marginBottom: 16,
          letterSpacing: -1,
        }}
      >
        404 — Страница не найдена
      </h1>

      <p
        style={{
          fontSize: 18,
          color: "#7e8796",
          lineHeight: 1.7,
          maxWidth: 460,
          marginBottom: 40,
        }}
      >
        Такой страницы не существует или она была удалена.
        Возможно, ссылка устарела.
      </p>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/">
          <button className="orangeButton" style={{ height: 52, padding: "0 28px" }}>
            На главную
          </button>
        </Link>
        <Link href="/catalog">
          <button className="darkButton" style={{ height: 52, padding: "0 28px" }}>
            В каталог
          </button>
        </Link>
      </div>
    </main>
  );
}
