import { LocationDto } from "./location.model";

export interface Destination {
  id?: number;
  name: string;
  location: LocationDto;
  imageUrl: string;
  rating: number;
  category: string;
}
