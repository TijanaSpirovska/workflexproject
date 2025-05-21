import {
  Component,
  Input,
  Output,
  EventEmitter,
  Inject,
  PLATFORM_ID,
  OnInit,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivityDto } from '../../../models/activity.model';
import { GeocodingService } from '../../../services/geocoding.service';
import { ActivityMapHelperService } from '../../../services/activity-map-helper.service';

@Component({
  selector: 'app-activity-map',
  standalone: false,
  templateUrl: './activity-map.component.html',
  styleUrls: ['./activity-map.component.scss'],
})
export class ActivityMapComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy
{
  @Input() activities: ActivityDto[] = [];
  @Input() filteredActivities: ActivityDto[] = [];
  @Input() selectedLocation: string | null = null;
  @Output() locationSelected = new EventEmitter<string>();

  private map: any;
  private L: any;
  private activityMarkers: any[] = [];
  private readonly isBrowser: boolean;
  constructor(
    private readonly geocodingService: GeocodingService,
    private readonly mapHelper: ActivityMapHelperService,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Don't initialize the map here, wait for AfterViewInit
  }
  ngOnChanges(changes: SimpleChanges): void {
    // When filtered activities or selected location changes, update markers
    if (changes['filteredActivities'] && this.map) {
      this.addMarkers(this.filteredActivities);
    }

    if (changes['selectedLocation'] && this.map) {
      if (this.selectedLocation) {
        setTimeout(() => {
          this.focusOnLocation(this.selectedLocation!);
        }, 100);
      }
    }
  }
  ngAfterViewInit(): void {
    if (this.isBrowser) {
      setTimeout(() => {
        this.initMap();
      }, 100);
    }
  }
  ngOnDestroy(): void {
    // Clean up resources when component is destroyed
    if (this.isBrowser) {
      try {
        if (this.map) {
          this.map.off(); // Remove all event listeners
          this.map.remove(); // Remove the map
          this.map = null;
        }

        // Clear markers array
        this.activityMarkers = [];

        // Check if map container still exists and clean up its Leaflet ID
        const mapContainer = document.getElementById('activityMap');
        if (mapContainer) {
          // @ts-ignore: Accessing internal Leaflet property
          if (mapContainer._leaflet_id) {
            // @ts-ignore: Accessing internal Leaflet property
            delete mapContainer._leaflet_id;
          }
        }
      } catch (error) {
        console.error('Error during map cleanup:', error);
      }
    }
  } // Initialize Leaflet map
  private async initMap(): Promise<void> {
    if (!this.isBrowser) return;

    // If map is already initialized, just update markers
    if (this.map) {
      this.addMarkers(
        this.filteredActivities.length > 0
          ? this.filteredActivities
          : this.activities
      );
      return;
    }

    try {
      // Check if the map container exists in the DOM
      const mapContainer = document.getElementById('activityMap');
      if (!mapContainer) {
        return;
      }

      // Check if there's an existing Leaflet map instance on this container
      // @ts-ignore: Accessing internal Leaflet property
      if (mapContainer._leaflet_id) {
        // @ts-ignore: Accessing internal Leaflet property
        delete mapContainer._leaflet_id;
      }

      // Dynamically import Leaflet only on the client side
      const Leaflet = await import('leaflet');
      this.L = Leaflet.default || Leaflet; // Default location - Use a central world coordinate (0,0) to start with
      const defaultLocation = { lat: 0, lng: 0 };

      // Create the map with error handling
      try {
        this.map = this.L.map('activityMap', {
          center: [defaultLocation.lat, defaultLocation.lng],
          zoom: 1, // Set to the most zoomed out view
          zoomControl: false,
          attributionControl: true,
          worldCopyJump: true,
        });
      } catch (error) {
        console.error('Error initializing map:', error);

        // If the error was about an already initialized container, we'll just return
        if (
          error &&
          typeof error === 'object' &&
          'message' in error &&
          typeof error.message === 'string' &&
          error.message.includes('already initialized')
        ) {
          console.warn('Map container already initialized, skipping');
          return; // Skip this initialization attempt
        }
        // For other errors, continue with the normal error flow
      } // Make sure the map was successfully created before adding controls and layers
      if (!this.map) {
        return;
      }

      // Add zoom control to the top-right corner
      this.L.control.zoom({ position: 'topright' }).addTo(this.map);

      // Add the tile layer with proper configuration
      this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
        minZoom: 1,
      }).addTo(this.map);

