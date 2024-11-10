import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../task.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';
import { Subscription } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]  // Importa FormsModule y CommonModule
})
export class TaskListComponent implements OnInit, OnDestroy {
  isQuoteModalOpen: boolean = false;  // Variable para manejar el estado del modal de cita
  isLocationModalOpen: boolean = false;  // Variable para manejar el estado del modal de ubicación
  isHolidayModalOpen: boolean = false;  // Variable para manejar el estado del modal de días festivos
  tasks: any[] = [];  // Array para almacenar las tareas
  usuario: any = null;  // Almacena el usuario autenticado
  newTaskTitle: string = '';  // Título de la nueva tarea
  newTaskDescription: string = '';  // Descripción de la nueva tarea
  newTaskDueDate: string = '';  // Fecha de vencimiento de la nueva tarea
  newTaskPriority: string = 'Media';  // Prioridad por defecto
  priorities = ['Baja', 'Media', 'Alta'];  // Opciones de prioridad
  editingTaskId: string | null = null;  // ID de la tarea que se está editando
  showForm: boolean = false;  // Si el formulario de tarea está visible
  private userSubscription: Subscription | null = null;  // Suscripción del usuario
  location: { latitude: number; longitude: number } | null = null;  // Ubicación del usuario
  private map!: L.Map;  // Variable para el mapa
  holidays: any[] = [];  // Array para almacenar los días festivos
  quote: string | null = null;
  weather: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    description: string;
    iconUrl: string;
    wind_speed: number;
    wind_deg: number;
    wind_gust: number;
    clouds: number;
    visibility: number;
    city: string;
    country: string;
    timezone: number;
  } | null = null;

  constructor(
    private taskService: TaskService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  // Al iniciar el componente, se obtiene el usuario y las tareas
  ngOnInit(): void {
    this.userSubscription = this.auth.user$.subscribe((user) => {
      if (user) {
        this.usuario = user;
        this.loadTasks();  
      }
    });
    this.loadHolidays();
    this.getRandomQuote();
  }

  // Desuscribir la suscripción y eliminar el mapa cuando se destruya el componente
  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.map?.remove();
  }

  // Obtener la ubicación del usuario usando la API de geolocalización
  getLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.location = {
            latitude: position.coords.latitude ,  // Ajuste en las coordenadas
            longitude: position.coords.longitude ,  // Ajuste en las coordenadas
          };
          this.initMap(this.location.latitude, this.location.longitude);
          this.getWeather(this.location.latitude, this.location.longitude);
          console.log('Ubicación obtenida:', this.location);
        },
        (error) => {
          console.error('Error al obtener la ubicación:', error);
          alert('No se pudo obtener la ubicación.');
        }
      );
    } else {
      alert('La geolocalización no es compatible con este navegador.');
    }
  }

  // Cargar las tareas del usuario autenticado
  loadTasks(): void {
    if (this.usuario) {
      this.taskService.getTasksByUserId(this.usuario.sub).subscribe({
        next: (data) => {
          this.tasks = this.sortTasks(data);  // Ordenar las tareas por fecha
        },
        error: (err) => {
          console.error('Error al cargar las tareas:', err);
          alert('Hubo un problema al cargar las tareas.');
        }
      });
    }
  }

  // Inicializar el mapa con la ubicación obtenida
  private async initMap(lat: number, lng: number, zoom: number = 13): Promise<void> {
    if (typeof window !== 'undefined') {
      const L = await import('leaflet');
      this.map = L.map('map').setView([lat, lng], zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);
      L.marker([lat, lng])
        .addTo(this.map)
        .bindPopup('Estás aquí.')
        .openPopup();
    }
  }

  // Ordenar las tareas por fecha de vencimiento
  sortTasks(tasks: any[]): any[] {
    return tasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  // Agregar una nueva tarea o actualizar una tarea existente
  addTask(): void {
    if (!this.newTaskTitle.trim()) {
      alert('El título de la tarea es obligatorio.');
      return;
    }

    const newTask = {
      title: this.newTaskTitle,
      description: this.newTaskDescription,
      dueDate: this.newTaskDueDate,
      priority: this.newTaskPriority,
      userId: this.usuario.sub,
      completed: false
    };

    if (this.editingTaskId) {
      this.updateTask();  // Si estamos editando, actualizar la tarea
    } else {
      this.taskService.addTask(newTask).subscribe({
        next: (task) => {
          this.tasks.push(task);  // Agregar la nueva tarea al array
          this.tasks = this.sortTasks(this.tasks);  // Ordenar las tareas
          this.resetForm();  // Limpiar el formulario
        },
        error: (err) => {
          console.error('Error al agregar la tarea:', err);
          alert('Hubo un problema al agregar la tarea.');
        }
      });
    }
  }

  // Actualizar una tarea existente
  updateTask(): void {
    const updatedTask = {
      title: this.newTaskTitle,
      description: this.newTaskDescription,
      dueDate: this.newTaskDueDate,
      priority: this.newTaskPriority,
      userId: this.usuario.sub,
      completed: false
    };

    if (this.editingTaskId !== null) {
      this.taskService.updateTask(this.editingTaskId, updatedTask).subscribe({
        next: (task) => {
          const index = this.tasks.findIndex(t => t._id === this.editingTaskId);
          this.tasks[index] = task;  // Actualizar la tarea en el array
          this.resetForm();  // Limpiar el formulario
        },
        error: (err) => {
          console.error('Error al actualizar la tarea:', err);
          alert('Hubo un problema al actualizar la tarea.');
        }
      });
    }
  }

  // Iniciar la edición de una tarea
  startEditing(task: any): void {
    this.editingTaskId = task._id;
    this.newTaskTitle = task.title;
    this.newTaskDescription = task.description;
    this.newTaskDueDate = task.dueDate;
    this.newTaskPriority = task.priority;
    this.showForm = true;
  }

  // Eliminar una tarea
  deleteTask(id: string): void {
    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(task => task._id !== id);  // Eliminar la tarea del array
      },
      error: (err) => {
        console.error('Error al eliminar la tarea:', err);
        alert('Hubo un problema al eliminar la tarea.');
      }
    });
  }

  // Restablecer el formulario
  resetForm(): void {
    this.newTaskTitle = '';
    this.newTaskDescription = '';
    this.newTaskDueDate = '';
    this.newTaskPriority = 'Media';
    this.editingTaskId = null;
    this.showForm = false;
  }

  // Verificar si la fecha de vencimiento se acerca
  isDeadlineApproaching(dueDate: string): boolean {
    const date = new Date(dueDate);
    const now = new Date();
    const timeDifference = date.getTime() - now.getTime();
    const daysUntilDue = Math.ceil(timeDifference / (1000 * 3600 * 24));
    return daysUntilDue <= 2;  // Si faltan 2 o menos días, retorna true
  }

  // Obtener el color de prioridad
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'Alta':
        return 'bg-red-200';
      case 'Media':
        return 'bg-yellow-200';
      case 'Baja':
        return 'bg-green-200';
      default:
        return '';
    }
  }

  loadHolidays(): void {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    this.taskService.getHolidays().subscribe({
      next: (response) => {
        const holidays = response.response.holidays
          .map((holiday: any) => {
            holiday.date.iso = new Date(holiday.date.iso);
            return holiday;
          })
          .filter((holiday: any) => holiday.date.iso >= today && holiday.date.iso <= thirtyDaysFromNow)
          .sort((a: any, b: any) => a.date.iso.getTime() - b.date.iso.getTime());

        // Traducir todos los días festivos
        Promise.all(
          holidays.map((holiday: any) =>
            this.translateText(holiday.name, 'es')
              .then(translated => holiday.name = translated)
              .catch(error => console.error('Error al traducir el día festivo:', error))
          )
        ).then(() => {
          this.holidays = holidays;
          this.cdr.detectChanges();  // Asegurarse de que la vista se actualice
        });
      },
      error: (err) => {
        console.error('Error al obtener los días festivos:', err);
        alert('Hubo un problema al obtener los días festivos.');
      }
    });
  }
  
  
  
  getRandomQuote(): void {
    fetch('https://api.quotable.io/random')
      .then(response => response.json())
      .then(data => {
        const quote = data.content;  // Obtener la cita
        this.translateText(quote, 'es')  // Traducir la cita al español
          .then(translated => {
            this.quote = translated;  // Asignar la cita traducida
          })
          .catch(error => {
            console.error('Error al traducir la cita:', error);
          });
      })
      .catch(error => {
        console.error('Error al obtener la cita:', error);
      });
  }
  
  translateText(holidayName: string, targetLang: string): Promise<string> {
    const url = 'https://libretranslate.de/translate';
    const data = {
      q: holidayName,
      source: 'en', 
      target: targetLang,
      format: 'text',
    };
  
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
      return data.translatedText;
    })
    .catch(error => {
      console.error('Error al traducir:', error);
      return holidayName;  // Devuelve el nombre original si hay un error
    })
    .finally(() => {
      // Llamar a detectChanges para que Angular actualice la vista
      this.cdr.detectChanges();
    });
  }
  
  getWeather(latitude: number, longitude: number): void {
    const apiKey = '2a0bd20450d7b6125ed140498e6ddc11';
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=es`;
  
    fetch(url)
      .then(response => response.json())
      .then(data => {
        this.weather = {
          temp: data.main.temp,  // Temperatura actual
          feels_like: data.main.feels_like,  // Sensación térmica
          temp_min: data.main.temp_min,  // Temperatura mínima
          temp_max: data.main.temp_max,  // Temperatura máxima
          pressure: data.main.pressure,  // Presión atmosférica
          humidity: data.main.humidity,  // Humedad relativa
          description: data.weather[0].description,  // Descripción del clima
          iconUrl: `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`,  // Icono del clima
          wind_speed: data.wind.speed,  // Velocidad del viento
          wind_deg: data.wind.deg,  // Dirección del viento (grados)
          wind_gust: data.wind.gust,  // Ráfagas del viento (si disponible)
          clouds: data.clouds.all,  // Porcentaje de nubosidad
          visibility: data.visibility,  // Visibilidad en metros
          city: data.name,  // Nombre de la ciudad
          country: data.sys.country,  // País
          timezone: data.timezone  // Zona horaria
        };
  
        console.log('Clima actual:', this.weather);
      })
      .catch(error => {
        console.error('Error al obtener el clima:', error);
      });
  }

  // Métodos para abrir y cerrar el modal de cita
  openQuoteModal() {
    this.isQuoteModalOpen = true;
    this.getRandomQuote();  // Obtener cita aleatoria cuando se abre el modal
  }

  closeQuoteModal() {
    this.isQuoteModalOpen = false;
  }

  // Métodos para abrir y cerrar el modal de ubicación
  openLocationModal() {
    this.isLocationModalOpen = true;
    this.getLocation();  // Obtener ubicación cuando se abre el modal
  }

  closeLocationModal() {
    this.isLocationModalOpen = false;
  }

  // Cerrar sesión
  logOut(): void {
    this.auth.logout();
  }
}


//mapa, latitud-longitud, cita aleatoria, dia festivo, weather