// src/app/api/review/route.ts
import crypto from 'crypto';

import mongoose, { Schema, model, models } from 'mongoose';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { serverEnv } from '@/env.server';
import { getErrorMessage } from '@/lib/errors';
import { error as logError } from '@/lib/logger';
import { createRateLimiter, ipFromRequest, withRateLimit } from '@/lib/rateLimit';

// ------------- Rate limit (5 req / min par IP, fenêtre glissante) -------------
const limiter = createRateLimiter({
  id: 'review',
  limit: 5,
  intervalMs: 60_000,
  strategy: 'sliding-window',
});

// ------------- Validation -------------
const ReviewSchemaZ = z.object({
  productId: z.string().min(1, 'productId requis'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(3).max(1000),
  email: z.string().email().optional(),
  recaptchaToken: z.string().optional(),
  hp: z.string().optional(), // honeypot -> doit rester vide
});

// ------------- Types -------------
type ReviewInput = z.infer<typeof ReviewSchemaZ>;

type ReviewDoc = {
  productId: string;
  email?: string;
  rating: number;
  comment: string;
  ip: string;
  idempotencyKey: string;
  createdAt: Date;
};

type RecaptchaResponse = {
  success?: boolean;
  score?: number;
};

type MongoLikeError = {
  code?: unknown;
  message?: unknown;
};

// ------------- ReCAPTCHA -------------
async function verifyRecaptcha(token: string | undefined, ip: string) {
  const secret = serverEnv.RECAPTCHA_SECRET_KEY;
  const IS_PROD = process.env.NODE_ENV === 'production';

  if (!secret) {
    // En production sans clé configurée → bloquer les soumissions
    if (IS_PROD) return { ok: false, score: 0 };
    return { ok: true, score: 0 };
  }

  if (!token) {
    return { ok: false, score: 0 };
  }

  const body = new URLSearchParams({
    secret,
    response: token,
    remoteip: ip,
  });

  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const json = (await res.json()) as RecaptchaResponse;
  const ok = Boolean(json.success) && (json.score == null || json.score >= 0.4);

  return { ok, score: json.score ?? 0 };
}

// ------------- Mongo (optionnel) -------------
const MONGO_URI = serverEnv.MONGODB_URI;

function getReviewModel(): mongoose.Model<ReviewDoc> {
  const existing = models.Review as mongoose.Model<ReviewDoc> | undefined;
  if (existing) return existing;

  const reviewMongooseSchema = new Schema<ReviewDoc>(
    {
      productId: { type: String, index: true, required: true },
      email: { type: String, index: true },
      rating: { type: Number, min: 1, max: 5, required: true },
      comment: { type: String, required: true },
      ip: { type: String, index: true },
      idempotencyKey: { type: String, unique: true, index: true },
      createdAt: { type: Date, default: () => new Date(), index: true },
    },
    { versionKey: false }
  );

  return model<ReviewDoc>('Review', reviewMongooseSchema);
}

// ------------- Idempotency mémoire (fallback si pas de DB) -------------
type ReviewMemoryGlobal = typeof globalThis & {
  __REV_MEM__?: Set<string>;
};

const reviewGlobal = globalThis as ReviewMemoryGlobal;
const memIds = reviewGlobal.__REV_MEM__ ?? new Set<string>();
reviewGlobal.__REV_MEM__ = memIds;

function makeIdemKey(input: { productId: string; email?: string; comment: string; ip: string }) {
  const base = `${input.productId}|${(input.email || '').toLowerCase()}|${input.comment.trim()}|${input.ip}`;
  return crypto.createHash('sha256').update(base).digest('hex');
}

// ------------- Helpers -------------
function stripTags(value: string) {
  return value.replace(/<[^>]*>/g, '').trim();
}

function getErrorCode(error: unknown): string | number | undefined {
  if (typeof error !== 'object' || error === null) return undefined;

  const code = (error as MongoLikeError).code;
  if (typeof code === 'string' || typeof code === 'number') return code;

  return undefined;
}

function isDuplicateKeyError(error: unknown): boolean {
  const code = getErrorCode(error);
  if (code === 11000 || code === '11000') return true;

  if (error instanceof Error) {
    return /E11000/i.test(error.message);
  }

  const maybeMessage =
    typeof error === 'object' && error !== null ? (error as MongoLikeError).message : undefined;

  return typeof maybeMessage === 'string' && /E11000/i.test(maybeMessage);
}

// ------------- Handler principal -------------
async function handler(request: Request) {
  const ip = ipFromRequest(request);

  let payload: ReviewInput;
  try {
    payload = ReviewSchemaZ.parse(await request.json());
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) || 'Payload invalide' },
      { status: 400 }
    );
  }

  // Honeypot
  if (payload.hp && payload.hp.trim() !== '') {
    return NextResponse.json({ success: true, message: 'Ok' }, { status: 200 });
  }

  // reCAPTCHA si configuré
  const captcha = await verifyRecaptcha(payload.recaptchaToken, ip);
  if (!captcha.ok) {
    return NextResponse.json({ success: false, error: 'Captcha invalide' }, { status: 400 });
  }

  const doc: Omit<ReviewDoc, 'createdAt'> = {
    productId: payload.productId,
    email: payload.email?.toLowerCase(),
    rating: payload.rating,
    comment: stripTags(payload.comment),
    ip,
    idempotencyKey: makeIdemKey({
      productId: payload.productId,
      email: payload.email,
      comment: payload.comment,
      ip,
    }),
  };

  // Déduplication mémoire si pas de DB
  if (!MONGO_URI) {
    if (memIds.has(doc.idempotencyKey)) {
      return NextResponse.json({ success: true, message: 'Avis déjà reçu' }, { status: 200 });
    }

    memIds.add(doc.idempotencyKey);

    return NextResponse.json({ success: true, message: 'Avis reçu' }, { status: 200 });
  }

  // Insertion DB si MONGO_URI configuré
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }

  try {
    const ReviewModel = getReviewModel();
    await ReviewModel.create({ ...doc, createdAt: new Date() });
  } catch (error: unknown) {
    if (isDuplicateKeyError(error)) {
      return NextResponse.json({ success: true, message: 'Avis déjà reçu' }, { status: 200 });
    }

    logError('[review] DB error:', error);

    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Avis reçu' }, { status: 200 });
}

// Middleware rate limit -> ajoute les bons headers et gère 429
export const POST = withRateLimit(handler, limiter);
