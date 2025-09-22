import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface NavigationItem {
  path: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  readonly navigationItems: NavigationItem[] = [
    { path: '/uuid', label: 'UUID Generator' },
    { path: '/url-encoder', label: 'URL Encoder' },
    { path: '/ip-location', label: 'IP Location' },
    { path: '/unix-timestamp', label: 'Unix Timestamp' },
    { path: '/jwt-decoder', label: 'JWT Decoder' },
    { path: '/vin-decoder', label: 'VIN Decoder' },
    { path: '/leaflet', label: 'Leaflet' }
  ];
}
