import { Component, OnInit } from '@angular/core';
import { RegisterService } from '../../services/register.service';
import { UserDto } from '../../models/user.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Role } from '../../data/role';

@Component({
  selector: 'app-sign-up-page',
  standalone: false,
  templateUrl: './sign-up-page.component.html',
  styleUrl: './sign-up-page.component.scss',
})
export class SignUpPageComponent implements OnInit {
  constructor(
    private readonly registerService: RegisterService,
    private readonly formBuilder: FormBuilder,
    public toastr: ToastrService
  ) {}
  userCredentials!: UserDto;
  formGroup!: FormGroup;

  ngOnInit(): void {
    this.createFormGroup();
    this.updateFormGroup();
  }
  hasError(controlName: string, errorType: string): boolean {
    const control = this.formGroup.get(controlName);
    return !!(control && control.touched && control.hasError(errorType));
  }

  createFormGroup(): void {
    this.formGroup = this.formBuilder.group(
      {
        fullName: ['', [Validators.required, Validators.maxLength(255)]],
        username: ['', [Validators.required, Validators.maxLength(255)]],
        email: [
          '',
          [Validators.required, Validators.maxLength(255), Validators.email],
        ],
        phoneNumber: [123456789],
        address: [
          '456 Elm Street',
          [Validators.required, Validators.maxLength(255)],
        ],
        password: ['', [Validators.required, Validators.maxLength(255)]],
        confirmPassword: ['', [Validators.required]],
        accountExpiredDate: ['2999-12-31'],
        accountLocked: [false],
        credentialsExpiredDate: ['2999-12-31'],
        enabled: [true],
        role: [Role.Guest],
      },
      { validator: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  updateFormGroup(): void {
    this.formGroup = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.maxLength(255)]],
      username: ['', [Validators.required, Validators.maxLength(255)]],
      email: [
        '',
        [Validators.required, Validators.maxLength(255), Validators.email],
      ],
      phoneNumber: [123456789],
      confirmPassword: ['', [Validators.required]],
      address: [
        '456 Elm Street',
        [Validators.required, Validators.maxLength(255)],
      ],
      password: ['', [Validators.required, Validators.maxLength(255)]],
      accountExpiredDate: ['2999-12-31'],
      accountLocked: [false],
      credentialsExpiredDate: ['2999-12-31'],
      enabled: [true],
      role: [Role.Guest],
    });
  }
  onSubmit(): void {
    const formValue = this.formGroup.value;

    const { confirmPassword, ...userDto } = formValue;

    this.registerService.create(userDto).subscribe({
      next: (response) => {
        this.toastr.success(
          'Your account was created',
          'Registration Complete'
        );
        this.formGroup.reset();
      },
      error: (error) => {
        this.toastr.error(error.error.description ?? 'Registration failed', 'Error');
      },
    });
  }
}
