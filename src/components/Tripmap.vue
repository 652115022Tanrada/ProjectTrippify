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
const markers = [];
let directionsRenderer = null;

function loadGoogleMapsScript() {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyB7rywYWQGBxKypuwi-7-R1mdotjmhZQWA';
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

function clearMarkers() {
  markers.forEach(marker => marker.setMap(null));
  markers.length = 0;
}

function addMarkers() {
  if (!map.value || !props.locations) return;

  clearMarkers();

  props.locations
    .filter(loc => loc.lat && loc.lng)
    .forEach((loc, index) => {
      const marker = new google.maps.Marker({
        position: { lat: loc.lat, lng: loc.lng },
        map: map.value,
        title: loc.name,
        label: {
          text: String(index + 1),
          color: "white",
          fontWeight: "bold",
          fontSize: "14px"
        },
      });
      markers.push(marker);
    });
}

const isValidCoord = (v) => typeof v === "number" && !isNaN(v);

const buildRouteRequest = (locations) => {
  if (!Array.isArray(locations) || locations.length < 2) return null;

  // filter and coerce to numbers
  const sanitized = locations
    .map((loc) => {
      const latNum = Number(loc.lat);
      const lngNum = Number(loc.lng);
      return {
        ...loc,
        lat: isValidCoord(latNum) ? latNum : null,
        lng: isValidCoord(lngNum) ? lngNum : null,
      };
    })
    .filter((l) => isValidCoord(l.lat) && isValidCoord(l.lng));

  if (sanitized.length < 2) return null;

  const originLoc = sanitized[0];
  const destLoc = sanitized[sanitized.length - 1];

  const origin = { lat: originLoc.lat, lng: originLoc.lng };
  const destination = { lat: destLoc.lat, lng: destLoc.lng };

  const waypoints = sanitized.slice(1, -1).map((l) => ({
    location: { lat: l.lat, lng: l.lng },
    stopover: true,
  }));

  return {
    origin,
    destination,
    waypoints,
    travelMode: google.maps.TravelMode.DRIVING,
  };
};

async function calculateDistances() {
  if (!props.locations || props.locations.length < 2) return;

  const service = new google.maps.DistanceMatrixService();

  for (let i = 0; i < props.locations.length - 1; i++) {
    const origin = props.locations[i];
    const destination = props.locations[i + 1];

    try {
      const response = await new Promise((resolve, reject) => {
        service.getDistanceMatrix(
          {
            origins: [{ lat: origin.lat, lng: origin.lng }],
            destinations: [{ lat: destination.lat, lng: destination.lng }],
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === 'OK') {
              resolve(result);
            } else {
              reject(`Distance Matrix failed: ${status}`);
            }
          }
        );
      });

      const distanceText = response.rows[0].elements[0].distance?.text || 'N/A';
      destination.distance_to_next = distanceText;
    } catch (error) {
      console.error(error);
      destination.distance_to_next = 'N/A';
    }
  }
}

async function drawRoute() {
  if (!props.locations || props.locations.length < 2 || !map.value) return;

  const routeRequest = buildRouteRequest(props.locations);
  if (!routeRequest) {
    console.warn("ไม่พอข้อมูลพิกัดที่ถูกต้องสำหรับสร้าง route");
    return;
  }

  const directionsService = new google.maps.DirectionsService();
  if (!directionsRenderer) {
    directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#1D4ED8',
        strokeOpacity: 0.8,
        strokeWeight: 5,
      },
    });
    directionsRenderer.setMap(map.value);
  }
  // Debug payload
  console.log("Route request payload:", routeRequest);

  const origin = props.locations[0];
  const destination = props.locations[props.locations.length - 1];
  const waypoints = props.locations.slice(1, -1).map(loc => ({
    location: { lat: loc.lat, lng: loc.lng },
    stopover: true,
  }));

  directionsService.route(
    {
      origin: { lat: origin.lat, lng: origin.lng },
      destination: { lat: destination.lat, lng: destination.lng },
      waypoints,
      optimizeWaypoints: false,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (result, status) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result);
      } else {
        console.error('Directions request failed due to ', status);
      }
    }
  );
}

onMounted(async () => {
  await loadGoogleMapsScript();

  const firstValidLoc = props.locations.find(loc => loc.lat && loc.lng);
  if (firstValidLoc) {
    initMap({ lat: firstValidLoc.lat, lng: firstValidLoc.lng });
    addMarkers();
    await calculateDistances();
    await drawRoute(); // วาดเส้นทาง
  }
});

watch(() => props.locations, async (newLocs) => {
  const firstValidLoc = newLocs.find(loc => loc.lat && loc.lng);
  if (firstValidLoc && !mapLoaded.value) {
    initMap({ lat: firstValidLoc.lat, lng: firstValidLoc.lng });
  }
  addMarkers();
  await calculateDistances();
  await drawRoute(); 
});
</script>

<template>
  <div class="w-full h-full">
    <div id="map" class="w-full h-full" style="min-height:400px;"></div>
  </div>
</template>
