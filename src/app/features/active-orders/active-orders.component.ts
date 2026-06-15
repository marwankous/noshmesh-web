import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/order.model';

@Component({
  selector: 'app-active-orders',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, MatChipsModule, MatIconModule,
    MatProgressSpinnerModule, MatButtonModule,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Active Orders</h1>
        <button mat-icon-button (click)="load()" title="Refresh">
          <mat-icon>refresh</mat-icon>
        </button>
      </div>

      @if (loading()) {
        <div class="center"><mat-spinner/></div>
      } @else if (orders().length === 0) {
        <div class="empty">
          <mat-icon>restaurant</mat-icon>
          <p>No active orders yet</p>
        </div>
      } @else {
        <div class="grid">
          @for (order of orders(); track order.uuid) {
            <mat-card>
              <mat-card-header>
                <mat-card-title>{{ order.craving_text }}</mat-card-title>
                <mat-card-subtitle>{{ order.created_at | date:'short' }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="meta">
                  <mat-chip [class]="'status-' + order.status">
                    {{ statusLabel(order.status) }}
                  </mat-chip>
                  <span class="address">
                    <mat-icon>location_on</mat-icon>{{ order.delivery_address }}
                  </span>
                </div>
                @if (order.glovo_tracking_url) {
                  <a [href]="order.glovo_tracking_url" target="_blank" class="glovo-link">
                    <mat-icon>delivery_dining</mat-icon> Track with Glovo
                  </a>
                }
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 32px; max-width: 1100px; }
    .page-header { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 24px; font-weight: 700; }
    .center { display: flex; justify-content: center; padding: 64px; }
    .empty  { text-align: center; padding: 64px; color: #aaa; }
    .empty mat-icon { font-size: 48px; height: 48px; width: 48px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px,1fr)); gap: 16px; }
    .meta { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 12px; }
    .address { display: flex; align-items: center; font-size: 13px; color: #666; gap: 2px; }
    .glovo-link {
      display: inline-flex; align-items: center; gap: 4px;
      margin-top: 12px; color: #e8390e; text-decoration: none; font-size: 14px;
    }
    :host ::ng-deep .status-accepted  .mdc-evolution-chip__text-label { color: #1565c0; }
    :host ::ng-deep .status-delivering .mdc-evolution-chip__text-label { color: #6a1b9a; }
    :host ::ng-deep .status-delivered  .mdc-evolution-chip__text-label { color: #2e7d32; }
  `],
})
export class ActiveOrdersComponent implements OnInit {
  orders  = signal<Order[]>([]);
  loading = signal(false);

  constructor(private orderSvc: OrderService) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.orderSvc.myRestaurantOrders().subscribe({
      next: (data) => { this.orders.set(data); this.loading.set(false); },
      error: ()    => this.loading.set(false),
    });
  }

  statusLabel(s: string) {
    const m: Record<string, string> = {
      accepted: 'Accepted', delivering: 'Out for delivery', delivered: 'Delivered',
    };
    return m[s] ?? s;
  }
}
