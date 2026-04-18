import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, from, of } from 'rxjs';
import { switchMap, map, catchError, timeout } from 'rxjs/operators';
import * as bcrypt from 'bcryptjs';

interface User {
  username: string;
  userfullname?: string;
  passwordHash: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly SESSION_KEY = 'suiviApp_user';
  private readonly FULLNAME_KEY = 'suiviApp_fullname';
  private readonly REQUEST_TIMEOUT_MS = 5000;

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<boolean> {
    return this.http.get<User[]>('/users.json').pipe(
      timeout({ first: this.REQUEST_TIMEOUT_MS }),
      switchMap((users) => {
        const user = users.find(
          (u) => u.username.toLowerCase() === username.toLowerCase()
        );
        if (!user) {
          return of(false);
        }
        return from(bcrypt.compare(password, user.passwordHash)).pipe(
          timeout({ first: this.REQUEST_TIMEOUT_MS }),
          map((match) => {
            if (match) {
              sessionStorage.setItem(this.SESSION_KEY, user.username);
              sessionStorage.setItem(
                this.FULLNAME_KEY,
                user.userfullname ?? user.username
              );
            }
            return match;
          }),
          catchError(() => of(false))
        );
      }),
      catchError(() => of(false))
    );
  }

  logout(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
    sessionStorage.removeItem(this.FULLNAME_KEY);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem(this.SESSION_KEY);
  }

  getUsername(): string | null {
    return sessionStorage.getItem(this.SESSION_KEY);
  }

  getFullname(): string | null {
    return sessionStorage.getItem(this.FULLNAME_KEY);
  }

  isAdmin(): boolean {
    return this.getUsername()?.toLowerCase() === 'admin';
  }
}
