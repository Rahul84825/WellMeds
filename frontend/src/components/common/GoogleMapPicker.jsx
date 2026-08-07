import React, { useEffect, useRef, useState } from "react";
import { loadGoogleMapsScript, fetchStoreLocation } from "../../services/googleMapsService";
import { MapPin, Navigation, Compass, AlertCircle } from "lucide-react";

const GoogleMapPicker = ({
  latitude,
  longitude,
  onLocationSelect = null,
  height = "240px",
  interactive = true,
  showRoute = true,
  className = "",
}) => {
  const mapRef = useRef(null);
  const googleMapObj = useRef(null);
  const markerObj = useRef(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [storeLocation, setStoreLocation] = useState({ lat: 18.559, lng: 73.7868 });

  const currentLat = latitude ? parseFloat(latitude) : storeLocation.lat;
  const currentLng = longitude ? parseFloat(longitude) : storeLocation.lng;

  useEffect(() => {
    fetchStoreLocation().then((store) => {
      if (store && store.latitude && store.longitude) {
        setStoreLocation({ lat: store.latitude, lng: store.longitude });
      }
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    loadGoogleMapsScript()
      .then((google) => {
        if (!isMounted) return;
        if (!google || !google.maps) {
          setLoadError(true);
          return;
        }

        if (!mapRef.current) return;

        const center = { lat: currentLat, lng: currentLng };

        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom: 14,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          styles: [
            {
              featureType: "poi.medical",
              elementType: "geometry",
              stylers: [{ color: "#e1f5fe" }],
            },
          ],
        });

        googleMapObj.current = map;

        // Destination Marker (Teal Pin)
        const marker = new google.maps.Marker({
          position: center,
          map,
          draggable: interactive,
          animation: google.maps.Animation.DROP,
          title: "Delivery Location",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: "#157a6d",
            fillOpacity: 1,
            strokeWeight: 3,
            strokeColor: "#ffffff",
          },
        });

        markerObj.current = marker;

        if (interactive && onLocationSelect) {
          // Drag End Event
          marker.addListener("dragend", (e) => {
            const newLat = e.latLng.lat();
            const newLng = e.latLng.lng();
            onLocationSelect({ latitude: newLat, longitude: newLng });
          });

          // Map Click Event
          map.addListener("click", (e) => {
            const newLat = e.latLng.lat();
            const newLng = e.latLng.lng();
            marker.setPosition({ lat: newLat, lng: newLng });
            onLocationSelect({ latitude: newLat, longitude: newLng });
          });
        }

        // Add Store Marker
        new google.maps.Marker({
          position: storeLocation,
          map,
          title: "WellMeds Pharmacy Store",
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 5,
            fillColor: "#0f6157",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#ffffff",
          },
        });

        // Add Directions Route line if showRoute is enabled
        if (showRoute && (currentLat !== storeLocation.lat || currentLng !== storeLocation.lng)) {
          const directionsService = new google.maps.DirectionsService();
          const directionsRenderer = new google.maps.DirectionsRenderer({
            map,
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: "#157a6d",
              strokeWeight: 4,
              strokeOpacity: 0.8,
            },
          });

          directionsService.route(
            {
              origin: storeLocation,
              destination: center,
              travelMode: google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
              if (status === google.maps.DirectionsStatus.OK) {
                directionsRenderer.setDirections(result);
              }
            }
          );
        }

        setMapLoaded(true);
      })
      .catch((err) => {
        console.error("GoogleMapPicker Load Error:", err);
        if (isMounted) setLoadError(true);
      });

    return () => {
      isMounted = false;
    };
  }, [currentLat, currentLng, interactive, showRoute]);

  if (loadError) {
    return (
      <div
        className={`w-full rounded-2xl bg-teal-50/60 dark:bg-zinc-900 border border-teal-200/80 dark:border-zinc-800 p-4 text-center flex flex-col items-center justify-center ${className}`}
        style={{ height }}
      >
        <MapPin size={28} className="text-[#157a6d] mb-1.5 animate-bounce" />
        <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">Delivery Destination Map</p>
        <p className="text-[11px] text-slate-500 font-medium">
          {latitude && longitude
            ? `Coordinates: ${parseFloat(latitude).toFixed(4)}, ${parseFloat(longitude).toFixed(4)}`
            : "Baner - Pashan Link Road, Pune"}
        </p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${currentLat},${currentLng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 text-[11px] font-bold text-[#157a6d] underline hover:text-[#0f6157] flex items-center gap-1"
        >
          <Navigation size={12} /> Open in Google Maps
        </a>
      </div>
    );
  }

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-[#dde8e3] dark:border-zinc-800 shadow-xs ${className}`} style={{ height }}>
      <div ref={mapRef} className="w-full h-full" />
      {interactive && (
        <div className="absolute bottom-2 left-2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 text-[10px] font-bold text-[#157a6d] shadow-sm flex items-center gap-1 pointer-events-none">
          <Compass size={12} /> Click map or drag pin to fine-tune location
        </div>
      )}
    </div>
  );
};

export default GoogleMapPicker;
