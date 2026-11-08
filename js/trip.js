// ==========================================================================
// Trip Computer & History Logger
// ==========================================================================

import { APP_CONFIG } from './config.js';

class TripComputer {
  constructor() {
    this.distance = 0;      // KM
    this.fuelBurned = 0;    // Liters
    this.startTime = null;  // Date timestamp
    this.elapsedSeconds = 0;
    this.maxSpeed = 0;      // KM/H
    this.speedSamples = [];
    this.timerInterval = null;
  }

  start() {
    this.startTime = Date.now();
    if (!this.timerInterval) {
      this.timerInterval = setInterval(() => {
        if (this.startTime) {
          this.elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
        }
      }, 1000);
    }
  }

  stop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  reset() {
    this.distance = 0;
    this.fuelBurned = 0;
    this.startTime = Date.now();
    this.elapsedSeconds = 0;
    this.maxSpeed = 0;
    this.speedSamples = [];
  }

  recordMovement(distKm, fuelLiters, currentSpeedKmh) {
    if (distKm > 0) this.distance += distKm;
    if (fuelLiters > 0) this.fuelBurned += fuelLiters;
    
    if (currentSpeedKmh > this.maxSpeed) {
      this.maxSpeed = currentSpeedKmh;
    }
    if (currentSpeedKmh > 1) {
      this.speedSamples.push(currentSpeedKmh);
      if (this.speedSamples.length > 300) {
        this.speedSamples.shift();
      }
    }
  }

  getAverageSpeed() {
    if (this.speedSamples.length === 0) return 0;
    const sum = this.speedSamples.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.speedSamples.length);
  }

  getFormattedTime() {
    const s = this.elapsedSeconds % 60;
    const m = Math.floor((this.elapsedSeconds / 60) % 60);
    const h = Math.floor(this.elapsedSeconds / 3600);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  getStats() {
    return {
      distance: this.distance.toFixed(1),
      fuelBurned: this.fuelBurned.toFixed(2),
      formattedTime: this.getFormattedTime(),
      avgSpeed: this.getAverageSpeed(),
      maxSpeed: Math.round(this.maxSpeed)
    };
  }

  // Refuel Log Management
  static logRefuel(liters, amountRM, pricePerLiter) {
    try {
      const logs = TripComputer.getRefuelLogs();
      logs.unshift({
        id: Date.now(),
        date: new Date().toLocaleString(),
        liters: parseFloat(liters.toFixed(2)),
        amountRM: parseFloat(amountRM.toFixed(2)),
        pricePerLiter: parseFloat(pricePerLiter.toFixed(2))
      });
      // Keep last 30 logs
      if (logs.length > 30) logs.pop();
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.REFUEL_LOG, JSON.stringify(logs));
    } catch (e) {
      console.warn('Could not save refuel log:', e);
    }
  }

  static getRefuelLogs() {
    try {
      const saved = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.REFUEL_LOG);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }
}

export const trip = new TripComputer();
