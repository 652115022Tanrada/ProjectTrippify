<script setup>
import { ref, onMounted, watch, toRefs } from 'vue';
import { loadGoogleMaps } from '../utils/loadGoogleMaps';
 
const props = defineProps({
  locations: { type: Array, default: () => [] },
  nearby: { type: Array, default: () => [] },
  highlighted: { type: Object, default: null },
  tripPlan: { type: Object, default: null },
});
const { tripPlan } = toRefs(props);
 
const emit = defineEmits(["update:locations"]);
const googleRef = ref(null);
const map = ref(null);
const mapLoaded = ref(false);
const markers = [];
const nearbyMarkers = [];
let directionsRenderer = null;
 
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
 
function initMap(center) {
  map.value = new google.maps.Map(document.getElementById("map"), {
    center,
    zoom: 13,
  });
  mapLoaded.value = true;
}
 
function clearMarkers() {
  markers.forEach(m => m.setMap(null));
  markers.length = 0;
}
 
function clearNearbyMarkers() {
  nearbyMarkers.forEach(m => m.setMap(null));
  nearbyMarkers.length = 0;
}
 
const getMarkerColor = (dayNumber) => {
  const colors = ["#9656a2", "#5e62a9", "#de324c", "#f4895f", "#f8e16f", "#95cf92", "#369acc"];
  return colors[(dayNumber - 1) % colors.length];
};
 
function addMarkers() {
  if (!map.value || !props.locations) return;
  clearMarkers();
  const sanitized = sanitizeLocations(props.locations);
  sanitized.forEach((loc, idx) => {
    const pinColor = getMarkerColor(loc.day);
    const svgIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
        <path fill="${pinColor}" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      </svg>`;
    const marker = new google.maps.Marker({
      map: map.value,
      position: { lat: loc.lat, lng: loc.lng },
      title: loc.name,
      icon: { url: `data:image/svg+xml;utf-8,${encodeURIComponent(svgIcon)}`, scaledSize: new google.maps.Size(32, 32) },
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
 
function drawRouteAndDistances() {
  return new Promise((resolve, reject) => {
    const sanitized = sanitizeLocations(props.locations);
    if (sanitized.length < 2 || !map.value) return resolve();
 
    if (!directionsRenderer) {
      directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: { strokeColor: '#1D4ED8', strokeOpacity: 0.8, strokeWeight: 5 }
      });
      directionsRenderer.setMap(map.value);
    }
 
    const origin = sanitized[0];
    const destination = sanitized[sanitized.length - 1];
    const waypoints = sanitized.slice(1, -1).map(l => ({ location: { lat: l.lat, lng: l.lng }, stopover: true }));
 
    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      { origin, destination, waypoints, optimizeWaypoints: false, travelMode: google.maps.TravelMode.DRIVING },
      (result, status) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result);
          resolve();
        } else {
          console.error('Directions request failed:', status);
          resolve();
        }
      }
    );
  });
}
 
function flyTo(loc) {
  if (!map.value || !loc) return;
  const sanitized = sanitizeLocations([loc])[0];
  if (!sanitized) return;
  map.value.panTo({ lat: sanitized.lat, lng: sanitized.lng });
  map.value.setZoom(15);
}
const mapInitialized = ref(false);
 
watch(
  () => props.locations,
  async (locs) => {
    const sanitized = sanitizeLocations(locs);
    if (!sanitized.length) return;
 
    // ถ้ายังไม่สร้าง map
    if (!mapInitialized.value) {
      await loadGoogleMaps(); // ✅ รอให้โหลด Maps API เสร็จก่อน
      initMap({ lat: sanitized[0].lat, lng: sanitized[0].lng });
      mapInitialized.value = true;
    }
 
    addMarkers();
    addNearbyMarkers();
    await drawRouteAndDistances();
  },
  { immediate: true, deep: true }
);
 
onMounted(async () => {
  googleRef.value = await loadGoogleMaps();
});
 
watch(
  () => props.locations,
  (newLocs, oldLocs) => {
    if (!mapLoaded.value) return;
 
    const oldIds = (oldLocs || []).map((l) => l.id || `${l.day}-${l.name}`);
    const newIds = (newLocs || []).map((l) => l.id || `${l.day}-${l.name}`);
 
    // ถ้าจำนวนและ id เหมือนเดิม → ไม่ต้องทำอะไรเลย
    if (JSON.stringify(oldIds) === JSON.stringify(newIds)) return;
 
    addMarkers();
    drawRouteAndDistances();
  },
  { deep: true }
);
 
 
watch(() => props.nearby, () => addNearbyMarkers());
watch(() => props.highlighted, (loc) => { if (loc) flyTo(loc); });
</script>
 
<template>
  <div class="w-full h-full">
    <div id="map" class="w-full aspect-square md:w-auto md:h-full" style="min-height:300px;"></div>
  </div>
</template>