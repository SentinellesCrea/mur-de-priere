"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Icône personnalisée (optionnelle)
const defaultIcon = new L.Icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Composant interne pour centrer dynamiquement la carte
function FlyToLocation({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 14);
    }
  }, [position, map]);

  return null;
}

export default function ChurchMap({ churches = [], centerPosition = null }) {
  return (
    <MapContainer
      center={centerPosition ? [centerPosition.lat, centerPosition.lng] : [48.8566, 2.3522]} // Paris par défaut
      zoom={12}
      scrollWheelZoom={true}
      style={{ width: "100%", height: "100%" }}
      className={"z-0"}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {centerPosition && <FlyToLocation position={centerPosition} />}

      {churches.map((church, i) => {
        const coords = church.coordinates?.coordinates; // GeoJSON: [lng, lat]
        if (!coords || coords.length !== 2) return null;

        return (
          <Marker
            key={church._id || i}
            position={[coords[1], coords[0]]} // Leaflet attend [lat, lng]
            icon={defaultIcon}
          >
            <Popup>
              <strong>{church.name}</strong>
              <br />
              {church.address}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
