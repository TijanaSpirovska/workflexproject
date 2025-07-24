import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from './configs/toastr.config';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  HTTP_INTERCEPTORS,
  HttpClientModule,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthInterceptor } from './configs/http.token.interceptor';
import { MenuComponent } from './components/menu/menu.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { CalendarModule } from 'primeng/calendar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { WorkationListComponent } from './components/workation-list/workation-list.component';
import { UploadCsvComponent } from './components/upload-csv/upload-csv.component';

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    HomePageComponent,
    WorkationListComponent,
    UploadCsvComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ToastrModule.forRoot(toastrConfig),
    CalendarModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    HttpClientModule,
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  exports: [
    ToastrModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
