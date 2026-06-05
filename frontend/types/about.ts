import type { SitePayload } from '@/types/site';

export interface AboutUsPayload {
  about: AboutUsContent | null;
  why_choose_us: WhyChooseUsSection | null;
  site: SitePayload;
}

export interface AboutUsContent {
  line_1: string | null;
  line_2: string | null;
  about_page_title: string | null;
  short_description: string | null;
  long_description: string | null;
  button_text: string | null;
  button_url: string | null;
  video_type: 'url' | 'upload' | null;
  video_url: string | null;
  video_file: string | null;
  video_thumbnail: string | null;
  mission: string | null;
  vision: string | null;
  core_value: string | null;
  display_home: boolean;
}

export interface AboutUsItem {
  id: number;
  icon: string | null;
  icon_alt: string | null;
  line_1: string | null;
  line_2: string | null;
  sort_order: number;
}

export interface WhyChooseUsSection {
  title: string | null;
  description: string | null;
  home_title: string | null;
  home_description: string | null;
  display_home: boolean;
  items: AboutUsItem[];
}

export type AboutSiteChrome = import('@/types/site').SitePayload;
