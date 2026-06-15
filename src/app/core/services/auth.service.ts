import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: { uuid: string; name: string; email: string };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _token = signal<string | null>(localStorage.getItem('nm_token'));
  private readonly _user = signal<LoginResponse['user'] | null>(
    JSON.parse(localStorage.getItem('nm_user') ?? 'null')
  );

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(res => {
          localStorage.setItem('nm_token', res.access_token);
          localStorage.setItem('nm_user', JSON.stringify(res.user));
          this._token.set(res.access_token);
          this._user.set(res.user);
        })
      );
  }

  logout() {
    localStorage.removeItem('nm_token');
    localStorage.removeItem('nm_user');
    this._token.set(null);
    this._user.set(null);
  }
}
