import Link from "next/link";

export const metadata = {
  title: "Как работает гарант — Radmir RP Market",
  description: "Система безопасных сделок с заморозкой средств на Radmir RP Market",
};

const STEPS = [
  {
    num: "01",
    icon: "🛒",
    title: "Покупатель оплачивает товар",
    text: "Нажмите «Купить» на странице товара и подтвердите покупку в модальном окне. Средства спишутся с вашего баланса.",
    color: "#ff9a00",
  },
  {
    num: "02",
    icon: "🔒",
    title: "Деньги замораживаются гарантом",
    text: "Средства переходят в статус «Заморожено» — они не у продавца и не у покупателя, а под защитой платформы. Продавец не получит деньги до завершения сделки.",
    color: "#ffb340",
  },
  {
    num: "03",
    icon: "✋",
    title: "Продавец принимает сделку",
    text: "Продавец видит уведомление и принимает сделку. После этого стороны обсуждают детали передачи в чате сделки.",
    color: "#22c55e",
  },
  {
    num: "04",
    icon: "🎮",
    title: "Передача товара в игре",
    text: "Продавец передаёт товар (валюту, транспорт, имущество) покупателю непосредственно в игре Radmir RP. Используйте чат для координации.",
    color: "#38bdf8",
  },
  {
    num: "05",
    icon: "✅",
    title: "Покупатель подтверждает получение",
    text: "После получения товара нажмите «Завершить» в разделе «Сделки». Это сигнал платформе, что всё прошло успешно.",
    color: "#a78bfa",
  },
  {
    num: "06",
    icon: "💰",
    title: "Продавец получает деньги",
    text: "Средства зачисляются на баланс продавца за вычетом комиссии платформы 5%. Деньги сразу доступны для вывода.",
    color: "#22c55e",
  },
];

const FAQ_ITEMS = [
  {
    q: "Могу ли я вернуть деньги после завершения сделки?",
    a: "Нет. После нажатия «Завершить» сделка закрывается окончательно. Убедитесь в получении товара до подтверждения.",
  },
  {
    q: "Что происходит с деньгами при споре?",
    a: "Средства остаются замороженными до решения администратора. Никто не может их получить до окончания разбирательства.",
  },
  {
    q: "Сколько времени занимает разбор спора?",
    a: "Администратор рассматривает споры в течение 1–3 рабочих дней. При необходимости запрашивает скриншоты у обеих сторон.",
  },
  {
    q: "Зачем нужна комиссия 5%?",
    a: "Комиссия покрывает расходы на работу платформы, поддержку и арбитраж споров. Взимается только с продавца при успешной сделке.",
  },
];

export default function GuaranteePage() {
  return (
    <main className="container" style={{ paddingTop: 60, paddingBottom: 100 }}>

      {/* Заголовок */}
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 16px", borderRadius: 999,
          background: "rgba(255,154,0,.08)", border: "1px solid rgba(255,154,0,.18)",
          color: "#ffb340", fontSize: 13, marginBottom: 20,
        }}>
          🛡 Система гаранта
        </div>
        <h1 style={{ fontSize: "clamp(38px,6vw,56px)", fontWeight: 900, marginBottom: 16, lineHeight: 1.1 }}>
          Как работает <span style={{ color: "#ff9a00" }}>гарант</span>
        </h1>
        <p style={{ fontSize: 17, color: "#7e8796", maxWidth: 580, margin: "0 auto", lineHeight: 1.7 }}>
          Все сделки на платформе защищены системой заморозки средств.
          Ни продавец, ни покупатель не могут потерять деньги при честной сделке.
        </p>
      </div>

      {/* Шаги */}
      <div style={{ position: "relative", maxWidth: 760, margin: "0 auto 72px" }}>

        {/* Вертикальная линия */}
        <div style={{
          position: "absolute", left: 35, top: 0, bottom: 0,
          width: 2, background: "rgba(255,255,255,.06)",
          zIndex: 0,
        }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              style={{
                display: "flex",
                gap: 24,
                alignItems: "flex-start",
                paddingBottom: i < STEPS.length - 1 ? 32 : 0,
                position: "relative",
                zIndex: 1,
              }}
            >
              {/* Иконка-кружок */}
              <div style={{
                width: 72, height: 72, borderRadius: "50%", flexShrink: 0,
                background: `${step.color}14`,
                border: `2px solid ${step.color}40`,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                fontSize: 22,
              }}>
                {step.icon}
              </div>

              {/* Текст */}
              <div className="card" style={{ flex: 1, padding: "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: step.color, letterSpacing: 1 }}>
                    ШАГ {step.num}
                  </span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: "#b0bac8", lineHeight: 1.75, margin: 0 }}>{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Баннер комиссии */}
      <div className="card" style={{
        padding: "28px 32px", marginBottom: 60, maxWidth: 760, margin: "0 auto 60px",
        background: "rgba(255,154,0,.04)", border: "1px solid rgba(255,154,0,.15)",
        display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, alignItems: "center",
      }}>
        <div style={{ fontSize: 42 }}>💎</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>
            Комиссия платформы — 5%
          </div>
          <p style={{ fontSize: 14, color: "#b0bac8", lineHeight: 1.7, margin: 0 }}>
            Взимается только с <strong style={{ color: "white" }}>продавца</strong> при успешном завершении сделки.
            Покупатель платит ровно столько, сколько указано в объявлении.
            При возврате средств (спор в пользу покупателя) — вся сумма возвращается без удержаний.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 24, textAlign: "center" }}>
          Частые вопросы о гаранте
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {FAQ_ITEMS.map((item) => (
            <div key={item.q} className="card" style={{ padding: "20px 24px" }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: "white" }}>
                {item.q}
              </div>
              <div style={{ fontSize: 14, color: "#b0bac8", lineHeight: 1.75 }}>
                {item.a}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ссылки */}
      <div style={{ display: "flex", gap: 14, marginTop: 48, justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/faq">
          <button className="orangeButton">Частые вопросы →</button>
        </Link>
        <Link href="/rules">
          <button className="darkButton">Правила платформы</button>
        </Link>
      </div>

    </main>
  );
}
