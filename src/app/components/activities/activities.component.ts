import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivityService } from '../../services/activity.service';
import { ToastrService } from 'ngx-toastr';
import { ActivityDto, FeaturedActivityDto } from '../../models/activity.model';
import { isPlatformBrowser } from '@angular/common';
import { GeocodingService } from '../../services/geocoding.service';

@Component({
  selector: 'app-activities',
  standalone: false,
  templateUrl: './activities.component.html',
  styleUrl: './activities.component.scss',
})
export class ActivitiesComponent implements OnInit, OnDestroy {
  private readonly isBrowser: boolean;
  formGroup!: FormGroup;
  imageFile: File | null = null;
  imagePreviewUrl: string | null = null;
  isNewActivity: boolean = false;
  isExpanded: boolean = false;
  isFormGroupValid: boolean = false;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  activityDto: ActivityDto = new ActivityDto();
  upcomingActivities: ActivityDto[] = [];
  baseUrl: string = 'activity/browse?location=Berlin';
  isEditActivity: boolean = false;
  userId:string='';

  // Properties for delete confirmation
  showDeleteConfirmation: boolean = false;
  activityToDelete: ActivityDto | null = null;
  // Properties for location filtering
  selectedLocation: string | null = null;
  filteredActivities: ActivityDto[] = [];
  featuredActivities: FeaturedActivityDto[] = [];
  uniqueLocations: string[] = [];

  // Loading state for featured activities
  isFeaturedActivitiesLoading: boolean = false;

  // Track by function for optimizing lists
  trackById(index: number, activity: ActivityDto): number {
    return activity.id;
  }
  getActivityByLocation(): void {
    this.isFeaturedActivitiesLoading = true;
    this.activityService.getByPath(this.baseUrl).subscribe({
      next: (response) => {
        const uniqueMap = new Map<string, any>();

        response.forEach((activity: any) => {
          const uniqueKey = `${activity.activityName}-${activity.imageUrl}`;
          if (!uniqueMap.has(uniqueKey)) {
            uniqueMap.set(uniqueKey, {
              image: activity.imageUrl,
              title: activity.activityName,
              description: activity.description
                ? activity.description.charAt(0).toUpperCase() +
                  activity.description.slice(1)
                : '',

              buttonText: 'View More',
            });
          }
        });

        this.featuredActivities = Array.from(uniqueMap.values());
        this.isFeaturedActivitiesLoading = false;
      },
      error: (error) => {
        this.isFeaturedActivitiesLoading = false;
        this.toastr.error(
          error.error.description ?? 'Failed to fetch activities by location',
          'Error'
        );
      },
    });
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
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId') ?? '';
    this.createFormGroup();
    this.updateFormGroup();
    if (this.isBrowser) {
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

      address: ['', [Validators.required]],

      planTripId: [1, Validators.required],
      userId: [this.userId, Validators.required],
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

  onFileChange(event: any) {
    // Check if this is a remove image event
    if (event.type === 'remove') {
      // Clear the image file and preview
      this.imageFile = null;
      this.imagePreviewUrl = null;
      return;
    }

    // Handle normal file selection
    const file = event.target.files?.[0];
    if (file) {
      this.imageFile = file;

      // Create a preview URL for the image
      if (this.isBrowser) {
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
    this.isEditActivity = true; // set edit mode
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
      userId:this.userId,
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
        .updateById(this.activityDto.id.toString(), this.formGroup.value)
        .subscribe({
          next: () => {
            this.toastr.success('Activity updated successfully!', 'Success');
            this.formGroup.reset();
            this.isNewActivity = false;
            this.isFormGroupValid = false;
            this.getData(); // refresh list
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
      },
      error: (error) => {
        this.toastr.error(
          error.error.description ?? 'No activities found',
          'Error'
        );
      },
    });
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
  ngOnDestroy() {
    // Clean up resources when component is destroyed
  }
  // Focus the map on a specific activity's marker
  public focusActivityOnMap(activity: ActivityDto): void {
    if (activity?.address) {
      // First clear the selected location to force Angular to detect the change
      this.selectedLocation = null;

      // Use setTimeout to ensure the change detection cycle processes the null value
      setTimeout(() => {
        // Then set it to the activity address to trigger the map update
        this.selectedLocation = activity.address; // No longer filter activities when clicking on the map pin
        // this.filterActivitiesByLocation(activity.address);

        // Scroll to map section to ensure it's visible
        if (this.isBrowser) {
          const mapElement = document.querySelector('.activities-map-wrapper');
          if (mapElement) {
            mapElement.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }, 50); // Increased timeout to ensure DOM updates first
    }
  }

  // Filter activities by location
  public filterActivitiesByLocation(locationName: string | null): void {
    if (!locationName) {
      // If no location selected, show all activities
      this.filteredActivities = [...this.upcomingActivities];
      this.selectedLocation = null;
    } else {
      // Filter activities by selected location
      this.filteredActivities = this.upcomingActivities.filter((activity) => {
        // Match against the address field
        return activity.address === locationName;
      });
      this.selectedLocation = locationName;
    }
  }

  // Toggle location filter (select or deselect)
  public toggleLocationFilter(locationName: string): void {
    if (this.selectedLocation === locationName) {
      this.filterActivitiesByLocation(null);
    } else {
      this.filterActivitiesByLocation(locationName);
    }
  }
}
