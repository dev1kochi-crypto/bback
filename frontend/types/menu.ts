export interface MenuSection {
  line_1: string | null;
  line_2: string | null;
  short_description: string | null;
  button_text: string | null;
  button_url: string | null;
  listing_title: string | null;
  listing_description: string | null;
  display_home: boolean;
}

export interface MenuCategory {
  id: number;
  name: string | null;
  icon: string | null;
  icon_alt: string | null;
  sort_order: number;
}

export interface MenuItem {
  id: number;
  category_id: number | null;
  category_name: string | null;
  image: string | null;
  image_alt: string | null;
  name: string | null;
  description: string | null;
  food_type: 'veg' | 'non_veg';
  spicy: boolean;
  price: string;
  sort_order: number;
}

export interface MenuSignatureSection {
  line_1: string | null;
  line_2: string | null;
  short_description: string | null;
  display_home: boolean;
}

export interface MenuSignatureItem {
  id: number;
  image: string | null;
  image_alt: string | null;
  title: string | null;
  sort_order: number;
}

export interface MenuPayload {
  section: MenuSection | null;
  categories: MenuCategory[];
  items: MenuItem[];
  signature_section: MenuSignatureSection | null;
  signature_items: MenuSignatureItem[];
}
