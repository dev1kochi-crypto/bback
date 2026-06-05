export interface SiteNavItem {
  label: string;
  url: string;
}

export interface SiteFooterLink {
  label: string;
  url: string;
}

export interface SitePayload {
  logo: string | null;
  logo_alt: string | null;
  company_name: string | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  address: string | null;
  google_map_link: string | null;
  opening_hours: string | null;
  delivery_free_above_amount: string;
  delivery_charge_amount: string;
  tax_amount: string;
  privacy_policy: string | null;
  terms_and_conditions: string | null;
  nav_items: SiteNavItem[];
  footer: {
    description: string | null;
    privacy_policy_url: string | null;
    terms_url: string | null;
    menu_links: SiteFooterLink[];
    social: Record<string, string | null>;
  };
  seo?: {
    gtm_container_ids: string[];
    custom_head_script: string | null;
    custom_body_script: string | null;
  };
}
