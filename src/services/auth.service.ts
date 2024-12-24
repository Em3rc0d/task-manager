import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://backend-task-m.vercel.app/auth'; // Cambia esto según tu API
  private tokenKey = 'token';

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object // Inyección para verificar si el código corre en el navegador
  ) {}

  // Login con JWT
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password });
  }

  // Logout: elimina el token
  logout(): void {
    if (this.isBrowser()) {
      sessionStorage.removeItem(this.tokenKey);
    }
    this.router.navigate(['/welcome']);
  }

  // Guarda el token en sessionStorage
  setToken(token: string): void {
    if (this.isBrowser()) {
      sessionStorage.setItem(this.tokenKey, token);
    }
  }

  // Verifica si el usuario está autenticado (si existe el token)
  isAuthenticated(): boolean {
    return this.isBrowser() && !!sessionStorage.getItem(this.tokenKey);
  }

  // Obtener el token
  getToken(): string | null {
    if (this.isBrowser()) {
      return sessionStorage.getItem(this.tokenKey);
    }
    return null;
  }

  // Registrar usuario
  register(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { email, password });
  }

  // Verifica si el código corre en el navegador
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
