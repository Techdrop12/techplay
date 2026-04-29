import { error as logError } from '@/lib/logger';
import { apiError, apiSuccess, safeErrorForLog } from '@/lib/apiResponse';
import { connectToDatabase } from '@/lib/db';
import Product from '@/models/Product';
import Review from '@/models/Review';
import SitePage from '@/models/SitePage';
import Order from '@/models/Order';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import { requireAdmin } from '@/lib/requireAdmin';

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;

  try {
    await connectToDatabase();

    const [
      lowStockCount,
      noImageCount,
      draftReviewsCount,
      pagesCount,
      recentOrdersCount,
      featuredCount,
      newsletterCount,
    ] = await Promise.all([
      Product.countDocuments({ stock: { $lte: 3 } }).exec(),
      Product.countDocuments({ $or: [{ image: { $in: [null, ''] } }, { images: { $size: 0 } }] }).exec(),
      Review.countDocuments({ status: 'pending' }).exec(),
      SitePage.countDocuments().exec(),
      Order.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }).exec(),
      Product.countDocuments({ featured: true }).exec(),
      NewsletterSubscriber.countDocuments({ confirmed: true }).exec(),
    ]);

    return apiSuccess({
      lowStockCount,
      noImageCount,
      draftReviewsCount,
      pagesCount,
      recentOrdersCount,
      featuredCount,
      newsletterCount,
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    logError('[admin/health]', safeErrorForLog(e));
    return apiError('Erreur serveur', 500);
  }
}

