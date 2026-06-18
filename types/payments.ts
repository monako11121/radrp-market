// ─── Статусы заявок ─────────────────────────────────────────────────────────

export type PaymentStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

// ─── Провайдеры ─────────────────────────────────────────────────────────────

export type PaymentProvider =
  | "manual"       // ручное зачисление/вывод администратором
  | "yookassa"     // ЮKassa (карты РФ, СБП)
  | "tinkoff"      // Tinkoff Acquiring
  | "stripe"       // Stripe (международные карты)
  | "cryptomus";   // Cryptomus (криптовалюта)

export type PayoutProvider =
  | "manual"
  | "yookassa"     // ЮKassa Payouts
  | "tinkoff_payout"
  | "stripe_payout";

// ─── Методы оплаты / вывода ─────────────────────────────────────────────────

export type DepositMethod =
  | "card"         // банковская карта
  | "sbp"          // Система быстрых платежей
  | "crypto"       // криптовалюта
  | "manual";      // ручное пополнение

export type WithdrawalMethod =
  | "card"
  | "sbp"
  | "crypto";

// ─── Заявка на пополнение ───────────────────────────────────────────────────

export interface DepositRequestData {
  userId:    string;
  amount:    number;  // сумма к зачислению
  feeAmount: number;  // комиссия провайдера
  netAmount: number;  // amount - feeAmount (реально поступает на баланс)
  provider:  PaymentProvider;
  method:    DepositMethod;
}

export interface DepositRequestResult {
  depositRequestId: string;
  redirectUrl?: string;  // URL для оплаты (если нужен редирект к провайдеру)
}

// ─── Заявка на вывод ────────────────────────────────────────────────────────

export interface WithdrawalRequestData {
  userId:      string;
  amount:      number;  // запрошенная сумма
  feeAmount:   number;  // комиссия платформы за вывод
  netAmount:   number;  // amount - feeAmount (реально получает пользователь)
  provider:    PayoutProvider;
  method:      WithdrawalMethod;
  requisites?: string; // зашифрованные реквизиты (номер карты / телефон СБП)
}

export interface WithdrawalRequestResult {
  withdrawalRequestId: string;
}

// ─── Webhook от провайдера ──────────────────────────────────────────────────

export interface ProviderWebhookEvent {
  provider:         PaymentProvider;
  providerPaymentId: string;
  status:           PaymentStatus;
  amount:           number;
  metadata?:        Record<string, unknown>;
}

// ─── Интерфейс провайдера (для будущей реализации) ──────────────────────────
// Каждый провайдер реализует этот интерфейс.
// Пока используется только ManualProvider.

export interface IPaymentProvider {
  /**
   * Инициировать пополнение — возвращает redirectUrl или null (для manual).
   */
  initiateDeposit(data: DepositRequestData): Promise<{ redirectUrl?: string }>;

  /**
   * Инициировать выплату продавцу.
   */
  initiatePayout(data: WithdrawalRequestData): Promise<void>;

  /**
   * Верифицировать webhook-подпись и вернуть событие.
   * Бросает ошибку если подпись невалидна.
   */
  verifyWebhook(rawBody: string, signature: string): Promise<ProviderWebhookEvent>;
}

// ─── Комиссии (константы) ────────────────────────────────────────────────────

export const PLATFORM_COMMISSION_RATE = 0.05;   // 5% с продавца при каждой сделке
export const WITHDRAWAL_FEE_RATE      = 0.02;   // 2% за вывод (пример, не активно)
export const MIN_DEPOSIT_AMOUNT       = 10;     // минимальная сумма пополнения ($)
export const MIN_WITHDRAWAL_AMOUNT    = 10;     // минимальная сумма вывода ($)
