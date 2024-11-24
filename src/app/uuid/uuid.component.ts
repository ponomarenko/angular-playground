import { Component } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatOptionModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
    selector: 'app-uuid',
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatTooltipModule,
        MatButtonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatOptionModule,
        MatExpansionModule
    ],
    templateUrl: './uuid.component.html',
    styleUrl: './uuid.component.scss'
})
export class UuidComponent {
  private readonly uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  uuid = new FormControl('', [
    Validators.required,
    Validators.pattern(this.uuidRegex)
  ]);

  uuidVersion = new FormControl('4');

  constructor(
    private clipboard: Clipboard,
    private snackBar: MatSnackBar
  ) {
    this.generateUUID();
  }

  generateUUID(): void {
    const version = this.uuidVersion.value;
    switch (version) {
      case '1':
        // Implement v1 generation
        break;
      case '3':
        // Implement v3 generation
        break;
      case '4':
        this.uuid.setValue(uuidv4());
        break;
      case '5':
        // Implement v5 generation
        break;
    }
  }

  copyUUID(): void {
    if (this.uuid.valid && this.uuid.value) {
      this.clipboard.copy(this.uuid.value);
      this.snackBar.open('UUID copied to clipboard!', 'Close', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    }
  }

  getUUIDVersion(): string {
    if (!this.uuid.value) return 'N/A';
    const uuid = this.uuid.value;
    const version = uuid.charAt(14);
    return `UUID version ${version}`;
  }

  getUUIDVariant(): string {
    if (!this.uuid.value) return 'N/A';
    const uuid = this.uuid.value;
    const variantBit = parseInt(uuid.charAt(19), 16);
    if (variantBit >= 8 && variantBit <= 11) return 'RFC 4122/DCE 1.1';
    if (variantBit >= 12 && variantBit <= 15) return 'Reserved, Microsoft Corporation';
    if (variantBit >= 0 && variantBit <= 7) return 'NCS backward compatibility';
    return 'Reserved, future definition';
  }

  canBeNormalized(): boolean {
    if (!this.uuid.value) return false;
    const cleanValue = this.uuid.value.replace(/[^0-9a-fA-F]/g, '');
    return cleanValue.length === 32;
  }

  normalizeUUID() {
    if (!this.canBeNormalized() || !this.uuid.value) return;

    let value = this.uuid.value.replace(/[^0-9a-fA-F]/g, '');
    value = value.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
    this.uuid.setValue(value.toLowerCase());
  }

  getStandardFormat(): string {
    return this.uuid.valid ? this.uuid.value ?? 'N/A' : 'N/A';
  }

  getIntegerValue(): string {
    return this.uuid.valid ? 'Conversion implementation needed' : 'N/A';
  }

  getVersionDescription(): string {
    return this.uuid.valid ? `${this.getUUIDVersion()} (random data based)` : 'N/A';
  }

  getVariantDescription(): string {
    return this.uuid.valid ? 'DCE 1.1, ISO/IEC 11578:1996' : 'N/A';
  }

  getHexContents(): string {
    if (!this.uuid.valid || !this.uuid.value) return 'N/A';
    const uuid = this.uuid.value.replace(/-/g, '');
    const pairs = uuid.match(/.{2}/g);
    return pairs ? pairs.join(':') : 'N/A';
  }

  getUUIDContents(): string {
    if (!this.uuid.valid || !this.uuid.value) return 'N/A';
    const hexPairs = this.uuid.value.replace(/-/g, '').match(/.{2}/g);
    return hexPairs ? hexPairs.join(':').toUpperCase() : 'N/A';
  }

  getTimeBits(): string {
    if (!this.uuid.valid || !this.uuid.value) return 'N/A';
    // Parse and return time bits based on UUID version
    return 'Time bits extraction logic';
  }

  getClockSequence(): string {
    if (!this.uuid.valid || !this.uuid.value) return 'N/A';
    // Parse and return clock sequence
    return 'Clock sequence extraction logic';
  }

  getNodeId(): string {
    if (!this.uuid.valid) return '';
    // Parse and return node ID
    return 'Node ID extraction logic';
  }
}
