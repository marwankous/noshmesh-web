import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Order } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private http: HttpClient) {}

  availableOrders() {
    return this.http.get<Order[]>(`${environment.apiUrl}/available`);
  }

  myRestaurantOrders() {
    return this.http.get<Order[]>(`${environment.apiUrl}/mine/restaurant`);
  }

  getOrder(uuid: string) {
    return this.http.get<Order>(`${environment.apiUrl}/orders/${uuid}`);
  }
}
