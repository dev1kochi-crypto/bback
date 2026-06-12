import 'server-only';

import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import type { Banner } from '@/types/banner';
import type { AboutUsPayload } from '@/types/about';
import type { ContactPayload } from '@/types/contact';
import type { PageMetadataPayload } from '@/types/metadata';
import type { MenuPayload } from '@/types/menu';
import type { OrderProcessPayload } from '@/types/orderProcess';
import type { OffersPayload } from '@/types/offer';
import type { SitePayload } from '@/types/site';
import type { TestimonialsPayload } from '@/types/testimonial';
import {
  api,
  defaultAboutPayload,
  defaultMenuPayload,
  defaultOrderProcessPayload,
  defaultSitePayload,
  defaultTestimonialsPayload,
  normalizeMenuPayload,
} from '@/lib/api';
import { CMS_CACHE_ENABLED, REVALIDATE_SECONDS } from '@/lib/cache';

const defaultContactPayload: ContactPayload = {
  site: defaultSitePayload,
  contact: {
    phone: null,
    email: null,
    whatsapp: null,
    address: null,
    google_map_link: null,
    map_embed_url: null,
    opening_hours: null,
  },
};

const defaultOffersPayload: OffersPayload = {
  offers: [],
};

async function withRetry<T>(fetcher: () => Promise<T>, attempts = 2): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await fetcher();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

function cachedQuery<T>(key: string, fetcher: () => Promise<T>, fallback: T): () => Promise<T> {
  if (!CMS_CACHE_ENABLED) {
    return async () => {
      try {
        return await fetcher();
      } catch {
        return fallback;
      }
    };
  }

  const cachedFetcher = unstable_cache(fetcher, [key], { revalidate: REVALIDATE_SECONDS, tags: [key, 'cms-data'] });

  return async () => {
    try {
      return await cachedFetcher();
    } catch {
      return fallback;
    }
  };
}

const fetchSite = cachedQuery('api-site', async () => {
  const response = await api.get<SitePayload>('/api/site');

  return response.data;
}, defaultSitePayload);

const fetchBanners = cachedQuery('api-banners', async () => {
  const response = await withRetry(() => api.get<Banner[]>('/api/banners'), 3);

  return response.data
    .filter((banner) => banner.status === 1)
    .sort((a, b) => a.order - b.order);
}, []);

const fetchAboutUs = cachedQuery('api-about-us', async () => {
  const response = await api.get<AboutUsPayload>('/api/about-us');

  return response.data;
}, defaultAboutPayload);

const fetchContact = cachedQuery('api-contact', async () => {
  const response = await api.get<ContactPayload>('/api/contact');

  return response.data;
}, defaultContactPayload);

const fetchOffers = cachedQuery('api-offers', async () => {
  const response = await api.get<OffersPayload>('/api/offers');

  return response.data;
}, defaultOffersPayload);

const fetchMenus = cachedQuery('api-menus', async () => {
  const response = await api.get<MenuPayload>('/api/menus');

  return normalizeMenuPayload(response.data);
}, defaultMenuPayload);

const fetchOrderProcess = cachedQuery('api-order-process', async () => {
  const response = await api.get<OrderProcessPayload>('/api/order-process');

  return response.data;
}, defaultOrderProcessPayload);

const fetchTestimonials = cachedQuery('api-testimonials', async () => {
  const response = await api.get<TestimonialsPayload>('/api/testimonials');

  return response.data;
}, defaultTestimonialsPayload);

export const getSite = cache(async () => fetchSite());

export const getBanners = cache(async () => fetchBanners());

export const getAboutUs = cache(async () => fetchAboutUs());

export const getContact = cache(async () => fetchContact());

export const getOffers = cache(async () => fetchOffers());

export const getMenus = cache(async () => fetchMenus());

export const getOrderProcess = cache(async () => fetchOrderProcess());

export const getTestimonials = cache(async () => fetchTestimonials());

export const getPageMetadata = cache(async (pageKey: string): Promise<PageMetadataPayload | null> => {
  const fetchMetadata = async () => {
    try {
      const response = await api.get<PageMetadataPayload | null>(`/api/metadata/${pageKey}`);

      return response.data;
    } catch {
      return null;
    }
  };

  if (!CMS_CACHE_ENABLED) {
    return fetchMetadata();
  }

  return unstable_cache(fetchMetadata, ['api-metadata', pageKey], {
    revalidate: REVALIDATE_SECONDS,
    tags: ['api-metadata', `api-metadata-${pageKey}`, 'cms-data'],
  })();
});
