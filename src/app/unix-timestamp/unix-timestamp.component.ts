import { Component, OnInit } from '@angular/core';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';

interface DateFormat {
  label: string;
  value: string;
}

@Component({
  selector: 'app-unix-timestamp',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    FormsModule
],
  templateUrl: './unix-timestamp.component.html',
  styleUrls: ['./unix-timestamp.component.scss']
})
export class UnixTimestampComponent implements OnInit {
  inputTimestamp: string = '';
  displayedTimestamp: number = 0;
  dateFormats: DateFormat[] = [];
  private currentDate: Date = new Date();

  constructor(
    private clipboard: Clipboard,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.updateCurrentTime();
    setInterval(() => this.updateCurrentTime(), 1000);
  }

  updateCurrentTime() {
    this.currentDate = new Date();
    if (!this.inputTimestamp) {
      this.displayedTimestamp = Math.floor(Date.now() / 1000);
      this.updateDateFormats(this.currentDate);
    }
  }

  convertTimestamp() {
    if (!this.inputTimestamp) {
      this.updateCurrentTime();
      return;
    }

    const parsed = this.parseTimestamp(this.inputTimestamp);
    if (parsed) {
      const date = new Date(parsed);
      this.displayedTimestamp = Math.floor(parsed / 1000);
      this.updateDateFormats(date);
    }
  }

  parseTimestamp(input: string): number | null {
    const num = Number(input.trim());
    if (isNaN(num)) return null;

    // Convert to milliseconds based on input length
    if (num < 1e11) { // seconds
      return num * 1000;
    } else if (num < 1e14) { // milliseconds
      return num;
    } else if (num < 1e17) { // microseconds
      return num / 1000;
    } else { // nanoseconds
      return num / 1e6;
    }
  }

  updateDateFormats(date: Date) {
    this.dateFormats = [
      { label: 'GMT', value: date.toUTCString() },
      { label: 'Local', value: date.toString() },
      { label: 'Relative', value: this.getRelativeTime(date) },
      { label: 'UTC', value: this.getSimpleUTCDate(date) },
      { label: 'ISO 8601', value: this.getISODate(date) },
      { label: 'RFC 822', value: this.getRFC822Date(date) },
      { label: 'RFC 2822', value: this.getRFC2822Date(date) },
      { label: 'RFC 3339', value: this.getRFC3339Date(date) }
    ];
  }

  private getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 120) return 'a minute ago';
    if (diffInSeconds < 3600) return Math.floor(diffInSeconds / 60) + ' minutes ago';
    if (diffInSeconds < 7200) return 'an hour ago';
    if (diffInSeconds < 86400) return Math.floor(diffInSeconds / 3600) + ' hours ago';
    if (diffInSeconds < 172800) return 'a day ago';
    if (diffInSeconds < 604800) return Math.floor(diffInSeconds / 86400) + ' days ago';
    if (diffInSeconds < 1209600) return 'a week ago';
    return Math.floor(diffInSeconds / 604800) + ' weeks ago';
  }

  clearInput() {
    this.inputTimestamp = '';
    this.convertTimestamp();
  }

  copyToClipboard(text: string) {
    this.clipboard.copy(text);
    this.snackBar.open('Copied to clipboard!', 'Close', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  getRFC822Date(date: Date): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return `${days[date.getUTCDay()]}, ${String(date.getUTCDate()).padStart(2, '0')} ${
      months[date.getUTCMonth()]} ${date.getUTCFullYear()} ${
      String(date.getUTCHours()).padStart(2, '0')}:${
      String(date.getUTCMinutes()).padStart(2, '0')}:${
      String(date.getUTCSeconds()).padStart(2, '0')} +0000`;
  }

  getRFC2822Date(date: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return `${days[date.getUTCDay()]}, ${String(date.getUTCDate()).padStart(2, '0')}-${
      months[date.getUTCMonth()]}-${date.getUTCFullYear().toString().slice(-2)} ${
      String(date.getUTCHours()).padStart(2, '0')}:${
      String(date.getUTCMinutes()).padStart(2, '0')}:${
      String(date.getUTCSeconds()).padStart(2, '0')} UTC`;
  }

  getISODate(date: Date): string {
    return date.toISOString();
  }

  getRFC3339Date(date: Date): string {
    return date.toISOString();
  }

  getSimpleUTCDate(date: Date): string {
    return `${String(date.getUTCDate()).padStart(2, '0')}/${
      String(date.getUTCMonth() + 1).padStart(2, '0')}/${
      date.getUTCFullYear()} @ ${
      date.getUTCHours() % 12 || 12}:${
      String(date.getUTCMinutes()).padStart(2, '0')}${
      date.getUTCHours() >= 12 ? 'pm' : 'am'}\tUTC`;
  }
}
