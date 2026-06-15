import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { BidService } from '../../core/services/bid.service';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/order.model';
import { Bid } from '../../core/models/bid.model';
import { forkJoin } from 'rxjs';

interface BidRow extends Bid { craving_text?: string; budget_max?: number; }

@Component({
  selector: 'app-my-bids',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, MatTableModule, MatChipsModule,
    MatIconModule, MatProgressSpinnerModule, MatButtonModule,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>My Bids</h1>
        <button mat-icon-button (click)="load()" title="Refresh">
          <mat-icon>refresh</mat-icon>
        </button>
      </div>

      @if (loading()) {
        <div class="center"><mat-spinner/></div>
      } @else if (bids().length === 0) {
        <div class="empty">
          <mat-icon>gavel</mat-icon>
          <p>You haven't placed any bids yet</p>
        </div>
      } @else {
        <mat-card>
          <table mat-table [dataSource]="bids()" class="full">
            <ng-container matColumnDef="craving">
              <th mat-header-cell *matHeaderCellDef>Craving</th>
              <td mat-cell *matCellDef="let row">{{ row.craving_text ?? '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="meal">
              <th mat-header-cell *matHeaderCellDef>Your Meal</th>
              <td mat-cell *matCellDef="let row">
                <strong>{{ row.meal_name }}</strong><br>
                <small>{{ row.meal_description }}</small>
              </td>
            </ng-container>
            <ng-container matColumnDef="price">
              <th mat-header-cell *matHeaderCellDef>Price</th>
              <td mat-cell *matCellDef="let row">{{ row.price | currency }}</td>
            </ng-container>
            <ng-container matColumnDef="eta">
              <th mat-header-cell *matHeaderCellDef>ETA</th>
              <td mat-cell *matCellDef="let row">{{ row.estimated_minutes }} min</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row">
                <mat-chip [class]="'chip-' + row.status">{{ row.status }}</mat-chip>
              </td>
            </ng-container>
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Placed</th>
              <td mat-cell *matCellDef="let row">{{ row.created_at | date:'short' }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols"></tr>
          </table>
        </mat-card>
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
    .full { width: 100%; }
    :host ::ng-deep .chip-accepted .mdc-evolution-chip__text-label { color: #2e7d32; }
    :host ::ng-deep .chip-pending  .mdc-evolution-chip__text-label { color: #e65100; }
    :host ::ng-deep .chip-rejected .mdc-evolution-chip__text-label { color: #c62828; }
  `],
})
export class MyBidsComponent implements OnInit {
  bids    = signal<BidRow[]>([]);
  loading = signal(false);
  cols    = ['craving', 'meal', 'price', 'eta', 'status', 'date'];

  constructor(
    private bidSvc: BidService,
    private orderSvc: OrderService,
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    // Load all restaurant orders then get bids for each
    this.orderSvc.myRestaurantOrders().subscribe({
      next: (orders) => {
        if (orders.length === 0) { this.bids.set([]); this.loading.set(false); return; }
        const orderMap = new Map<string, Order>(orders.map(o => [o.uuid, o]));
        forkJoin(orders.map(o => this.bidSvc.bidsForOrder(o.uuid))).subscribe({
          next: (results) => {
            const rows: BidRow[] = results.flat().map(b => ({
              ...b,
              craving_text: orderMap.get(b.order_uuid)?.craving_text,
              budget_max:   orderMap.get(b.order_uuid)?.budget_max,
            }));
            this.bids.set(rows);
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
      },
      error: () => this.loading.set(false),
    });
  }
}
