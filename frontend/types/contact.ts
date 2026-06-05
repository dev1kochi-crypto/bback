import type { SitePayload } from '@/types/site';

export interface ContactPayload {
  site: SitePayload;
  contact: ContactDetails;
}

export interface ContactDetails {
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  address: string | null;
  google_map_link: string | null;
  map_embed_url: string | null;
  opening_hours: string | null;
}

export interface ContactEnquiryInput {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  message: string;
  page_url?: string;
}
