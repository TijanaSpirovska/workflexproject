import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Trip } from '../models/trip-details.model';
import { CoreService } from './core.service';
import { map } from 'rxjs/operators';
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
  // Mock data for trip details
  private mockTrips: Trip[] = [
    {
      id: '1',
      destination: 'New York City',
      country: 'USA',
      startDate: '2025-05-20T00:00:00.000Z', // Starting 3 days ago from today (May 23, 2025)
      imageUrl: '/assets/images/travel.png',
      flight: {
        from: 'NYC',
        to: 'Tbilisi',
        departureTime: '2025-05-20T08:30:00.000Z',
        duration: '12h 45m',
      },
      days: [
        {
          activities: ['Arrival', 'Hotel Check-in', 'Welcome Dinner'],
        },
        {
          activities: [
            'City Tour',
            'Museum Visit',
            'Lunch at Local Restaurant',
          ],
        },
        {
          activities: ['Shopping Tour', 'Broadway Show', 'Dinner Cruise'],
        },
        {
          activities: [
            'Ferry to Staten Island',
            'Brooklyn Bridge Walk',
            'Food Tour',
          ],
        },
        {
          activities: ['Central Park Tour', 'Biking', 'Rooftop Bar'],
        },
        {
          activities: ['Art Gallery Visit', 'Shopping in SoHo', 'Jazz Club'],
        },
        {
          activities: ['Checkout', 'Airport Transfer', 'Departure'],
        },
      ],
    },
    {
      id: '2',
      destination: 'Paris',
      country: 'France',
      startDate: '2025-05-27T00:00:00.000Z', // Starting next week
      imageUrl: '/assets/images/travel.png',
      flight: {
        from: 'CDG',
        to: 'JFK',
        departureTime: '2025-05-27T14:15:00.000Z',
        duration: '8h 30m',
      },
      days: [
        {
          activities: ['Arrival', 'Hotel Check-in', 'Dinner at Eiffel Tower'],
        },
        {
          activities: ['Louvre Museum', 'Seine River Cruise', 'Notre-Dame'],
        },
        {
          activities: ['Versailles Day Trip', 'Palace Tour', 'Gardens Visit'],
        },
        {
          activities: [
            'Montmartre Exploration',
            'Sacré-Cœur Basilica',
            'Moulin Rouge',
          ],
        },
        {
          activities: ['Shopping in Le Marais', 'Picnic at Luxembourg Gardens'],
        },
      ],
    },
    {
      id: '3',
      destination: 'Tokyo',
      country: 'Japan',
      startDate: '2025-05-10T00:00:00.000Z', // Already finished trip (ended May 19)
      imageUrl: '/assets/images/japan.png',
      flight: {
        from: 'NRT',
        to: 'LAX',
        departureTime: '2025-05-10T23:45:00.000Z',
        duration: '11h 15m',
      },
      days: [
        {
          activities: [
            'Arrival',
            'Hotel Check-in',
            'Dinner at Robot Restaurant',
          ],
        },
        {
          activities: ['Shibuya Crossing', 'Harajuku Shopping', 'Meiji Shrine'],
        },
        {
          activities: [
            'Tsukiji Outer Market',
            'Sumo Wrestling Practice',
            'Asakusa Temple',
          ],
        },
        {
          activities: ['Akihabara Electric Town', 'Anime and Manga Shopping'],
        },
        {
          activities: ['Ueno Park', 'Tokyo National Museum', 'Ameyoko Market'],
        },
        {
          activities: [
            'Odaiba Seaside Park',
            'TeamLab Borderless',
            'DiverCity Tokyo Plaza',
          ],
        },
        {
          activities: [
            'Day Trip to Mount Fuji',
            'Lake Kawaguchi',
            'Onsen Experience',
          ],
        },
        {
          activities: ['Nara Day Trip', 'Todai-ji Temple', 'Nara Park'],
        },
        {
          activities: [
            'Kyoto Day Trip',
            'Kinkaku-ji (Golden Pavilion)',
            'Gion District',
          ],
        },
        {
          activities: ['Checkout', 'Airport Transfer', 'Departure'],
        },
      ],
    },
  ];
  constructor(
    http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    super('plan-trips/trip-details', http);
  }

  /**
   * Get all trips
   * In a real app, this would fetch from an API
   */
  getTrips(): Observable<Trip[]> {
    // For demo purposes, we're using mock data
    // In a real app, replace this with an API call:
    // return this.http.get<Trip[]>(`${this.URL}`);
    return of(this.mockTrips);
  }
  /**
   * Get trip by ID
   */ getTripById(id: string): Observable<Trip> {
    // Store the selected trip ID for retrieval after page refresh
    this.storeSelectedTripId(id);

    // For demo, we'll use mock data:
    return of(this.mockTrips.find((trip) => trip.id === id)).pipe(
      map((trip) => {
        if (!trip) {
          console.error(`Trip with ID ${id} not found`);
          // Return a default trip instead of throwing an error
          // This provides graceful recovery in the UI
          return {
            id: '0',
            destination: 'Trip Not Found',
            country: 'Please try another trip',
            startDate: new Date().toISOString(),
            durationDays: 0,
            imageUrl: '/assets/images/travel.png',
            flight: {
              from: 'N/A',
              to: 'N/A',
              departureTime: new Date().toISOString(),
              duration: 'N/A',
            },
            days: [],
          } as Trip;
        }

        // If we have a selected image, temporarily override the trip's image
        // This ensures consistency with the my-trips component
        const currentImage = this.selectedTripImageSource.getValue();
        if (currentImage && currentImage !== '/assets/images/travel.png') {
          trip = { ...trip, imageUrl: currentImage };
        }

        return trip;
      })
    );
  }

  /**
   * Format date for display
   */ formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  /**
   * Sets the selected trip image URL
   */
  setSelectedTripImage(imageUrl: string): void {
    // Store the image URL in localStorage
    this.storeImageUrl(imageUrl);
    // Update the BehaviorSubject
    this.selectedTripImageSource.next(imageUrl);
  }
  /**
   * Store image URL in localStorage
   */
  private storeImageUrl(imageUrl: string): void {
    try {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.STORAGE_KEY, imageUrl);
      }
    } catch (error) {
      console.error('Error storing image URL in localStorage:', error);
    }
  }
  /**
   * Get stored image URL from localStorage
   */
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
  /**
   * Store selected trip ID in localStorage
   */
  private storeSelectedTripId(tripId: string): void {
    try {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.TRIP_ID_KEY, tripId);
      }
    } catch (error) {
      console.error('Error storing trip ID in localStorage:', error);
    }
  }
  /**
   * Get stored trip ID from localStorage
   */
  getStoredTripId(): string | null {
    try {
      if (isPlatformBrowser(this.platformId)) {
        return localStorage.getItem(this.TRIP_ID_KEY);
      }
    } catch (error) {
      console.error('Error retrieving trip ID from localStorage:', error);
    }
    return null;
  }
}
