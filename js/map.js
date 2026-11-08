// ==========================================================================
// Fullscreen Map & Custom Vehicle Marker Manager
// ==========================================================================

class MapController {
  constructor() {
    this.map = null;
    this.marker = null;
    this.headingArrow = null;
    this.vehicleCore = null;
    this.autoFollow = true;
    this.lastPosition = null;
    this.defaultCoords = [3.1390, 101.6869]; // Kuala Lumpur center
  }

  init(containerId = 'map') {
    if (this.map) return;

    // Initialize Leaflet map
    this.map = L.map(containerId, {
      zoomControl: false,
      attributionControl: false,
      fadeAnimation: true,
      zoomAnimation: true
    }).setView(this.defaultCoords, 16);

    // Dark Matter high contrast tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      detectRetina: true
    }).addTo(this.map);

    // Custom liquid vehicle marker with radar ring & heading pointer
    const customIcon = L.divIcon({
      className: 'vehicle-marker-wrapper',
      html: `
        <div class="vehicle-marker-container">
          <div class="radar-ring"></div>
          <div class="vehicle-core" id="mapVehicleCore">
            <div class="vehicle-heading-arrow"></div>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    this.marker = L.marker(this.defaultCoords, { icon: customIcon });

    // Detect user manual dragging to pause strict auto-center
    this.map.on('dragstart', () => {
      this.autoFollow = false;
      document.dispatchEvent(new CustomEvent('map:autofollow', { detail: { following: false } }));
    });
  }

  updatePosition(lat, lon, heading = null) {
    if (!this.map) return;

    const latLng = new L.LatLng(lat, lon);
    this.lastPosition = latLng;

    if (!this.map.hasLayer(this.marker)) {
      this.marker.addTo(this.map);
    }
    this.marker.setLatLng(latLng);

    if (this.autoFollow) {
      this.map.setView(latLng, 17, { animate: true, duration: 0.5 });
    }

    // Update marker heading rotation
    if (heading !== null && heading !== undefined && !isNaN(heading)) {
      const core = document.getElementById('mapVehicleCore');
      if (core) {
        core.style.transform = `rotate(${heading}deg)`;
      }
    }
  }

  recenter() {
    this.autoFollow = true;
    if (this.lastPosition && this.map) {
      this.map.setView(this.lastPosition, 17, { animate: true, duration: 0.8 });
    }
    document.dispatchEvent(new CustomEvent('map:autofollow', { detail: { following: true } }));
  }
}

export const mapController = new MapController();
