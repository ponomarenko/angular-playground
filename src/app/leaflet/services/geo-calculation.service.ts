import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GeoCalculationService {
  readonly earthRadiusKm = 6371;

  /**
   * Haversine formula to calculate the distance between two lat/lng points in kilometers.
   * Reference: https://en.wikipedia.org/wiki/Haversine_formula
   */
  public haversine(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return this.earthRadiusKm * c;
  }
}
