import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return new NextResponse(null, { status: 405, headers: { Allow: 'POST' } });
}

/**
 * Stub : route appelée par ChatBot et ProductAssistant.
 * Implémenter avec OpenAI / autre LLM pour activer le chat.
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Not implemented', message: 'Chat IA non configuré.' },
    { status: 501 }
  );
}
