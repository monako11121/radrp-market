import Link from "next/link";

export const metadata = {
  title: "Частые вопросы (FAQ) — Radmir RP Market",
  description: "Ответы на частые вопросы о покупке, продаже и безопасности на Radmir RP Market",
};

type FaqItem = {
  q: string;
  a: React.ReactNode;
  anchor: string;
};

const FAQ: FaqItem[] = [
  {
    anchor: "buy",
    q: "Как купить товар?",
    a: (
      <>
        <ol style={{ paddingLeft: 18, margin: 0, lineHeight: 2 }}>
          <li>Зарегистрируйтесь или войдите в аккаунт.</li>
          <li>Пополните баланс — свяжитесь с администратором.</li>
          <li>Перейдите в <Link href="/catalog" style={{ color: "#ff9a00" }}>Каталог</Link> и выберите товар.</li>
          <li>Нажмите <strong>«Купить»</strong> — откроется окно подтверждения.</li>
          <li>Подтвердите покупку — средства заморозятся гарантом.</li>
          <li>Дождитесь принятия сделки продавцом.</li>
          <li>Получите товар в игре и нажмите <strong>«Завершить»</strong>.</li>
        </ol>
      </>
    ),
  },
  {
    anchor: "sell",
    q: "Как продать товар?",
    a: (
      <>
        <ol style={{ paddingLeft: 18, margin: 0, lineHeight: 2 }}>
          <li>Войдите в аккаунт.</li>
          <li>Нажмите <strong>«Продать»</strong> в шапке сайта.</li>
          <li>Заполните название, описание, категорию, сервер и цену.</li>
          <li>Опубликуйте объявление — оно появится в каталоге.</li>
          <li>Когда покупатель создаст сделку — примите её в разделе <Link href="/deals" style={{ color: "#ff9a00" }}>Сделки</Link>.</li>
          <li>Передайте товар в игре и дождитесь подтверждения от покупателя.</li>
          <li>Деньги поступят на баланс за вычетом комиссии 5%.</li>
        </ol>
      </>
    ),
  },
  {
    anchor: "chat",
    q: "Как написать продавцу без покупки?",
    a: "На странице товара нажмите «Написать». Откроется сделка-чат без заморозки средств. Вы можете обсудить детали, уточнить наличие и только потом оплатить — нажав «Оплатить» внутри сделки.",
  },
  {
    anchor: "pay",
    q: "Как оплатить сделку?",
    a: (
      <>
        <p style={{ margin: "0 0 10px" }}>Есть два способа:</p>
        <p style={{ margin: "0 0 6px" }}>
          <strong>Через кнопку «Купить»</strong> на странице товара — деньги замораживаются сразу.
        </p>
        <p style={{ margin: 0 }}>
          <strong>Через чат</strong> — сначала нажмите «Написать», пообщайтесь с продавцом, затем нажмите <strong>«Оплатить»</strong> внутри открытой сделки. Кнопка появляется, если сделка ещё не оплачена.
        </p>
      </>
    ),
  },
  {
    anchor: "dispute",
    q: "Как открыть спор?",
    a: (
      <>
        <p style={{ margin: "0 0 10px" }}>Откройте спор, если:</p>
        <ul style={{ paddingLeft: 18, margin: "0 0 10px", lineHeight: 2 }}>
          <li>Продавец не выходит на связь после принятия сделки.</li>
          <li>Товар передан не в полном объёме или не тот.</li>
          <li>Продавец просит оплату вне платформы.</li>
        </ul>
        <p style={{ margin: 0 }}>
          Перейдите в <Link href="/deals" style={{ color: "#ff9a00" }}>Сделки</Link>, выберите нужную сделку и нажмите <strong>«Спор»</strong>. Администратор рассмотрит заявку в течение 1–3 рабочих дней.
        </p>
      </>
    ),
  },
  {
    anchor: "withdraw",
    q: "Как вывести деньги?",
    a: (
      <>
        <ol style={{ paddingLeft: 18, margin: 0, lineHeight: 2 }}>
          <li>Перейдите в <Link href="/withdraw" style={{ color: "#ff9a00" }}>Вывод средств</Link> (кнопка в профиле).</li>
          <li>Укажите сумму, способ вывода и реквизиты.</li>
          <li>Нажмите <strong>«Создать заявку»</strong> — деньги зарезервируются.</li>
          <li>Администратор обработает заявку вручную в течение 1–3 рабочих дней.</li>
          <li>После одобрения и выплаты статус изменится на «Выплачено».</li>
        </ol>
        <p style={{ margin: "10px 0 0", fontSize: 13, color: "#7e8796" }}>
          При отклонении заявки средства автоматически возвращаются на баланс.
        </p>
      </>
    ),
  },
  {
    anchor: "frozen",
    q: "Почему деньги заморожены?",
    a: (
      <>
        <p style={{ margin: "0 0 10px" }}>Деньги могут быть заморожены по двум причинам:</p>
        <p style={{ margin: "0 0 6px" }}>
          <strong style={{ color: "#ffb340" }}>🔒 Заморожено в сделке</strong> — вы совершили покупку, средства ждут завершения сделки. После нажатия «Завершить» деньги уйдут продавцу.
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ color: "#a78bfa" }}>⏳ На выводе</strong> — вы создали заявку на вывод. Средства будут возвращены, если заявку отклонят, или выплачены — если одобрят.
        </p>
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <main className="container" style={{ paddingTop: 60, paddingBottom: 100 }}>

      {/* Заголовок */}
      <div style={{ marginBottom: 48 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 16px", borderRadius: 999,
          background: "rgba(255,154,0,.08)", border: "1px solid rgba(255,154,0,.18)",
          color: "#ffb340", fontSize: 13, marginBottom: 20,
        }}>
          ❓ Частые вопросы
        </div>
        <h1 style={{ fontSize: "clamp(38px,6vw,56px)", fontWeight: 900, marginBottom: 16, lineHeight: 1.1 }}>
          FAQ
        </h1>
        <p style={{ fontSize: 17, color: "#7e8796", maxWidth: 560, lineHeight: 1.7 }}>
          Ответы на самые частые вопросы о работе маркетплейса.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 32, alignItems: "start" }} className="faqLayout">

        {/* Навигация по якорям */}
        <div className="card faqNav" style={{ padding: "20px 18px", position: "sticky", top: 110 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#7e8796", letterSpacing: 1, marginBottom: 14 }}>
            СОДЕРЖАНИЕ
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {FAQ.map((item) => (
              <a
                key={item.anchor}
                href={`#${item.anchor}`}
                style={{ fontSize: 13, color: "#7e8796", padding: "4px 0", lineHeight: 1.4 }}
              >
                {item.q}
              </a>
            ))}
          </div>
        </div>

        {/* Вопросы */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {FAQ.map((item, i) => (
            <div
              key={item.anchor}
              id={item.anchor}
              className="card"
              style={{ padding: "24px 28px", scrollMarginTop: 120 }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  background: "rgba(255,154,0,.10)", border: "1px solid rgba(255,154,0,.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 900, color: "#ff9a00",
                }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>
                    {item.q}
                  </h2>
                  <div style={{ fontSize: 15, color: "#b0bac8", lineHeight: 1.75 }}>
                    {item.a}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Ссылки */}
      <div style={{ display: "flex", gap: 14, marginTop: 48, flexWrap: "wrap" }}>
        <Link href="/guarantee">
          <button className="orangeButton">Как работает гарант →</button>
        </Link>
        <Link href="/rules">
          <button className="darkButton">Правила платформы</button>
        </Link>
        <Link href="/support">
          <button className="darkButton">Задать вопрос</button>
        </Link>
      </div>

    </main>
  );
}
