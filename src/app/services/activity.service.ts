import { HttpClient } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { CoreService } from './core.service';


@Injectable({
  providedIn: 'root',
})
export class ActivityService extends CoreService {
  constructor(@Inject(HttpClient) http: HttpClient) {
    super('activity', http);
  }
}
