// ==========================================================================
// PWA Installation & Service Worker Manager (Android Chrome)
// ==========================================================================

import { ui } from './ui.js';
import { sound } from './audio.js';

class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.installBtn = null;
  }

  init() {
    this.registerServiceWorker();
    this.bindInstallPrompt();
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((registration) => {
            console.log('Fuel Meter SW registered with scope:', registration.scope);
            
            // Check for updates
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    ui.showToast('New version available! Reloading...', '🚀');
                    setTimeout(() => window.location.reload(), 1500);
                  }
                };
              }
            };
          })
          .catch((err) => {
            console.warn('SW registration failed:', err);
          });
      });
    }
  }

  bindInstallPrompt() {
    this.installBtn = document.getElementById('btnInstallApp');

    // Android Chrome triggers beforeinstallprompt when PWA criteria are met
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing automatically
      e.preventDefault();
      // Stash event for manual trigger
      this.deferredPrompt = e;

      // Reveal the liquid glass install button in the HUD
      if (this.installBtn) {
        this.installBtn.classList.add('show');
      }

      console.log('Android Chrome PWA install prompt ready.');
    });

    if (this.installBtn) {
      this.installBtn.addEventListener('click', async () => {
        ui.vibrate(20);
        sound.playClick();

        if (this.deferredPrompt) {
          // Show the native Android install dialog
          this.deferredPrompt.prompt();
          const { outcome } = await this.deferredPrompt.userChoice;
          console.log(`User response to install prompt: ${outcome}`);

          if (outcome === 'accepted') {
            ui.showToast('Installing Fuel Meter to Home Screen...', '📲');
          }

          // Clear prompt
          this.deferredPrompt = null;
          this.installBtn.classList.remove('show');
        } else {
          ui.showToast('To install: tap Chrome menu (⋮) -> Add to Home screen', '💡');
        }
      });
    }

    // App installed event
    window.addEventListener('appinstalled', () => {
      console.log('Fuel Meter PWA successfully installed!');
      ui.showToast('Fuel Meter Installed on your device!', '🎉');
      if (this.installBtn) {
        this.installBtn.classList.remove('show');
      }
      this.deferredPrompt = null;
    });
  }
}

export const pwa = new PWAManager();
