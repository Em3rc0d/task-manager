// auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Obtener el token de localStorage
    const token = localStorage.getItem('token');

    if (token) {
      // Clonar la solicitud original y agregar el encabezado Authorization con el token
      const clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      // Pasar la solicitud modificada al siguiente interceptor o al backend
      return next.handle(clonedRequest);
    }

    // Si no hay token, simplemente pasar la solicitud original
    return next.handle(req);
  }
}
