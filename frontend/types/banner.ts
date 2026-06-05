export type FoodLayout = 'center' | 'wide' | 'right';

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  button_text: string | null;
  button_url: string | null;
  secondary_button_text: string | null;
  secondary_button_url: string | null;
  image: string | null;
  image_alt: string | null;
  secondary_image: string | null;
  background_image: string | null;
  logo_image: string | null;
  logo_alt: string | null;
  nav_items: Array<{
    label: string;
    url: string;
  }>;
  badge_image: string | null;
  crumb_image: string | null;
  floating_images: string[];
  phone: string | null;
  email: string | null;
  food_layout: FoodLayout;
  food_scale: number | null;
  status: 0 | 1;
  order: number;
}
