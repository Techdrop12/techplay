// src/components/ShippingSimulator.tsx
'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';

interface ShippingSimulatorProps {
  minDays?: number;
  maxDays?: number;
  businessDaysOnly?: boolean;
  cutoffHourLocal?: number;
  holidays?: string[];
  varianceExtraDays?: number;
  productKey?: string;
  showDates?: boolean;
  locale?: string;
  timeZone?: string;
  persist?: 'local' | 'session';
  className?: string;
  icon?: string;
}

export default function ShippingSimulator({
  minDays = 2,
  maxDays = 5,
  businessDaysOnly = true,
  cutoffHourLocal = 15,
  holidays = [],
  varianceExtraDays = 1,
  productKey,
  showDates = true,
  locale = 'fr-FR',
  timeZone,
  persist = 'local',
  className = '',
  icon = '🚚',
}: ShippingSimulatorProps) {
  const [state, setState] = useState<{
    shipToday: boolean;
    daysMin: number;
    daysMax: number;
    etaStart: Date | null;
    etaEnd: Date | null;
  }>({
    shipToday: false,
    daysMin: minDays,
    daysMax: maxDays,
    etaStart: null,
    etaEnd: null,
  });
  const srRef = useRef<HTMLSpanElement>(null);

  const toYMD = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const holidaysSet = useMemo(
    () => new Set((holidays || []).filter(Boolean)),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- holidays from props, stable ref
    [JSON.stringify(holidays || [])]
  );

  const isHoliday = (d: Date) => holidaysSet.has(toYMD(d));
  const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

  const addBusinessDays = (date: Date, days: number): Date => {
    const out = new Date(date);
    let added = 0;
    while (added < days) {
      out.setDate(out.getDate() + 1);
      if (!isWeekend(out) && !isHoliday(out)) added++;
    }
    return out;
  };
  const addCalendarDays = (date: Date, days: number): Date => {
    const out = new Date(date);
    out.setDate(out.getDate() + days);
    return out;
  };
  const addDays = businessDaysOnly ? addBusinessDays : addCalendarDays;

  const seeded = (seedStr: string) => {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seedStr.length; i++) {
      h ^= seedStr.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return () => {
      h += h << 13;
      h ^= h >>> 7;
      h += h << 3;
      h ^= h >>> 17;
      h += h << 5;
      return (h >>> 0) / 4294967295;
    };
  };

  const fmtDate = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        ...(timeZone ? { timeZone } : {}),
      }),
    [locale, timeZone]
  );
  const plural = (n: number, s: string, p: string) => (n > 1 ? p : s);

  useEffect(() => {
    const now = new Date();

    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
    const rawKey = productKey || pathname;
    const safeKey = encodeURIComponent(rawKey);
    const LS_KEY = `tp_ship_${safeKey}`;

    const storage =
      persist === 'session'
        ? (typeof window !== 'undefined' ? window.sessionStorage : undefined)
        : (typeof window !== 'undefined' ? window.localStorage : undefined);

    let persisted: { daysBaseMin?: number; daysBaseMax?: number; exp?: number } | undefined;
    try {
      const raw = storage?.getItem(LS_KEY);
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj && obj.exp > Date.now()) persisted = obj;
      }
    } catch {}

    let daysBaseMin = minDays;
    let daysBaseMax = maxDays;

    if (persisted?.daysBaseMin != null && persisted?.daysBaseMax != null) {
      daysBaseMin = persisted.daysBaseMin;
      daysBaseMax = persisted.daysBaseMax;
    } else {
      const rnd = seeded(`${rawKey}-${toYMD(now)}`);
      const extra = Math.floor(rnd() * (Math.max(0, varianceExtraDays) + 1));
      const span = Math.max(0, maxDays - minDays);
      const bump = Math.floor(rnd() * (span + 1));
      daysBaseMin = minDays + Math.min(bump, span);
      daysBaseMax = Math.max(daysBaseMin + 1, maxDays + extra);

      try {
        storage?.setItem(
          LS_KEY,
          JSON.stringify({
            daysBaseMin,
            daysBaseMax,
            exp: Date.now() + 24 * 60 * 60 * 1000,
          })
        );
      } catch {}
    }

    const isBeforeCutoff = now.getHours() < cutoffHourLocal;
    const todayIsWorking = !isWeekend(now) && !isHoliday(now);
    const shipToday = isBeforeCutoff && todayIsWorking;

    const shipStart = new Date(now);
    if (!shipToday) {
      const start = new Date(now);
      if (isWeekend(start) || isHoliday(start) || !isBeforeCutoff) {
        start.setDate(start.getDate() + 1);
        while (businessDaysOnly && (isWeekend(start) || isHoliday(start))) {
          start.setDate(start.getDate() + 1);
        }
      }
      shipStart.setTime(start.getTime());
    }

    const etaStart = addDays(shipStart, daysBaseMin);
    const etaEnd = addDays(shipStart, daysBaseMax);

    setState({ shipToday, daysMin: daysBaseMin, daysMax: daysBaseMax, etaStart, etaEnd });

    try {
      if (srRef.current) {
        const txt = shipToday
          ? `Expédition aujourd'hui. Livraison estimée entre ${fmtDate.format(etaStart)} et ${fmtDate.format(etaEnd)}.`
          : `Expédition prochaine. Livraison estimée entre ${fmtDate.format(etaStart)} et ${fmtDate.format(etaEnd)}.`;
        srRef.current.textContent = txt;
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps -- addDays/fmtDate/isHoliday are stable
  }, [
    productKey,
    minDays,
    maxDays,
    businessDaysOnly,
    cutoffHourLocal,
    varianceExtraDays,
    holidaysSet,
    locale,
    timeZone,
    persist,
  ]);

  const { shipToday, daysMin, daysMax, etaStart, etaEnd } = state;

  const line = useMemo(() => {
    if (!daysMin || !daysMax) return null;
    const rangeTxt =
      daysMin === daysMax
        ? `${daysMin} ${plural(daysMin, 'jour', 'jours')}`
        : `${daysMin}–${daysMax} jours`;
    const datesTxt =
      showDates && etaStart && etaEnd
        ? ` • ${fmtDate.format(etaStart)} → ${fmtDate.format(etaEnd)}`
        : '';
    const shipTxt = shipToday ? "Expédié aujourd'hui" : 'Expédition prochaine';
    return `${shipTxt} · Livraison estimée sous ${rangeTxt}${datesTxt}`;
  }, [shipToday, daysMin, daysMax, etaStart, etaEnd, fmtDate, showDates]);

  if (!line) return null;

  return (
    <motion.p
      className={`text-sm text-token-text/70 mt-2 ${className}`}
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      <span aria-hidden="true" className="mr-1.5">
        {icon}
      </span>
      {line}
      <span ref={srRef} className="sr-only" />
    </motion.p>
  );
}
