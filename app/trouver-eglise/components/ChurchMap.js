"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";

const defaultCenter = [48.8566, 2.3522]; // Paris

function SetViewOnUser({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 10);
  }, [position, map]);
  return null;
}

export default function ChurchMap({ churches }) {
  const [userPos, setUserPos] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPos([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          console.warn("Géo refusée", err);
        }
      );
    }
  }, []);

  const customIcon = new L.Icon({
    iconUrl: "/icons/church-marker.png", // Ajoute une icône dans public/icons/
    iconSize: [32, 32],
  });

  return (
    <MapContainer center={defaultCenter} zoom={5} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {userPos && <SetViewOnUser position={userPos} />}
      {churches.map((church) => (
        <Marker key={church._id} position={[church.coordinates.lat, church.coordinates.lng]} icon={customIcon}>
          <Popup>
            <strong>{church.name}</strong><br />
            {church.address}<br />
            {church.phone && <div>📞 {church.phone}</div>}
            {church.email && <div>✉️ {church.email}</div>}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
