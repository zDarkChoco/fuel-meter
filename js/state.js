// ==========================================================================
// Reactive State Management & LocalStorage Persistence
// ==========================================================================

import { APP_CONFIG } from './config.js';
import { sound } from './audio.js';

class StateStore {
  constructor() {
    this.listeners = new Map();
    this.state = {
      // Vehicle specs & fuel levels
      fuel: 25.0,
      tankMax: APP_CONFIG.DEFAULT_TANK_CAPACITY,
      eff: APP_CONFIG.DEFAULT_EFFICIENCY,
      selectedPrice: APP_CONFIG.PRICES.BUDI_DIESEL,
      
      // Tracking & Navigation
      tracking: false,
      simulating: false,
      wakeLockActive: false,
      hasGpsLock: false,
      currentSpeed: 0,
      currentHeading: 0,
      currentCoords: null,
      
      // User Settings
      settings: {
        soundEnabled: true,
        hapticEnabled: true,
        wakeLockEnabled: true,
        unit: 'metric'
      }
    };
  }

  init() {
    this.load();
  }

  load() {
    try {
      // Backwards compatible with legacy localStorage keys
      const savedFuel = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.FUEL);
      const savedTank = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TANK);
      const savedEff = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.EFFICIENCY);
      const savedPrice = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.PRICE);
      const savedSettings = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.SETTINGS);

      if (savedFuel !== null) this.state.fuel = Math.max(0, parseFloat(savedFuel));
      if (savedTank !== null) this.state.tankMax = Math.max(1, parseFloat(savedTank));
      if (savedEff !== null) this.state.eff = Math.max(0.1, parseFloat(savedEff));
      if (savedPrice !== null) this.state.selectedPrice = parseFloat(savedPrice);
      if (savedSettings !== null) {
        this.state.settings = { ...this.state.settings, ...JSON.parse(savedSettings) };
      }

      // Bound fuel within tank bounds
      if (this.state.fuel > this.state.tankMax) {
        this.state.fuel = this.state.tankMax;
      }

      sound.setEnabled(this.state.settings.soundEnabled);
    } catch (e) {
      console.warn('Failed to load state from localStorage:', e);
    }
  }

  save() {
    try {
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.FUEL, this.state.fuel.toFixed(4));
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.TANK, this.state.tankMax.toString());
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.EFFICIENCY, this.state.eff.toString());
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.PRICE, this.state.selectedPrice.toString());
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.SETTINGS, JSON.stringify(this.state.settings));
    } catch (e) {
      console.warn('Failed to persist state:', e);
    }
  }

  getState() {
    return { ...this.state };
  }

  update(partial, notify = true) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...partial };
    
    // Bounds check fuel
    if ('fuel' in partial || 'tankMax' in partial) {
      if (this.state.fuel < 0) this.state.fuel = 0;
      if (this.state.fuel > this.state.tankMax) this.state.fuel = this.state.tankMax;
    }

    this.save();

    if (notify) {
      this.notify(this.state, prevState);
    }
  }

  subscribe(keyOrFn, callback) {
    if (typeof keyOrFn === 'function') {
      const id = Symbol();
      this.listeners.set(id, keyOrFn);
      return () => this.listeners.delete(id);
    } else {
      const id = Symbol();
      this.listeners.set(id, (newState, oldState) => {
        if (newState[keyOrFn] !== oldState[keyOrFn]) {
          callback(newState[keyOrFn], oldState[keyOrFn]);
        }
      });
      return () => this.listeners.delete(id);
    }
  }

  notify(newState, oldState) {
    this.listeners.forEach((fn) => {
      try {
        fn(newState, oldState);
      } catch (e) {
        console.error('State subscriber error:', e);
      }
    });
  }

  // Deduct fuel for distance traveled in KM
  consumeFuelForDistance(distanceKm) {
    if (distanceKm <= 0 || this.state.eff <= 0) return 0;
    const burned = distanceKm / this.state.eff;
    const newFuel = Math.max(0, this.state.fuel - burned);
    this.update({ fuel: newFuel });
    return burned;
  }

  // Add fuel in Liters
  addFuelLiters(liters) {
    if (liters <= 0) return;
    const newFuel = Math.min(this.state.tankMax, this.state.fuel + liters);
    this.update({ fuel: newFuel });
    sound.playRefuelChime();
  }

  // Set tank to 100% capacity
  fillFullTank() {
    this.update({ fuel: this.state.tankMax });
    sound.playRefuelChime();
  }
}

export const store = new StateStore();
