/**
 * Форматирует денежную сумму в USD.
 * formatMoney(10)   → "$10"
 * formatMoney(0)    → "$0"
 * formatMoney(1.5)  → "$1.5"
 */
export function formatMoney(amount: number | null | undefined): string {
  const n = (amount == null || isNaN(amount as number)) ? 0 : Number(amount);
  const str = Number.isInteger(n)
    ? String(n)
    : String(parseFloat(n.toFixed(2)));
  return `$${str}`;
}
