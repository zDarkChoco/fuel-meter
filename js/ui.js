// ==========================================================================
// UI Controller & Liquid Glass Component Binder
// ==========================================================================

import { APP_CONFIG } from './config.js';
import { store } from './state.js';
import { trip } from './trip.js';
import { sound } from './audio.js';
import { refuelCalc } from './calculator.js';

class UIController {
  constructor() {
    this.elements = {};
  }

  init() {
    this.cacheElements();
    this.bindEvents();
    this.render();

    // Subscribe to store updates
    store.subscribe(() => {
      this.render();
    });

    // Refresh trip timer every second
    setInterval(() => {
      if (store.getState().tracking) {
        this.updateTripDisplay();
      }
    }, 1000);
  }

  cacheElements() {
    this.elements = {
      // Speed & HUD
      speedVal: document.getElementById('speedVal'),
      fuelLiters: document.getElementById('fuelLiters'),
      fuelRange: document.getElementById('fuelRange'),
      fuelPercent: document.getElementById('fuelPercent'),
      fuelFillBar: document.getElementById('fuelFillBar'),
      gpsBadge: document.getElementById('gpsBadge'),
      wakeBadge: document.getElementById('wakeBadge'),
      demoBadge: document.getElementById('demoBadge'),

      // Controls
      btnDrive: document.getElementById('btnDrive'),
      btnDriveText: document.getElementById('btnDriveText'),
      btnDriveIcon: document.getElementById('btnDriveIcon'),
      btnInstall: document.getElementById('btnInstallApp'),

      // Trip Drawer
      tripDistVal: document.getElementById('tripDistVal'),
      tripFuelVal: document.getElementById('tripFuelVal'),
      tripTimeVal: document.getElementById('tripTimeVal'),
      tripAvgVal: document.getElementById('tripAvgVal'),

      // Refuel Modal
      refuelModal: document.getElementById('refuelModal'),
      inputPaymentRM: document.getElementById('inputPaymentRM'),
      previewPumpRM: document.getElementById('previewPumpRM'),
      previewLiters: document.getElementById('previewLiters'),
      pricePills: document.querySelectorAll('.price-pill-btn'),

      // Settings Modal
      configModal: document.getElementById('configModal'),
      confTank: document.getElementById('confTank'),
      confEff: document.getElementById('confEff'),
      switchSound: document.getElementById('switchSound'),
      switchWake: document.getElementById('switchWake'),
      switchHaptic: document.getElementById('switchHaptic'),

      // Trip Modal
      tripModal: document.getElementById('tripModal'),
      refuelLogsList: document.getElementById('refuelLogsList'),

      // Toast Container
      toastContainer: document.getElementById('toastContainer')
    };
  }

