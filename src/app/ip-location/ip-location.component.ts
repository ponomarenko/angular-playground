import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { HttpClient } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface IpInfo {
  ip: string;
  city: string;
  region: string;
  country: string;
  loc: string;
  org: string;
  postal: string;
  timezone: string;
}

@Component({
  selector: 'app-ip-location',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './ip-location.component.html',
  styleUrls: ['./ip-location.component.scss']
})
export class IpLocationComponent implements OnInit {
  public readonly API_BASE_URL = 'https://ipinfo.io';
  private readonly API_TOKEN = '93b59d811e1b5f';

  ipAddress: string = '';
  ipInfo: IpInfo | null = null;
  loading: boolean = false;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getCurrentIp();
  }

  getCurrentIp() {
    this.loading = true;
    this.error = null;
    this.http.get<IpInfo>(`${this.API_BASE_URL}/json?token=${this.API_TOKEN}`)
      .subscribe({
        next: (data) => {
          this.ipInfo = data;
          this.ipAddress = data.ip;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to fetch IP information';
          this.loading = false;
        }
      });
  }

  lookupIp() {
    if (!this.ipAddress) return;

    this.loading = true;
    this.error = null;
    this.http.get<IpInfo>(`${this.API_BASE_URL}/${this.ipAddress}/json?token=${this.API_TOKEN}`)
      .subscribe({
        next: (data) => {
          this.ipInfo = data;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to fetch IP information';
          this.loading = false;
        }
      });
  }
}
