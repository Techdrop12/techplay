import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return new NextResponse(null, { status: 405, headers: { Allow: 'POST' } });
}

/**
 * Stub : route appelée par GenerateBlogPost.
 * Implémenter avec OpenAI (ex. lib/openai ou lib/ai-blog) pour activer la génération.
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Not implemented', message: 'Génération d’article IA non configurée.' },
    { status: 501 }
  );
}
