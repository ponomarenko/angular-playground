import { Injectable } from '@angular/core';
import { GeoCalculationService } from './geo-calculation.service';
import * as L from 'leaflet';

export interface SafeCenterOptions {
  maxSpeed?: number;
  bbox?: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  historySize?: number;
}

@Injectable({
  providedIn: 'root',
})
export class SafeLeafletCenterService {
  private map!: L.Map;
  private maxSpeed: number = 50;
  private bbox: any = null;
  private historySize: number = 5;
  private lastCenter!: L.LatLng;
  private lastTime!: number;
  private history: L.LatLng[] = [];

  constructor(private geoCalculationService: GeoCalculationService) {}

  initialize(map: L.Map, options: SafeCenterOptions = {}) {
    this.map = map;
    this.maxSpeed = options.maxSpeed || 50;
    this.bbox = options.bbox || null;
    this.historySize = options.historySize || 5;
    this.lastCenter = map.getCenter();
    this.lastTime = Date.now();
    this.history = [this.lastCenter];
  }

  private medianCenter(): L.LatLng {
    const lats = this.history.map((p) => p.lat).sort((a, b) => a - b);
    const lngs = this.history.map((p) => p.lng).sort((a, b) => a - b);
    const mid = Math.floor(this.history.length / 2);
    return new L.LatLng(lats[mid], lngs[mid]);
  }

  private inBBox(lat: number, lng: number): boolean {
    if (!this.bbox) return true;
    return (
      lat >= this.bbox.minLat &&
      lat <= this.bbox.maxLat &&
      lng >= this.bbox.minLng &&
      lng <= this.bbox.maxLng
    );
  }

  setCenter(lat: number, lng: number): boolean {
    const now = Date.now();
    const dt = (now - this.lastTime) / 1000;
    const dist = this.geoCalculationService.haversine(
      this.lastCenter.lat,
      this.lastCenter.lng,
      lat,
      lng
    );
    const speed = dist / (dt || 1);

    if (!this.inBBox(lat, lng)) {
      console.warn('❌ Coordinate outside bbox');
      return false;
    }

    if (speed > this.maxSpeed) {
      console.warn(`❌ Suspicious speed: ${speed.toFixed(1)} m/s`);
      return false;
    }

    const median = this.medianCenter();
    const medianDist = this.geoCalculationService.haversine(median.lat, median.lng, lat, lng);
    if (medianDist > 200) {
      console.warn(
        `⚠️ Coordinate deviates from trend (${medianDist.toFixed(1)} m)`
      );
      return false;
    }

    this.map.setView([lat, lng]);
    this.lastCenter = new L.LatLng(lat, lng);
    this.lastTime = now;
    this.history.push(this.lastCenter);
    if (this.history.length > this.historySize) {
      this.history.shift();
    }
    return true;
  }
}
