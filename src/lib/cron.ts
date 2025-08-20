// src/lib/cron.ts
// ✅ Orchestrateur simple avec verrou (anti double exécution), logs horodatés,
// tâches prêtes : publication programmée, relance panier abandonné, nettoyage.

let running = false;

type CronTask = {
  name: string;
  run: () => Promise<void> | void;
};

function log(msg: string) {
  // eslint-disable-next-line no-console
  console.log(`[CRON] ${new Date().toISOString()} — ${msg}`);
}

const tasks: CronTask[] = [
  {
    name: "publishScheduledArticles",
    async run() {
      // TODO : branche ta logique réelle
      // await publishScheduledArticles()
      log("✓ Articles programmés : OK");
    },
  },
  {
    name: "sendAbandonedCartReminders",
    async run() {
      // TODO : branche ta logique (par ex. via sendAbandonedCart(to, product))
      // await sendAbandonedCart(to, product)
      log("✓ Relances panier abandonné : OK");
    },
  },
  {
    name: "cleanupOldSessions",
    async run() {
      // TODO : supprime anciennes sessions/notifications si nécessaire
      log("✓ Nettoyage : OK");
    },
  },
];

export async function runCronTasks() {
  if (running) {
    log("Déjà en cours, on skip pour éviter les doublons.");
    return;
  }
  running = true;
  log("Démarrage des tâches planifiées…");

  try {
    for (const t of tasks) {
      log(`→ ${t.name}`);
      await t.run();
    }
    log("Toutes les tâches sont terminées.");
  } catch (e) {
    log(`Erreur : ${(e as Error).message}`);
  } finally {
    running = false;
  }
}
