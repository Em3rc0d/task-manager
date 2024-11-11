import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
const uri = "http://localhost:4200";
const uri1 = "https://task-manager-plum-xi.vercel.app";
const uri2 = "http://tarea-angular-dsi.s3-website.us-east-2.amazonaws.com";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideClientHydration(),
    provideHttpClient()
  ],
};
