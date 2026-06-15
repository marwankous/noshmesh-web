export interface Order {
  uuid: string;
  status: 'bidding' | 'accepted' | 'delivering' | 'delivered' | 'cancelled';
  craving_text: string;
  budget_max: number;
  delivery_address: string;
  payment_method: string;
  bidding_expires_at: string | null;
  glovo_tracking_url: string | null;
  created_at: string;
}
