import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const headerSecret = request.headers.get('x-revalidate-secret');
  const body = (await request.json().catch(() => ({}))) as {
    secret?: string;
    tags?: unknown;
  };
  const providedSecret = headerSecret ?? (typeof body.secret === 'string' ? body.secret : null);

  if (!providedSecret || providedSecret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  const tags = Array.isArray(body.tags)
    ? body.tags.filter((tag): tag is string => typeof tag === 'string')
    : ['cms-data'];

  for (const tag of tags) {
    revalidateTag(tag);
  }

  revalidatePath('/', 'layout');

  return NextResponse.json({ revalidated: true, tags, at: Date.now() });
}
