import { prisma }  from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link         from "next/link";

export default async function SellerReviewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const seller = await prisma.user.findUnique({
    where: { id },
    select: { id: true, username: true, createdAt: true },
  });

  if (!seller) notFound();

  const reviews = await prisma.review.findMany({
    where:   { sellerId: id },
    orderBy: { createdAt: "desc" },
    include: { buyer: { select: { username: true } } },
  });

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null;

  // Распределение по звёздам
  const dist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }));

  return (
    <main className="container" style={{ paddingTop: 60, paddingBottom: 100 }}>

      {/* Хлебные крошки */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 26, fontSize: 14, color: "#7e8796", flexWrap: "wrap" }}>
        <Link href="/catalog" style={{ color: "#7e8796" }}>Каталог</Link>
        <span>/</span>
        <Link href={`/seller/${seller.id}`} style={{ color: "#7e8796" }}>{seller.username}</Link>
        <span>/</span>
        <span style={{ color: "white" }}>Отзывы</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24, alignItems: "start" }} className="reviewLayout">

        {/* Боковая панель — итоги */}
        <div className="card" style={{ padding: 26, position: "sticky", top: 110 }}>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 22 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "linear-gradient(180deg,#202938,#121821)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, fontWeight: 900, marginBottom: 14,
            }}>
              {seller.username[0]}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{seller.username}</div>
            <div style={{ fontSize: 13, color: "#7e8796" }}>
              На сайте с {new Date(seller.createdAt).getFullYear()} года
            </div>
          </div>

          {/* Средний рейтинг */}
          {avgRating !== null ? (
            <>
              <div style={{ textAlign: "center", marginBottom: 18 }}>
                <div style={{ fontSize: 52, fontWeight: 900, color: "#ff9a00", lineHeight: 1 }}>
                  {avgRating.toFixed(1)}
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 4, margin: "8px 0" }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} style={{ fontSize: 20, color: s <= Math.round(avgRating!) ? "#ff9a00" : "#2d3748" }}>★</span>
                  ))}
                </div>
                <div style={{ fontSize: 13, color: "#7e8796" }}>{reviews.length} отзывов</div>
              </div>

              {/* Распределение */}
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {dist.map(({ star, count }) => {
                  const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={star} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                      <span style={{ color: "#7e8796", minWidth: 14, textAlign: "right" }}>{star}</span>
                      <span style={{ color: "#ff9a00", fontSize: 12 }}>★</span>
                      <div style={{ flex: 1, height: 6, borderRadius: 3, background: "#1d2734", overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: "#ff9a00", borderRadius: 3, transition: "width .3s" }} />
                      </div>
                      <span style={{ color: "#7e8796", minWidth: 20, textAlign: "right" }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", color: "#7e8796", fontSize: 14, padding: "12px 0" }}>
              Отзывов пока нет
            </div>
          )}

        </div>

        {/* Список отзывов */}
        <div>

          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 20 }}>
            Отзывы о продавце
          </h1>

          {reviews.length === 0 ? (
            <div className="card" style={{ padding: 36, textAlign: "center", color: "#7e8796" }}>
              Пока нет отзывов. Оставьте первый после завершения сделки.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {reviews.map(review => (
                <div key={review.id} className="card" style={{ padding: 22 }}>

                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{review.buyer.username}</div>
                      <div style={{ display: "flex", gap: 3 }}>
                        {[1, 2, 3, 4, 5].map(s => (
                          <span key={s} style={{ fontSize: 16, color: s <= review.rating ? "#ff9a00" : "#2d3748" }}>★</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "#7e8796", flexShrink: 0 }}>
                      {new Date(review.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                  </div>

                  {review.comment ? (
                    <p style={{ fontSize: 14, color: "#c0c8d4", lineHeight: 1.8, margin: 0 }}>
                      {review.comment}
                    </p>
                  ) : (
                    <p style={{ fontSize: 13, color: "#4a5568", margin: 0, fontStyle: "italic" }}>
                      Без комментария
                    </p>
                  )}

                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </main>
  );
}
