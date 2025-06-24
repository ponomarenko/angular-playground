import { Routes } from '@angular/router';
import { UuidComponent } from './uuid/uuid.component';
import { UrlEncoderComponent } from './url-encoder/url-encoder.component';
import { IpLocationComponent } from './ip-location/ip-location.component';
import { UnixTimestampComponent } from './unix-timestamp/unix-timestamp.component';
import { JwtDecoderComponent } from './jwt-decoder/jwt-decoder.component';
import { VinDecoderComponent } from './vin-decoder/vin-decoder.component';

export const routes: Routes = [
  { path: 'uuid', component: UuidComponent },
  { path: 'url-encoder', component: UrlEncoderComponent },
  { path: 'ip-location', component: IpLocationComponent },
  { path: 'unix-timestamp', component: UnixTimestampComponent },
  { path: 'jwt-decoder', component: JwtDecoderComponent },
  { path: 'vin-decoder', component: VinDecoderComponent },
];
