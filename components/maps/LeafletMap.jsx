
"use client";

import { MapContainer, TileLayer, Marker, useMapEvent } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

// Corrige íconos default de Leaflet para entornos como Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function ClickHandler({ onSelect }) {
  useMapEvent('click', (e) => {
    const { lat, lng } = e.latlng;
    if (onSelect) onSelect([lat, lng]);
  });
  return null;
}

const LeafletMap = ({ onSelect, markerLocation, markerLabel, userLocation }) => {
  if (!userLocation) {
    return <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 16}}>Obteniendo ubicación...</div>;
  }
  return (
    <MapContainer
      center={userLocation}
      zoom={13}
      scrollWheelZoom={true}
      style={{ width: '100%', height: '100%', borderRadius: '8px', zIndex: 0 }}
      attributionControl={false}
    >
      <TileLayer
        attribution='© OpenStreetMap contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      <ClickHandler onSelect={onSelect} />
      {markerLocation && (
        <Marker position={markerLocation} title={markerLabel || 'Taller'} />
      )}
    </MapContainer>
  );
};

export default LeafletMap;
