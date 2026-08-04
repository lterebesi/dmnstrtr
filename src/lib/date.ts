/** Prima zi a lunii ca "YYYY-MM-01", formatul folosit de coloana `month`. */
export function currentMonthDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

const MONTH_NAMES = [
  "ianuarie",
  "februarie",
  "martie",
  "aprilie",
  "mai",
  "iunie",
  "iulie",
  "august",
  "septembrie",
  "octombrie",
  "noiembrie",
  "decembrie",
];

/** Formatează "YYYY-MM-01" ca "august 2026". */
export function formatMonthLabel(monthDateString: string): string {
  const [year, month] = monthDateString.split("-");
  const index = Number(month) - 1;
  return `${MONTH_NAMES[index] ?? month} ${year}`;
}
