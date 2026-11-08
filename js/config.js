// ==========================================================================
// App Configuration & Constants
// ==========================================================================

export const APP_CONFIG = {
  APP_NAME: 'Gen-2 Liquid Fuel Meter',
  VERSION: '2.0.0',
  DEFAULT_TANK_CAPACITY: 50,      // Liters (Proton Gen-2 default)
  DEFAULT_EFFICIENCY: 11.0,       // KM / Liter
  DEFAULT_RESERVE_PERCENT: 15,    // Low fuel threshold %
  DEFAULT_CRITICAL_PERCENT: 8,    // Critical fuel threshold %
  
  // Fuel Pricing Presets (Malaysia)
  PRICES: {
    BUDI_DIESEL: 1.99,            // Subsidised Diesel Budi rate
    RON95: 2.05,                  // Subsidised RON95 Petrol
    STD_DIESEL: 2.60,             // Market / Standard Diesel rate
    RON97: 3.19                   // Market RON97 Petrol
  },
  
  MARKET_PUMP_RATE: 2.60,         // Rate shown on standard commercial pumps
  
  STORAGE_KEYS: {
    FUEL: 'g7_fuel',
    TANK: 'g7_tank',
    EFFICIENCY: 'g7_eff',
    PRICE: 'g7_price',
    SETTINGS: 'g7_settings',
    TRIP_LOG: 'g7_trip_logs',
    REFUEL_LOG: 'g7_refuel_logs'
  },
  
  GPS: {
    MIN_SPEED_KMH: 3.0,           // Filter out stationary GPS drift
    MIN_DISTANCE_KM: 0.003,       // Minimum 3 meters movement
    MAX_DISTANCE_JUMP_KM: 0.8,    // Filter out aberrant GPS teleportation jumps
    SIMULATION_INTERVAL_MS: 1000  // Demo mode update tick
  }
};
