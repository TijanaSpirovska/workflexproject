import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Trip } from '../models/trip-details.model';
import { CoreService } from './core.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TripService extends CoreService {
  // For sharing trip data between components
  private selectedTripImageSource = new BehaviorSubject<string>('/assets/images/travel.png');
  selectedTripImage$ = this.selectedTripImageSource.asObservable();
    // Mock data for trip details
  private mockTrips: Trip[] = [
    {
      id: '1',
      destination: 'New York City',
      country: 'USA',
      startDate: '2025-05-20T00:00:00.000Z', // Starting 3 days ago from today (May 23, 2025)
      durationDays: 7,
      imageUrl: '/assets/images/travel.png',
      flight: {
        from: 'NYC',
        to: 'Tbilisi',
        departureTime: '2025-05-20T08:30:00.000Z',
        duration: '12h 45m'
      },      days: [        {
          date: '2025-05-20T00:00:00.000Z', // Day 1
          label: 'Day 1',
          isToday: false,
          activities: ['Arrival', 'Hotel Check-in', 'Welcome Dinner']
        },
        {
          date: '2025-05-21T00:00:00.000Z', // Day 2
          label: 'Day 2',
          isToday: false,
          activities: ['City Tour', 'Museum Visit', 'Lunch at Local Restaurant']
        },
        {
          date: '2025-05-22T00:00:00.000Z', // Day 3
          label: 'Day 3',
          isToday: false,
          activities: ['Shopping Tour', 'Broadway Show', 'Dinner Cruise']
        },        {
          date: '2025-05-23T00:00:00.000Z', // Day 4 - Today
          label: 'Day 4',
          isToday: true,
          activities: ['Ferry to Staten Island', 'Brooklyn Bridge Walk', 'Food Tour']
        },
        {
          date: '2025-05-24T00:00:00.000Z', // Day 5
          label: 'Day 5',
          isToday: false,
          activities: ['Central Park Tour', 'Biking', 'Rooftop Bar']
        },
        {
          date: '2025-05-25T00:00:00.000Z', // Day 6
          label: 'Day 6',
          isToday: false,
          activities: ['Art Gallery Visit', 'Shopping in SoHo', 'Jazz Club']
        },
        {
          date: '2025-05-26T00:00:00.000Z', // Day 7
          label: 'Day 7',
          isToday: false,
          activities: ['Checkout', 'Airport Transfer', 'Departure']
        }
      ]
    },    {
      id: '2',
      destination: 'Paris',
      country: 'France',
      startDate: '2025-05-27T00:00:00.000Z', // Starting next week
      durationDays: 5,
      imageUrl: '/assets/images/travel.png',
      flight: {
        from: 'CDG',
        to: 'JFK',
        departureTime: '2025-05-27T14:15:00.000Z',
        duration: '8h 30m'
      },      days: [
        {
          date: '2025-05-27T00:00:00.000Z', // Upcoming - Day 1
          label: 'Day 1',
          isToday: false
        },
        {
          date: '2025-05-28T00:00:00.000Z', // Upcoming - Day 2
          label: 'Day 2',
          isToday: false
        },
        {
          date: '2025-05-29T00:00:00.000Z', // Upcoming - Day 3
          label: 'Day 3',
          isToday: false
        },
        {
          date: '2025-05-30T00:00:00.000Z', // Upcoming - Day 4
          label: 'Day 4',
          isToday: false
        },
        {
          date: '2025-05-31T00:00:00.000Z', // Upcoming - Day 5
          label: 'Day 5',
          isToday: false
        }
      ]
    },    {
      id: '3',
      destination: 'Tokyo',
      country: 'Japan',
      startDate: '2025-05-10T00:00:00.000Z', // Already finished trip (ended May 19)
      durationDays: 10,
      imageUrl: '/assets/images/japan.png',
      flight: {
        from: 'NRT',
        to: 'LAX',
        departureTime: '2025-05-10T23:45:00.000Z',
        duration: '11h 15m'
      },      days: [
        {
          date: '2025-05-10T00:00:00.000Z', // Past - Day 1
          label: 'Day 1',
          isToday: false
        },
        {
          date: '2025-05-11T00:00:00.000Z', // Past - Day 2
          label: 'Day 2',
          isToday: false
        },
        {
          date: '2025-05-12T00:00:00.000Z', // Past - Day 3
          label: 'Day 3',
          isToday: false
        },
        {
          date: '2025-05-13T00:00:00.000Z', // Past - Day 4
          label: 'Day 4',
          isToday: false
        },
        {
          date: '2025-05-14T00:00:00.000Z', // Past - Day 5
          label: 'Day 5',
          isToday: false
        },
        {
          date: '2025-05-15T00:00:00.000Z', // Past - Day 6
          label: 'Day 6',
          isToday: false
        },
        {
          date: '2025-05-16T00:00:00.000Z', // Past - Day 7
          label: 'Day 7',
          isToday: false
        },
        {
          date: '2025-05-17T00:00:00.000Z', // Past - Day 8
          label: 'Day 8',
          isToday: false
        },
        {
          date: '2025-05-18T00:00:00.000Z', // Past - Day 9
          label: 'Day 9',
          isToday: false
        },
        {
          date: '2025-05-19T00:00:00.000Z', // Past - Day 10
          label: 'Day 10',
          isToday: false
        }
      ]
    }
  ];

  constructor(http: HttpClient) {
    super('trip-details', http);
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
   */  getTripById(id: string): Observable<Trip> {
    // In a real app, you would use: 
    // return this.getOneById(id);
    
    // For demo, we'll use mock data:
    return of(this.mockTrips.find(trip => trip.id === id))
      .pipe(
        map(trip => {
          if (!trip) {
            throw new Error(`Trip with ID ${id} not found`);
          }
          
          // If we have a selected image, temporarily override the trip's image
          // This ensures consistency with the my-trips component
          const currentImage = this.selectedTripImageSource.getValue();
          if (currentImage && currentImage !== '/assets/images/travel.png') {
            trip = {...trip, imageUrl: currentImage};
          }
          
          return trip;
        })
      );
  }

  /**
   * Format date for display
   */  formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  }
    /**
   * Sets the selected trip image URL
   */
  setSelectedTripImage(imageUrl: string): void {
    this.selectedTripImageSource.next(imageUrl);
  }
}
