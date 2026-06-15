import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Bid } from '../models/bid.model';

export interface PlaceBidPayload {
  order_uuid: string;
  meal_name: string;
  meal_description: string;
  price: number;
  estimated_minutes: number;
}

@Injectable({ providedIn: 'root' })
export class BidService {
  constructor(private http: HttpClient) {}

  placeBid(payload: PlaceBidPayload) {
    return this.http.post<void>(`${environment.apiUrl}/bids`, payload);
  }

  bidsForOrder(orderUuid: string) {
    return this.http.get<Bid[]>(`${environment.apiUrl}/bids/order/${orderUuid}`);
  }
}
