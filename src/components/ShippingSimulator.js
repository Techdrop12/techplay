// src/components/ShippingSimulator.js
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * ShippingSimulator
 * - Jours ouvrés/feriés, cutoff, seed stable 24h (local|session)
 * - Affiche: “Expédié aujourd’hui / prochain” + fenêtre dates
 */
export default function ShippingSimulator({
  minDays = 2,
  maxDays = 5,
  businessDaysOnly = true,
  cutoffHourLocal = 15,
  holidays = [],                 // ['2025-12-25', '2026-01-01']
  varianceExtraDays = 1,         // ajoute aléatoirement 0..N jours au max
  productKey,                    // id/slug; fallback: pathname
  showDates = true,
  locale = 'fr-FR',
  timeZone,                      // ex: 'Europe/Paris' (facultatif)
  persist = 'local',             // 'local' | 'session'
  className = '',
  icon = '🚚',
}) {
  const [state, setState] = useState({
    shipToday: false,
    daysMin: minDays,
    daysMax: maxDays,
    etaStart: null, // Date | null
    etaEnd: null,   // Date | null
  });
  const srRef = useRef(null);

  // --- utils ---
  const toYMD = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;

  // Set pour lookup O(1) (et robustesse si array recréé)
  const holidaysSet = useMemo(
    () => new Set((holidays || []).filter(Boolean)),
    // JSON stringify pour mémo stable même si nouvelle référence
    [JSON.stringify(holidays || [])]
  );

  const isHoliday = (d) => holidaysSet.has(toYMD(d));
  const isWeekend = (d) => d.getDay() === 0 || d.getDay() === 6;

  const addBusinessDays = (date, days) => {
    const out = new Date(date);
    let added = 0;
    while (added < days) {
      out.setDate(out.getDate() + 1);
      if (!isWeekend(out) && !isHoliday(out)) added++;
    }
    return out;
  };
  const addCalendarDays = (date, days) => {
    const out = new Date(date);
    out.setDate(out.getDate() + days);
    return out;
  };
  const addDays = businessDaysOnly ? addBusinessDays : addCalendarDays;

  // petit random stable (seed string)
  const seeded = (seedStr) => {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seedStr.length; i++) {
      h ^= seedStr.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return () => {
      h += h << 13; h ^= h >>> 7; h += h << 3; h ^= h >>> 17; h += h << 5;
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
  const plural = (n, s, p) => (n > 1 ? p : s);

  useEffect(() => {
    const now = new Date();

    const pathname =
      typeof window !== 'undefined' ? window.location.pathname : '/';
    const rawKey = productKey || pathname;
    // clé storage “safe”
    const safeKey = encodeURIComponent(rawKey);
    const LS_KEY = `tp_ship_${safeKey}`;

    const storage =
      persist === 'session'
        ? (typeof window !== 'undefined' ? window.sessionStorage : undefined)
        : (typeof window !== 'undefined' ? window.localStorage : undefined);

    // Reprendre valeur stable (<24h)
    let persisted;
    try {
      const raw = storage?.getItem(LS_KEY);
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj && obj.exp > Date.now()) persisted = obj;
      }
    } catch {}

    let daysBaseMin = minDays;
    let daysBaseMax = maxDays;

    if (persisted?.daysBaseMin && persisted?.daysBaseMax) {
      daysBaseMin = persisted.daysBaseMin;
      daysBaseMax = persisted.daysBaseMax;
    } else {
      // random stable: varie chaque jour, stable pour la journée
      const rnd = seeded(`${rawKey}-${toYMD(now)}`);
      const extra = Math.floor(rnd() * (Math.max(0, varianceExtraDays) + 1)); // 0..N
      const span = Math.max(0, maxDays - minDays);
      const bump = Math.floor(rnd() * (span + 1)); // 0..span
      daysBaseMin = minDays + Math.min(bump, span);
      daysBaseMax = Math.max(daysBaseMin + 1, maxDays + extra);

      try {
        storage?.setItem(
          LS_KEY,
          JSON.stringify({
            daysBaseMin,
            daysBaseMax,
            exp: Date.now() + 24 * 60 * 60 * 1000, // 24h
          })
        );
      } catch {}
    }

    // Cutoff & jour ouvré actuel
    const isBeforeCutoff = now.getHours() < cutoffHourLocal;
    const todayIsWorking = !isWeekend(now) && !isHoliday(now);
    const shipToday = isBeforeCutoff && todayIsWorking;

    // Point de départ d’expédition
    const shipStart = new Date(now);
    if (!shipToday) {
      let start = new Date(now);
      // si weekend/jour férié OU cutoff dépassé -> +1 puis (si businessDaysOnly) saute wkd/holidays
      if (isWeekend(start) || isHoliday(start) || !isBeforeCutoff) {
        start.setDate(start.getDate() + 1);
        while (businessDaysOnly && (isWeekend(start) || isHoliday(start))) {
          start.setDate(start.getDate() + 1);
        }
      }
      shipStart.setTime(start.getTime());
    }

    // Fenêtre ETA
    const etaStart = addDays(shipStart, daysBaseMin);
    const etaEnd = addDays(shipStart, daysBaseMax);

    setState({ shipToday, daysMin: daysBaseMin, daysMax: daysBaseMax, etaStart, etaEnd });

    // Live region (SR)
    try {
      if (srRef.current) {
        const txt = shipToday
          ? `Expédition aujourd’hui. Livraison estimée entre ${fmtDate.format(
              etaStart
            )} et ${fmtDate.format(etaEnd)}.`
          : `Expédition prochaine. Livraison estimée entre ${fmtDate.format(
              etaStart
            )} et ${fmtDate.format(etaEnd)}.`;
        srRef.current.textContent = txt;
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    productKey,
    minDays,
    maxDays,
    businessDaysOnly,
    cutoffHourLocal,
    varianceExtraDays,
    // holi via Set mémoïsé :
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
    const shipTxt = shipToday ? 'Expédié aujourd’hui' : 'Expédition prochaine';
    return `${shipTxt} · Livraison estimée sous ${rangeTxt}${datesTxt}`;
  }, [shipToday, daysMin, daysMax, etaStart, etaEnd, fmtDate, showDates]);

  if (!line) return null;

  return (
    <motion.p
      className={`text-sm text-gray-600 dark:text-gray-400 mt-2 ${className}`}
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
