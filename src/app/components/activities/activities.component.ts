import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  OnDestroy,
  AfterViewInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivityService } from '../../services/activity.service';
import { ToastrService } from 'ngx-toastr';
import { ActivityDto } from '../../models/activity.model';
import { isPlatformBrowser } from '@angular/common';
import { GeocodingService } from '../../services/geocoding.service';

// Do not directly import Leaflet here
// We'll import it dynamically only in browser environment

@Component({
  selector: 'app-activities',
  standalone: false,
  templateUrl: './activities.component.html',
  styleUrl: './activities.component.scss',
})
export class ActivitiesComponent implements OnInit, AfterViewInit, OnDestroy {
  private map: any;
  private L: any;
  private activityMarkers: any[] = [];
  formGroup!: FormGroup;
  imageFile: File | null = null;
  imagePreviewUrl: string | null = null;
  isNewActivity: boolean = false;
  isExpanded: boolean = false;
  isFormGroupValid: boolean = false;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  activityDto: ActivityDto = new ActivityDto();
  upcomingActivities: ActivityDto[] = [];
  baseUrl: string = 'activity/browse?location=Wayanad';
  isEditActivity: boolean = false;

  // Properties for delete confirmation
  showDeleteConfirmation: boolean = false;
  activityToDelete: ActivityDto | null = null;

  // Properties for location filtering
  selectedLocation: string | null = null;
  filteredActivities: ActivityDto[] = [];
  uniqueLocations: string[] = [];

  getActivityByLocation(): void {
    // this.activityService.getByPath(this.baseUrl).subscribe({
    //   next: (response: { data: ActivityDto[] }) => {
    //     console.log(response.data);
    //     this.upcomingActivities = response.data;
    //   },
    //   error: (error) => {
    //     this.toastr.error(
    //       error.error.description ?? 'Failed to fetch activities by location',
    //       'Error'
    //     );
    //   },
    // });
  }

  scrollLeft() {
    this.scrollContainer.nativeElement.scrollBy({
      left: -300,
      behavior: 'smooth',
    });
  }

  scrollRight() {
    this.scrollContainer.nativeElement.scrollBy({
      left: 300,
      behavior: 'smooth',
    });
  }

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly activityService: ActivityService,
    private readonly geocodingService: GeocodingService,
    public toastr: ToastrService,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {}

  ngOnInit(): void {
    this.createFormGroup();
    this.updateFormGroup();
    if (isPlatformBrowser(this.platformId)) {
      this.getData();
      this.getActivityByLocation();
    }
  }

  createFormGroup(): void {
    this.formGroup = this.formBuilder.group({
      activityName: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      activityType: ['', [Validators.required, Validators.maxLength(255)]],
      durationHours: [0, [Validators.required, Validators.min(0)]],
      transportation: ['', [Validators.required, Validators.maxLength(255)]],
      numberOfPeople: [1, [Validators.required, Validators.min(1)]],
      startTime: ['', Validators.required],

      address: ['vienna', [Validators.required]],

      planTripId: [1, Validators.required],
      userId: [15, Validators.required],
    });
  }
  updateFormGroup(): void {
    // Reset the form values
    this.formGroup.reset();

    // Set default values for the form
    this.formGroup.patchValue({
      durationHours: 0,
      numberOfPeople: 1,
      planTripId: 1,
    });
  }
  openModal(): void {
    this.createFormGroup();
    this.isNewActivity = true; // open the modal
  }
  onExpanded(event: any): void {
    this.isExpanded = event;
  }

  featuredActivities = [
    {
      title: 'Visit Wayanad Elephant Camp',
      image: '/assets/images/elephant.png',
      duration: 'Holiday Trip',
      buttonText: 'Book Now',
    },
    {
      title: 'Guided Forest Walk',
      image: '/assets/images/forest.png',
      duration: '3 hours - 4.8★',
      buttonText: 'Book Now',
    },
    {
      title: 'River Rafting Experience',
      image: '/assets/images/rafting.png',
      duration: '5 hours',
      buttonText: 'See Details',
    },
  ];
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imageFile = file;

