import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';

interface usuario {
  email: string,
  password: string,
  token: string
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://backend-task-m.vercel.app/auth'; // Cambia esto según tu API
  private tokenKey = 'token';
  
  private key = localStorage.getItem('userEmail');
  constructor(private http: HttpClient, private router: Router) {}

  // Login con JWT
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password });

  }

  // Logout: elimina el token
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/welcome']);
  }

  // Verifica si el usuario está autenticado (si existe el token)
  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  // Obtener el token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Registrar usuario
  register(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { email, password });
  }
}
