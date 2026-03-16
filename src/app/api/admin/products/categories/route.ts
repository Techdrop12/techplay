import { NextResponse } from 'next/server';

import { apiError } from '@/lib/apiResponse';
import { connectToDatabase } from '@/lib/db';
import { error as logError } from '@/lib/logger';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/requireAdmin';

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;

  try {
    await connectToDatabase();
    const categories = await Product.distinct('category').exec();
    const sorted = (categories as string[]).filter(Boolean).sort();
    return NextResponse.json(sorted);
  } catch (e) {
    logError('[admin/products/categories]', e);
    return apiError('Erreur', 500, { details: e instanceof Error ? e.message : undefined });
  }
}
