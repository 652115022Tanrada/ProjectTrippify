<script setup>
import { onMounted, watch, ref } from 'vue';


const props = defineProps({
  locations: {
    type: Array,
    default: () => [],
  },
});

const map = ref(null);
const mapLoaded = ref(false);

function loadGoogleMapsScript() {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAlVzD6P1wGxozJWLhwXhYGwd1E9xLNshk';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function initMap(center) {
  map.value = new google.maps.Map(document.getElementById("map"), {
    center: center,
    zoom: 13,
  });
  mapLoaded.value = true;
}

function addMarkers() {
  if (!map.value || !props.locations) return;

  props.locations
    .filter(loc => loc.lat && loc.lng)
    .forEach(loc => {
      new google.maps.Marker({
        position: { lat: loc.lat, lng: loc.lng },
        map: map.value,
        title: loc.name,
      });
    });
}

onMounted(async () => {
  await loadGoogleMapsScript();

  const firstValidLoc = props.locations.find(loc => loc.lat && loc.lng);
  if (firstValidLoc) {
    initMap({ lat: firstValidLoc.lat, lng: firstValidLoc.lng });
    addMarkers();
  }
});

watch(() => props.locations, (newLocs) => {
  const firstValidLoc = newLocs.find(loc => loc.lat && loc.lng);
  if (firstValidLoc && !mapLoaded.value) {
    initMap({ lat: firstValidLoc.lat, lng: firstValidLoc.lng });
    addMarkers();
  } else if (map.value) {
    addMarkers();
  }
});
</script>

<template>
  <div id="map" style="height: 400px; width: 100%; margin-bottom: 20px;"></div>
</template>