      // Make sure the entire world is visible initially
      this.map.fitWorld();

      // Add markers for activities if they have location data
      if (this.filteredActivities.length > 0) {
        this.addMarkers(this.filteredActivities);
      } else if (this.activities.length > 0) {
        this.addMarkers(this.activities);
      }
    } catch (error) {
      console.error('Error loading Leaflet:', error);
    }
  }
  // Unified method to add markers for any array of activities
  private addMarkers(activities: ActivityDto[]): void {
    // Validate all required dependencies and data
    if (!this.isBrowser) {
      return;
    }

    if (!this.map) {
      return;
    }

    if (!this.L) {
      return;
    }

    if (!activities || !activities.length) {
      return;
    }

    // Clear existing markers
    this.clearActivityMarkers();

    // Add markers for each activity that has location data
    activities.forEach((activity) => {
      const locationName = activity.address;

      if (locationName) {
        this.geocodingService.getCoordinates(locationName).subscribe(
          (coordinates) => {
            if (this.map && this.L) {
              // Get custom icon based on activity type
              const icon = this.mapHelper.getMarkerIcon(activity, this.L);

              // Create location display text
              const locationDisplay = this.mapHelper.createLocationDisplayText(
                activity,
                locationName
              );

              // Create popup content with dynamic data
              const popupContent = this.mapHelper.createPopupContent(
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
              // this.addClickHandlerToMarker(marker, locationName);

              this.activityMarkers.push(marker);

              // If this is the first marker, fit the map to show all markers
              if (this.activityMarkers.length === 1) {
                this.fitMapToMarkers();
              }
            }
          },
          (error) => {
            console.error('Error getting coordinates for activity:', error);
          }
        );
      }
    });
  }
  // Focus on a specific location on the map
  public focusOnLocation(locationName: string): void {
    if (!this.map || !this.L || !this.isBrowser || !locationName) {
      return;
    }

    // Make sure the map is visible and properly sized
    if (this.map) {
      // This triggers a resize detection in leaflet
      this.map.invalidateSize(true);
    }

    this.geocodingService.getCoordinates(locationName).subscribe(
      (coordinates) => {
        if (this.map) {
          // Fly to the coordinates with animation
          this.map.flyTo([coordinates.lat, coordinates.lng], 10, {
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
            setTimeout(() => {
              existingMarker.openPopup();
            }, 1000); // Open popup after map has flown to location
          }
        }
      },
      (error) => {
        console.error('Error getting coordinates for location:', error);
      }
    );
  }

  // Fit map to show all markers
  private fitMapToMarkers(): void {
    if (
      !this.map ||
      !this.L ||
      this.activityMarkers.length === 0 ||
      !this.isBrowser
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
    if (!this.isBrowser) return;

    try {
      if (this.activityMarkers && this.activityMarkers.length > 0) {
        this.activityMarkers.forEach((marker) => {
          if (this.map && marker) {
            try {
              this.map.removeLayer(marker);
            } catch (err) {
              console.warn('Error removing marker:', err);
            }
          }
        });
      }
      this.activityMarkers = [];
    } catch (error) {
      console.error('Error clearing activity markers:', error);
      // Reset markers array even if there was an error
      this.activityMarkers = [];
    }
  }
  // These methods are now in the ActivityMapHelperService

  // Add click handler to marker
  // private addClickHandlerToMarker(marker: any, locationName: string): void {
  //   // Add click event to filter by this location
  //   marker.on('click', () => {
  //     // Directly fly to location for immediate feedback
  //     if (this.map) {
  //       this.geocodingService.getCoordinates(locationName).subscribe(
  //         (coordinates) => {
  //           this.map.flyTo([coordinates.lat, coordinates.lng], 10, {
  //             animate: true,
  //             duration: 1.0,
  //           });
  //         },
  //         (error) => {
  //           console.error('Error getting coordinates for marker click:', error);
  //         }
  //       );
  //     }

  //     // Emit the selected location to the parent component
  //     setTimeout(() => {
  //       this.locationSelected.emit(locationName);
  //     }, 100);
  //   });
  // }
}
