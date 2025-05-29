import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NewTripDto } from '../../models/new-trip.model';
import { NewTripService } from '../../services/new-trip.service';
import { DOCUMENT } from '@angular/common';
import { Role } from '../../data/role';

@Component({
  selector: 'app-new-trip',
  standalone: false,
  templateUrl: './new-trip.component.html',
  styleUrl: './new-trip.component.scss',
})
export class NewTripComponent {
  formGroup!: FormGroup;
  minToDate: string = '';
  newTripDto: NewTripDto = new NewTripDto();
  isFormGroupValid: boolean = false;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private readonly newTripService: NewTripService,
    private readonly formBuilder: FormBuilder,
    public toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.createFormGroup();
    this.document.body.style.overflowY = 'visible';
  }

  createFormGroup(): void {
    const userId = localStorage.getItem('userId') ?? '';
    this.formGroup = this.formBuilder.group({
      tripName: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.required, Validators.maxLength(255)]],
      location: this.formBuilder.group({
        city: ['', [Validators.required, Validators.maxLength(255)]],
        country: ['', [Validators.required, Validators.maxLength(255)]],
        state: [' ', [Validators.required, Validators.maxLength(255)]],
      }),
      user: this.formBuilder.group({
        id: [userId, [Validators.required, Validators.maxLength(255)]],
      }),
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      numberOfPeople: [1, [Validators.required, Validators.min(1)]],
      budget: [0, [Validators.required, Validators.min(0)]],
    });
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.formGroup.get(controlName);
    return !!(control && control.touched && control.hasError(errorType));
  }


  onCreateTrip(): void {
    // if (this.formGroup.invalid) {
    //   this.isFormGroupValid = true;
    //   return;}


    this.newTripDto = this.formGroup.value;

    this.newTripService.create(this.newTripDto).subscribe({
      next: () => {
        this.toastr.success('Trip created successfully!', 'Success');
        this.formGroup.reset();
        this.isFormGroupValid = false
      },
      error: (error) => {
        this.toastr.error(
          error.error.description ?? 'Trip creation failed',
          'Error'
        );
      },
    });
  }
}


