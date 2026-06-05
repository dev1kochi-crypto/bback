export interface Offer {
  id: number;
  image: string | null;
  alt_text: string | null;
  sort_order: number;
}

export interface OffersPayload {
  offers: Offer[];
}
