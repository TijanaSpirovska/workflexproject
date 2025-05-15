import { LocationDto } from './location.model';

// Ensure LocationDto is defined as expected, or define it here if not already present elsewhere
// export interface LocationDto {
//   city: string;
//   country: string;
//   state: string;
// }

export interface RoomDto {
  id: number;
  roomType: string;
  capacity: number;
  pricePerNight: number;
  description?: string;
  accommodationId: number;
  availableFrom?: string | Date;
  availableTo?: string | Date;
}

export interface AccommodationDto {
  id: number;
  type: string; // e.g., 'HOTEL', 'APARTMENT', matches backend
  name: string;
  address: string;
  features?: string; // Assuming AccommodationFeature enum from backend is string on frontend
  location: LocationDto; // Assumes LocationDto is defined correctly
  rating?: number;
  userId: number; // Assuming Long maps to number
  rooms: RoomDto[];
  image?: string; // Kept from previous frontend version
}

export interface ReservationDto {
  roomId: number; // Assuming Long maps to number
  accommodationId: number; // Added for frontend convenience
  accommodationName?: string; // Added for frontend convenience
  roomType?: string; // Added for frontend convenience
  checkInDate: string | Date; // Assuming LocalDate maps to string or Date
  checkOutDate: string | Date; // Assuming LocalDate maps to string or Date
  guestName?: string;
  guestEmail?: string;
  status: string; // e.g., 'CONFIRMED', 'PENDING', 'CANCELLED'
  pricePerNight?: number; // Added for frontend display convenience
  totalPrice?: number; // Added for frontend display convenience, can be calculated
}

// Remove or update the old class-based DTOs if they exist to avoid conflicts
// For example, if you have 'export class LocationDto ...', ensure it matches or remove it
// if the interface version is now the standard.
// The user's previous DTOs were classes, so we are replacing them with interfaces.
// Make sure to remove or comment out the old class definitions for AccommodationDto and RoomDto.

// Example of what might have been there before (ensure these are removed or updated):
// export class RoomDto { ... }
// export class AccommodationDto { ... }
// export class LocationDto { ... } // This should already be an interface or class
