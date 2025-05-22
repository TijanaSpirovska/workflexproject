import { HttpClient } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { CoreService } from './core.service';


@Injectable({
  providedIn: 'root',
})
export class RecommendedTripService extends CoreService {
  constructor(@Inject(HttpClient) http: HttpClient) {
    super('plan-trips/recommended', http);
  }
}
