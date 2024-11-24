import { Routes } from '@angular/router';
import { UuidComponent } from './uuid/uuid.component';
import { UrlEncoderComponent } from './url-encoder/url-encoder.component';
import { IpLocationComponent } from './ip-location/ip-location.component';

export const routes: Routes = [
  { path: 'uuid', component: UuidComponent },
  { path: 'url-encoder', component: UrlEncoderComponent },
  { path: 'ip-location', component: IpLocationComponent },
];
