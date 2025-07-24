import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
import { WorkationListComponent } from './components/workation-list/workation-list.component';
import { UploadCsvComponent } from './components/upload-csv/upload-csv.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomePageComponent },
  { path: 'workation-list', component: WorkationListComponent },
  { path: 'upload-csv', component: UploadCsvComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
