const CURRENCY_FORMATTER = new Intl.NumberFormat("ro-RO", {
  style: "currency",
  currency: "RON",
});

export function formatCurrency(amount: number): string {
  return CURRENCY_FORMATTER.format(amount);
}
