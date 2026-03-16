import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return new NextResponse(null, { status: 405, headers: { Allow: 'POST' } });
}

/**
 * Stub : route appelée par AIProductSummary.
 * Implémenter avec OpenAI pour activer le résumé produit.
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Not implemented', message: 'Résumé IA non configuré.' },
    { status: 501 }
  );
}
