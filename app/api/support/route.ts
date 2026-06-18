import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const SYSTEM_PROMPT = `Ты — ИИ-ассистент маркетплейса Radmir RP Market.
Отвечай только на вопросы, связанные с платформой. Будь краток и конкретен.

О платформе:
- Radmir RP Market — маркетплейс для покупки и продажи игровых ценностей сервера Radmir RP (GTA RP).
- Категории: Вирты (игровая валюта), Имущество, Транспорт, Аксессуары.
- Валюта на платформе — внутренний баланс (рубли), пополняется вручную администратором.

Как купить:
1. Зарегистрируйся и пополни баланс (свяжись с администратором).
2. Перейди в каталог, выбери товар.
3. Нажми «Купить» — создаётся сделка.
4. Дождись, пока продавец примет сделку.
5. Получи товар в игре и нажми «Завершить» в разделе «Сделки».
6. Деньги переходят продавцу.

Как продать:
1. Нажми «Начать продавать» на главной или перейди в /sell.
2. Заполни: название, категорию, цену, описание.
3. Жди покупателя — сделка придёт в /deals.
4. Прими сделку и передай товар в игре.
5. Покупатель подтвердит получение — деньги поступят на баланс.

Как открыть спор:
- В разделе /deals нажми «Спор» рядом со сделкой.
- Администратор рассмотрит ситуацию и примет решение.
- Спор можно открыть на любом этапе сделки.

Комиссия:
- На данный момент комиссия платформой не взимается. Продавец получает полную сумму.

Пополнение баланса:
- Обратись к администратору напрямую. Автоматического пополнения пока нет.

Если вопрос не связан с платформой — вежливо откажись отвечать и предложи задать вопрос о платформе.
Отвечай на русском языке.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API не настроен. Обратитесь к администратору." },
      { status: 503 }
    );
  }

  let messages: { role: "user" | "assistant"; content: string }[];
  try {
    const body = await req.json();
    messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) throw new Error();
  } catch {
    return NextResponse.json({ error: "Неверный формат запроса." }, { status: 400 });
  }

  const client = new OpenAI({ apiKey });

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 600,
      temperature: 0.4,
    });

    const reply = completion.choices[0]?.message?.content ?? "Не удалось получить ответ.";
    return NextResponse.json({ reply });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("401") || msg.includes("Incorrect API key")) {
      return NextResponse.json({ error: "Неверный API ключ OpenAI." }, { status: 503 });
    }
    return NextResponse.json({ error: "Ошибка при обращении к ИИ. Попробуйте позже." }, { status: 500 });
  }
}
