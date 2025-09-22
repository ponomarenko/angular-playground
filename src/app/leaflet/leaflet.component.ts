import { AfterViewInit, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SafeLeafletCenterService } from '../services/safe-leaflet-center.service';
import * as L from 'leaflet';

interface DetectionAlert {
  timestamp: Date;
  message: string;
  severity: 'low' | 'medium' | 'high';
  data?: any;
}

interface LocationData {
  lat: number;
  lng: number;
  timestamp: Date;
  accuracy: number;
  speed?: number;
}

@Component({
  selector: 'app-leaflet',
  templateUrl: './leaflet.component.html',
  styleUrls: ['./leaflet.component.scss'],
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  providers: [SafeLeafletCenterService],
})
export class LeafletComponent implements AfterViewInit {
  markers: L.Marker[] = [
    L.marker([23.7771, 90.3994]), // Dhaka, Bangladesh
  ];
  // GPS Testing Overlay Properties
  currentLocation = { lat: 23.7771, lng: 90.3994 };
  gpsAccuracy = 5;
  currentSpeed = 0;
  spoofingRiskLevel: 'low' | 'medium' | 'high' = 'low';
  // Simulation Controls
  simulatedLat = 23.7771;
  simulatedLng = 90.3994;
  simulatedSpeed = 0;
  simulatedAccuracy = 5;
  // Detection Data
  detectionAlerts: DetectionAlert[] = [];
  locationHistory: LocationData[] = [];
  isSimulationMode = false;
  private map!: L.Map;
  // Tracking markers
  private currentLocationMarker?: L.Marker;
  private simulatedLocationMarker?: L.Marker;

  constructor(
    private safeCenterService: SafeLeafletCenterService
  ) {
  }

  ngAfterViewInit(): void {
    this.map = L.map('map').setView(
      [this.currentLocation.lat, this.currentLocation.lng],
      13
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.map.whenReady(() => {
      // Initialize safe center service
      this.safeCenterService.initialize(this.map, {
        maxSpeed: 50,
        bbox: {
          minLat: 44.3, // Ukraine bounds
          maxLat: 52.3,
          minLng: 22.1,
          maxLng: 40.2,
        },
        historySize: 5,
      });
      this.centerMap();
      this.startGPSMonitoring();
    });
  }

  applySimulatedLocation() {
    this.isSimulationMode = true;
    this.currentLocation = {
      lat: this.simulatedLat,
      lng: this.simulatedLng,
    };
    this.gpsAccuracy = this.simulatedAccuracy;
    this.currentSpeed = this.simulatedSpeed;

    this.addLocationToHistory({
      lat: this.simulatedLat,
      lng: this.simulatedLng,
      timestamp: new Date(),
      accuracy: this.simulatedAccuracy,
      speed: this.simulatedSpeed,
    });

    this.updateSimulatedLocationMarker();
    this.safeCenterService.setCenter(this.simulatedLat, this.simulatedLng);

    this.addAlert({
      timestamp: new Date(),
      message: `Manual location set: ${this.simulatedLat.toFixed(
        6
      )}, ${this.simulatedLng.toFixed(6)}`,
      severity: 'low',
      data: { lat: this.simulatedLat, lng: this.simulatedLng },
    });
  }

  simulateScenario(scenario: string) {
    const currentLat = this.currentLocation.lat;
    const currentLng = this.currentLocation.lng;

    switch (scenario) {
      case 'teleport':
        // Jump to a distant location instantly
        this.simulatedLat = currentLat + 0.1; // ~11km jump
        this.simulatedLng = currentLng + 0.1;
        this.simulatedSpeed = 0;
        this.simulatedAccuracy = 3;
        this.applySimulatedLocation();

        setTimeout(() => {
          this.addAlert({
            timestamp: new Date(),
            message: 'Teleport scenario: Instant location jump of ~15km',
            severity: 'high',
            data: { scenario: 'teleport' },
          });
        }, 100);
        break;

      case 'impossible-speed':
        // Move at impossible speed
        this.simulatedLat = currentLat + 0.01; // ~1km
        this.simulatedLng = currentLng + 0.01;
        this.simulatedSpeed = 500; // 500 km/h - impossible for ground vehicle
        this.simulatedAccuracy = 2;
        this.applySimulatedLocation();

        setTimeout(() => {
          this.addAlert({
            timestamp: new Date(),
            message: 'Speed scenario: Vehicle moving at 500 km/h',
            severity: 'high',
            data: { scenario: 'impossible-speed', speed: 500 },
          });
        }, 100);
        break;

      case 'signal-jump':
        // Simulate GPS signal jumping between positions
        const jumpDistance = 0.005; // ~500m
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            this.simulatedLat =
              currentLat + (Math.random() - 0.5) * jumpDistance;
            this.simulatedLng =
              currentLng + (Math.random() - 0.5) * jumpDistance;
            this.simulatedAccuracy = 25 + Math.random() * 25; // Poor accuracy
            this.applySimulatedLocation();
          }, i * 1000);
        }

