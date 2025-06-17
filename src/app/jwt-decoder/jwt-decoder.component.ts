import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-jwt-decoder',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule
],
  templateUrl: './jwt-decoder.component.html',
  styleUrls: ['./jwt-decoder.component.scss']
})
export class JwtDecoderComponent {
  jwtToken: string = '';
  decodedHeader: string = '';
  decodedPayload: string = '';
  signature: string = '';
  verificationKey: string = '';
  isValid: boolean | null = null;

  constructor(
    private clipboard: Clipboard,
    private snackBar: MatSnackBar
  ) {}

  decodeToken() {
    try {
      const parts = this.jwtToken.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      this.decodedHeader = this.prettyPrint(this.base64UrlDecode(parts[0]));
      this.decodedPayload = this.prettyPrint(this.base64UrlDecode(parts[1]));
      this.signature = parts[2];
    } catch (error) {
      this.snackBar.open('Invalid JWT token format', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    }
  }

  private base64UrlDecode(input: string): string {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    return atob(base64 + padding);
  }

  private prettyPrint(json: string): string {
    try {
      return JSON.stringify(JSON.parse(json), null, 2);
    } catch {
      return json;
    }
  }

  copyToClipboard(text: string) {
    this.clipboard.copy(text);
    this.snackBar.open('Copied to clipboard!', 'Close', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  verifySignature() {
    // Implement JWT signature verification logic here
    // This would typically use a library like 'jsonwebtoken' or similar
    this.isValid = null; // Placeholder
  }

  clearAll() {
    this.jwtToken = '';
    this.decodedHeader = '';
    this.decodedPayload = '';
    this.signature = '';
    this.verificationKey = '';
    this.isValid = null;
  }
}
