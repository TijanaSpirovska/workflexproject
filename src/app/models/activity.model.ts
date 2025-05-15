export class LocationDto {
  id?: number;
  address: string = ''; // Changed from country to address
  state: string = '';
  city: string = '';
}

export class ActivityDto {
  id: number = 0;
  activityName: string = '';
  description: string = '';
  activityType: string = '';
  durationHours: number = 0;
  transportation: string = '';
  numberOfPeople: number = 1;
  startTime: string = '';
  address: string = '';
  planTripId: number = 0;
  imageUrl?: string | null;
  userId: number = 0; // New field for user ID
}

export interface FeaturedActivityDto {
  title: string;
  image: string;
  description: string;
  buttonText: string;
}