        setTimeout(() => {
          this.addAlert({
            timestamp: new Date(),
            message:
              'Signal jump scenario: Erratic GPS signal with poor accuracy',
            severity: 'medium',
            data: { scenario: 'signal-jump' },
          });
        }, 100);
        break;

      case 'indoor-outdoor':
        // Simulate indoor/outdoor accuracy changes
        this.simulatedLat = currentLat + 0.001;
        this.simulatedLng = currentLng + 0.001;
        this.simulatedSpeed = 5; // Walking speed
        this.simulatedAccuracy = 65; // Indoor accuracy
        this.applySimulatedLocation();

        // Then improve to outdoor accuracy
        setTimeout(() => {
          this.simulatedAccuracy = 3;
          this.applySimulatedLocation();
        }, 3000);

        setTimeout(() => {
          this.addAlert({
            timestamp: new Date(),
            message:
              'Indoor/Outdoor scenario: Accuracy changed from ±65m to ±3m',
            severity: 'low',
            data: { scenario: 'indoor-outdoor' },
          });
        }, 100);
        break;
    }
  }

  resetToRealGPS() {
    this.isSimulationMode = false;

    if (this.simulatedLocationMarker) {
      this.map.removeLayer(this.simulatedLocationMarker);
      this.simulatedLocationMarker = undefined;
    }

    // Reset to original location
    this.currentLocation = { lat: 23.7771, lng: 90.3994 };
    this.gpsAccuracy = 5;
    this.currentSpeed = 0;
    this.spoofingRiskLevel = 'low';

    this.updateCurrentLocationMarker();
    this.safeCenterService.setCenter(
      this.currentLocation.lat,
      this.currentLocation.lng
    );

    this.addAlert({
      timestamp: new Date(),
      message: 'GPS simulation reset - back to real GPS mode',
      severity: 'low',
      data: { action: 'reset' },
    });
  }

  clearAlerts() {
    this.detectionAlerts = [];
    this.spoofingRiskLevel = 'low';
  }

  exportTestData() {
    const exportData = {
      timestamp: new Date().toISOString(),
      currentLocation: this.currentLocation,
      locationHistory: this.locationHistory.slice(-20), // Last 20 locations
      detectionAlerts: this.detectionAlerts.slice(0, 10), // Last 10 alerts
      spoofingRiskLevel: this.spoofingRiskLevel,
      testSession: {
        isSimulationMode: this.isSimulationMode,
        simulatedLocation: {
          lat: this.simulatedLat,
          lng: this.simulatedLng,
          speed: this.simulatedSpeed,
          accuracy: this.simulatedAccuracy,
        },
      },
    };

    // Create and download JSON file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gps-test-data-${new Date()
      .toISOString()
      .slice(0, 19)}.json`;
    link.click();
    URL.revokeObjectURL(url);

    this.addAlert({
      timestamp: new Date(),
      message: 'Test data exported successfully',
      severity: 'low',
      data: { action: 'export', recordCount: this.locationHistory.length },
    });
  }

  private centerMap() {
    // Create a boundary based on the markers
    const bounds = L.latLngBounds(
      this.markers.map((marker) => marker.getLatLng())
    );

    // Fit the map into the boundary
    this.map.fitBounds(bounds);
  }

  private startGPSMonitoring() {
    // Simulate GPS monitoring
    setInterval(() => {
      if (!this.isSimulationMode) {
        this.updateRealGPS();
      }
      this.analyzeForSpoofing();
    }, 2000);
  }

  private updateRealGPS() {
    // Simulate real GPS updates (in real app, this would use geolocation API)
    const variation = 0.0001;
    this.currentLocation = {
      lat: this.currentLocation.lat + (Math.random() - 0.5) * variation,
      lng: this.currentLocation.lng + (Math.random() - 0.5) * variation,
    };
    this.gpsAccuracy = 3 + Math.random() * 7;
    this.currentSpeed = Math.random() * 60;

    this.addLocationToHistory({
      lat: this.currentLocation.lat,
      lng: this.currentLocation.lng,
      timestamp: new Date(),
      accuracy: this.gpsAccuracy,
      speed: this.currentSpeed,
    });

    this.updateCurrentLocationMarker();
  }

  private updateCurrentLocationMarker() {
    if (this.currentLocationMarker) {
      this.map.removeLayer(this.currentLocationMarker);
    }

    const icon = L.divIcon({
      html: '<div style="background: #007bff; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px rgba(0,123,255,0.5);"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      className: 'current-location-marker',
    });

    this.currentLocationMarker = L.marker(
      [this.currentLocation.lat, this.currentLocation.lng],
      { icon }
    )
      .bindPopup(
        `Current Location<br>Accuracy: ±${this.gpsAccuracy.toFixed(
          1
        )}m<br>Speed: ${this.currentSpeed.toFixed(1)} km/h`
      )
      .addTo(this.map);
  }

  private analyzeForSpoofing() {
    if (this.locationHistory.length < 2) return;

    const recent = this.locationHistory.slice(-2);
    const [prev, current] = recent;

    // Calculate speed between points
    const distance = this.calculateDistance(
      prev.lat,
      prev.lng,
      current.lat,
      current.lng
    );
    const timeDiff =
      (current.timestamp.getTime() - prev.timestamp.getTime()) / 1000; // seconds
    const calculatedSpeed = (distance / timeDiff) * 3.6; // km/h

    // Detection algorithms
    this.detectImpossibleSpeed(calculatedSpeed);
    this.detectTeleportation(distance, timeDiff);
    this.detectAccuracyAnomalies(current.accuracy);
    this.detectSignalPatterns();

    this.updateRiskLevel();
  }

  private detectImpossibleSpeed(speed: number) {
    const maxReasonableSpeed = 120; // km/h

    if (speed > maxReasonableSpeed) {
      this.addAlert({
        timestamp: new Date(),
        message: `Impossible speed detected: ${speed.toFixed(1)} km/h`,
        severity: 'high',
        data: { speed, threshold: maxReasonableSpeed },
      });
    }
  }

  private detectTeleportation(distance: number, timeDiff: number) {
    const minTimeForDistance = distance / 33.33; // assuming max 120 km/h

    if (timeDiff < minTimeForDistance && distance > 100) {
      this.addAlert({
        timestamp: new Date(),
        message: `Possible teleportation: ${distance.toFixed(
          0
        )}m in ${timeDiff.toFixed(1)}s`,
        severity: 'high',
        data: { distance, timeDiff },
      });
    }
  }

  private detectAccuracyAnomalies(accuracy: number) {
    if (accuracy > 50) {
      this.addAlert({
        timestamp: new Date(),
        message: `Poor GPS accuracy: ±${accuracy.toFixed(1)}m`,
        severity: 'medium',
        data: { accuracy },
      });
    }
  }

  private detectSignalPatterns() {
    if (this.locationHistory.length < 5) return;

    const recent = this.locationHistory.slice(-5);
    const accuracies = recent.map((l) => l.accuracy);
    const avgAccuracy =
      accuracies.reduce((a, b) => a + b, 0) / accuracies.length;

    // Check for suspiciously consistent accuracy
    const variance =
      accuracies.reduce((sum, acc) => sum + Math.pow(acc - avgAccuracy, 2), 0) /
      accuracies.length;

    if (variance < 0.1 && avgAccuracy < 3) {
      this.addAlert({
        timestamp: new Date(),
        message: 'Suspiciously consistent GPS accuracy detected',
        severity: 'medium',
        data: { variance, avgAccuracy },
      });
    }
  }

  private updateRiskLevel() {
    const recentAlerts = this.detectionAlerts.filter(
      (a) => new Date().getTime() - a.timestamp.getTime() < 60000 // Last minute
    );

    const highAlerts = recentAlerts.filter((a) => a.severity === 'high').length;
    const mediumAlerts = recentAlerts.filter(
      (a) => a.severity === 'medium'
    ).length;

    if (highAlerts > 0) {
      this.spoofingRiskLevel = 'high';
    } else if (mediumAlerts > 2) {
      this.spoofingRiskLevel = 'medium';
    } else {
      this.spoofingRiskLevel = 'low';
    }
  }

  private addAlert(alert: DetectionAlert) {
    this.detectionAlerts.unshift(alert);
    // Keep only last 50 alerts
    if (this.detectionAlerts.length > 50) {
      this.detectionAlerts = this.detectionAlerts.slice(0, 50);
    }
  }

  private addLocationToHistory(location: LocationData) {
    this.locationHistory.push(location);
    // Keep only last 100 locations
    if (this.locationHistory.length > 100) {
      this.locationHistory = this.locationHistory.slice(-100);
    }
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  private updateSimulatedLocationMarker() {
    if (this.simulatedLocationMarker) {
      this.map.removeLayer(this.simulatedLocationMarker);
    }

    const icon = L.divIcon({
      html: '<div style="background: #dc3545; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px rgba(220,53,69,0.5);"></div>',
      iconSize: [18, 18],
      iconAnchor: [9, 9],
      className: 'simulated-location-marker',
    });

    this.simulatedLocationMarker = L.marker(
      [this.simulatedLat, this.simulatedLng],
      { icon }
    )
      .bindPopup(
        `Simulated Location<br>Accuracy: ±${this.simulatedAccuracy}m<br>Speed: ${this.simulatedSpeed} km/h`
      )
      .addTo(this.map);
  }
}
