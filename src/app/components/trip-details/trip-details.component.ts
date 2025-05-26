import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Trip } from '../../models/trip-details.model';
import { TripService } from '../../services/trip.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-trip-details',
  standalone: false,
  templateUrl: './trip-details.component.html',
  styleUrl: './trip-details.component.scss',
})
export class TripDetailsComponent implements OnInit {
  trip: Trip | null = null;
  loading: boolean = true;
  error: string | null = null;
  tripBackgroundImage: string = '';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tripService: TripService,
    private location: Location
  ) {
    // Subscribe to the selected trip image from the service
    // This will already have the localStorage value if available
    this.tripService.selectedTripImage$.subscribe((imageUrl) => {
      // Only update if we received a valid URL
      if (imageUrl) {
        this.tripBackgroundImage = imageUrl;
      }
    });
  }
  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const tripId = params.get('id');
      if (tripId) {
        this.loadTripDetails(tripId);
      } else {
        // If no ID in route, check localStorage
        const storedTripId = this.tripService.getStoredTripId();
        if (storedTripId) {
          this.loadTripDetails(storedTripId);
        } else {
          this.error = 'Trip ID not found';
          this.loading = false;
        }
      }
    });
  }
  loadTripDetails(tripId: string): void {
    this.loading = true;
    this.tripService.getTripById(tripId).subscribe({
      next: (trip) => {
        this.trip = trip;

        // Check for stored trip name and dates from localStorage
        const storedTripName = localStorage.getItem('selectedTripName');
        const storedStartDate = localStorage.getItem('selectedTripStartDate');
        const storedEndDate = localStorage.getItem('selectedTripEndDate');

        // If we have stored trip data, use it
        if (storedTripName) {
          this.trip.destination = storedTripName;
        }

        if (storedStartDate) {
          this.trip.startDate = new Date(storedStartDate).toISOString();
        }

        // Only use the trip's image if we don't already have a stored image
        if (this.tripBackgroundImage === '/assets/images/travel.png') {
          // Make sure there's a valid image URL
          if (trip && trip.imageUrl) {
            // Update both the local property and the stored value in the service
            this.tripService.setSelectedTripImage(trip.imageUrl);
            this.tripBackgroundImage = trip.imageUrl;
          }
        }
        // Calculate duration days from stored dates if available
        this.calculateDuration();
        // Otherwise use the image passed from my-trips (which is already set via subscription)
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading trip details:', err);
        this.error = 'Failed to load trip details';
        this.loading = false;
      },
    });
  }
  formatDate(isoDate: string): string {
    if (!isoDate) return 'N/A';
    return this.tripService.formatDate(isoDate);
  }

  formatFlightDate(isoDate: string): string {
    if (!isoDate) return 'N/A';

    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  }

  getDayAbbreviation(isoDate: string): string {
    if (!isoDate) return '';

    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  getDayNumber(isoDate: string): number {
    if (!isoDate) return 0;

    const date = new Date(isoDate);
    return date.getDate();
  }
  /**
   * Check if the given date is today
   */
  isToday(isoDate: string): boolean {
    if (!isoDate) return false;

    const today = new Date();
    const dayDate = new Date(isoDate);

    return (
      today.getFullYear() === dayDate.getFullYear() &&
      today.getMonth() === dayDate.getMonth() &&
      today.getDate() === dayDate.getDate()
    );
  }

  goBack(): void {
    this.location.back();
  }

  editTrip(): void {
    // In a real app, navigate to edit form
    alert('Edit functionality would open here');
  }
  getTripProgress(): number {
    if (!this.trip?.startDate) return 0;

    const startDate = new Date(this.trip.startDate);
    const endDate = this.getEndDate();
    const today = new Date(); // This uses the real current date

    // If trip hasn't started yet
    if (today < startDate) return 0;

    // If trip has ended
    if (today > endDate) return 100;

    // Calculate progress
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = today.getTime() - startDate.getTime();
    return Math.floor((elapsed / totalDuration) * 100);
  }
  getEndDate(): Date {
    if (!this.trip?.startDate) return new Date();

    const startDate = new Date(this.trip.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (this.trip.durationDays || 0) - 1);
    return endDate;
  }

  // Calculate duration days from stored dates if available
  calculateDuration(): void {
    const storedStartDate = localStorage.getItem('selectedTripStartDate');
    const storedEndDate = localStorage.getItem('selectedTripEndDate');

    if (storedStartDate && storedEndDate && this.trip) {
      const start = new Date(storedStartDate);
      const end = new Date(storedEndDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      this.trip.durationDays = diffDays || 1; // Ensure at least 1 day
    }
  }
}
