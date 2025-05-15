import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { SignUpPageComponent } from './components/sign-up-page/sign-up-page.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { NewTripComponent } from './components/new-trip/new-trip.component';
import { MyTripsComponent } from './components/my-trips/my-trips.component';
import { ActivitiesComponent } from './components/activities/activities.component';
import { AccommodationComponent } from './components/accommodation/accommodation.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomePageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'sign-up', component: SignUpPageComponent },
  { path: 'new-trip', component: NewTripComponent },
  { path: 'my-trips', component: MyTripsComponent },
  { path: 'activities', component: ActivitiesComponent },
  { path: 'accommodation', component: AccommodationComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
