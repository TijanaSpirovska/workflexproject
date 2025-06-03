import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { CoreService } from './core.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class TripService extends CoreService {
  private readonly STORAGE_KEY = 'selectedTripImage';
  private readonly TRIP_ID_KEY = 'selectedTripId';
  private readonly DEFAULT_IMAGE = '/assets/images/travel.png';

  // For sharing trip data between components
  private selectedTripImageSource = new BehaviorSubject<string>(
    this.getStoredImageUrl()
  );
  selectedTripImage$ = this.selectedTripImageSource.asObservable();
  constructor(
    http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    super('plan-trips/trip-details', http);
  }

  setSelectedTripImage(imageUrl: string): void {
    this.storeImageUrl(imageUrl);
    this.selectedTripImageSource.next(imageUrl);
  }

  private storeImageUrl(imageUrl: string): void {
    try {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.STORAGE_KEY, imageUrl);
      }
    } catch (error) {
      console.error('Error storing image URL in localStorage:', error);
    }
  }

  private getStoredImageUrl(): string {
    try {
      if (isPlatformBrowser(this.platformId)) {
        const storedUrl = localStorage.getItem(this.STORAGE_KEY);
        return storedUrl ?? this.DEFAULT_IMAGE;
      }
    } catch (error) {
      console.error('Error retrieving image URL from localStorage:', error);
    }
    return this.DEFAULT_IMAGE;
  }
}
