import { prisma }    from "@/lib/prisma";
import { notFound }  from "next/navigation";
import Link          from "next/link";
import { formatMoney } from "@/lib/formatMoney";
import { categoryIcons } from "@/lib/categoryIcons";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const seller  = await prisma.user.findUnique({ where: { id }, select: { username: true } });
  return { title: seller ? `${seller.username} — продавец | Radmir RP Market` : "Продавец не найден" };
}

export default async function SellerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const seller = await prisma.user.findUnique({
    where: { id },
    select: {
      id:        true,
      username:  true,
      createdAt: true,
      products: {
        orderBy: { createdAt: "desc" },
        take: 8,
      },
    },
  });

  if (!seller) notFound();

  const [
    recentReviews,
    doneDealsCnt,
    totalReviewsCnt,
    productsCnt,
    ratingAgg,
  ] = await Promise.all([
    prisma.review.findMany({
      where:   { sellerId: id },
      orderBy: { createdAt: "desc" },
      take:    5,
      include: { buyer: { select: { username: true } } },
    }),
    prisma.deal.count({ where: { sellerId: id, status: "DONE" } }),
    prisma.review.count({ where: { sellerId: id } }),
    prisma.product.count({ where: { sellerId: id } }),
    prisma.review.aggregate({
      where:  { sellerId: id },
      _avg:   { rating: true },
    }),
  ]);

  const avgRating = ratingAgg._avg.rating;

  const joinYear = new Date(seller.createdAt).getFullYear();

  return (
    <main className="container" style={{ paddingTop: 60, paddingBottom: 100 }}>

      {/* Хлебные крошки */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 30, fontSize: 14, color: "#7e8796", flexWrap: "wrap" }}>
        <Link href="/catalog" style={{ color: "#7e8796" }}>Каталог</Link>
        <span>/</span>
        <span style={{ color: "white" }}>{seller.username}</span>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, alignItems: "start" }}
        className="sellerLayout"
      >

        {/* ── Боковая панель ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }} className="sellerSidebar">

          {/* Карточка продавца */}
          <div className="card" style={{ padding: 28, textAlign: "center" }}>

            {/* Аватар */}
            <div style={{
              width: 80, height: 80, borderRadius: "50%", margin: "0 auto 16px",
              background: "linear-gradient(135deg,#202938,#121821)",
              border: "2px solid rgba(255,154,0,.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 30, fontWeight: 900, color: "#ff9a00",
            }}>
              {seller.username[0].toUpperCase()}
            </div>

            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{seller.username}</div>
            <div style={{ fontSize: 13, color: "#7e8796", marginBottom: 20 }}>
              На сайте с {joinYear} года
            </div>

            {/* Звёзды */}
            {avgRating !== null ? (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 44, fontWeight: 900, color: "#ff9a00", lineHeight: 1 }}>
                  {avgRating.toFixed(1)}
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 4, margin: "8px 0 4px" }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} style={{ fontSize: 18, color: s <= Math.round(avgRating!) ? "#ff9a00" : "#2d3748" }}>★</span>
                  ))}
                </div>
                <div style={{ fontSize: 13, color: "#7e8796" }}>{totalReviewsCnt} отзывов</div>
              </div>
            ) : (
              <div style={{ color: "#7e8796", fontSize: 14, marginBottom: 20 }}>Нет отзывов</div>
            )}

            {/* Статистика */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              <StatBox label="Сделок" value={String(doneDealsCnt)} />
              <StatBox label="Товаров" value={String(productsCnt)} />
            </div>

            <Link href={`/seller/${id}/reviews`} style={{ display: "block" }}>
              <button className="darkButton" style={{ width: "100%" }}>
                Все отзывы →
              </button>
            </Link>

          </div>

        </div>

        {/* ── Основная область ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

          {/* Активные товары */}
          <section>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>
              Товары продавца
            </h2>

            {seller.products.length === 0 ? (
              <div className="card" style={{ padding: 28, textAlign: "center", color: "#7e8796" }}>
                У продавца пока нет активных товаров
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
                {seller.products.map(p => (
                  <Link key={p.id} href={`/product/${p.id}`} style={{ textDecoration: "none" }}>
                    <div className="card" style={{ padding: 18, cursor: "pointer" }}>
                      <div style={{
                        height: 80, borderRadius: 14, marginBottom: 14,
                        background: "linear-gradient(180deg,#151b25,#0d1117)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 36,
                      }}>
                        {categoryIcons[p.category as keyof typeof categoryIcons] ?? "📦"}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, lineHeight: 1.3, wordBreak: "break-word" }}>
                        {p.title}
                      </div>
                      <div style={{ fontSize: 13, color: "#7e8796", marginBottom: 8 }}>
                        Сервер {String(p.server).padStart(2, "0")}
                      </div>
                      <div style={{ fontWeight: 800, color: "#ff9a00", fontSize: 16 }}>
                        {p.category === "Вирты"
                          ? `${formatMoney(p.pricePerKK)}/кк`
                          : formatMoney(p.price)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Последние отзывы */}
          <section>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800 }}>Последние отзывы</h2>
              {totalReviewsCnt > 5 && (
                <Link href={`/seller/${id}/reviews`} style={{ fontSize: 13, color: "#ff9a00" }}>
                  Все {totalReviewsCnt} →
                </Link>
              )}
            </div>

            {recentReviews.length === 0 ? (
              <div className="card" style={{ padding: 28, textAlign: "center", color: "#7e8796" }}>
                Пока нет отзывов
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {recentReviews.map(r => (
                  <div key={r.id} className="card" style={{ padding: "18px 22px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 10, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{r.buyer.username}</div>
                        <div style={{ display: "flex", gap: 3 }}>
                          {[1, 2, 3, 4, 5].map(s => (
                            <span key={s} style={{ fontSize: 14, color: s <= r.rating ? "#ff9a00" : "#2d3748" }}>★</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: "#7e8796", flexShrink: 0 }}>
                        {new Date(r.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                      </div>
                    </div>
                    {r.comment ? (
                      <p style={{ fontSize: 14, color: "#b0bac8", lineHeight: 1.7, margin: 0 }}>{r.comment}</p>
                    ) : (
                      <p style={{ fontSize: 13, color: "#4a5568", margin: 0, fontStyle: "italic" }}>Без комментария</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </main>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      padding: "14px 10px", borderRadius: 14, textAlign: "center",
      background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)",
    }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: "white" }}>{value}</div>
      <div style={{ fontSize: 12, color: "#7e8796", marginTop: 4 }}>{label}</div>
    </div>
  );
}
