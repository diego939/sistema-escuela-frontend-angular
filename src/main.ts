import { bootstrapApplication } from '@angular/platform-browser';
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes'; // 🔥 IMPORTANTE: Asegúrate de importar tus rutas correctamente
import { provideHttpClient } from '@angular/common/http'; // 🔥 IMPORTANTE
import { AppComponent } from './app/app.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient() // 🔥 ESTO SOLUCIONA TODO
  ]
};

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));