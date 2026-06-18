import Link from "next/link";

export const metadata = {
  title: "Правила платформы — Radmir RP Market",
  description: "Правила использования маркетплейса Radmir RP Market",
};

const ICON_STYLE = {
  fontSize: 28,
  marginBottom: 10,
} as const;

const SECTION_TITLE = {
  fontSize: 20,
  fontWeight: 800,
  marginBottom: 14,
  color: "white",
} as const;

const PARA = {
  fontSize: 15,
  color: "#b0bac8",
  lineHeight: 1.85,
  margin: 0,
} as const;

const LIST_ITEM = {
  display: "flex",
  gap: 10,
  alignItems: "flex-start",
  fontSize: 15,
  color: "#b0bac8",
  lineHeight: 1.7,
  marginBottom: 8,
} as const;

function Section({
  icon,
  title,
  children,
  accent = false,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className="card"
      style={{
        padding: 28,
        border: accent ? "1px solid rgba(239,68,68,.22)" : undefined,
        background: accent ? "rgba(239,68,68,.04)" : undefined,
      }}
    >
      <div style={ICON_STYLE}>{icon}</div>
      <h2 style={SECTION_TITLE}>{title}</h2>
      {children}
    </div>
  );
}

function Li({ dot = "•", children }: { dot?: string; children: React.ReactNode }) {
  return (
    <div style={LIST_ITEM}>
      <span style={{ color: "#ff9a00", flexShrink: 0, marginTop: 2 }}>{dot}</span>
      <span>{children}</span>
    </div>
  );
}

export default function RulesPage() {
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
          📋 Правила платформы
        </div>
        <h1 style={{ fontSize: "clamp(38px,6vw,56px)", fontWeight: 900, marginBottom: 16, lineHeight: 1.1 }}>
          Правила <span style={{ color: "#ff9a00" }}>Radmir RP</span> Market
        </h1>
        <p style={{ fontSize: 17, color: "#7e8796", maxWidth: 640, lineHeight: 1.7 }}>
          Соблюдение правил обязательно для всех участников платформы.
          Незнание правил не освобождает от ответственности.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(520px,1fr))", gap: 20 }}>

        {/* Что можно продавать */}
        <Section icon="✅" title="Разрешено продавать">
          <Li>Игровую валюту (вирты) сервера Radmir RP</Li>
          <Li>Транспортные средства из игры Radmir RP</Li>
          <Li>Имущество (квартиры, дома, бизнесы) в рамках правил сервера</Li>
          <Li>Игровые аксессуары и предметы</Li>
          <Li>Любые ценности, не нарушающие правила сервера Radmir RP</Li>
        </Section>

        {/* Что запрещено */}
        <Section icon="🚫" title="Запрещено">
          <Li dot="✕">Продавать аккаунты игроков</Li>
          <Li dot="✕">Продавать читы, моды, скрипты</Li>
          <Li dot="✕">Рекламировать другие платформы и маркетплейсы</Li>
          <Li dot="✕">Размещать дублирующиеся объявления</Li>
          <Li dot="✕">Указывать заведомо ложные цены или описания</Li>
          <Li dot="✕">Проводить сделки в обход гаранта платформы</Li>
          <Li dot="✕">Использовать несколько аккаунтов</Li>
        </Section>

        {/* Правила общения */}
        <Section icon="💬" title="Правила общения в чате сделки">
          <Li>Общайтесь уважительно — оскорбления запрещены</Li>
          <Li>Используйте чат только для обсуждения текущей сделки</Li>
          <Li>Не передавайте персональные данные в чате</Li>
          <Li>Не пишите ссылки на сторонние ресурсы</Li>
          <Li>Чат сделки является доказательной базой при разборе споров</Li>
        </Section>

        {/* Ответственность покупателя */}
        <Section icon="🛒" title="Ответственность покупателя">
          <Li>Убедитесь в корректности товара перед подтверждением сделки</Li>
          <Li>После нажатия «Завершить» — сделка закрыта, претензии не принимаются</Li>
          <Li>Обязательно проверьте получение товара в игре до подтверждения</Li>
          <Li>При проблемах — открывайте спор, не завершайте сделку</Li>
          <Li>Не передавайте реквизиты продавцу вне платформы</Li>
        </Section>

        {/* Ответственность продавца */}
        <Section icon="🏪" title="Ответственность продавца">
          <Li>Передайте товар покупателю точно в соответствии с описанием</Li>
          <Li>Соблюдайте сроки — не задерживайте передачу товара</Li>
          <Li>Указывайте реальные цены и актуальные остатки (для виртов)</Li>
          <Li>Комиссия платформы 5% списывается при завершении каждой сделки</Li>
          <Li>За систематические отказы от сделок аккаунт может быть заблокирован</Li>
        </Section>

        {/* Когда открывать спор */}
        <Section icon="⚖️" title="Когда открывать спор">
          <Li>Продавец не выходит на связь более 24 часов после принятия сделки</Li>
          <Li>Товар передан не в том количестве или качестве</Li>
          <Li>Продавец требует оплату вне платформы</Li>
          <Li>Любое нарушение условий сделки со стороны продавца</Li>
          <p style={{ ...PARA, marginTop: 12, fontSize: 13, color: "#7e8796" }}>
            Спор разбирается администратором в течение 1–3 рабочих дней.
            Решение администратора окончательное.
          </p>
        </Section>

        {/* Мошенничество */}
        <Section icon="🚨" title="Последствия мошенничества" accent>
          <Li dot="⚠">Постоянная блокировка аккаунта</Li>
          <Li dot="⚠">Заморозка всех средств на балансе</Li>
          <Li dot="⚠">Передача данных в администрацию сервера Radmir RP</Li>
          <Li dot="⚠">Публичное внесение в список недобросовестных продавцов</Li>
          <p style={{ ...PARA, marginTop: 12, fontSize: 13, color: "#7e8796" }}>
            Под мошенничеством понимается: обман при описании товара, получение
            оплаты без передачи товара, сговор с целью обхода гаранта.
          </p>
        </Section>

      </div>

      {/* Ссылки на другие страницы */}
      <div style={{ display: "flex", gap: 14, marginTop: 48, flexWrap: "wrap" }}>
        <Link href="/guarantee">
          <button className="orangeButton">Как работает гарант →</button>
        </Link>
        <Link href="/faq">
          <button className="darkButton">Частые вопросы</button>
        </Link>
      </div>

    </main>
  );
}
