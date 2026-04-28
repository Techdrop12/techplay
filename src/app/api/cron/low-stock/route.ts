import { NextRequest } from 'next/server';

import { connectToDatabase } from '@/lib/db';
import { sendBrevoEmail } from '@/lib/email/sendBrevo';
import { error as logError, log } from '@/lib/logger';
import { verifySecret } from '@/lib/secureCompare';
import { apiError, apiJson } from '@/lib/apiResponse';
import { serverEnv } from '@/env.server';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const LOW_STOCK_THRESHOLD = 5;

export async function GET(req: NextRequest) {
  const secret =
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ??
    req.nextUrl.searchParams.get('secret');
  const expected = serverEnv.CRON_SECRET;

  if (expected && !verifySecret(secret, expected)) {
    return apiError('Unauthorized', 401);
  }

  try {
    await connectToDatabase();

    const lowStock = await Product.find({ stock: { $gt: 0, $lte: LOW_STOCK_THRESHOLD } })
      .select('title slug stock sku')
      .sort({ stock: 1 })
      .limit(50)
      .lean()
      .exec();

    if (lowStock.length === 0) {
      log('[cron/low-stock] Aucun produit en stock faible');
      return apiJson({ alerted: 0 });
    }

    const adminEmail = serverEnv.ADMIN_EMAIL || 'admin@techplay.com';
    const rows = lowStock
      .map(
        (p) =>
          `<tr>
            <td style="padding:6px 12px;border-bottom:1px solid #eee">${p.title}</td>
            <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center">${p.stock}</td>
            <td style="padding:6px 12px;border-bottom:1px solid #eee;color:#888">${p.sku ?? p.slug}</td>
          </tr>`
      )
      .join('');

    const html = `
      <h2 style="color:#e11d48">⚠️ Alerte stock faible — TechPlay</h2>
      <p>${lowStock.length} produit(s) ont moins de ${LOW_STOCK_THRESHOLD} unités en stock.</p>
      <table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px">
        <thead>
          <tr style="background:#f4f4f5">
            <th style="padding:8px 12px;text-align:left">Produit</th>
            <th style="padding:8px 12px;text-align:center">Stock</th>
            <th style="padding:8px 12px;text-align:left">SKU / Slug</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin-top:24px;color:#888;font-size:12px">
        Généré automatiquement le ${new Date().toLocaleString('fr-FR')}.
      </p>
    `;

    await sendBrevoEmail({
      to: adminEmail,
      subject: `⚠️ Stock faible — ${lowStock.length} produit(s) à réapprovisionner`,
      html,
      tags: ['cron', 'stock-alert'],
    });

    log(`[cron/low-stock] Alerte envoyée pour ${lowStock.length} produits`);
    return apiJson({ alerted: lowStock.length, products: lowStock.map((p) => p.slug) });
  } catch (e) {
    logError('[cron/low-stock]', e);
    return apiError('Erreur serveur', 500);
  }
}