  bindEvents() {
    // Quick Chips for refuel payment
    document.querySelectorAll('.quick-chip').forEach((chip) => {
      chip.addEventListener('click', (e) => {
        const val = parseFloat(e.target.dataset.amount);
        if (this.elements.inputPaymentRM) {
          const current = parseFloat(this.elements.inputPaymentRM.value) || 0;
          this.elements.inputPaymentRM.value = (current + val).toString();
          refuelCalc.setPaymentRM(this.elements.inputPaymentRM.value);
          this.updateRefuelPreview();
          this.vibrate(15);
          sound.playClick();
        }
      });
    });

    // Payment input change
    if (this.elements.inputPaymentRM) {
      this.elements.inputPaymentRM.addEventListener('input', (e) => {
        refuelCalc.setPaymentRM(e.target.value);
        this.updateRefuelPreview();
      });
    }

    // Modal backdrop click to close
    document.querySelectorAll('.modal-overlay').forEach((modal) => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal.id);
        }
      });
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });
  }

  render() {
    const state = store.getState();
    const pct = Math.max(0, Math.min(100, (state.fuel / state.tankMax) * 100));
    const rangeKm = state.fuel * state.eff;

    // 1. Speedometer
    if (this.elements.speedVal) {
      this.elements.speedVal.innerText = state.currentSpeed.toString();
      if (state.currentSpeed > 0) {
        this.elements.speedVal.classList.add('text-glow-cyan');
      } else {
        this.elements.speedVal.classList.remove('text-glow-cyan');
      }
    }

    // 2. Fuel Stats
    if (this.elements.fuelLiters) {
      this.elements.fuelLiters.innerText = `${state.fuel.toFixed(1)} L`;
    }
    if (this.elements.fuelRange) {
      this.elements.fuelRange.innerText = `~${rangeKm.toFixed(0)} KM`;
    }
    if (this.elements.fuelPercent) {
      this.elements.fuelPercent.innerText = `${Math.round(pct)}%`;
    }

    // 3. Fuel Tube Fill Bar & Dynamic Color State
    if (this.elements.fuelFillBar) {
      this.elements.fuelFillBar.style.width = `${pct}%`;
      this.elements.fuelFillBar.classList.remove('fuel-state-normal', 'fuel-state-warning', 'fuel-state-danger');

      if (pct <= APP_CONFIG.DEFAULT_CRITICAL_PERCENT) {
        this.elements.fuelFillBar.classList.add('fuel-state-danger');
      } else if (pct <= APP_CONFIG.DEFAULT_RESERVE_PERCENT) {
        this.elements.fuelFillBar.classList.add('fuel-state-warning');
      } else {
        this.elements.fuelFillBar.classList.add('fuel-state-normal');
      }
    }

    // 4. Badges
    if (this.elements.gpsBadge) {
      if (state.hasGpsLock) {
        this.elements.gpsBadge.classList.add('active-gps');
        this.elements.gpsBadge.innerText = 'GPS LOCK';
      } else {
        this.elements.gpsBadge.classList.remove('active-gps');
        this.elements.gpsBadge.innerText = state.tracking ? 'ACQUIRING...' : 'GPS OFF';
      }
    }

    if (this.elements.wakeBadge) {
      if (state.wakeLockActive) {
        this.elements.wakeBadge.classList.add('active-wake');
        this.elements.wakeBadge.style.display = 'inline-flex';
      } else {
        this.elements.wakeBadge.classList.remove('active-wake');
        this.elements.wakeBadge.style.display = 'none';
      }
    }

    if (this.elements.demoBadge) {
      this.elements.demoBadge.style.display = state.simulating ? 'inline-flex' : 'none';
    }

    // 5. Drive Button State
    if (this.elements.btnDrive) {
      if (state.tracking) {
        this.elements.btnDrive.classList.add('active');
        if (this.elements.btnDriveText) this.elements.btnDriveText.innerText = 'STOP DRIVE';
        if (this.elements.btnDriveIcon) this.elements.btnDriveIcon.innerText = '⏹️';
      } else {
        this.elements.btnDrive.classList.remove('active');
        if (this.elements.btnDriveText) this.elements.btnDriveText.innerText = 'START DRIVE';
        if (this.elements.btnDriveIcon) this.elements.btnDriveIcon.innerText = '📍';
      }
    }

    // 6. Settings Inputs Sync
    if (this.elements.confTank) this.elements.confTank.value = state.tankMax;
    if (this.elements.confEff) this.elements.confEff.value = state.eff;
    if (this.elements.switchSound) this.elements.switchSound.checked = state.settings.soundEnabled;
    if (this.elements.switchWake) this.elements.switchWake.checked = state.settings.wakeLockEnabled;
    if (this.elements.switchHaptic) this.elements.switchHaptic.checked = state.settings.hapticEnabled;

    this.updateTripDisplay();
  }

  updateTripDisplay() {
    const stats = trip.getStats();
    if (this.elements.tripDistVal) this.elements.tripDistVal.innerText = `${stats.distance} KM`;
    if (this.elements.tripFuelVal) this.elements.tripFuelVal.innerText = `${stats.fuelBurned} L`;
    if (this.elements.tripTimeVal) this.elements.tripTimeVal.innerText = stats.formattedTime;
    if (this.elements.tripAvgVal) this.elements.tripAvgVal.innerText = `${stats.avgSpeed} KM/H`;
  }

  // Refuel calculation live preview
  updateRefuelPreview() {
    const { litersReceived, pumpDisplayRM, isDiscounted } = refuelCalc.calculate();

    if (this.elements.previewPumpRM) {
      this.elements.previewPumpRM.innerText = `RM ${pumpDisplayRM.toFixed(2)}`;
      if (isDiscounted) {
        this.elements.previewPumpRM.style.color = 'var(--neon-emerald)';
      } else {
        this.elements.previewPumpRM.style.color = 'var(--neon-cyan)';
      }
    }

    if (this.elements.previewLiters) {
      this.elements.previewLiters.innerText = `${litersReceived.toFixed(1)} Liters`;
    }
  }

  // Modals management
  openModal(modalId) {
    this.closeAllModals();
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('open');
      this.vibrate(10);
      sound.playClick();

      if (modalId === 'refuelModal') {
        if (this.elements.inputPaymentRM) {
          this.elements.inputPaymentRM.value = '';
          refuelCalc.setPaymentRM(0);
          this.updateRefuelPreview();
          setTimeout(() => this.elements.inputPaymentRM.focus(), 150);
        }
      } else if (modalId === 'tripModal') {
        this.renderRefuelLogs();
      }
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('open');
      sound.playClick();
    }
  }

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach((m) => m.classList.remove('open'));
  }

  renderRefuelLogs() {
    if (!this.elements.refuelLogsList) return;
    const logs = trip.constructor.getRefuelLogs();

    if (logs.length === 0) {
      this.elements.refuelLogsList.innerHTML = `
        <div style="text-align:center; padding: 20px; color: var(--text-muted); font-size: 0.88rem;">
          No refuel records yet. Add fuel to see history!
        </div>
      `;
      return;
    }

    this.elements.refuelLogsList.innerHTML = logs.map((log) => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding: 10px 14px; background: rgba(255,255,255,0.04); border-radius: 12px; border: 1px solid var(--glass-border-subtle); margin-bottom: 8px;">
        <div>
          <div style="font-weight: 800; font-size: 0.95rem; color: #fff;">+${log.liters.toFixed(1)} L</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${log.date}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: 800; color: var(--neon-emerald); font-size: 0.95rem;">RM ${log.amountRM.toFixed(2)}</div>
          <div style="font-size: 0.72rem; color: var(--text-dim);">@ RM ${log.pricePerLiter.toFixed(2)}/L</div>
        </div>
      </div>
    `).join('');
  }

  // Toast Notification
  showToast(message, icon = '✨') {
    if (!this.elements.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'glass-toast';
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    this.elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-12px) scale(0.9)';
      setTimeout(() => toast.remove(), 350);
    }, 2800);
  }

  // Haptic feedback
  vibrate(pattern = 15) {
    if (store.getState().settings.hapticEnabled && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }

  // Fullscreen toggle
  toggleFullscreen() {
    this.vibrate(15);
    sound.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }
}

export const ui = new UIController();
