export interface Trip {
  id: string;
  destination: string;
  country: string;
  startDate: string; // ISO format
  durationDays: number;
  imageUrl: string;
  flight: {
    from: string;
    to: string;
    departureTime: string; // ISO
    duration: string;
  };
  days: {
    date: string; // ISO
    label: string;
    isToday: boolean;
    activities?: string[];
  }[];
}
