export interface TestimonialsPayload {
  section: TestimonialsSection | null;
  items: TestimonialItem[];
}

export interface TestimonialsSection {
  title: string | null;
  sub_heading_1: string | null;
  sub_heading_2: string | null;
  description: string | null;
  display_home: boolean;
}

export interface TestimonialItem {
  id: number;
  name: string | null;
  designation: string | null;
  content: string | null;
  rating: number | null;
  image: string | null;
  image_alt: string | null;
  order_index: number;
}
