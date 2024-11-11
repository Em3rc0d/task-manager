// weather.service.ts - Servicio Angular para manejar la solicitud al backend

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private backendUrl = 'https://backend-task-m.vercel.app/api/weather'; // URL del backend intermedio

  constructor(private http: HttpClient) {}

  getWeather(latitude: number, longitude: number): Observable<any> {
    return this.http.get(`${this.backendUrl}?lat=${latitude}&lon=${longitude}`);
  }
}