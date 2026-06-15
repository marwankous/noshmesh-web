import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatListModule, MatIconModule,
    MatToolbarModule, MatButtonModule,
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="brand">
          <span class="nosh">Nosh</span><span class="mesh">Mesh</span>
        </div>

        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard/available"
             routerLinkActive="active-link">
            <mat-icon matListItemIcon>search</mat-icon>
            <span matListItemTitle>Available Orders</span>
          </a>
          <a mat-list-item routerLink="/dashboard/active"
             routerLinkActive="active-link">
            <mat-icon matListItemIcon>restaurant</mat-icon>
            <span matListItemTitle>Active Orders</span>
          </a>
          <a mat-list-item routerLink="/dashboard/my-bids"
             routerLinkActive="active-link">
            <mat-icon matListItemIcon>gavel</mat-icon>
            <span matListItemTitle>My Bids</span>
          </a>
        </mat-nav-list>

        <div class="sidenav-footer">
          <p class="user-name">{{ auth.user()?.name }}</p>
          <button mat-stroked-button (click)="logout()">Sign out</button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="main-content">
        <router-outlet/>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container { height: 100vh; }
    .sidenav {
      width: 220px; display: flex; flex-direction: column;
      background: #1a1a1a; color: white;
      border-right: none;
    }
    .brand {
      padding: 24px 20px 20px;
      border-bottom: 1px solid rgba(255,255,255,.1);
    }
    .nosh { font-size: 22px; font-weight: 800; color: #e8390e; }
    .mesh { font-size: 22px; font-weight: 800; color: white; }

    mat-nav-list { flex: 1; padding-top: 12px; }
    mat-nav-list a {
      color: rgba(255,255,255,.7);
      border-radius: 8px; margin: 2px 8px;
    }
    mat-nav-list .active-link {
      background: rgba(232,57,14,.15);
      color: #e8390e;
    }

    .sidenav-footer {
      padding: 16px 20px;
      border-top: 1px solid rgba(255,255,255,.1);
    }
    .user-name { font-size: 13px; color: rgba(255,255,255,.5); margin: 0 0 10px; }

    .main-content { background: #f5f5f5; overflow-y: auto; }
  `],
})
export class LayoutComponent {
  constructor(public auth: AuthService, private router: Router) {}
  logout() { this.auth.logout(); this.router.navigate(['/login']); }
}
