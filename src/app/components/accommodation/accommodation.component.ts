import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { LocationDto } from '../../models/location.model'; // Corrected import path
import { LocationService } from '../../services/location.service';
import { ToastrService } from 'ngx-toastr';
import { isPlatformBrowser } from '@angular/common';
import { AccommodationService } from '../../services/accommodation.service';
import {
  AccommodationDto,
  ReservationDto,
} from '../../models/accommodation.model';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReservationService } from '../../services/reservation.service';

@Component({
  selector: 'app-accommodation',
  standalone: false,
  templateUrl: './accommodation.component.html',
  styleUrl: './accommodation.component.scss',
})
export class AccommodationComponent implements OnInit {
  locationDto: LocationDto = new LocationDto();
  selectedLocation = 'All';
  locations: LocationDto[] = [];
  isExpanded: boolean = false;
  accommodation: AccommodationDto = {} as AccommodationDto;
  accommodations: AccommodationDto[] = [];
  isNewAccommodation: boolean = false;
  formGroup!: FormGroup;
  isFormGroupValid: boolean = false;
  hasAdminRole: boolean = false;
  userId: string = '';

  selectedAccommodationForReservation: AccommodationDto | null = null;
  reservationFormGroup!: FormGroup;
  reservedRooms: ReservationDto[] = []; // Will store user's reservations
  showMyReservationsView: boolean = false; // Added property

  // Breadcrumb navigation
  breadcrumbItems: { label: string; active: boolean }[] = [
    { label: 'All Accommodations', active: true },
    { label: 'My Reservations', active: false },
  ];

  constructor(
    private readonly locationService: LocationService,
    public toastr: ToastrService,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    private readonly accommodationService: AccommodationService,
    private readonly reservationService: ReservationService,
    private readonly formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId') ?? '';
    if (isPlatformBrowser(this.platformId)) {
      this.getLocations();
      this.getAllAccommodations();
      this.loadReservedRooms();
      this.hasAdminRole = localStorage.getItem('userRole') !== 'ADMIN';
    }
    this.createFormGroup();
    this.createReservationFormGroup();
  }

  createFormGroup(): void {
    const roomsData = [
      {
        roomType: 'Deluxe Room',
        capacity: 2,
        pricePerNight: 75,
        description: 'A comfortable deluxe room.',
        availableFrom: '2025-06-01',
        availableTo: '2025-12-31',
      },
      {
        roomType: 'Suite',
        capacity: 4,
        pricePerNight: 150,
        description: 'A luxurious suite.',
        availableFrom: '2025-07-01',
        availableTo: '2025-11-30',
      },
    ];
    this.formGroup = this.formBuilder.group({
      id: [this.accommodation?.id ?? null],
      type: ['HOTEL', [Validators.required, Validators.maxLength(255)]],
      name: ['Luxury Hotel', [Validators.required, Validators.maxLength(255)]],
      address: [
        '123 Main Street',
        [Validators.required, Validators.maxLength(500)],
      ],
      features: [
        'POOL_ACCESS',
        [Validators.required, Validators.maxLength(255)],
      ],
      location: this.formBuilder.group({
        id:28,
        city: ['Tokyo', [Validators.required]],
        country: ['Japan', [Validators.required]], // Corrected prefill
        state: ['Tokyo', [Validators.required]], // Corrected prefill
      }),
      rating: [5, [Validators.min(0), Validators.max(5)]],
      userId: [this.userId, Validators.required],
      rooms: this.formBuilder.array(
        roomsData.map((room) => this.createRoomFormGroup(room))
      ),
      image: [
        'assets/images/cabin.png',
        Validators.pattern('(https?://.*.(?:png|jpg|jpeg|gif|svg))'),
      ],
    });
  }

  createRoomFormGroup(roomData?: any): FormGroup {
    return this.formBuilder.group({
      roomType: [roomData?.roomType ?? 'Standard Room', Validators.required],
      capacity: [
        roomData?.capacity ?? 1,
        [Validators.required, Validators.min(1)],
      ],
      pricePerNight: [
        roomData?.pricePerNight ?? null,
        [Validators.required, Validators.min(0)],
      ],
      description: [roomData?.description ?? ''],
      accommodationId: [roomData?.accommodationId ?? null],
      availableFrom: [roomData?.availableFrom ?? null, Validators.required],
      availableTo: [roomData?.availableTo ?? null, Validators.required],
    });
  }

  // --- New method to create reservation form group ---
  createReservationFormGroup(): void {
    this.reservationFormGroup = this.formBuilder.group({
      roomId: [null, Validators.required],
      checkInDate: [null, Validators.required],
      checkOutDate: [null, Validators.required],
      guestName: ['', Validators.required],
      guestEmail: ['', [Validators.required, Validators.email]],
    });
  }

  get rooms(): FormArray {
    return this.formGroup.get('rooms') as FormArray;
  }

  addRoomToForm(): void {
    this.rooms.push(this.createRoomFormGroup());
  }

