import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

const REVALIDATE_PATHS = ['/', '/menu', '/about', '/contact', '/offers'] as const;

function resolveRevalidateSecret(request: NextRequest, body: { secret?: string }): string | null {
  const headerSecret = request.headers.get('x-revalidate-secret');

  if (headerSecret) {
    return headerSecret;
  }

  if (typeof body.secret === 'string' && body.secret.length > 0) {
    return body.secret;
  }

  return null;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    secret?: string;
    tags?: unknown;
  };
  const providedSecret = resolveRevalidateSecret(request, body);
  const configuredSecret = process.env.REVALIDATE_SECRET ?? process.env.FRONTEND_REVALIDATE_SECRET;

  if (!configuredSecret || !providedSecret || providedSecret !== configuredSecret) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  const tags = Array.isArray(body.tags)
    ? body.tags.filter((tag): tag is string => typeof tag === 'string')
    : ['cms-data'];

  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }

  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path, 'layout');
    revalidatePath(path, 'page');
  }

  return NextResponse.json({ revalidated: true, tags, paths: REVALIDATE_PATHS, at: Date.now() });
}
