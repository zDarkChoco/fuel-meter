// ==========================================================================
// Master Application Coordinator & Bootstrapper
// ==========================================================================

import { APP_CONFIG } from './config.js';
import { store } from './state.js';
import { sound } from './audio.js';
import { gpsEngine } from './gps.js';
import { mapController } from './map.js';
import { refuelCalc } from './calculator.js';
import { trip } from './trip.js';
import { ui } from './ui.js';
import { pwa } from './pwa.js';

class Application {
  constructor() {
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;

    console.log(`Starting ${APP_CONFIG.APP_NAME} v${APP_CONFIG.VERSION}`);

    // 1. Initialize State & Audio
    store.init();

    // 2. Initialize Leaflet Map
    mapController.init('map');

    // 3. Initialize UI & Bindings
    ui.init();

    // 4. Initialize PWA Service Worker & Chrome Install hook
    pwa.init();

    // 5. Bind Global Action Dispatchers
    this.bindGlobalActions();

    // 6. Check URL query parameters (e.g. ?action=drive or ?action=refuel from PWA shortcuts)
    this.handleUrlActions();

    // Show initial welcome toast
    setTimeout(() => {
      ui.showToast('HUD Ready. Tap START DRIVE or 🎮 for Demo', '🚗');
    }, 600);
  }

  bindGlobalActions() {
    // Primary Drive Button Toggle
    window.toggleDrive = async () => {
      ui.vibrate(20);
      sound.playClick();
      const state = store.getState();

      if (state.simulating) {
        gpsEngine.toggleSimulation();
        return;
      }

      if (!state.tracking) {
        try {
          await gpsEngine.startDrive();
          ui.showToast('GPS Tracking Active', '📍');
        } catch (err) {
          ui.showToast(err.message || 'GPS Access Denied', '⚠️');
        }
      } else {
        gpsEngine.stopDrive();
        ui.showToast('Drive Ended', '⏹️');
      }
    };

    // Toggle Demo / Simulation Mode
    window.toggleSimulation = () => {
      ui.vibrate(15);
      sound.playClick();
      gpsEngine.toggleSimulation();
      const isSim = store.getState().simulating;
      ui.showToast(isSim ? 'Demo Driving Simulation Started' : 'Demo Mode Stopped', isSim ? '🎮' : '⏹️');
    };

    // Recenter Map
    window.recenterMap = () => {
      ui.vibrate(10);
      sound.playClick();
      mapController.recenter();
      ui.showToast('Map Centered on Vehicle', '🧭');
    };

    // Modal Triggers
    window.openModal = (id) => ui.openModal(id);
    window.closeModal = (id) => ui.closeModal(id);

    // Fuel Price Rate Selection
    window.selectPrice = (rate, element) => {
      ui.vibrate(10);
      sound.playClick();
      refuelCalc.setPriceRate(rate);

      document.querySelectorAll('.price-pill-btn').forEach((btn) => btn.classList.remove('selected'));
      if (element) element.classList.add('selected');

      ui.updateRefuelPreview();
    };

    // Confirm Refuel Payment
    window.confirmRefuel = () => {
      ui.vibrate(25);
      const liters = refuelCalc.confirmRefuel();
      if (liters > 0) {
        ui.closeModal('refuelModal');
        ui.showToast(`Added ${liters.toFixed(1)} L to Fuel Tank!`, '⛽');
      } else {
        ui.showToast('Please enter an amount in RM', '⚠️');
      }
    };

    // Full Tank Sync
    window.confirmFullTank = () => {
      ui.vibrate(25);
      if (confirm('Confirm reset to 100% Full Tank capacity?')) {
        store.fillFullTank();
        ui.closeModal('refuelModal');
        ui.showToast(`Tank filled to ${store.getState().tankMax} L`, '🎉');
      }
    };

    // Save Settings
    window.saveSettings = () => {
      ui.vibrate(15);
      sound.playClick();

      const tank = parseFloat(document.getElementById('confTank').value);
      const eff = parseFloat(document.getElementById('confEff').value);
      const soundEnabled = document.getElementById('switchSound').checked;
      const wakeLockEnabled = document.getElementById('switchWake').checked;
      const hapticEnabled = document.getElementById('switchHaptic').checked;

      if (tank > 0 && eff > 0) {
        store.update({
          tankMax: tank,
          eff: eff,
          settings: {
            soundEnabled,
            wakeLockEnabled,
            hapticEnabled,
            unit: 'metric'
          }
        });
        sound.setEnabled(soundEnabled);
        ui.closeModal('configModal');
        ui.showToast('Settings Saved', '✅');
      } else {
        ui.showToast('Please enter valid positive numbers', '⚠️');
      }
    };

    // Reset Trip
    window.resetCurrentTrip = () => {
      ui.vibrate(15);
      sound.playClick();
      trip.reset();
      ui.updateTripDisplay();
      ui.showToast('Trip Counter Reset', '🔄');
    };

    // Fullscreen Toggle
    window.toggleFullscreen = () => ui.toggleFullscreen();
  }

  handleUrlActions() {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');

    if (action === 'drive') {
      setTimeout(() => window.toggleDrive(), 800);
    } else if (action === 'refuel') {
      setTimeout(() => ui.openModal('refuelModal'), 800);
    }
  }
}

export const app = new Application();

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}
