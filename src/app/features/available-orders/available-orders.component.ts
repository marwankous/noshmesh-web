import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OrderService } from '../../core/services/order.service';
import { BidService } from '../../core/services/bid.service';
import { Order } from '../../core/models/order.model';

@Component({
  selector: 'app-available-orders',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatChipsModule,
    MatProgressSpinnerModule, MatIconModule, MatSnackBarModule,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Available Orders</h1>
        <button mat-icon-button (click)="load()" title="Refresh">
          <mat-icon>refresh</mat-icon>
        </button>
      </div>

      @if (loading()) {
        <div class="center"><mat-spinner/></div>
      } @else if (orders().length === 0) {
        <div class="empty">
          <mat-icon>search_off</mat-icon>
          <p>No open orders right now</p>
        </div>
      } @else {
        <div class="grid">
          @for (order of orders(); track order.uuid) {
            <mat-card class="order-card">
              <mat-card-header>
                <mat-card-subtitle>{{ order.created_at | date:'short' }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p class="craving">{{ order.craving_text }}</p>
                <div class="meta">
                  <mat-chip color="primary" highlighted>
                    Budget: {{ order.budget_max | currency }}
                  </mat-chip>
                  <mat-chip>
                    <mat-icon>location_on</mat-icon>
                    {{ order.delivery_address }}
                  </mat-chip>
                </div>
              </mat-card-content>
              <mat-card-actions align="end">
                <button mat-flat-button color="accent" (click)="openBidDialog(order)">
                  Place Bid
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </div>

    <!-- Bid dialog -->
    @if (bidTarget()) {
      <div class="dialog-backdrop" (click)="closeBidDialog()">
        <mat-card class="bid-dialog" (click)="$event.stopPropagation()">
          <mat-card-header>
            <mat-card-title>Place a Bid</mat-card-title>
            <mat-card-subtitle>{{ bidTarget()!.craving_text }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="bidForm">
              <mat-form-field appearance="outline" class="full">
                <mat-label>Meal Name</mat-label>
                <input matInput formControlName="meal_name"/>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="meal_description" rows="2"></textarea>
              </mat-form-field>
              <div class="row-2">
                <mat-form-field appearance="outline">
                  <mat-label>Price ({{ bidTarget()!.budget_max | currency }} max)</mat-label>
                  <input matInput type="number" formControlName="price"/>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>ETA (minutes)</mat-label>
                  <input matInput type="number" formControlName="estimated_minutes"/>
                </mat-form-field>
              </div>
            </form>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-button (click)="closeBidDialog()">Cancel</button>
            <button mat-flat-button color="primary"
                    [disabled]="bidForm.invalid || submitting()"
                    (click)="submitBid()">
              @if (submitting()) { <mat-spinner diameter="18"/> } @else { Submit Bid }
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    }
  `,
  styles: [`
    .page { padding: 32px; max-width: 1100px; }
    .page-header { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 24px; font-weight: 700; }
    .center { display: flex; justify-content: center; padding: 64px; }
    .empty  { text-align: center; padding: 64px; color: #aaa; }
    .empty mat-icon { font-size: 48px; height: 48px; width: 48px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
    .order-card {}
    .craving { font-size: 15px; margin: 8px 0; }
    .meta { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }

    .dialog-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,.4);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
    }
    .bid-dialog { width: 480px; max-width: 95vw; padding: 8px; }
    .full { width: 100%; }
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  `],
})
export class AvailableOrdersComponent implements OnInit {
  orders  = signal<Order[]>([]);
  loading = signal(false);
  bidTarget  = signal<Order | null>(null);
  submitting = signal(false);

  bidForm!: UntypedFormGroup;

  constructor(
    private orderSvc: OrderService,
    private bidSvc: BidService,
    private fb: FormBuilder,
    private snack: MatSnackBar,
  ) {
    this.bidForm = this.fb.nonNullable.group({
      meal_name:         ['', Validators.required],
      meal_description:  ['', Validators.required],
      price:             [0,  [Validators.required, Validators.min(1)]],
      estimated_minutes: [30, [Validators.required, Validators.min(5)]],
    });
  }

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.orderSvc.availableOrders().subscribe({
      next: (data) => { this.orders.set(data); this.loading.set(false); },
      error: ()    => this.loading.set(false),
    });
  }

  openBidDialog(order: Order) {
    this.bidTarget.set(order);
    this.bidForm.reset({ estimated_minutes: 30 });
  }

  closeBidDialog() { this.bidTarget.set(null); }

  submitBid() {
    if (this.bidForm.invalid || !this.bidTarget()) return;
    this.submitting.set(true);
    const v = this.bidForm.getRawValue();
    this.bidSvc.placeBid({ order_uuid: this.bidTarget()!.uuid, ...v }).subscribe({
      next: () => {
        this.snack.open('Bid placed!', '', { duration: 3000 });
        this.closeBidDialog();
        this.submitting.set(false);
        this.load();
      },
      error: (e) => {
        this.snack.open(e?.error?.message ?? 'Failed to place bid', 'OK', { duration: 4000 });
        this.submitting.set(false);
      },
    });
  }
}