  removeRoomFromForm(index: number): void {
    this.rooms.removeAt(index);
  }

  onExpanded(event: any): void {
    this.isExpanded = event;
  }

  getDateValue(controlName: string, i?: number): Date | null {
    // If the 'i' index is provided, we are dealing with a FormArray (e.g., rooms)
    if (i !== undefined) {
      const controlValue = this.rooms.controls[i].get(controlName)?.value;
      return controlValue ? new Date(controlValue) : null;
    } else {
      // Otherwise, it's a simple FormGroup control (e.g., checkInDate, checkOutDate)
      const selectedDate = this.reservationFormGroup.get(controlName)?.value;
      return selectedDate ? new Date(selectedDate) : null;
    }
  }

  getLocations(): void {
    this.locationService.getAll().subscribe({
      next: (response: { data: LocationDto[] }) => {
        this.locations = response.data;
      },
      error: (error) => {
        this.toastr.error(
          error.error.description ?? 'No locations found',
          'Error'
        );
      },
    });
  }

  getAllAccommodations(): void {
    this.accommodationService.getAll().subscribe({
      // Expect the API response to be the array directly
      next: (responseData: any[]) => {
        if (Array.isArray(responseData)) {
          this.accommodations = responseData as AccommodationDto[];
          this.filteredAccommodations = [...this.accommodations];
        }
      },
      error: (error) => {
        this.toastr.error(
          error.error?.description ?? 'Error fetching accommodations',
          'Error'
        );
        this.accommodations = [];
        this.filteredAccommodations = [];
      },
    });
  }

  // Renamed from 'accommodation' to 'currentAccommodationFormData' for clarity
  currentAccommodationFormData: AccommodationDto = {} as AccommodationDto;

  // Initialize filteredAccommodations directly with accommodations
  // This will be populated once getAllAccommodations completes
  filteredAccommodations: AccommodationDto[] = [];

  filterAccommodations(): void {
    // If a location is selected (not 'All'), then filter.
    // Otherwise, show all accommodations.
    if (this.selectedLocation !== 'All') {
      this.filteredAccommodations = this.accommodations.filter(
        (acc) => acc.location.country === this.selectedLocation
      );
    } else {
      // If 'All' is selected, show all accommodations
      this.filteredAccommodations = [...this.accommodations];
    }
  }

  addNewAccommodation(id: any): void {
    this.isNewAccommodation = true;
    this.createFormGroup();
    this.formGroup.patchValue({ id: id });
  }

  editAccommodationSetup(accommodation: AccommodationDto): void {
    this.isNewAccommodation = true;
    this.formGroup.patchValue({
      id: accommodation.id,
      type: accommodation.type,
      name: accommodation.name,
      address: accommodation.address,
      features: accommodation.features,
      location: {
        city: accommodation.location.city,
        country: accommodation.location.country,
        state: accommodation.location.state,
      },
      rating: accommodation.rating,
      userId: accommodation.userId,
      image: accommodation.image,
    });

    this.rooms.clear();
    if (accommodation.rooms && accommodation.rooms.length > 0) {
      accommodation.rooms.forEach((room) => {
        this.rooms.push(
          this.createRoomFormGroup({
            roomType: room.roomType,
            capacity: room.capacity,
            pricePerNight: room.pricePerNight,
            description: room.description,
            accommodationId: room.accommodationId,
            availableFrom: room.availableFrom,
            availableTo: room.availableTo,
          })
        );
      });
    } else {
      this.rooms.push(this.createRoomFormGroup());
    }
  }

  updateAccommodation(): void {
    // if (this.formGroup.invalid) {
    //   this.toastr.error('Please fill all required fields.', 'Error');
    //   return;
    // }

    const accommodationData = this.formGroup.value as AccommodationDto;

    this.accommodationService
      .updateById(accommodationData.id.toString(), accommodationData)
      .subscribe({
        next: (response: { data: AccommodationDto }) => {
          this.toastr.success('Accommodation updated successfully!', 'Success');
          const index = this.accommodations.findIndex(
            (acc) => acc.id === accommodationData.id
          );
          if (index !== -1) {
            this.accommodations[index] = response.data;
          }
          this.filterAccommodations();
          this.createFormGroup(); // Reset form to initial prefill
          this.isNewAccommodation = false;
          this.isFormGroupValid = false;
        },
        error: (error: any) => {
          this.toastr.error(
            error.error?.description ?? 'Accommodation update failed',
            'Error'
          );
        },
      });
  }

  addAccommodation(): void {
    if (!this.formGroup.get('id')?.value) {
      const accommodationData = this.formGroup.value as AccommodationDto;

      // Create new accommodation
      this.accommodationService.updateById('1', accommodationData).subscribe({
        next: (response: { data: AccommodationDto }) => {
          this.toastr.success('Accommodation created successfully!', 'Success');
          this.accommodations.push(response.data);
          this.filterAccommodations();
          this.createFormGroup(); // Reset form to initial prefill for a new accommodation
          this.isNewAccommodation = false;
          this.isFormGroupValid = false;
        },
        error: (error: any) => {
          this.toastr.error(
            error.error?.description ?? 'Accommodation creation failed',
            'Error'
          );
        },
      });
    } else {
      this.updateAccommodation();
    }
  }

