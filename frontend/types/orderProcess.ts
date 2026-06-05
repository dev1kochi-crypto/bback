export interface OrderProcessSection {
  line_1: string | null;
  title: string | null;
  description: string | null;
  image: string | null;
  image_alt: string | null;
  display_home: boolean;
}

export interface OrderProcessItem {
  id: number;
  icon: string | null;
  icon_alt: string | null;
  title: string | null;
  description: string | null;
  sort_order: number;
}

export interface OrderProcessPayload {
  section: OrderProcessSection | null;
  items: OrderProcessItem[];
}
