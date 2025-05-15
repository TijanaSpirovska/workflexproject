import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

@Injectable({
  providedIn: 'root',
})
export class GeocodingService {
  // This is a simple geocoding service for demonstration purposes
  // In a production app, you would use a proper geocoding API
  // A small set of predefined cities with coordinates for demo purposes
  private cityCoordinates: Record<string, GeoCoordinates> = {
    skopje: { lat: 41.9981, lng: 21.4254 },
    paris: { lat: 48.8566, lng: 2.3522 },
    london: { lat: 51.5074, lng: -0.1278 },
    rome: { lat: 41.9028, lng: 12.4964 },
    barcelona: { lat: 41.3851, lng: 2.1734 },
    berlin: { lat: 52.52, lng: 13.405 },
    vienna: { lat: 48.2082, lng: 16.3738 },
    wayanad: { lat: 11.6854, lng: 76.132 }, // Kerala, India
    'new york': { lat: 40.7128, lng: -74.006 },
    tokyo: { lat: 35.6762, lng: 139.6503 },
    sydney: { lat: -33.8688, lng: 151.2093 },
    cairo: { lat: 30.0444, lng: 31.2357 },
    bangkok: { lat: 13.7563, lng: 100.5018 },
    // Adding more popular tourist destinations
    'san francisco': { lat: 37.7749, lng: -122.4194 },
    'los angeles': { lat: 34.0522, lng: -118.2437 },
    'las vegas': { lat: 36.1699, lng: -115.1398 },
    miami: { lat: 25.7617, lng: -80.1918 },
    chicago: { lat: 41.8781, lng: -87.6298 },
    amsterdam: { lat: 52.3676, lng: 4.9041 },
    dubai: { lat: 25.2048, lng: 55.2708 },
    singapore: { lat: 1.3521, lng: 103.8198 },
    bali: { lat: -8.3405, lng: 115.092 },
    'hong kong': { lat: 22.3193, lng: 114.1694 },
    mumbai: { lat: 19.076, lng: 72.8777 },
    delhi: { lat: 28.6139, lng: 77.209 },
    goa: { lat: 15.2993, lng: 74.124 },
    jaipur: { lat: 26.9124, lng: 75.7873 },
    agra: { lat: 27.1767, lng: 78.0081 },
    chennai: { lat: 13.0827, lng: 80.2707 },
    kolkata: { lat: 22.5726, lng: 88.3639 },
    bangalore: { lat: 12.9716, lng: 77.5946 },
    hyderabad: { lat: 17.385, lng: 78.4867 },
  };

  constructor(private http: HttpClient) {}
  /**
   * Get coordinates for a given city name
   * @param cityName The name of the city
   * @returns Observable with the coordinates
   */
  getCoordinates(cityName: string): Observable<GeoCoordinates> {
    console.log('Getting coordinates for:', cityName);

    if (!cityName) {
      console.log('No city name provided, returning default coordinates');
      // Return a default location if no city name is provided
      return of({ lat: 20.5937, lng: 78.9629 }); // Center of India
    }

    // Convert to lowercase for case-insensitive matching and remove extra spaces
    const normalizedCity = cityName.toLowerCase().trim();
    console.log('Normalized city name:', normalizedCity);

    // Check for exact match
    if (this.cityCoordinates[normalizedCity]) {
      console.log(
        'Found exact match for:',
        normalizedCity,
        this.cityCoordinates[normalizedCity]
      );
      return of(this.cityCoordinates[normalizedCity]).pipe(
        tap((coords) => console.log('Returning coordinates:', coords))
      );
    }

    // Check for partial matches
    for (const city in this.cityCoordinates) {
      if (city.includes(normalizedCity) || normalizedCity.includes(city)) {
        console.log('Found partial match:', city, 'for input:', normalizedCity);
        return of(this.cityCoordinates[city]).pipe(
          tap((coords) =>
            console.log('Returning coordinates for partial match:', coords)
          )
        );
      }
    }

    // If no match is found, return default coordinates
    console.log(
      'No match found for:',
      normalizedCity,
      'returning default coordinates'
    );
    return of({ lat: 20.5937, lng: 78.9629 }); // Default to center of India
  }
}