  handleAccommodationAction(): void {
    if (this.isNewAccommodation) {
      this.addAccommodation();
    } else {
      this.updateAccommodation();
    }
  }

  // --- Methods for reservation modal ---
  openReservationModal(accommodation: AccommodationDto): void {
    this.selectedAccommodationForReservation = accommodation;
    this.reservationFormGroup.reset(); // Reset form for new reservation
    // Potentially pre-fill some fields if needed, e.g., guest name from logged-in user
  }

  closeReservationModal(): void {
    this.selectedAccommodationForReservation = null;
  }

  reserveRoom(): void {
    if (
      !this.selectedAccommodationForReservation ||
      this.reservationFormGroup.invalid
    ) {
      this.toastr.error(
        'Please select a room and fill all reservation details.',
        'Error'
      );
      return;
    }

    const reservationData = this.reservationFormGroup.value;
    const roomToReserve = this.selectedAccommodationForReservation.rooms.find(
      (r) => r.id === reservationData.roomId
    );

    if (!roomToReserve) {
      this.toastr.error('Selected room not found.', 'Error');
      return;
    }

    // Create the reservation payload
    const reservationPayload = {
      roomId: reservationData.roomId,
      checkInDate: reservationData.checkInDate,
      checkOutDate: reservationData.checkOutDate,
      guestName: reservationData.guestName,
      guestEmail: reservationData.guestEmail,
    };

    // Call the service to create the reservation
    this.reservationService.create(reservationPayload).subscribe({
      next: (response: any) => {
        // Create a local ReservationDto object for UI display
        const newReservation: ReservationDto = {
          roomId: reservationData.roomId,
          accommodationId: this.selectedAccommodationForReservation!.id,
          accommodationName: this.selectedAccommodationForReservation!.name,
          roomType: roomToReserve.roomType,
          checkInDate: reservationData.checkInDate,
          checkOutDate: reservationData.checkOutDate,
          guestName: reservationData.guestName,
          guestEmail: reservationData.guestEmail,
          status: response.status ?? 'CONFIRMED',
          pricePerNight: roomToReserve.pricePerNight,
          totalPrice: this.calculateTotalPrice(
            reservationData.checkInDate,
            reservationData.checkOutDate,
            roomToReserve.pricePerNight
          ),
        };

        this.reservedRooms.push(newReservation);
        this.toastr.success(
          `Room  reserved successfully!`,
          'Reservation Confirmed'
        );
        this.closeReservationModal();

        // Reload reservations to get fresh data
        this.loadReservedRooms();
      },
      error: (error) => {
        this.toastr.error(
          error.error?.description ?? 'Failed to make reservation',
          'Error'
        );
      },
    });
  }

  calculateTotalPrice(
    checkIn: string | Date,
    checkOut: string | Date,
    pricePerNight: number
  ): number {
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * pricePerNight;
  }

  // --- Helper to get min price for an accommodation to display on card ---
  getMinRoomPrice(accommodation: AccommodationDto): number {
    if (!accommodation.rooms || accommodation.rooms.length === 0) {
      return 0;
    }
    let minPrice = Infinity;
    accommodation.rooms.forEach((room) => {
      if (room.pricePerNight !== null && room.pricePerNight < minPrice) {
        minPrice = room.pricePerNight;
      }
    });
    return minPrice === Infinity ? 0 : minPrice;
  }

  // --- Method to toggle between all accommodations and user's reservations view ---
  showAllAccommodationsAndReservations(): void {
    this.showMyReservationsView = !this.showMyReservationsView;
    this.updateBreadcrumbState();
  }

  // --- Method to handle breadcrumb navigation ---
  handleBreadcrumbNavigation(index: number): void {
    if (index === 0) {
      // All Accommodations
      this.showMyReservationsView = false;
    } else {
      // My Reservations
      this.showMyReservationsView = true;
    }
    this.updateBreadcrumbState();
  }

  // --- Update breadcrumb active states based on current view ---
  private updateBreadcrumbState(): void {
    this.breadcrumbItems = [
      { label: 'All Accommodations', active: !this.showMyReservationsView },
      { label: 'My Reservations', active: this.showMyReservationsView },
    ];
  }

  loadReservedRooms(): void {
    this.reservationService.getAll().subscribe({
      next: (reservations: ReservationDto[]) => {
        this.reservedRooms = reservations;
      },
      error: (error) => {
        this.toastr.error(
          error.error?.description ?? 'Failed to load reservations',
          'Error'
        );
        // Keep an empty array in case of error
        this.reservedRooms = [];
      },
    });
  }
}
