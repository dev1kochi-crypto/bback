import { getPageMetadata } from '@/lib/api.server';
import type { Metadata } from 'next';
import { headers } from 'next/headers';

interface MetadataFallback {
  title: string;
  description: string;
  canonicalPath?: string;
}

export async function buildPageMetadata(pageKey: string, fallback: MetadataFallback): Promise<Metadata> {
  try {
    const pageMetadata = await getPageMetadata(pageKey);
    const fallbackCanonical = absoluteCurrentUrl(fallback.canonicalPath ?? pagePathFromKey(pageKey));

    if (!pageMetadata) {
      return withFallbackCanonical(fallback, fallbackCanonical);
    }

    const title = pageMetadata.meta_title || pageMetadata.og_title || pageMetadata.page_name || fallback.title;
    const description = pageMetadata.meta_description || pageMetadata.og_description || fallback.description;
    const canonical = pageMetadata.canonical_url || fallbackCanonical;
    const keywords = pageMetadata.meta_keywords
      ? pageMetadata.meta_keywords
          .split(',')
          .map((keyword) => keyword.trim())
          .filter(Boolean)
      : undefined;

    return {
      title,
      description,
      keywords,
      alternates: canonical ? { canonical } : undefined,
      openGraph: {
        title: pageMetadata.og_title || title,
        description: pageMetadata.og_description || description,
        images: pageMetadata.og_image ? [{ url: pageMetadata.og_image }] : undefined,
      },
      other: parseMetaTags(pageMetadata.other_meta_tags),
    };
  } catch {
    return withFallbackCanonical(fallback, absoluteCurrentUrl(fallback.canonicalPath ?? pagePathFromKey(pageKey)));
  }
}

function withFallbackCanonical(fallback: MetadataFallback, canonical: string | null): Metadata {
  return {
    title: fallback.title,
    description: fallback.description,
    alternates: canonical ? { canonical } : undefined,
  };
}

function pagePathFromKey(pageKey: string): string {
  return pageKey === 'home' ? '/' : `/${pageKey}`;
}

function absoluteCurrentUrl(path: string): string | null {
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (configuredOrigin) {
    return new URL(normalizedPath, configuredOrigin).toString();
  }

  const requestHeaders = headers();
  const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host');

  if (!host) {
    return null;
  }

  const protocol = requestHeaders.get('x-forwarded-proto') || (host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https');

  return `${protocol}://${host}${normalizedPath}`;
}

function parseMetaTags(rawHtml: string | null): Record<string, string> | undefined {
  if (!rawHtml) {
    return undefined;
  }

  const tags: Record<string, string> = {};
  const metaTagPattern = /<meta\s+([^>]+)>/gi;
  let match: RegExpExecArray | null;

  while ((match = metaTagPattern.exec(rawHtml))) {
    const attributes = match[1];
    const name = getAttribute(attributes, 'name') || getAttribute(attributes, 'property');
    const content = getAttribute(attributes, 'content');

    if (name && content) {
      tags[name] = content;
    }
  }

  return Object.keys(tags).length ? tags : undefined;
}

function getAttribute(attributes: string, name: string): string | null {
  const pattern = new RegExp(`${name}\\s*=\\s*(['"])(.*?)\\1`, 'i');
  const match = attributes.match(pattern);

  return match?.[2] ?? null;
}
