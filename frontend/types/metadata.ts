export interface PageMetadataPayload {
  page_key: string;
  page_name: string | null;
  canonical_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  other_meta_tags: string | null;
}
