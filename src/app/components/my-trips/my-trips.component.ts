import { Component, ElementRef, HostListener, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
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
  trips: NewTripDto[] = [];  constructor(
    private readonly newTripService: NewTripService,
    private readonly tripService: TripService,
    private readonly router: Router,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {}
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.newTripService.getAll().subscribe({
        next: (response: { data: NewTripDto[] }) => {
          console.log('Trips response:', response);
          this.trips = response.data;
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

  selectedTripIndex = 0;
  selectTrip(index: number): void {
    this.selectedTripIndex = index;
  }
    viewTripDetails(index: number): void {
    // Set the selected trip image before navigating
    const selectedTrip = this.trips[index];
    this.tripService.setSelectedTripImage(selectedTrip.imageUrl);
    
    // For demo purposes we'll use a hardcoded trip ID
    // In a real application, you would use the actual trip ID from the API
    const demoTripIds = ['1', '2', '3'];
    const tripId = demoTripIds[index % demoTripIds.length];
    this.router.navigate(['/trip', tripId]);
  }
}