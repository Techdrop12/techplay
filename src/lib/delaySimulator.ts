// src/lib/delaySimulator.ts
// ✅ Estimation de livraison ultra propre : jours ouvrés, cutoff, jours fériés,
// zip-aware, facteur aléatoire stable, labels FR.

export type DeliveryEstimate = {
  label: string;           // "Livraison estimée : 3–5 jours"
  shipMin: Date;
  shipMax: Date;
  minDays: number;
  maxDays: number;
};

export type DeliveryOptions = {
  zipCode?: string;
  now?: Date;
  minDays?: number;             // avant application weekend/jours fériés
  maxDays?: number;
  businessDaysOnly?: boolean;   // défaut true
  cutoffHourLocal?: number;     // 0..23 - défaut 15h
  holidays?: string[];          // ["2025-12-25", "2026-01-01"]
};

const DEFAULT_HOLIDAYS = [
  // principaux jours fériés FR (ajuste si besoin)
  "2025-01-01", "2025-05-01", "2025-05-08", "2025-07-14", "2025-08-15",
  "2025-11-01", "2025-11-11", "2025-12-25",
];

function isHoliday(d: Date, holidays: Set<string>) {
  const iso = d.toISOString().slice(0, 10);
  return holidays.has(iso);
}
function isWeekend(d: Date) {
  const day = d.getDay();
  return day === 0 || day === 6;
}
function addDays(date: Date, n: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function addBusinessDays(base: Date, n: number, holidays: Set<string>) {
  let d = new Date(base);
  let added = 0;
  while (added < n) {
    d = addDays(d, 1);
    if (!isWeekend(d) && !isHoliday(d, holidays)) {
      added++;
    }
  }
  return d;
}
function seededOffset(zip?: string) {
  if (!zip) return 0;
  // petit bruit déterministe 0..1 jour
  const h = Array.from(zip).reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) % 97, 7);
  return h % 2; // 0 ou 1
}

export function estimateDelivery(opts: DeliveryOptions = {}): DeliveryEstimate {
  const {
    zipCode,
    now = new Date(),
    minDays = 2,
    maxDays = 5,
    businessDaysOnly = true,
    cutoffHourLocal = 15,
    holidays = DEFAULT_HOLIDAYS,
  } = opts;

  const holidaysSet = new Set(holidays);
  const afterCutoff = now.getHours() >= cutoffHourLocal;
  const base = afterCutoff ? addDays(now, 1) : now;

  const zipBonus = seededOffset(zipCode);
  const min = Math.max(1, minDays + zipBonus);
  const max = Math.max(min + 1, maxDays + zipBonus);

  const shipMin = businessDaysOnly ? addBusinessDays(base, min, holidaysSet) : addDays(base, min);
  const shipMax = businessDaysOnly ? addBusinessDays(base, max, holidaysSet) : addDays(base, max);

  const label =
    min === max
      ? `Livraison estimée : ${min} jour${min > 1 ? "s" : ""}`
      : `Livraison estimée : ${min}–${max} jours`;

  return { label, shipMin, shipMax, minDays: min, maxDays: max };
}
