# 🚗 Gen-2 Virtual Dashboard & Fuel Tracker

A web-based Heads-Up Display (HUD) and fuel management system designed to replace a broken physical fuel gauge. This application uses your phone's GPS to track distance traveled and automatically calculates fuel consumption in real-time.

**🔗 Live App:** [https://zdarkchoco.github.io/fuel-meter/](https://zdarkchoco.github.io/fuel-meter/)

## 📖 The Problem
The physical fuel gauge in my Proton Gen-2 is broken, making it impossible to know how much fuel is left or when to refuel. Relying on memory or guessing mileage is unreliable and risky.

## 💡 The Solution
A "Virtual Dashboard" that runs in a mobile browser. It acts as the car's memory.
* **It remembers** your fuel level (even if you close the browser).
* **It tracks** your driving distance using GPS.
* **It calculates** fuel usage based on the car's specific efficiency (11 km/L).
* **It visualizes** the data with a digital speedometer and fuel bar.

## ✨ Key Features

### 🖥️ Heads-Up Display (HUD)
* **Digital Speedometer:** Large, easy-to-read speed display (km/h) derived from GPS data.
* **Visual Fuel Gauge:** A color-coded progress bar (Blue → Yellow → Red) indicating current fuel level.
* **Range Estimator:** Calculates approximately how many kilometers you can drive before empty.

### 📍 GPS Integration & Mapping
* **Auto-Following Map:** Integrated dark-mode map (Leaflet.js & OpenStreetMap) that locks to your current position.
* **Real-Time Tracking:** Calculates distance moved every few seconds and deducts the precise amount of fuel consumed.
* **Noise Filtering:** Intelligent algorithms ignore GPS "drift" (jitter) when the car is stationary.

### ⛽ Smart Refueling System
* **RM-to-Liters Calculator:** You don't need to guess liters. Just input the amount you paid (e.g., RM 50).
* **Price Selector:** Toggle between **Diesel Budi (RM 1.99)** and **Standard (RM 2.60)** prices.
* **Full Tank Sync:** One-click button to reset the system to 100% (50L) when you fill the tank to the brim.

### 💾 Data Persistence
* Uses **LocalStorage** to save fuel data directly on your phone.
* No server or login required. Your data stays on your device.

## 📱 How to Use

### 1. Driving (The Dashboard)
1.  Open the [Live Link](https://zdarkchoco.github.io/fuel-meter/) on your phone.
2.  Mount your phone on the dashboard.
3.  Click the **"📍 START DRIVE"** button.
    * *Note: You must allow Location Permissions.*
4.  The system will prevent the screen from sleeping (Wake Lock) and track your speed/fuel as you drive.
5.  When you park, click **"STOP DRIVE"**.

### 2. Refueling
1.  Click the **Gear Icon (⚙️)** to open the settings menu.
2.  **Option A (Partial Fill):** Enter the money spent (e.g., `50`), select the price rate, and click **"Confirm Fuel Added"**.
3.  **Option B (Full Tank):** If you filled it to the max, just click **"Set to FULL TANK"**.

## 🛠️ Technical Details for Customization

If you want to fork this project for a different car, you can modify the constants in the `index.html` file:

```javascript
// --- CONFIGURATION ---
const TANK_CAPACITY = 50;  // Tank size in Liters
const EFFICIENCY = 11;     // Average fuel consumption (KM per Liter)
