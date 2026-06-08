export interface Offer {
  id: number;
  menu_item_id: number | null;
  image: string | null;
  alt_text: string | null;
  offer_percent: string | null;
  offer_price: string | null;
  menu_item: {
    id: number;
    name: string | null;
    description: string | null;
    price: string;
    food_type: 'veg' | 'non_veg';
    spicy: boolean;
  } | null;
  sort_order: number;
}

export interface OffersPayload {
  offers: Offer[];
}
