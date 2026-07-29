"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultIcon = L.divIcon({
  className: "",
  html: '<div style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#8B1E3F;color:white;border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,.25)"><span style="transform:rotate(45deg);font-size:16px">✝</span></div>',
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -32],
});

function FitChurches({ churches, centerPosition }) {
  const map = useMap();

  useEffect(() => {
    const points = churches
      .map((church) => church.coordinates?.coordinates)
      .filter((coordinates) => Array.isArray(coordinates) && coordinates.length === 2)
      .map(([lng, lat]) => [lat, lng]);

    if (centerPosition) points.push([centerPosition.lat, centerPosition.lng]);
    if (points.length === 0) return;
    if (points.length === 1) {
      map.flyTo(points[0], 13);
      return;
    }

    map.fitBounds(points, { padding: [36, 36], maxZoom: 14 });
  }, [centerPosition, churches, map]);

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
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitChurches churches={churches} centerPosition={centerPosition} />

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
