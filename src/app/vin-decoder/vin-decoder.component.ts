import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { VinDecoderService, VinDecodingResult } from './vin-decoder.service';

@Component({
  selector: 'app-vin-decoder',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './vin-decoder.component.html',
  styleUrls: ['./vin-decoder.component.scss']
})
export class VinDecoderComponent implements OnDestroy {
  vinForm: FormGroup;
  decodedVin: VinDecodingResult | null = null;
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private vinDecoderService: VinDecoderService,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar
  ) {
    this.vinForm = this.fb.group({
      vinNumber: ['', [
        Validators.required,
        Validators.minLength(17),
        Validators.maxLength(17),
        this.vinPatternValidator
      ]]
    });

    // Auto-decode on input with debounce
    this.vinForm.get('vinNumber')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      if (value && value.trim().length === 17 && this.vinForm.get('vinNumber')?.valid) {
        this.decodeVin();
      } else if (!value || value.trim().length === 0) {
        this.decodedVin = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private vinPatternValidator(control: any) {
    if (!control.value) return null;

    const vinPattern = /^[A-HJ-NPR-Z0-9]{17}$/i;
    const isValid = vinPattern.test(control.value.trim().toUpperCase());

    return isValid ? null : { invalidVinPattern: true };
  }

  decodeVin(): void {
    const vinNumber = this.vinForm.get('vinNumber')?.value?.trim();

    if (!vinNumber) {
      this.showMessage('Please enter a VIN number');
      return;
    }

    if (this.vinForm.invalid) {
      this.showMessage('Please enter a valid VIN number');
      return;
    }

    this.isLoading = true;

    // Simulate async operation
    setTimeout(() => {
      this.decodedVin = this.vinDecoderService.decodeVin(vinNumber);
      this.isLoading = false;

      if (this.decodedVin?.errors?.length) {
        this.showMessage(this.decodedVin.errors.join('; '));
      } else if (this.decodedVin) {
        this.showMessage('VIN decoded successfully!');
      }
    }, 300);
  }

  copyToClipboard(text: string): void {
    if (this.clipboard.copy(text)) {
      this.showMessage('Copied to clipboard!');
    } else {
      this.showMessage('Failed to copy to clipboard');
    }
  }

  clearAll(): void {
    this.vinForm.reset();
    this.decodedVin = null;
  }

  get isValid(): boolean {
    return this.vinForm.valid && !this.isLoading;
  }

  get vinErrors(): string[] {
    const control = this.vinForm.get('vinNumber');
    const errors: string[] = [];

    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        errors.push('VIN is required');
      }
      if (control.errors['minlength'] || control.errors['maxlength']) {
        errors.push('VIN must be exactly 17 characters');
      }
      if (control.errors['invalidVinPattern']) {
        errors.push('Invalid VIN format. Only A-Z (except I, O, Q) and 0-9 are allowed');
      }
    }

    return errors;
  }

  get hasValidResult(): boolean {
    return !!(this.decodedVin && !this.decodedVin.errors?.length);
  }

  get hasErrors(): boolean {
    return !!(this.decodedVin?.errors?.length);
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}
