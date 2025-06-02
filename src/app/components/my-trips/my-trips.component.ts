import {
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { NewTripDto } from '../../models/new-trip.model';
import { NewTripService } from '../../services/new-trip.service';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { TripService } from '../../services/trip.service';

@Component({
  selector: 'app-my-trips',
  standalone: false,
  templateUrl: './my-trips.component.html',
  styleUrl: './my-trips.component.scss',
})
export class MyTripsComponent implements OnInit {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  isExpanded: boolean = false;
  trips: NewTripDto[] = [];
  selectedTripIndex: number = 0;
  defaultImageUrl: string = '/assets/images/travel.png';
  isLoading: boolean = true;
  constructor(
    private readonly newTripService: NewTripService,
    private readonly tripService: TripService,
    private readonly router: Router,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {
    // Initialize with default trips until real data loads
    this.initializeDefaultTrips();

    // Initialize the trip service with the default image
    this.tripService.setSelectedTripImage(this.defaultImageUrl);
  }

  initializeDefaultTrips(): void {
    const defaultTrip = new NewTripDto();
    defaultTrip.tripName = 'Loading trips...';
    defaultTrip.description = 'Please wait while we load your trips';
    defaultTrip.imageUrl = this.defaultImageUrl;
    this.trips = [defaultTrip];
  }
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // First check if we're in a browser environment before accessing localStorage
      const userId = localStorage.getItem('userId');
      if (userId) {
        this.isLoading = true;
        this.newTripService.getOneById(userId).subscribe({
          next: (response: { data: NewTripDto[] }) => {
            this.trips = response.data;
            console.log('Trips loaded:', this.trips);
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Failed to load trips', error);
            this.isLoading = false;
          },
        });
      } else {
        // No userId in localStorage
        this.isLoading = false;
      }
    } else {
      // Not in browser environment, can't access localStorage
      this.isLoading = false;
    }
  }

  scroll(amount: number): void {
    this.scrollContainer.nativeElement.scrollBy({
      left: amount,
      behavior: 'smooth',
    });
  }

  onExpanded(event: any): void {
    this.isExpanded = event;
  }

  onHover(event: MouseEvent): void {
    const card = event.currentTarget as HTMLElement;
    card.style.transform = 'scale(1.05)';
    card.style.zIndex = '10';
    card.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
  }

  onLeave(event: MouseEvent): void {
    const card = event.currentTarget as HTMLElement;
    card.style.transform = 'scale(1)';
    card.style.zIndex = '1';
    card.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
  }

  // Format date for display
  formatDate(date: Date): string {
    if (!date) return 'N/A';

    // Convert string to Date object if needed
    const dateObj = date instanceof Date ? date : new Date(date);

    // Format the date as May 26, 2025
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  // Get date range string for display
  getDateRangeString(trip: NewTripDto): string {
    if (!trip || !trip.startDate || !trip.endDate) return '';

    return `${this.formatDate(trip.startDate)} - ${this.formatDate(
      trip.endDate
    )}`;
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollLeft += event.deltaY;
      event.preventDefault();
    }
  }
  selectTrip(index: number): void {
    if (index >= 0 && index < this.trips.length) {
      this.selectedTripIndex = index;

      // Safety check: if there's a trip at this index and it has an imageUrl
      const selectedTrip = this.trips[index];
      if (selectedTrip) {
        // Update the selected trip image in the service
        this.tripService.setSelectedTripImage(
          selectedTrip.imageUrl || this.defaultImageUrl
        );
      }
    }
  }
  viewTripDetails(index: number): void {
    // Check if the trip exists at this index
    if (index < 0 || index >= this.trips.length) {
      console.error('Invalid trip index:', index);
      return;
    }

    const selectedTrip = this.trips[index];

    // Check if the trip exists before using it
    if (selectedTrip) {
      // Set the image URL, with a fallback to the default if none is available
      this.tripService.setSelectedTripImage(
        selectedTrip.imageUrl || this.defaultImageUrl
      );

      const tripId = selectedTrip.id; // Use the exact trip ID from the fetched data

      // Pass data via router state to avoid localStorage dependency
      this.router.navigate(['/trip', tripId], {
        state: {
          tripName: selectedTrip.tripName,
          tripStartDate: selectedTrip.startDate?.toString(),
          tripEndDate: selectedTrip.endDate?.toString(),
          tripImageUrl: selectedTrip.imageUrl || this.defaultImageUrl,
        },
      });
    } else {
      console.error('Selected trip is undefined at index:', index);
    }
  }
}
