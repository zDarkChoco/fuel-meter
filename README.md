# 🚗 Gen-2 Digital Dashboard & Fuel Tracker

A web-based Heads-Up Display (HUD) designed to replace a broken physical fuel gauge. This application turns your smartphone into a smart dashboard that tracks your driving distance via GPS, calculates real-time fuel usage, and overlays this data on a live map.

**🔗 Live App:** [https://zdarkchoco.github.io/fuel-meter/](https://zdarkchoco.github.io/fuel-meter/)

## 📖 The Problem
The physical fuel gauge in my Proton Gen-2 is non-functional. Estimating fuel levels based on memory or trip meters is unreliable.

## 💡 The Solution
This web app acts as the car's persistent memory.
* **It tracks** your speed and distance using GPS.
* **It calculates** fuel consumption based on your specific car's efficiency.
* **It saves** your data automatically to your phone, so it remembers your fuel level even after you close the browser.

## ✨ Key Features

### 🖥️ Driver's HUD (Heads-Up Display)
* **Live Speedometer:** Large, high-contrast KM/H display.
* **Fuel Monitor:** Visual progress bar (Blue → Yellow → Red) with exact Liters and Range estimates.
* **Always-On Map:** A dark-mode map that automatically follows your car's position (no interaction needed).
* **Wake Lock:** Prevents your phone screen from turning off while driving.

### ⛽ Quick Refuel System
* **RM Calculator:** No need to calculate liters manually. Just enter the RM amount (e.g., "50").
* **Price Toggles:** Quickly switch between **Diesel Budi (1.99)** and **Standard (2.60)** rates.
* **Full Tank Sync:** A dedicated button to instantly reset the system to 100% capacity when you fill to the brim.

### ⚙️ In-App Configuration (New!)
* **Customizable:** You can now change the **Tank Size** and **Fuel Efficiency** directly inside the app.
* **Universal:** While designed for a Proton Gen-2, this app can be configured for *any* car via the Settings menu.

## 📱 User Guide

### 1. While Driving
1.  Open the app and mount your phone on the dashboard.
2.  Tap the big **"📍 START DRIVE"** button.
3.  The app will lock onto your GPS and track your fuel usage as you move.
4.  Tap **"STOP DRIVE"** when you park.

### 2. At the Gas Station
1.  Tap the **"⛽ Add Fuel"** button (bottom left).
2.  Enter the amount you paid (e.g., `50`).
3.  Select the price rate.
4.  Tap **"Confirm Fuel"**. The app adds the new fuel to your current total.
    * *Note: If you filled it completely, just tap "Set FULL TANK".*

### 3. Setting Up (First Time)
1.  Tap the **Gear Icon (⚙️)** (bottom right).
2.  Enter your car's **Tank Capacity** (e.g., 50 Liters).
3.  Enter your car's **Efficiency** (e.g., 11 KM/L).
4.  Tap **Save Settings**.

## 🛠️ Technical Info
* **Frontend:** HTML5, CSS3, Vanilla JavaScript.
* **Mapping:** [Leaflet.js](https://leafletjs.com/) with OpenStreetMap (CartoDB Dark Matter tiles).
* **Storage:** HTML5 LocalStorage (Data stays on your device).
* **Privacy:** No data is sent to any server. Location data is processed locally on your phone.

##
