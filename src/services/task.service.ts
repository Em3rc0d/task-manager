// task.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';  // Importar AuthService para acceder al token

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'https://backend-task-m.vercel.app/tasks';
  private apiUrlHolidays = 'https://calendarific.com/api/v2/holidays?api_key=L1sOG3Gak8ftPR9dhD5n0UGp4y9O46qk&country=PE&year=2024&type=national'

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Método para obtener los encabezados con el token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}` // Agregar el token en los encabezados
    });
  }

  // Obtener tareas por email
  getTasksByUserEmail(email: string): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/${email}`, { headers });
  }

  // Actualizar tarea por email
  updateTaskByEmail(email: string, task: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put<any>(`${this.apiUrl}/${email}`, task, { headers });
  }

  // Eliminar tarea por email
  deleteTaskByEmail(email: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete<any>(`${this.apiUrl}/${email}`, { headers });
  }


  getTasksByUserId(userId: string): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/${userId}`, { headers });
  }

  addTask(task: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(this.apiUrl, task, { headers });
  }

  updateTask(id: string, task: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put<any>(`${this.apiUrl}/${id}`, task, { headers });
  }

  deleteTask(id: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers });
  }
  
  getHolidays(): Observable<any> {
    return this.http.get<any>(this.apiUrlHolidays); // No se necesita el token para esta solicitud
  }
}
