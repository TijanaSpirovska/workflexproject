import { Injectable } from '@angular/core';
import { ActivityDto } from '../models/activity.model';

@Injectable({
  providedIn: 'root',
})
export class ActivityMapHelperService {
  constructor() {}

  /**
   * Generate a custom marker icon based on activity type
   */
  getMarkerIcon(activity: ActivityDto, L: any): any {
    if (!L) return null;

    // Define different icons based on activity type
    switch (activity.activityType?.toLowerCase()) {
      case 'hiking':
      case 'trekking':
      case 'walking':
        return L.divIcon({
          className: 'custom-marker hiking-marker',
          html: '<i class="fas fa-hiking"></i>',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

      case 'swimming':
      case 'beach':
      case 'water':
        return L.divIcon({
          className: 'custom-marker water-marker',
          html: '<i class="fas fa-swimming-pool"></i>',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

      case 'museum':
      case 'culture':
      case 'art':
        return L.divIcon({
          className: 'custom-marker culture-marker',
          html: '<i class="fas fa-landmark"></i>',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

      case 'food':
      case 'dining':
      case 'restaurant':
        return L.divIcon({
          className: 'custom-marker food-marker',
          html: '<i class="fas fa-utensils"></i>',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

      default:
        // Default marker for other types
        return L.divIcon({
          className: 'custom-marker default-marker',
          html: '<i class="fas fa-map-marker-alt"></i>',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });
    }
  }

  /**
   * Create a display text for a location
   */
  createLocationDisplayText(
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

  /**
   * Create HTML content for a popup
   */
  createPopupContent(activity: ActivityDto, locationDisplay: string): string {
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
}
