/**
 * Webhook-обработчик для платёжных провайдеров.
 *
 * URL: POST /api/payments/webhook?provider=yookassa
 *
 * Для подключения провайдера:
 *  1. Реализуй IPaymentProvider.verifyWebhook() в lib/payments.ts.
 *  2. Укажи этот URL в настройках личного кабинета провайдера.
 *  3. Добавь WEBHOOK_SECRET_<PROVIDER> в .env.
 *
 * Сейчас возвращает 501 — провайдеры не подключены.
 */

import { NextRequest, NextResponse } from "next/server";
import { handleProviderWebhook } from "@/lib/payments";

export async function POST(req: NextRequest) {
  const provider = req.nextUrl.searchParams.get("provider");

  if (!provider) {
    return NextResponse.json(
      { error: "provider query param required" },
      { status: 400 }
    );
  }

  if (provider === "manual") {
    return NextResponse.json(
      { error: "Manual provider does not support webhooks" },
      { status: 400 }
    );
  }

  const rawBody  = await req.text();
  const signature = req.headers.get("x-signature") ?? "";

  try {
    await handleProviderWebhook(provider, rawBody, signature);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";

    // Провайдер не реализован — возвращаем 501
    if (msg.includes("не реализован")) {
      return NextResponse.json({ error: msg }, { status: 501 });
    }

    // Неверная подпись — 401
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}
