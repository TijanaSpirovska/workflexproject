import { HttpClient } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { CoreService } from './core.service';


@Injectable({
  providedIn: 'root',
})
export class WorkationService extends CoreService {
  constructor(@Inject(HttpClient) http: HttpClient) {
    super('workflex/workation', http);
  }
}
