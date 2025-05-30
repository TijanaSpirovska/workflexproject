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
import { Location } from '@angular/common';
import moment from 'moment';
import { FlightService } from '../../services/flight.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';

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

  flightForm!: FormGroup;

  isModalOpen: boolean = false; // Manage modal visibility

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tripService: TripService,
    private location: Location,
    private flightService: FlightService,
    private  readonly fb: FormBuilder,
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

    this.flightForm = this.fb.group({
      from: ['', [Validators.required]],
      to: ['', [Validators.required]],
      departureTime: ['', [Validators.required]],
      duration: ['', [Validators.required]],
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
    let userId: string | null = null;

    if (isPlatformBrowser(this.platformId)) {
      userId = localStorage.getItem('userId');
    }

    if (!userId) {
      this.error = 'User ID not found';
      this.loading = false;
      return;
    }

    this.tripService.getOneById(`${userId}/${tripId}`).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.populateTripDetails(response.data);
        } else {
          console.error('Failed to load trip details:', response.error);
          this.error = 'Failed to load trip details';
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

  private populateTripDetails(tripData: any): void {
    this.trip = {
      id: tripData.id,
      destination: tripData.destination,
      country: tripData.country,
      startDate: tripData.startDate,
      endDate: tripData.endDate ?? null,
      imageUrl: tripData.imageUrl ?? '/assets/images/travel.png',
      flight: {
        from: tripData.flight?.fromLocation ?? '',
        to: tripData.flight?.toLocation ?? '',
        departureTime: tripData.flight?.departureTime ?? '',
        duration: tripData.flight?.duration ?? '',
      },
      days: tripData.days.map((day: any) => ({
        date: day.date,
        label: day.label,
        activities: day.activities ?? [],
      })),
    };
    this.calculateProgressAndDays();
    this.groupActivitiesByDate();
  }

  private calculateProgressAndDays(): void {
    if (this.trip?.startDate && this.trip?.endDate) {
      const start = moment(this.trip.startDate);
      const end = moment(this.trip.endDate);

      if (start.isValid() && end.isValid() && end.isAfter(start)) {
        this.totalDays = end.diff(start, 'days') + 1;

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
      }
    }
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
    this.router.navigate(['/my-trips']);
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

  openFlightModal(): void {
    if (this.trip?.flight.from && this.trip?.flight.to) {
      this.flightForm.patchValue({
        from: this.trip.flight.from,
        to: this.trip.flight.to,
        departureTime: this.formatDateTimeForInput(this.trip.flight.departureTime),
        duration: this.trip.flight.duration,
      });
    } else {
      this.flightForm.reset();
    }

    this.isModalOpen = true; // Open the modal
    console.log('Flight modal opened with trip data:', this.isModalOpen);
  }

  private formatDateTimeForInput(dateTime: string): string {
    const date = moment(dateTime);
    return date.isValid() ? date.format('YYYY-MM-DDTHH:mm') : '';
  }

  closeModal(): void {
    this.isModalOpen = false; // Close the modal
  }

  saveFlight(): void {
    if (this.flightForm.invalid) {
      alert('Please fill in all required fields.');
      return;
    }

    const flightData = this.flightForm.value;

    if (this.trip?.flight.from && this.trip?.flight.to) {
      // Edit existing flight
      this.flightService.updateById(this.trip.id, flightData).subscribe({
        next: (response) => {
          console.log('Flight updated successfully:', response);
          alert('Flight updated successfully!');
        },
        error: (err) => {
          console.error('Error updating flight:', err);
          alert('Failed to update flight.');
        },
      });
    } else {
      // Add new flight
      this.flightService.create(flightData, 'json').subscribe({
        next: (response) => {
          console.log('Flight added successfully:', response);
          alert('Flight added successfully!');
        },
        error: (err) => {
          console.error('Error adding flight:', err);
          alert('Failed to add flight.');
        },
      });
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

  private groupActivitiesByDate(): void {
    if (!this.trip?.days) return;

    const groupedDays: { date: string; label: string; activities: string[] }[] =
      [];

    this.trip.days.forEach((day) => {
      const existingDay = groupedDays.find((d) => d.date === day.date);
      if (existingDay) {
        existingDay.activities.push(day.label);
      } else {
        groupedDays.push({
          date: day.date,
          label: day.label,
          activities: [day.label],
        });
      }
    });

    // Sort groupedDays by date in ascending order
    groupedDays.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    this.trip.days = groupedDays;
  }
}
