export interface Trip {
  id: string;
  destination: string;
  country: string;
  startDate: string; // ISO format
  endDate?: string; // ISO format
  imageUrl: string;
  flight: {
    from: string;
    to: string;
    departureTime: string; // ISO
    duration: string;
  };
  days: {
    activities?: string[];
  }[];
}
