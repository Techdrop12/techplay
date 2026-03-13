// src/lib/cron.ts
// Orchestrateur cron avec verrou (anti double exécution). Tâches à brancher
// sur la logique métier (voir docs/RUNBOOK.md#cron).

import { log as devLog } from '@/lib/logger'

let running = false

type CronTask = {
  name: string
  run: () => Promise<void> | void
}

function log(msg: string) {
  devLog(`[CRON] ${new Date().toISOString()} — ${msg}`)
}

const tasks: CronTask[] = [
  {
    name: 'publishScheduledArticles',
    async run() {
      // Stub : brancher sur API publication blog / CMS (ex. GET /api/cron/publish-blog)
      log('✓ Articles programmés : OK')
    },
  },
  {
    name: 'sendAbandonedCartReminders',
    async run() {
      // Stub : relances gérées côté client (AbandonCartTracker) + API /api/brevo/abandon-panier
      log('✓ Relances panier abandonné : OK')
    },
  },
  {
    name: 'cleanupOldSessions',
    async run() {
      // Stub : nettoyage DB / cache / notifications si nécessaire
      log('✓ Nettoyage : OK')
    },
  },
]

export async function runCronTasks() {
  if (running) {
    log('Déjà en cours, skip (évite doublons).')
    return
  }
  running = true
  log('Démarrage des tâches planifiées…')

  try {
    for (const t of tasks) {
      log(`→ ${t.name}`)
      await t.run()
    }
    log('Toutes les tâches sont terminées.')
  } catch (e) {
    log(`Erreur : ${(e as Error).message}`)
  } finally {
    running = false
  }
}
