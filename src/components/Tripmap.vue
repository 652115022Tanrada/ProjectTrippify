<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  locations: { type: Array, default: () => [] },
  nearby: { type: Array, default: () => [] },
  highlighted: { type: Object, default: null }
});

const map = ref(null);
const mapLoaded = ref(false);
const markers = [];
const nearbyMarkers = [];
let directionsRenderer = null;

// --- Helpers ---
const isValidCoord = (v) => typeof v === "number" && !isNaN(v);

function sanitizeLocations(locations) {
  return locations
    .map(loc => {
      const lat = Number(loc.lat);
      const lng = Number(loc.lng);
      if (!isValidCoord(lat) || !isValidCoord(lng)) return null;
      return { ...loc, lat, lng };
    })
    .filter(Boolean);
}

// --- Load Google Maps ---
function loadGoogleMapsScript() {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) return resolve();
    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAPXZbbrz75ECNK3VD77E9CZULbebHbe9I';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function initMap(center) {
  map.value = new google.maps.Map(document.getElementById("map"), {
    center,
    zoom: 13,
  });
  mapLoaded.value = true;
}

// --- Markers ---
function clearMarkers() {
  markers.forEach(m => m.setMap(null));
  markers.length = 0;
}

function clearNearbyMarkers() {
  nearbyMarkers.forEach(m => m.setMap(null));
  nearbyMarkers.length = 0;
}

function addMarkers() {
  if (!map.value || !props.locations) return;
  clearMarkers();
  const sanitized = sanitizeLocations(props.locations);
  sanitized.forEach((loc, idx) => {
    const marker = new google.maps.Marker({
      map: map.value,
      position: { lat: loc.lat, lng: loc.lng },
      title: loc.name,
      label: { text: String(idx + 1), color: "white", fontWeight: "bold", fontSize: "14px" }
    });
    markers.push(marker);
  });
}

function addNearbyMarkers() {
  if (!map.value || !props.nearby) return;
  clearNearbyMarkers();
  const sanitized = sanitizeLocations(props.nearby);
  sanitized.forEach(loc => {
    const marker = new google.maps.Marker({
      map: map.value,
      position: { lat: loc.lat, lng: loc.lng },
      title: loc.name,
      icon: { url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png" }
    });
    nearbyMarkers.push(marker);
  });
}

// --- Route & Directions ---
function buildRouteRequest(locations) {
  const sanitized = sanitizeLocations(locations);
  if (sanitized.length < 2) return null;

  const origin = sanitized[0];
  const destination = sanitized[sanitized.length - 1];
  const waypoints = sanitized.slice(1, -1).map(l => ({ location: { lat: l.lat, lng: l.lng }, stopover: true }));

  return { origin, destination, waypoints, travelMode: google.maps.TravelMode.DRIVING };
}

async function calculateDistances() {
  const sanitized = sanitizeLocations(props.locations);
  if (sanitized.length < 2) return;

  const service = new google.maps.DistanceMatrixService();
  for (let i = 0; i < sanitized.length - 1; i++) {
    const origin = sanitized[i];
    const destination = sanitized[i + 1];
    try {
      const response = await new Promise((resolve, reject) => {
        service.getDistanceMatrix(
          { origins: [{ lat: origin.lat, lng: origin.lng }], destinations: [{ lat: destination.lat, lng: destination.lng }], travelMode: google.maps.TravelMode.DRIVING },
          (result, status) => (status === 'OK' ? resolve(result) : reject(`Distance Matrix failed: ${status}`))
        );
      });
      destination.distance_to_next = response.rows[0].elements[0].distance?.text || 'N/A';
    } catch (err) {
      console.error(err);
      destination.distance_to_next = 'N/A';
    }
  }
}

async function drawRoute() {
  const routeRequest = buildRouteRequest(props.locations);
  if (!routeRequest || !map.value) return;

  if (!directionsRenderer) {
    directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: { strokeColor: '#1D4ED8', strokeOpacity: 0.8, strokeWeight: 5 }
    });
    directionsRenderer.setMap(map.value);
  }

  const { origin, destination, waypoints } = routeRequest;

  const directionsService = new google.maps.DirectionsService();
  directionsService.route(
    { origin, destination, waypoints, optimizeWaypoints: false, travelMode: google.maps.TravelMode.DRIVING },
    (result, status) => {
      if (status === 'OK') directionsRenderer.setDirections(result);
      else console.error('Directions request failed:', status);
    }
  );
}

// --- Highlighted ---
function flyTo(loc) {
  if (!map.value || !loc) return;
  const sanitized = sanitizeLocations([loc])[0];
  if (!sanitized) return;
  map.value.panTo({ lat: sanitized.lat, lng: sanitized.lng });
  map.value.setZoom(15);
}

// --- Lifecycle ---
onMounted(async () => {
  await loadGoogleMapsScript();
  const firstValid = sanitizeLocations(props.locations)[0];
  if (firstValid) {
    initMap({ lat: firstValid.lat, lng: firstValid.lng });
    addMarkers();
    addNearbyMarkers();
    await calculateDistances();
    await drawRoute();
  }
});

// --- Watchers ---
watch(() => props.locations, async () => {
  if (!mapLoaded.value) {
    const firstValid = sanitizeLocations(props.locations)[0];
    if (firstValid) initMap({ lat: firstValid.lat, lng: firstValid.lng });
  }
  addMarkers();
  await calculateDistances();
  await drawRoute();
});

watch(() => props.nearby, () => addNearbyMarkers());

watch(() => props.highlighted, (loc) => { if (loc) flyTo(loc); });
</script>

<template>
  <div class="w-full h-full">
    <div id="map" class="w-full h-full" style="min-height:400px;"></div>
  </div>
</template>
