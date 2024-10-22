import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../task.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class TaskListComponent implements OnInit, OnDestroy {
  tasks: any[] = [];
  usuario: any = null;
  newTaskTitle: string = '';
  newTaskDescription: string = '';
  newTaskDueDate: string = '';
  newTaskPriority: string = 'Media';
  priorities = ['Baja', 'Media', 'Alta'];
  editingTaskId: string | null = null;
  showForm: boolean = false;
  private userSubscription: Subscription | null = null;

  constructor(private taskService: TaskService, private auth: AuthService) {}

  ngOnInit(): void {
    this.userSubscription = this.auth.user$.subscribe((user) => {
      if (user) {
        this.usuario = user;
        this.loadTasks();
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  loadTasks() {
    if (this.usuario) {
      this.taskService.getTasksByUserId(this.usuario.sub).subscribe({
        next: (data) => {
          this.tasks = this.sortTasks(data);
        },
        error: (err) => {
          console.error('Error al cargar las tareas:', err);
          alert('Hubo un problema al cargar las tareas.');
        }
      });
    }
  }

  sortTasks(tasks: any[]): any[] {
    return tasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  addTask() {
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
      this.updateTask();
    } else {
      this.taskService.addTask(newTask).subscribe({
        next: (task) => {
          this.tasks.push(task);
          this.tasks = this.sortTasks(this.tasks);
          this.resetForm();
        },
        error: (err) => {
          console.error('Error al agregar la tarea:', err);
          alert('Hubo un problema al agregar la tarea.');
        }
      });
    }
  }

  updateTask() {
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
        this.tasks[index] = task;
        this.resetForm();
      },
      error: (err) => {
        console.error('Error al actualizar la tarea:', err);
        alert('Hubo un problema al actualizar la tarea.');
      }
    });
    }
  }

  startEditing(task: any) {
    this.editingTaskId = task._id;
    this.newTaskTitle = task.title;
    this.newTaskDescription = task.description;
    this.newTaskDueDate = task.dueDate;
    this.newTaskPriority = task.priority;
    this.showForm = true;
  }

  deleteTask(id: string) {
    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(task => task._id !== id);
      },
      error: (err) => {
        console.error('Error al eliminar la tarea:', err);
        alert('Hubo un problema al eliminar la tarea.');
      }
    });
  }

  resetForm() {
    this.newTaskTitle = '';
    this.newTaskDescription = '';
    this.newTaskDueDate = '';
    this.newTaskPriority = 'Media';
    this.editingTaskId = null;
    this.showForm = false;
  }

  isDeadlineApproaching(dueDate: string): boolean {
    const date = new Date(dueDate);
    const now = new Date();
    const timeDifference = date.getTime() - now.getTime();
    const daysUntilDue = Math.ceil(timeDifference / (1000 * 3600 * 24));
    return daysUntilDue <= 2;
  }

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

  logOut() {
    this.auth.logout();
  }
}
