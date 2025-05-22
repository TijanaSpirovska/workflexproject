import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Destination } from '../models/destination.model';

@Injectable({
  providedIn: 'root',
})
export class DestinationService {
  // Mock data for destinations
  // private mockDestinations: Destination[] = [
  //   {
  //     id: 1,
  //     name: 'Kamado Island',
  //     location: 'NRT, Indonesia',
  //     imageUrl: '/assets/images/travel.png',
  //     rating: 4.7,
  //     category: 'Beach',
  //   },
  //   {
  //     id: 2,
  //     name: 'Mount Fuji',
  //     location: 'Tokyo, Japan',
  //     imageUrl: '/assets/images/japan.png',
  //     rating: 4.9,
  //     category: 'Mountain',
  //   },
  //   {
  //     id: 3,
  //     name: 'Savanna Safari',
  //     location: 'Nairobi, Kenya',
  //     imageUrl: '/assets/images/kenya.png',
  //     rating: 4.6,
  //     category: 'Nature',
  //   },
  //   {
  //     id: 4,
  //     name: 'Lake Como',
  //     location: 'Milan, Italy',
  //     imageUrl: '/assets/images/italy.png',
  //     rating: 4.8,
  //     category: 'Nature',
  //   },
  //   {
  //     id: 5,
  //     name: 'Alpine Meadows',
  //     location: 'Zurich, Switzerland',
  //     imageUrl: '/assets/images/alps.png',
  //     rating: 4.5,
  //     category: 'Mountain',
  //   },
  //   {
  //     id: 6,
  //     name: 'Tropical Beach Resort',
  //     location: 'Phuket, Thailand',
  //     imageUrl: '/assets/images/travel.png',
  //     rating: 4.4,
  //     category: 'Beach',
  //   },
  //   {
  //     id: 7,
  //     name: 'Central Park',
  //     location: 'New York, USA',
  //     imageUrl: '/assets/images/forest.png',
  //     rating: 4.6,
  //     category: 'Park',
  //   },
  //   {
  //     id: 8,
  //     name: 'Bali Beaches',
  //     location: 'Bali, Indonesia',
  //     imageUrl: '/assets/images/travel.png',
  //     rating: 4.9,
  //     category: 'Beach',
  //   },
  // ];

  constructor(private http: HttpClient) {}

  // /**
  //  * Get all destinations
  //  * In a real app, this would fetch from an API
  //  */
  // getDestinations(): Observable<Destination[]> {
  //   // For demo purposes, we're using mock data
  //   // In a real app, replace this with:
  //   // return this.http.get<Destination[]>(`${this.coreService.apiUrl}/destinations`);

  //   return of(this.mockDestinations).pipe(
  //     catchError((error) => {
  //       console.error('Error fetching destinations', error);
  //       return of([]);
  //     })
  //   );
  // }

  // /**
  //  * Get destinations by category
  //  */
  // getDestinationsByCategory(category: string): Observable<Destination[]> {
  //   if (category === 'All') {
  //     return this.getDestinations();
  //   }

  //   return this.getDestinations().pipe(
  //     map((destinations) =>
  //       destinations.filter((dest) => dest.category === category)
  //     )
  //   );
  // }

  // /**
  //  * Get top rated destinations
  //  */ getTopRatedDestinations(limit: number = 4): Observable<Destination[]> {
  //   return this.getDestinations().pipe(
  //     map((destinations) => {
  //       const sorted = [...destinations].sort((a, b) => b.rating - a.rating);
  //       return sorted.slice(0, limit);
  //     })
  //   );
  // }
}
