import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Trip } from '../models/trip-details.model';
import { CoreService } from './core.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TripService extends CoreService {
  // Mock data for trip details
  private mockTrips: Trip[] = [
    {
      id: '1',
      destination: 'New York City',
      country: 'USA',
      startDate: '2025-06-15T00:00:00.000Z',
      durationDays: 7,
      imageUrl: '/assets/images/travel.png',
      flight: {
        from: 'NYC',
        to: 'Tbilisi',
        departureTime: '2025-06-15T08:30:00.000Z',
        duration: '12h 45m'
      },
      days: [        {
          date: '2025-06-15T00:00:00.000Z',
          label: 'Day 1',
          isToday: false,
          activities: ['Arrival', 'Hotel Check-in', 'Welcome Dinner']
        },
        {
          date: '2025-06-16T00:00:00.000Z',
          label: 'Day 2',
          isToday: false,
          activities: ['City Tour', 'Museum Visit', 'Lunch at Local Restaurant']
        },
        {
          date: '2025-06-17T00:00:00.000Z',
          label: 'Day 3',
          isToday: true,
          activities: ['Shopping Tour', 'Broadway Show', 'Dinner Cruise']
        },        {
          date: '2025-06-18T00:00:00.000Z',
          label: 'Day 4',
          isToday: false,
          activities: ['Ferry to Staten Island', 'Brooklyn Bridge Walk', 'Food Tour']
        },
        {
          date: '2025-06-19T00:00:00.000Z',
          label: 'Day 5',
          isToday: false,
          activities: ['Central Park Tour', 'Biking', 'Rooftop Bar']
        },
        {
          date: '2025-06-20T00:00:00.000Z',
          label: 'Day 6',
          isToday: false,
          activities: ['Art Gallery Visit', 'Shopping in SoHo', 'Jazz Club']
        },
        {
          date: '2025-06-21T00:00:00.000Z',
          label: 'Day 7',
          isToday: false,
          activities: ['Checkout', 'Airport Transfer', 'Departure']
        }
      ]
    },
    {
      id: '2',
      destination: 'Paris',
      country: 'France',
      startDate: '2025-07-10T00:00:00.000Z',
      durationDays: 5,
      imageUrl: '/assets/images/travel.png',
      flight: {
        from: 'CDG',
        to: 'JFK',
        departureTime: '2025-07-10T14:15:00.000Z',
        duration: '8h 30m'
      },
      days: [
        {
          date: '2025-07-10T00:00:00.000Z',
          label: 'Day 1',
          isToday: false
        },
        {
          date: '2025-07-11T00:00:00.000Z',
          label: 'Day 2',
          isToday: false
        },
        {
          date: '2025-07-12T00:00:00.000Z',
          label: 'Day 3',
          isToday: false
        },
        {
          date: '2025-07-13T00:00:00.000Z',
          label: 'Day 4',
          isToday: false
        },
        {
          date: '2025-07-14T00:00:00.000Z',
          label: 'Day 5',
          isToday: false
        }
      ]
    },
    {
      id: '3',
      destination: 'Tokyo',
      country: 'Japan',
      startDate: '2025-08-05T00:00:00.000Z',
      durationDays: 10,
      imageUrl: '/assets/images/japan.png',
      flight: {
        from: 'NRT',
        to: 'LAX',
        departureTime: '2025-08-05T23:45:00.000Z',
        duration: '11h 15m'
      },
      days: [
        {
          date: '2025-08-05T00:00:00.000Z',
          label: 'Day 1',
          isToday: false
        },
        {
          date: '2025-08-06T00:00:00.000Z',
          label: 'Day 2',
          isToday: false
        },
        {
          date: '2025-08-07T00:00:00.000Z',
          label: 'Day 3',
          isToday: false
        },
        {
          date: '2025-08-08T00:00:00.000Z',
          label: 'Day 4',
          isToday: false
        },
        {
          date: '2025-08-09T00:00:00.000Z',
          label: 'Day 5',
          isToday: false
        },
        {
          date: '2025-08-10T00:00:00.000Z',
          label: 'Day 6',
          isToday: false
        },
        {
          date: '2025-08-11T00:00:00.000Z',
          label: 'Day 7',
          isToday: false
        },
        {
          date: '2025-08-12T00:00:00.000Z',
          label: 'Day 8',
          isToday: false
        },
        {
          date: '2025-08-13T00:00:00.000Z',
          label: 'Day 9',
          isToday: false
        },
        {
          date: '2025-08-14T00:00:00.000Z',
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
   */
  getTripById(id: string): Observable<Trip> {
    // In a real app, you would use: 
    // return this.getOneById(id);
    
    // For demo, we'll use mock data:
    return of(this.mockTrips.find(trip => trip.id === id))
      .pipe(
        map(trip => {
          if (!trip) {
            throw new Error(`Trip with ID ${id} not found`);
          }
          return trip;
        })
      );
  }

  /**
   * Format date for display
   */
  formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
}
