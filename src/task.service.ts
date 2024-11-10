// task.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'https://backend-task-m.vercel.app/tasks';
  private apiUrlHolidays = 'https://calendarific.com/api/v2/holidays?api_key=L1sOG3Gak8ftPR9dhD5n0UGp4y9O46qk&country=PE&year=2024&type=national'
  private translateUrl = 'https://libretranslate.de/translate';

  constructor(private http: HttpClient) {}

  getTasksByUserId(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${userId}`);
  }

  addTask(task: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, task);
  }

  updateTask(id: string, task: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, task);
  }

  deleteTask(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
  
  getHolidays(): Observable<any> {
    return this.http.get<any>(this.apiUrlHolidays);
  }

  translateText(text: string, targetLang: string = 'es'): Observable<any> {
    return this.http.post<any>(this.translateUrl, {
      q: text,
      source: 'en',
      target: targetLang,
      format: 'text'
    });
  }
}
