import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Destination } from '../../models/destination.model';
import { DestinationService } from '../../services/destination.service';
import { ToastrService } from 'ngx-toastr';
import { NewTripService } from '../../services/new-trip.service';
import { RecommendedTripService } from '../../services/new-trip.service copy';

@Component({
  selector: 'app-recommended-locations',
  standalone: false,
  templateUrl: './recommended-locations.component.html',
  styleUrl: './recommended-locations.component.scss',
})
export class RecommendedLocationsComponent implements OnInit {
  @Input() destinations: Destination[] = [];

  filteredDestinations: Destination[] = [];
  selectedCategory: string = 'All';
  filterForm: FormGroup;
  isLoading = false;
  isExpanded: boolean = false;

  // Categories for filter buttons
  categories: string[] = [
    'All',
    'Recommended',
    'Beach',
    'Park',
    'Nature',
    'Mountain',
  ];

  constructor(
    private fb: FormBuilder,
    private destinationService: DestinationService,
    private recommendedTripService: RecommendedTripService,
    private toastr: ToastrService
  ) {
    this.filterForm = this.fb.group({
      location: [''],
      budget: [''],
      date: [''],
    });
  }
  onExpanded(event: any): void {
    this.isExpanded = event;
  }

  ngOnInit(): void {
    // If destinations were provided via @Input, use those
    if (this.destinations && this.destinations.length > 0) {
      this.filteredDestinations = [...this.destinations];
    } else {
      // Otherwise fetch from service
      this.loadDestinations();
    }
  }

  /**
   * Load destinations from service
   */
  loadDestinations(): void {
    this.isLoading = true;

    // this.recommendedTripService.getAll().subscribe({
    //   next: (data) => {
    //     console.log('Destinations:', data);
    //     this.destinations = data;
    //     this.filteredDestinations = [...this.destinations];
    //     this.isLoading = false;
    //   },
    //   error: (error) => {
    //     this.toastr.error('Failed to load destinations', 'Error');
    //     this.isLoading = false;
    //   },
    // });

    // this.destinationService
    //   .getDestinations()
    //   .pipe(finalize(() => (this.isLoading = false)))
    //   .subscribe({
    //     next: (data) => {
    //       this.destinations = data;
    //       this.filteredDestinations = [...this.destinations];
    //     },
    //     error: (error) => {
    //       this.toastr.error('Failed to load destinations', 'Error');
    //     },
    //   });
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;

    if (category === 'All') {
      this.filteredDestinations = [...this.destinations];
    } else if (category === 'Recommended') {
      // For recommended, we'll show top-rated destinations
      const sortedDestinations = [...this.destinations];
      sortedDestinations.sort((a, b) => b.rating - a.rating);
      this.filteredDestinations = sortedDestinations.slice(0, 6);
    } else {
      this.filteredDestinations = this.destinations.filter(
        (dest) => dest.category === category
      );
    }
  }

  search(): void {
    // In a real app, this would send the form values to a service
    // For now, we're just filtering the existing data
    const formValues = this.filterForm.value;

    // Apply filters if any values are set
    let filtered = [...this.destinations];

    // if (formValues.location) {
    //   filtered = filtered.filter((dest) =>
    //     dest.location.toLowerCase().includes(formValues.location.toLowerCase())
    //   );
    // }

    // Budget filtering - this is a simplified example
    if (formValues.budget) {
      // In a real application, you would have actual budget values to filter by
      if (formValues.budget === '0-500') {
        // Show only budget-friendly options (for demo purposes)
        filtered = filtered.filter((dest) => dest.rating < 4.6);
      } else if (formValues.budget === '2000+') {
        // Show luxury options (for demo purposes)
        filtered = filtered.filter((dest) => dest.rating >= 4.8);
      }
    }

    // Date filtering
    if (formValues.date) {
      // In a real application, you would filter by available dates
      // For demo purposes, we'll just show that a filter was applied
      this.toastr.info(
        `Filtered by date: ${formValues.date}`,
        'Filter Applied'
      );
    }

    // Apply category filter if it's not 'All'
    if (this.selectedCategory !== 'All') {
      if (this.selectedCategory === 'Recommended') {
        // Sort by rating and take top 6
        const sortedFiltered = [...filtered].sort(
          (a, b) => b.rating - a.rating
        );
        filtered = sortedFiltered.slice(0, 6);
      } else {
        filtered = filtered.filter(
          (dest) => dest.category === this.selectedCategory
        );
      }
    }

    this.filteredDestinations = filtered;
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.selectedCategory = 'All';
    this.filteredDestinations = [...this.destinations];
  }
}
