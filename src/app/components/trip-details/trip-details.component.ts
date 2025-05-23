import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Trip } from '../../models/trip-details.model';
import { TripService } from '../../services/trip.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-trip-details',
  standalone: false,
  templateUrl: './trip-details.component.html',
  styleUrl: './trip-details.component.scss'
})
export class TripDetailsComponent implements OnInit {
  trip: Trip | null = null;
  loading: boolean = true;
  error: string | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tripService: TripService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const tripId = params.get('id');
      if (tripId) {
        this.loadTripDetails(tripId);
      } else {
        this.error = 'Trip ID not found';
        this.loading = false;
      }
    });
  }

  loadTripDetails(tripId: string): void {
    this.loading = true;
    this.tripService.getTripById(tripId).subscribe({
      next: (trip) => {
        this.trip = trip;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading trip details:', err);
        this.error = 'Failed to load trip details';
        this.loading = false;
      }
    });
  }

  formatDate(isoDate: string): string {
    return this.tripService.formatDate(isoDate);
  }
  
  formatFlightDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  }
  
  getDayAbbreviation(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  
  getDayNumber(isoDate: string): number {
    const date = new Date(isoDate);
    return date.getDate();
  }

  goBack(): void {
    this.location.back();
  }

  editTrip(): void {
    // In a real app, navigate to edit form
    alert('Edit functionality would open here');
  }
  
  getTripProgress(): number {
    if (!this.trip) return 0;
    
    const startDate = new Date(this.trip.startDate);
    const endDate = this.getEndDate();
    const today = new Date();
    
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
    if (!this.trip) return new Date();
    
    const startDate = new Date(this.trip.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + this.trip.durationDays - 1);
    return endDate;
  }
}
