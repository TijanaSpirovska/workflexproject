import { NgModule, isDevMode } from '@angular/core';
import {
  BrowserModule,
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { HeaderComponent } from './components/header/header.component';
import { SignUpPageComponent } from './components/sign-up-page/sign-up-page.component';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from './configs/toastr.config';
import { ReactiveFormsModule } from '@angular/forms';
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
import { NewTripComponent } from './components/new-trip/new-trip.component';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MyTripsComponent } from './components/my-trips/my-trips.component';
import { ActivitiesComponent } from './components/activities/activities.component';
import { AccommodationComponent } from './components/accommodation/accommodation.component';
import { BreadcrumbComponent } from './components/shared/breadcrumb/breadcrumb.component';
import { ActivityMapComponent } from './components/activities/activity-map/activity-map.component';
import { ActivityCardComponent } from './components/activities/activity-card/activity-card.component';
import { ActivityModalComponent } from './components/activities/activity-modal/activity-modal.component';
import { RecommendedLocationsComponent } from './components/recommended-locations/recommended-locations.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    HeaderComponent,
    SignUpPageComponent,
    MenuComponent,
    HomePageComponent,
    NewTripComponent,
    MyTripsComponent,
    ActivitiesComponent,
    AccommodationComponent,
    BreadcrumbComponent,
    ActivityMapComponent,
    ActivityCardComponent,
    ActivityModalComponent,
    RecommendedLocationsComponent,
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
