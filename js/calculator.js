// ==========================================================================
// Refuel Calculator & Gas Pump Screen Logic
// ==========================================================================

import { APP_CONFIG } from './config.js';
import { store } from './state.js';
import { trip } from './trip.js';

class RefuelCalculator {
  constructor() {
    this.currentPaymentRM = 0;
  }

  setPaymentRM(rm) {
    this.currentPaymentRM = Math.max(0, parseFloat(rm) || 0);
  }

  addQuickAmount(rm) {
    this.currentPaymentRM += rm;
    return this.currentPaymentRM;
  }

  setPriceRate(rate) {
    store.update({ selectedPrice: rate });
  }

  // Returns { litersReceived, pumpDisplayRM, isDiscounted }
  calculate() {
    const priceRate = store.getState().selectedPrice || APP_CONFIG.PRICES.BUDI_DIESEL;
    const payment = this.currentPaymentRM;

    if (payment <= 0 || priceRate <= 0) {
      return {
        litersReceived: 0,
        pumpDisplayRM: 0,
        isDiscounted: false
      };
    }

    // 1. Calculate Liters received
    const litersReceived = payment / priceRate;

    // 2. Calculate Pump Screen Display (at standard market rate)
    const pumpDisplayRM = litersReceived * APP_CONFIG.MARKET_PUMP_RATE;

    return {
      litersReceived: parseFloat(litersReceived.toFixed(2)),
      pumpDisplayRM: parseFloat(pumpDisplayRM.toFixed(2)),
      isDiscounted: priceRate < APP_CONFIG.MARKET_PUMP_RATE
    };
  }

  confirmRefuel() {
    const { litersReceived } = this.calculate();
    if (litersReceived > 0) {
      const priceRate = store.getState().selectedPrice;
      const payment = this.currentPaymentRM;

      store.addFuelLiters(litersReceived);
      TripComputerLog(litersReceived, payment, priceRate);

      this.currentPaymentRM = 0;
      return litersReceived;
    }
    return 0;
  }
}

function TripComputerLog(liters, amount, rate) {
  trip.constructor.logRefuel(liters, amount, rate);
}

export const refuelCalc = new RefuelCalculator();
