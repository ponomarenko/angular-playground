import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-url-encoder',
    imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
],
    templateUrl: './url-encoder.component.html',
    styleUrl: './url-encoder.component.scss'
})
export class UrlEncoderComponent {
  inputText: string = '';
  encodedText: string = '';
  decodedText: string = '';

  encodeUrl() {
    this.encodedText = encodeURIComponent(this.inputText);
  }

  decodeUrl() {
    try {
      this.decodedText = decodeURIComponent(this.inputText);
    } catch (e) {
      this.decodedText = 'Invalid URL encoding';
    }
  }

  clearInput(): void {
    this.inputText = '';
  }

  clearAll(): void {
    this.inputText = '';
    this.encodedText = '';
    this.decodedText = '';
  }

  async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }
}
