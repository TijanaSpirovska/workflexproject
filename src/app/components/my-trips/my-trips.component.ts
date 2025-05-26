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
      this.isLoading = true;
      this.newTripService.getAll().subscribe({
        next: (response: { data: NewTripDto[] }) => {
          this.trips = response.data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load trips', error);
        },
      });
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

      // For demo purposes we'll use a hardcoded trip ID
      // In a real application, you would use the actual trip ID from the API
      const demoTripIds = ['1', '2', '3'];
      const tripId = demoTripIds[index % demoTripIds.length];
      this.router.navigate(['/trip', tripId]);
    } else {
      console.error('Selected trip is undefined at index:', index);
    }
  }
}