      // Create a preview URL for the image
      if (isPlatformBrowser(this.platformId)) {
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviewUrl = reader.result as string;
        };
        reader.readAsDataURL(file);
      }
    }
  }
  editActivity(activity: ActivityDto): void {
    this.isNewActivity = true; // open the modal
    this.isEditActivity = true; // set edit mode    // Prepare location data
    this.formGroup.patchValue({
      activityName: activity.activityName,
      description: activity.description,
      activityType: activity.activityType,
      transportation: activity.transportation,
      durationHours: activity.durationHours,
      numberOfPeople: activity.numberOfPeople,
      startTime: activity.startTime,
      planTripId: 1,
      address: activity.address,
      userId: 15,
    });

    // Optionally store the activity ID for later update
    this.activityDto = activity;
  }

  closeModal(): void {
    this.isNewActivity = false;
    this.isEditActivity = false;
  }
  saveActivity(): void {
    const formData = this.formGroup.value;
    if (this.imageFile) {
      formData.imageUrl = '/assets/images/travel.png';
    }

    if (this.activityDto?.id) {
      // Update existing
      this.activityService
        .updateById(this.activityDto.id.toString(), formData)
        .subscribe({
          next: () => {
            this.toastr.success('Activity updated successfully!', 'Success');
            this.formGroup.reset();
            this.isNewActivity = false;
            this.isFormGroupValid = false;
            this.getData(); // refresh list

            // Update map markers after saving
            if (this.map && isPlatformBrowser(this.platformId)) {
              this.addActivityMarkers();
            }
          },
          error: (error) => {
            this.toastr.error(
              error.error.description ?? 'Activity update failed',
              'Error'
            );
          },
        });
    } else {
      // Create new
      this.activityService.create(formData).subscribe({
        next: () => {
          this.toastr.success('Activity created successfully!', 'Success');
          this.formGroup.reset();
          this.isNewActivity = false;
          this.isFormGroupValid = false;
          this.getData();

          // Update map markers after saving
          if (this.map && isPlatformBrowser(this.platformId)) {
            this.addActivityMarkers();
          }
        },
        error: (error) => {
          this.toastr.error(
            error.error.description ?? 'Activity creation failed',
            'Error'
          );
        },
      });
    }
  }

  // Open delete confirmation modal
  confirmDelete(activity: ActivityDto): void {
    event?.stopPropagation(); // Prevent event bubbling to edit
    this.showDeleteConfirmation = true;
    this.activityToDelete = activity;
  }

  // Cancel delete operation
  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.activityToDelete = null;
  }

  // Delete the activity
  deleteActivity(): void {
    if (this.activityToDelete?.id) {
      this.activityService
        .deleteById(this.activityToDelete.id.toString())
        .subscribe({
          next: () => {
            this.toastr.success('Activity deleted successfully!', 'Success');
            this.showDeleteConfirmation = false;
            this.activityToDelete = null;
            this.getData(); // Refresh the activities list
          },
          error: (error: any) => {
            this.toastr.error(
              error.error.description ?? 'Failed to delete activity',
              'Error'
            );
          },
        });
    }
  }

  getMonth(dateString: string): string {
    return new Date(dateString)
      .toLocaleString('default', { month: 'short' })
      .toUpperCase();
  }

  getDay(dateString: string): string {
    return new Date(dateString).getDate().toString().padStart(2, '0');
  }
  getData() {
    this.activityService.getAll().subscribe({
      next: (response: { data: ActivityDto[] }) => {
        this.upcomingActivities = response.data;
        this.filteredActivities = response.data;

        // Extract unique locations from activities
        this.extractUniqueLocations();

        // When activities are loaded, update map markers if map is initialized
        if (this.map && isPlatformBrowser(this.platformId)) {
          this.addActivityMarkers();
        }
      },
      error: (error) => {
        this.toastr.error(
          error.error.description ?? 'No activities found',
          'Error'
        );
      },
    });

    this.extractUniqueLocations();
    if (this.map && isPlatformBrowser(this.platformId)) {
      this.addActivityMarkers();
    }
  }

  // Extract unique locations from activities
  private extractUniqueLocations(): void {
    const locations = new Set<string>();

    this.upcomingActivities.forEach((activity) => {
      // Add location from address field
      if (activity.address) {
        locations.add(activity.address);
      }
    });

    this.uniqueLocations = Array.from(locations);
  }

  // Map initialization after the view is initialized
  ngAfterViewInit() {
    // Initialize map only when in browser environment
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initMap();
      }, 100);
    }
  }

  // Clean up resources when component is destroyed
  ngOnDestroy() {
    // Clean up the map instance to avoid memory leaks
    if (this.map && isPlatformBrowser(this.platformId)) {
      this.map.remove();
    }
  }
  // Initialize Leaflet map
  private async initMap(): Promise<void> {
    // Check if we're in the browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Dynamically import Leaflet only on the client side
    try {
      // Import Leaflet dynamically
      const Leaflet = await import('leaflet');
      this.L = Leaflet.default || Leaflet;

      // Default location - Use a central world coordinate (0,0) to start with
      const defaultLocation = { lat: 0, lng: 0 }; // Centered at the equator/prime meridian
      this.map = this.L.map('activityMap', {
        center: [defaultLocation.lat, defaultLocation.lng],
        zoom: 1, // Set to the most zoomed out view (1 is typically world view)
        zoomControl: false, 
        attributionControl: true,
        worldCopyJump: true,
      });

      // Add zoom control to the top-right corner
      this.L.control.zoom({ position: 'topright' }).addTo(this.map);

      // Add the tile layer with proper configuration
      this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
        minZoom: 1, // Allow maximum zoom out to see the whole world
      }).addTo(this.map);

      // Make sure the entire world is visible initially
      this.map.fitWorld();

      // Add markers for activities if they have location data
      this.addActivityMarkers();
    } catch (error) {
      console.error('Error loading Leaflet:', error);
    }
  } // Add markers for activities on the map
  private addActivityMarkers(): void {
    if (
      !this.map ||
      !this.upcomingActivities?.length ||
      !this.L ||
      !isPlatformBrowser(this.platformId)
    ) {
      console.log('Cannot add markers, prerequisites not met:', {
        mapExists: !!this.map,
        activitiesExist: !!this.upcomingActivities?.length,
        leafletExists: !!this.L,
        isBrowser: isPlatformBrowser(this.platformId),
      });
      return;
    }

    // Clear existing markers
    this.clearActivityMarkers();
    console.log('Cleared existing markers');

    // Add markers for each activity that has location data
    this.upcomingActivities.forEach((activity) => {
      // Get location from address field
      const locationName = activity.address;
    

      // Check if activity has valid location
      if (locationName) {
        // Use our geocoding service to get coordinates for the city
        this.geocodingService
          .getCoordinates(locationName)
          .subscribe((coordinates) => {
            console.log('Received coordinates for activity:', coordinates);
            if (this.map && this.L && isPlatformBrowser(this.platformId)) {
              // Get custom icon based on activity type
              const icon = this.getMarkerIcon(activity);

              // Create location display text
              const locationDisplay = this.createLocationDisplayText(
                activity,
                locationName
              );

              // Create popup content with dynamic data
              const popupContent = this.createPopupContent(
                activity,
                locationDisplay
              );

              // Create marker with custom icon and popup
              const marker = this.L.marker([coordinates.lat, coordinates.lng], {
                icon: icon,
              })
                .addTo(this.map)
                .bindPopup(popupContent);

              // Add click handler for location filtering
              this.addClickHandlerToMarker(marker, locationName);

              this.activityMarkers.push(marker);

              // If this is the first marker, fit the map to show all markers
              if (this.activityMarkers.length === 1) {
                this.fitMapToMarkers();
              }
            }
          });
      }
    });
  }
  // Add markers for filtered activities
  private addFilteredActivityMarkers(): void {
    if (
      !this.map ||
      !this.filteredActivities?.length ||
      !this.L ||
      !isPlatformBrowser(this.platformId)
    ) {
      return;
    }

    // Clear existing markers
    this.clearActivityMarkers();


    // Add markers for each filtered activity
    this.filteredActivities.forEach((activity) => {
      // Get location from address field
      const locationName = activity.address;
      // Check if activity has valid location
      if (locationName) {
        this.geocodingService
          .getCoordinates(locationName)
          .subscribe((coordinates) => {
            if (this.map && this.L && isPlatformBrowser(this.platformId)) {
              // Get custom icon based on activity type
              const icon = this.getMarkerIcon(activity);

              // Create location display text
              const locationDisplay = this.createLocationDisplayText(
                activity,
                locationName
              );

              // Create popup content with dynamic data
              const popupContent = this.createPopupContent(
                activity,
                locationDisplay
              );

              // Create marker with custom icon and popup
              const marker = this.L.marker([coordinates.lat, coordinates.lng], {
                icon: icon,
              })
                .addTo(this.map)
                .bindPopup(popupContent);

              // Add click handler for location filtering
              this.addClickHandlerToMarker(marker, locationName);

              this.activityMarkers.push(marker);

              // If this is the first marker, fit the map to show all markers
              if (this.activityMarkers.length === 1) {
                this.fitMapToMarkers();
              }
            }
          });
      }
    });
  }

  // Fit map to show all markers
  private fitMapToMarkers(): void {
    if (
      !this.map ||
      !this.L ||
      this.activityMarkers.length === 0 ||
      !isPlatformBrowser(this.platformId)
    )
      return;

    try {
      setTimeout(() => {
        if (this.map && this.L && this.activityMarkers.length > 0) {
          const group = this.L.featureGroup(this.activityMarkers);
          this.map.fitBounds(group.getBounds().pad(0.5), {
            maxZoom: 8, // Restrict maximum zoom level when fitting bounds
            animate: true,
            duration: 1,
          });
        } else if (this.map) {
          // If no markers, show the world view
          this.map.setZoom(2);
          this.map.panTo([0, 0]);
        }
      }, 300);
    } catch (error) {
      console.error('Error fitting map to markers:', error);
    }
  }

  // Clear all activity markers from the map
  private clearActivityMarkers(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.activityMarkers.forEach((marker) => {
      if (this.map && marker) {
        this.map.removeLayer(marker);
      }
    });
    this.activityMarkers = [];
  }
  // Define custom marker icons based on activity type
  private getMarkerIcon(activity: ActivityDto): any {
    if (!this.L) return null;

    // Define different icons based on activity type
    switch (activity.activityType?.toLowerCase()) {
      case 'hiking':
      case 'trekking':
      case 'walking':
        return this.L.divIcon({
          className: 'custom-marker hiking-marker',
          html: '<i class="fas fa-hiking"></i>',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

      case 'swimming':
      case 'beach':
      case 'water':
        return this.L.divIcon({
          className: 'custom-marker water-marker',
          html: '<i class="fas fa-swimming-pool"></i>',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

      case 'museum':
      case 'culture':
      case 'art':
        return this.L.divIcon({
          className: 'custom-marker culture-marker',
          html: '<i class="fas fa-landmark"></i>',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

      case 'food':
      case 'dining':
      case 'restaurant':
        return this.L.divIcon({
          className: 'custom-marker food-marker',
          html: '<i class="fas fa-utensils"></i>',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

      default:
        // Default marker for other types
        return this.L.divIcon({
          className: 'custom-marker default-marker',
          html: '<i class="fas fa-map-marker-alt"></i>',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });
    }
  }

  // Focus the map on a specific activity's marker
  public focusActivityOnMap(activity: ActivityDto): void {
    // Get location from address field
    const locationName = activity.address;
    console.log('Focusing on activity location:', locationName);

    if (
      !this.map ||
      !this.L ||
      !isPlatformBrowser(this.platformId) ||
      !locationName
    ) {
      console.error('Cannot focus on map:', {
        mapExists: !!this.map,
        leafletExists: !!this.L,
        isBrowser: isPlatformBrowser(this.platformId),
        locationName,
      });
      return;
    }

    this.geocodingService.getCoordinates(locationName).subscribe(
      (coordinates) => {
        console.log('Received coordinates:', coordinates);
        if (this.map) {
          // Fly to the coordinates with animation - reduced zoom level for wider view
          console.log('Flying to coordinates:', coordinates);
          this.map.flyTo([coordinates.lat, coordinates.lng], 8, {
            animate: true,
            duration: 1.5,
          });

          // Find existing marker if any and open its popup
          const existingMarker = this.activityMarkers.find((marker) => {
            const markerLatLng = marker.getLatLng();
            return (
              Math.abs(markerLatLng.lat - coordinates.lat) < 0.01 &&
              Math.abs(markerLatLng.lng - coordinates.lng) < 0.01
            );
          });

          if (existingMarker) {
            existingMarker.openPopup();
          }
        }
      },
      (error) => {
        console.error('Error getting coordinates:', error);
      }
    );
  }

  // Helper method to create location display text
  private createLocationDisplayText(
    activity: ActivityDto,
    locationName: string
  ): string {
    if (activity.address) {
      // Return the address field
      return activity.address;
    } else {
      // Fall back to provided location name
      return locationName;
    }
  }

  // Helper method to create popup content
  private createPopupContent(
    activity: ActivityDto,
    locationDisplay: string
  ): string {
    return `
    <div class="activity-popup">
      <strong>${activity.activityName}</strong>
      <p>${activity.description}</p>
      <p><i class="fas fa-map-marker-alt"></i> ${locationDisplay}</p>
      ${
        activity.activityType
          ? `<p><i class="fas fa-tag"></i> ${activity.activityType}</p>`
          : ''
      }
      ${
        activity.startTime
          ? `<p><i class="fas fa-clock"></i> ${new Date(
              activity.startTime
            ).toLocaleString()}</p>`
          : ''
      }
      ${
        activity.imageUrl
          ? `<img src="${activity.imageUrl}" alt="${activity.activityName}" class="popup-image">`
          : ''
      }
    </div>
  `;
  }

  // Filter activities by location
  public filterActivitiesByLocation(locationName: string | null): void {
    console.log('Filtering activities by location:', locationName);

    if (!locationName) {
      // If no location selected, show all activities
      this.filteredActivities = [...this.upcomingActivities];
      this.selectedLocation = null;
    } else {
      this.filteredActivities = this.upcomingActivities.filter((activity) => {
        // Match against the address field
        const match = activity.address === locationName;
        return match;
      });
      console.log('Found filtered activities:', this.filteredActivities.length);
      this.selectedLocation = locationName;
    }

    // Update map markers to reflect the filtered activities
    if (this.map && isPlatformBrowser(this.platformId)) {
      console.log('Updating map markers for filtered activities');
      this.addFilteredActivityMarkers();
    }

    // Fly to the location on the map if a location is selected
    if (locationName && this.map && isPlatformBrowser(this.platformId)) {
      this.geocodingService.getCoordinates(locationName).subscribe(
        (coordinates) => {
          this.map.flyTo([coordinates.lat, coordinates.lng], 8, {
            animate: true,
            duration: 1.5,
          });
        },
        (error) => {
          console.error('Error getting coordinates for location:', error);
        }
      );
    }
  }
  // Toggle location filter (select or deselect)
  public toggleLocationFilter(locationName: string): void {

    if (this.selectedLocation === locationName) {
      this.filterActivitiesByLocation(null);
    } else {
      this.filterActivitiesByLocation(locationName);

      // Also focus on this location on the map
      if (this.map && isPlatformBrowser(this.platformId)) {
        this.geocodingService.getCoordinates(locationName).subscribe(
          (coordinates) => {
            console.log('Got coordinates for selected location:', coordinates);
            this.map.flyTo([coordinates.lat, coordinates.lng], 8, {
              animate: true,
              duration: 1.5,
            });
          },
          (error) => {
            console.error(
              'Error getting coordinates for selected location:',
              error
            );
          }
        );
      }
    }
  }
  // Add click handler to marker
  private addClickHandlerToMarker(marker: any, locationName: string): void {


    // Add click event to filter by this location
    marker.on('click', () => {


      // Directly fly to location for immediate feedback
      if (this.map && isPlatformBrowser(this.platformId)) {
        this.geocodingService.getCoordinates(locationName).subscribe(
          (coordinates) => {
            this.map.flyTo([coordinates.lat, coordinates.lng], 10, {
              animate: true,
              duration: 1.0,
            });
          },
          (error) => {
            console.error('Error getting coordinates for marker click:', error);
          }
        );
      }
      setTimeout(() => {
        this.toggleLocationFilter(locationName);
      }, 100);
    });
  }
}
