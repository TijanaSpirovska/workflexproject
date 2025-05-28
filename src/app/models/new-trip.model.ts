export class NewTripDto {
  id: string = ''; // Added ID property to uniquely identify trips
  tripName: string = '';
  description: string = '';
  location: LocationDto = new LocationDto();
  startDate: Date = new Date();
  endDate: Date = new Date();
  numberOfPeople: number = 1;
  budget: number = 0;
  imageUrl: string = '';
}

export class LocationDto {
  country: string = '';
  state: string = '';
  city: string = '';
}
