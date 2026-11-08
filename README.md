# 🚗 Gen-2 Liquid Glass Fuel Meter & Floating HUD

A modern, progressive web application (PWA) designed as a floating **Liquid Glass Heads-Up Display (HUD)** and real-time GPS fuel tracker. Originally engineered to replace a broken physical fuel gauge in a Proton Gen-2, this app works universally for any vehicle.

**🔗 Live GitHub Pages App:** [https://zdarkchoco.github.io/fuel-meter/](https://zdarkchoco.github.io/fuel-meter/)

---

## 💎 Liquid Glass Design & Floating HUD

The interface has been redesigned with a modern **Liquid Glassmorphism** aesthetic:
* **Fullscreen Living Map:** Seamless dark-matter street map underneath the floating interface with auto-following and smooth panning.
* **Floating Glass Island:** The top status HUD floats over the map with multi-layered specular reflections, backdrop blur, glowing borders, and reactive lighting.
* **Liquid Fuel Tube Gauge:** Animated fluid fuel bar that shifts from Cyan/Emerald to Amber warning (15%) and pulsating Ruby alert (< 8%).
* **Floating Bottom Dock:** Ergonomic action dock positioned above mobile safe areas with tactile haptics, quick refuel, map recenter, and full-screen toggles.

---

## ✨ Features & Functionality

### 🖥️ Heads-Up Display & Driving Computer
* **Live GPS Speedometer:** Large, high-contrast digital readout in KM/H with velocity glow.
* **Smart Fuel & Range Engine:** Real-time fuel deduction calculated via high-accuracy Haversine GPS distance deltas and car efficiency.
* **Trip Computer:** Tracks trip distance (KM), trip fuel consumed (L), driving duration, average speed, and top speed.
* **Screen Wake Lock:** Prevents smartphone display from sleeping while mounted on the dashboard.
* **Heading & Radar Marker:** Custom vehicle marker on the map with heading direction indicator and animated radar ping waves.

### ⛽ Refuel Calculator & Gas Pump Sync
* **Quick Payment Chips:** One-tap `+RM20`, `+RM30`, `+RM50`, `+RM70`, `+RM100` chips.
* **Malaysian Fuel Presets:** Instant toggles for **BUDI Subsidised Diesel (1.99)**, **RON95 (2.05)**, **Standard Diesel (2.60)**, and **RON97 (3.19)**.
* **Pump Screen Preview:** Calculates exact liters received and displays what the commercial gas pump meter will read.
* **Full Tank One-Tap Sync:** Reset fuel level to 100% capacity with a single confirmation.
* **Refuel History Logs:** Automatically stores past refuels with date, liters added, RM spent, and price rate.

### 🎮 Built-in Demo Drive Simulation
* Test the speedometer, map centering, car rotation, fuel consumption, and trip computer anywhere—without needing to be in a moving car!

### 🔊 Futuristic Web Audio Synthesizer
* Native Web Audio API synthesizer generates tactile clicks, celebratory refuel chimes, and low-fuel alarms with zero external audio assets.

---

## 📲 Install on Android Chrome (PWA)

This app is a full Progressive Web App (PWA) with offline caching and standalone display:

1. Open [https://zdarkchoco.github.io/fuel-meter/](https://zdarkchoco.github.io/fuel-meter/) in **Chrome on your Android device**.
2. Tap the floating **"📲 Install App"** button that appears on the dock, OR tap the Chrome menu (three dots `⋮`) and select **"Add to Home screen"** / **"Install app"**.
3. Confirm installation. The app will launch in full-screen standalone mode without any browser URL bars, looking and behaving like a native Android dashboard app!

---

## 📂 Project Architecture

```
fuel-meter/
├── index.html                   # HTML5 Entry point
├── manifest.webmanifest         # PWA Web App Manifest (Android Chrome installable)
├── sw.js                        # Service Worker for offline caching & background updates
├── assets/
│   └── icons/
│       ├── icon.svg             # Scalable vector icon
│       ├── favicon.svg          # Browser tab icon
│       ├── icon-192.png         # 192x192 PWA Android icon
│       ├── icon-512.png         # 512x512 PWA Splash icon
│       └── icon-maskable-512.png# Maskable icon for Android adaptive icons
├── css/
│   ├── base.css                 # Reset, CSS variables, design tokens & typography
│   ├── glass.css                # Liquid glass styles, specular highlights, blurs & glows
│   ├── hud.css                  # Floating top HUD island, speedometer, liquid fuel tube & dock
│   ├── map.css                  # Fullscreen map, vehicle radar marker & heading chevron
│   └── modals.css               # Liquid glass modal dialogs, calculators & toasts
├── js/
│   ├── app.js                   # Master application bootstrapper & global action coordinator
│   ├── config.js                # App constants, presets & storage keys
│   ├── state.js                 # Reactive state store with localStorage persistence & pub/sub
│   ├── audio.js                 # Web Audio API synthesizer for clicks, chimes & alerts
│   ├── gps.js                   # Geolocation engine, Haversine formula & demo simulator
│   ├── map.js                   # Leaflet map manager & custom vehicle marker
│   ├── trip.js                  # Trip computer & refuel history logger
│   ├── calculator.js            # Refuel payment to liter converter & pump preview
│   ├── ui.js                    # UI binder, HUD animator, modal manager & haptics
│   └── pwa.js                   # Service worker registration & Chrome install prompt handler
└── README.md
```

---

## 🔒 Privacy & Local Storage
* **100% Client-Side:** No telemetry, tracking, or remote database. All GPS calculations occur locally on your device.
* **Persistent Memory:** Fuel levels, car configurations, and trip logs persist locally in `localStorage`.
