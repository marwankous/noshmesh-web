export interface Bid {
  uuid: string;
  order_uuid: string;
  restaurant_name: string;
  meal_name: string;
  meal_description: string;
  price: number;
  estimated_minutes: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}
