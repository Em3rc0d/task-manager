import { Component } from '@angular/core';
import { TaskListComponent } from './task-list/task-list.component'; // Ajusta la ruta según tu estructura de carpetas
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  imports: [TaskListComponent, RouterOutlet],  
})
export class AppComponent {
}
