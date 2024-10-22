import { Routes } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome.component';
import { TaskListComponent } from './task-list/task-list.component';

export const routes: Routes = [
{
  path: '', redirectTo: 'welcome', pathMatch: 'full'
},
{
  path: 'welcome',
  component: WelcomeComponent
},
{
  path: 'tasks',
  component: TaskListComponent
}
];
