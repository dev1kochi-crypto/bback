const parsed = Number(process.env.CMS_REVALIDATE_SECONDS ?? 10);

export const REVALIDATE_SECONDS = Number.isFinite(parsed) && parsed >= 0 ? parsed : 10;

export const CMS_CACHE_ENABLED =
  process.env.NODE_ENV === 'production' && process.env.CMS_CACHE_DISABLED !== 'true';
