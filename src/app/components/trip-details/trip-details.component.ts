import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Trip } from '../../models/trip-details.model';
import { TripService } from '../../services/trip.service';
import { Location, isPlatformBrowser } from '@angular/common';
import moment from 'moment';

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

  totalDays: number = 0;
  progressPercentage: number = 0;

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
      this.tripName = state.tripName ?? null;
      this.tripStartDate = state.tripStartDate ?? null;
      this.tripEndDate = state.tripEndDate ?? null;
      this.tripImageUrl = state.tripImageUrl ?? null;

      // Validate and calculate total days
      if (this.tripStartDate && this.tripEndDate) {
        const start = moment(this.tripStartDate);
        const end = moment(this.tripEndDate);

        if (start.isValid() && end.isValid() && end.isAfter(start)) {
          this.totalDays = end.diff(start, 'days') + 1;

          // Calculate progress percentage
          const today = moment();
          if (today.isBefore(start)) {
            this.progressPercentage = 0;
          } else if (today.isAfter(end)) {
            this.progressPercentage = 100;
          } else {
            const elapsed = today.diff(start, 'days');
            this.progressPercentage = Math.floor(
              (elapsed / this.totalDays) * 100
            );
          }
        } else {
          console.error(
            'Invalid date range:',
            this.tripStartDate,
            this.tripEndDate
          );
        }
      }
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
    this.route.paramMap.subscribe((params) => {
      const tripId = params.get('id');
      console.log(tripId);
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
    if (this.tripImageUrl) {
      this.tripBackgroundImage = this.tripImageUrl;
    }
  }


  // Calculate duration based on input dates
  calculateDurationFromDates(): number {
    if (this.tripStartDate && this.tripEndDate) {
      const start = moment(this.tripStartDate);
      const end = moment(this.tripEndDate);
      const diffTime = end.diff(start, 'milliseconds');
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1; // Ensure at least 1 day
    }
    return 1; // Default to 1 day
  }

  loadTripDetails(tripId: string): void {
    this.loading = true;
    const userId = localStorage.getItem('userId');
    this.tripService.getOneById(`${userId}/${tripId}`).subscribe({
      next: (response) => {
        console.log('Trip details loaded:', response);
      },
    });
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
          this.trip.startDate = moment(this.tripStartDate).toISOString();
        } else if (isPlatformBrowser(this.platformId)) {
          const storedStartDate = localStorage.getItem('selectedTripStartDate');
          if (storedStartDate) {
            this.trip.startDate = moment(storedStartDate).toISOString();
          }
        }

        // Update image from inputs, service or trip data
        if (this.tripImageUrl) {
          this.tripBackgroundImage = this.tripImageUrl;
        } else if (
          this.tripBackgroundImage === '/assets/images/travel.png' &&
          trip.imageUrl
        ) {
          // Update both the local property and the stored value in the service
          this.tripService.setSelectedTripImage(trip.imageUrl);
          this.tripBackgroundImage = trip.imageUrl;
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

    const date = moment(isoDate);
    return date.format('ddd, MMM D, h:mm A');
  }

  getDayAbbreviation(isoDate: string): string {
    if (!isoDate) return '';

    const date = moment(isoDate);
    return date.format('ddd');
  }

  getDayNumber(isoDate: string): number {
    if (!isoDate) return 0;

    const date = moment(isoDate);
    return date.date();
  }

  /**
   * Check if the given date is today
   */
  isToday(isoDate: string): boolean {
    const today = moment().startOf('day');
    const dayDate = moment(isoDate).startOf('day');
    return today.isSame(dayDate, 'day');
  }

  goBack(): void {
    this.router.navigate(['/my-trips'])
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

    const startDate = moment(this.trip.startDate);
    const endDate = moment(this.getEndDate());
    const today = moment(); // This uses the real current date

    // If trip hasn't started yet
    if (today.isBefore(startDate)) return 0;

    // If trip has ended
    if (today.isAfter(endDate)) return 100;

    // Calculate progress
    const totalDuration = endDate.diff(startDate, 'milliseconds');
    const elapsed = today.diff(startDate, 'milliseconds');
    return Math.floor((elapsed / totalDuration) * 100);
  }

  getEndDate(): moment.Moment {
    if (!this.trip?.startDate) return moment();

    const startDate = moment(this.trip.startDate);
    return moment(startDate)
      .add(this.calculateDurationFromDates(), 'days')
      .subtract(1, 'days');
  }

  getDayLabel(startDate: string, dayIndex: number): string {
    const date = moment(startDate).add(dayIndex, 'days');
    return `Day ${dayIndex + 1} - ${date.format('MMM D, YYYY')}`;
  }

  getDayDate(startDate: string, dayIndex: number): string {
    return moment(startDate).add(dayIndex, 'days').toISOString();
  }

  getDayLabelAndDate(startDate: string, dayIndex: number): string {
    const date = moment(startDate).add(dayIndex, 'days');
    return `Day ${dayIndex + 1} - ${date.format('MMM D, YYYY')}`;
  }

}
