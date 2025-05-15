import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  LoginResponseDto,
  RequestTokenDto,
  ResetPasswordDto,
  UserDto,
} from '../../models/user.model';
import { LoginService } from '../../services/login.service';
import { ToastrService } from 'ngx-toastr';
import { RequestTokenService } from '../../services/request-token.service';
import { ResetPasswordService } from '../../services/reset-password.service';

@Component({
  selector: 'app-login-page',
  standalone: false,
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent implements OnInit {
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private readonly loginService: LoginService,
    private readonly formBuilder: FormBuilder,
    private readonly requestTokenService: RequestTokenService,
    private readonly resetPasswordService: ResetPasswordService,
    public toastr: ToastrService
  ) {}
  userCredentials!: UserDto;
  formGroup!: FormGroup;
  isForgotPassword: boolean = false;
  isRequestToken: boolean = false;
  isResetPassword: boolean = false;
  requestTokenDto!: RequestTokenDto;
  resetPasswordDto!: ResetPasswordDto;
  isLoggedIn:boolean = false;

  ngOnInit(): void {
    this.createFormGroup();
    this.updateFormGroup();
    this.document.body.style.overflowY = 'hidden';

  }

  createFormGroup(): void {
    this.formGroup = this.formBuilder.group({
      email: [
        '',
        [Validators.required, Validators.maxLength(255), Validators.email],
      ],
      password: ['', [Validators.required, Validators.maxLength(255)]],
      confirmPassword: ['', [Validators.required, Validators.maxLength(255)]],
      token: ['', [Validators.required, Validators.maxLength(255)]],
    });
  }

  updateFormGroup(): void {
    this.formGroup = this.formBuilder.group({
      email: [
        '',
        [Validators.required, Validators.maxLength(255), Validators.email],
      ],
      password: ['', [Validators.required, Validators.maxLength(255)]],
      confirmPassword: ['', [Validators.required, Validators.maxLength(255)]],
      token: ['', [Validators.required, Validators.maxLength(255)]],
    });
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.formGroup.get(controlName);
    return !!(control && control.touched && control.hasError(errorType));
  }

  login() {
    const { token, ...userDtoWithoutToken } = this.formGroup.value;
    this.userCredentials = userDtoWithoutToken;

    this.loginService.create(this.userCredentials).subscribe({
      next: (data: LoginResponseDto) => {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userId', data.userId.toString());
        localStorage.setItem('role', data.role);
        this.toastr.success('You have successfully logged in', 'Welcome back!');
        this.formGroup.reset();
        this.isLoggedIn = true;

      },
      error: (error) => {
        this.toastr.error(
          error.error.description ?? 'Invalid credentials. Please try again.',
          'Login Failed'
        );
      },
    });
  }

  forgotPassword() {
    this.isResetPassword = true;
  }

  sendToken() {
    this.requestTokenDto = {
      email: this.formGroup.value.email,
    };
    console.log('test');
    this.requestTokenService.create(this.requestTokenDto).subscribe({
      next: (response) => {
        this.toastr.success(
          'All set! Check your email for the password reset code.',
          'Email Sent Successfully'
        );
        this.isForgotPassword = true;
        this.isResetPassword = false;
      },
      error: (error) => {
        this.toastr.error(error.error.description, 'Error');
      },
    });
  }

  resetPassword() {
    this.resetPasswordDto = {
      email: this.formGroup.value.email,
      token: this.formGroup.value.token,
      newPassword: this.formGroup.value.password,
    };

    this.resetPasswordService.create(this.resetPasswordDto).subscribe({
      next: (response) => {
        this.isForgotPassword = false;
        this.formGroup.reset();
        this.toastr.success(
          'Your password has been successfully updated!',
          'Password Changed'
        );
      },
      error: (error) => {
        this.toastr.error(error.error.description, 'Error');
      },
    });
  }
}
