// ==========================================================================
// GPS Geolocation Engine & Demo Drive Simulator
// ==========================================================================

import { APP_CONFIG } from './config.js';
import { store } from './state.js';
import { trip } from './trip.js';
import { mapController } from './map.js';

class GpsEngine {
  constructor() {
    this.watchId = null;
    this.wakeLock = null;
    this.lastLat = null;
    this.lastLon = null;
    this.lastTimestamp = null;
    
    // Simulation mode state
    this.simInterval = null;
    this.simIndex = 0;
    this.simRoute = this.generateDemoRoute();
  }

  // Start Real GPS Drive
  async startDrive() {
    if (store.getState().tracking) return;

    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by your browser.');
    }

    // Request screen wake lock
    await this.requestWakeLock();

    store.update({ tracking: true });
    trip.start();

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => this.handlePositionUpdate(pos),
      (err) => this.handlePositionError(err),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  }

  // Stop Real GPS Drive
  stopDrive() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    this.releaseWakeLock();

    this.lastLat = null;
    this.lastLon = null;

    store.update({
      tracking: false,
      hasGpsLock: false,
      currentSpeed: 0
    });

    trip.stop();
  }

  // Position update processing
  handlePositionUpdate(pos) {
    const { latitude: lat, longitude: lon, speed, heading, accuracy } = pos.coords;
    const now = pos.timestamp || Date.now();

    // Speed in KM/H (filtered)
    let kmh = speed !== null && speed !== undefined ? Math.max(0, speed * 3.6) : 0;

    // Heading calculation fallback if device compass heading is null
    let computedHeading = heading;
    if ((computedHeading === null || isNaN(computedHeading)) && this.lastLat !== null) {
      computedHeading = this.calculateBearing(this.lastLat, this.lastLon, lat, lon);
    }

    store.update({
      hasGpsLock: true,
      currentSpeed: Math.round(kmh),
      currentHeading: computedHeading,
      currentCoords: { lat, lon, accuracy }
    });

    // Update map marker
    mapController.updatePosition(lat, lon, computedHeading);

    // Calculate distance & deduct fuel if moving
    if (this.lastLat !== null && kmh >= APP_CONFIG.GPS.MIN_SPEED_KMH) {
      const distKm = this.getHaversineDistance(this.lastLat, this.lastLon, lat, lon);

      if (distKm >= APP_CONFIG.GPS.MIN_DISTANCE_KM && distKm <= APP_CONFIG.GPS.MAX_DISTANCE_JUMP_KM) {
        const burnedLiters = store.consumeFuelForDistance(distKm);
        trip.recordMovement(distKm, burnedLiters, kmh);
      }
    }

    this.lastLat = lat;
    this.lastLon = lon;
    this.lastTimestamp = now;
  }

  handlePositionError(err) {
    console.warn('GPS position error:', err.message);
    store.update({ hasGpsLock: false });
  }

  // Screen Wake Lock API
  async requestWakeLock() {
    if ('wakeLock' in navigator && store.getState().settings.wakeLockEnabled) {
      try {
        this.wakeLock = await navigator.wakeLock.request('screen');
        store.update({ wakeLockActive: true });
        this.wakeLock.addEventListener('release', () => {
          store.update({ wakeLockActive: false });
        });
      } catch (err) {
        console.warn('Wake Lock request error:', err);
      }
    }
  }

  releaseWakeLock() {
    if (this.wakeLock) {
      this.wakeLock.release().catch(() => {});
      this.wakeLock = null;
      store.update({ wakeLockActive: false });
    }
  }

  // Haversine formula for distance in kilometers
  getHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in KM
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Bearing in degrees
  calculateBearing(lat1, lon1, lat2, lon2) {
    const y = Math.sin((lon2 - lon1) * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
              Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos((lon2 - lon1) * Math.PI / 180);
    const brng = Math.atan2(y, x) * 180 / Math.PI;
    return (brng + 360) % 360;
  }

  // ==========================================================================
  // Demo / Simulation Mode (For Desktop & Testing Anywhere)
  // ==========================================================================
  generateDemoRoute() {
    // Scenic loop around Putrajaya / KL
    const startLat = 3.1390;
    const startLon = 101.6869;
    const points = [];
    const steps = 60;
    const radius = 0.015;

    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * 2 * Math.PI;
      const lat = startLat + radius * Math.cos(angle);
      const lon = startLon + radius * Math.sin(angle) * 1.5;
      const speed = 40 + Math.sin(angle * 3) * 25; // Speed varies dynamically 15 - 65 km/h
      points.push({ lat, lon, speed });
    }
    return points;
  }

  toggleSimulation() {
    const isSimulating = store.getState().simulating;

    if (!isSimulating) {
      if (store.getState().tracking) {
        this.stopDrive();
      }

      this.simIndex = 0;
      store.update({ simulating: true, tracking: true, hasGpsLock: true });
      trip.start();

      this.simInterval = setInterval(() => {
        const pt = this.simRoute[this.simIndex];
        const nextIdx = (this.simIndex + 1) % this.simRoute.length;
        const nextPt = this.simRoute[nextIdx];

        const heading = this.calculateBearing(pt.lat, pt.lon, nextPt.lat, nextPt.lon);

        this.handlePositionUpdate({
          coords: {
            latitude: pt.lat,
            longitude: pt.lon,
            speed: pt.speed / 3.6,
            heading: heading,
            accuracy: 4
          },
          timestamp: Date.now()
        });

        this.simIndex = nextIdx;
      }, APP_CONFIG.GPS.SIMULATION_INTERVAL_MS);

    } else {
      if (this.simInterval) {
        clearInterval(this.simInterval);
        this.simInterval = null;
      }

      store.update({ simulating: false, tracking: false, hasGpsLock: false, currentSpeed: 0 });
      trip.stop();
    }
  }
}

export const gpsEngine = new GpsEngine();
