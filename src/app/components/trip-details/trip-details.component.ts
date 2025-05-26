import { Component, OnInit, Input, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Trip } from '../../models/trip-details.model';
import { TripService } from '../../services/trip.service';
import { Location, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-trip-details',
  standalone: false,
  templateUrl: './trip-details.component.html',
  styleUrl: './trip-details.component.scss',
})
export class TripDetailsComponent implements OnInit {
  // Input properties to receive data from parent components
  @Input() tripName: string | null = null;
  @Input() tripStartDate: string | null = null;
  @Input() tripEndDate: string | null = null;
  @Input() tripImageUrl: string | null = null;
  
  // Output events for communication with parent components
  @Output() editTripEvent = new EventEmitter<Trip>();
  @Output() goBackEvent = new EventEmitter<void>();
  
  trip: Trip | null = null;
  loading: boolean = true;
  error: string | null = null;
  tripBackgroundImage: string = '';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tripService: TripService,
    private location: Location,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {
    // Get data from router state if available
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as {
      tripName?: string;
      tripStartDate?: string;
      tripEndDate?: string;
      tripImageUrl?: string;
    };
    
    if (state) {
      this.tripName = state.tripName || null;
      this.tripStartDate = state.tripStartDate || null;
      this.tripEndDate = state.tripEndDate || null;
      this.tripImageUrl = state.tripImageUrl || null;
    }
    
    // Subscribe to the selected trip image from the service
    // This will be used as fallback if not provided via @Input or router state
    this.tripService.selectedTripImage$.subscribe((imageUrl) => {
      // Only update if we received a valid URL and don't already have one from inputs
      if (imageUrl && !this.tripImageUrl) {
        this.tripBackgroundImage = imageUrl;
      }
    });
  }
  
  ngOnInit(): void {
    // Check if we have input properties first (highest priority)
    if (this.tripName && this.tripStartDate && this.tripEndDate) {
      // If we have all input properties, use them directly
      if (!this.trip) {
        this.trip = this.createTripFromInputs();
      }
      this.loading = false;
    } else {
      // If not, fall back to route params
      this.route.paramMap.subscribe((params) => {
        const tripId = params.get('id');
        if (tripId) {
          this.loadTripDetails(tripId);
        } else {
          // If no ID in route, check service for stored trip ID
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
    
    // Set background image if provided
    if (this.tripImageUrl) {
      this.tripBackgroundImage = this.tripImageUrl;
    }
  }
  
  // Create a trip object from Input properties
  createTripFromInputs(): Trip {
    // Create a basic trip object using the input properties
    const trip: Trip = {
      id: Math.random().toString(36).substring(2, 9), // Generate a random ID
      destination: this.tripName || 'Unknown Destination',
      country: '', // Default country
      startDate: this.tripStartDate || new Date().toISOString(),
      durationDays: this.calculateDurationFromDates(),
      imageUrl: this.tripImageUrl || '/assets/images/travel.png',
      flight: {
        from: 'Home',
        to: this.tripName || 'Destination',
        departureTime: this.tripStartDate || new Date().toISOString(),
        duration: '3h 45m'
      },
      days: []
    };
    
    // Generate trip days
    if (this.tripStartDate) {
      const startDate = new Date(this.tripStartDate);
      this.generateTripDays(startDate, trip.durationDays, trip);
    }
    
    return trip;
  }
  
  // Calculate duration based on input dates
  calculateDurationFromDates(): number {
    if (this.tripStartDate && this.tripEndDate) {
      const start = new Date(this.tripStartDate);
      const end = new Date(this.tripEndDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1; // Ensure at least 1 day
    }
    return 1; // Default to 1 day
  }
  
  // Generate day-by-day trip plan based on input dates
  generateTripDays(startDate: Date, durationDays: number, trip: Trip): void {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < durationDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const isCurrentDay = 
        today.getFullYear() === currentDate.getFullYear() &&
        today.getMonth() === currentDate.getMonth() &&
        today.getDate() === currentDate.getDate();
      
      // Create some sample activities based on the day number
      let activities: string[] = [];
      
      if (i === 0) {
        activities = ['Arrival', 'Hotel check-in', 'Welcome dinner'];
      } else if (i === durationDays - 1) {
        activities = ['Breakfast', 'Last-minute shopping', 'Departure'];
      } else {
        // Generate some random activities for middle days
        const possibleActivities = [
          'City tour', 'Museum visit', 'Beach day', 'Hiking trip',
          'Local cuisine tasting', 'Shopping tour', 'Boat excursion',
          'Relaxing at hotel', 'Spa day', 'Photography tour'
        ];
        
        // Select 2-3 random activities
        const numActivities = Math.floor(Math.random() * 2) + 2;
        for (let j = 0; j < numActivities; j++) {
          const activityIndex = Math.floor(Math.random() * possibleActivities.length);
          activities.push(possibleActivities[activityIndex]);
          possibleActivities.splice(activityIndex, 1); // Remove to avoid duplicates
        }
      }
      
      days.push({
        date: currentDate.toISOString(),
        label: `Day ${i + 1}`,
        isToday: isCurrentDay,
        activities: activities
      });
    }
    
    trip.days = days;
  }
  
  loadTripDetails(tripId: string): void {
    this.loading = true;
    this.tripService.getTripById(tripId).subscribe({
      next: (trip) => {
        this.trip = trip;

        // Use input properties if available, otherwise fallback to localStorage
        if (this.tripName) {
          this.trip.destination = this.tripName;
        } else if (isPlatformBrowser(this.platformId)) {
          const storedTripName = localStorage.getItem('selectedTripName');
          if (storedTripName) {
            this.trip.destination = storedTripName;
          }
        }

        if (this.tripStartDate) {
          this.trip.startDate = new Date(this.tripStartDate).toISOString();
        } else if (isPlatformBrowser(this.platformId)) {
          const storedStartDate = localStorage.getItem('selectedTripStartDate');
          if (storedStartDate) {
            this.trip.startDate = new Date(storedStartDate).toISOString();
          }
        }

        // Update image from inputs, service or trip data
        if (this.tripImageUrl) {
          this.tripBackgroundImage = this.tripImageUrl;
        } else if (this.tripBackgroundImage === '/assets/images/travel.png' && trip.imageUrl) {
          // Update both the local property and the stored value in the service
          this.tripService.setSelectedTripImage(trip.imageUrl);
          this.tripBackgroundImage = trip.imageUrl;
        }
        
        // Calculate duration days
        if (this.tripStartDate && this.tripEndDate) {
          this.trip.durationDays = this.calculateDurationFromDates();
        } else if (isPlatformBrowser(this.platformId)) {
          this.calculateDuration();
        }
        
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
    // Emit an event first
    this.goBackEvent.emit();
    // Then fall back to location.back() if no parent is listening
    this.location.back();
  }

  editTrip(): void {
    // Emit the trip for editing
    if (this.trip) {
      this.editTripEvent.emit(this.trip);
    } else {
      // Fall back to alert if no parent is listening
      alert('Edit functionality would open here');
    }
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
    if (!isPlatformBrowser(this.platformId) || !this.trip) return;
    
    const storedStartDate = localStorage.getItem('selectedTripStartDate');
    const storedEndDate = localStorage.getItem('selectedTripEndDate');

    if (storedStartDate && storedEndDate) {
      const start = new Date(storedStartDate);
      const end = new Date(storedEndDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      this.trip.durationDays = diffDays || 1; // Ensure at least 1 day
    }
  }
}
