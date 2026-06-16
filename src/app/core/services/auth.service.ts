import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface TokenResponse { access_token: string; refresh_token: string; }
interface MeResponse { UUID: string; name: string; email: string; plan_id: number; }

export type AuthUser = Pick<MeResponse, 'UUID' | 'name' | 'email' | 'plan_id'>;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _token = signal<string | null>(localStorage.getItem('nm_token'));
  private readonly _user  = signal<AuthUser | null>(
    JSON.parse(localStorage.getItem('nm_user') ?? 'null')
  );

  readonly token     = this._token.asReadonly();
  readonly user      = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http
      .post<TokenResponse>(`${environment.authUrl}/auth/login`, { email, password })
      .pipe(
        tap(res => {
          localStorage.setItem('nm_token', res.access_token);
          this._token.set(res.access_token);
        }),
        switchMap(res =>
          this.http.get<MeResponse>(`${environment.authUrl}/me`, {
            headers: new HttpHeaders({ Authorization: `Bearer ${res.access_token}` }),
          })
        ),
        tap(me => {
          const user: AuthUser = { UUID: me.UUID, name: me.name, email: me.email, plan_id: me.plan_id };
          localStorage.setItem('nm_user', JSON.stringify(user));
          this._user.set(user);
        }),
      );
  }

  logout() {
    localStorage.removeItem('nm_token');
    localStorage.removeItem('nm_user');
    this._token.set(null);
    this._user.set(null);
  }
}
