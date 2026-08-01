"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultIcon = L.divIcon({
  className: "",
  html: '<div style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#8B1E3F;color:white;border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,.25)"><span style="transform:rotate(45deg);font-size:16px">✝</span></div>',
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -32],
});

export default function ChurchMap({ churches = [], centerPosition = null }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerLayerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const map = L.map(container, {
      center: [48.8566, 2.3522],
      zoom: 12,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    }).addTo(map);

    const markerLayer = L.layerGroup().addTo(map);
    mapRef.current = map;
    markerLayerRef.current = markerLayer;

    const resizeTimer = window.setTimeout(() => map.invalidateSize(), 0);

    return () => {
      window.clearTimeout(resizeTimer);
      markerLayerRef.current = null;
      mapRef.current = null;
      map.remove();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;
    if (!map || !markerLayer) return;

    markerLayer.clearLayers();

    const points = churches
      .map((church) => church.coordinates?.coordinates)
      .filter((coordinates) => Array.isArray(coordinates) && coordinates.length === 2)
      .map(([lng, lat]) => [lat, lng]);

    churches.forEach((church) => {
      const coordinates = church.coordinates?.coordinates;
      if (!Array.isArray(coordinates) || coordinates.length !== 2) return;

      const [lng, lat] = coordinates;
      const popup = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = church.name || "Église";
      popup.append(name);

      if (church.address) {
        popup.append(document.createElement("br"));
        popup.append(document.createTextNode(church.address));
      }

      L.marker([lat, lng], { icon: defaultIcon })
        .bindPopup(popup)
        .addTo(markerLayer);
    });

    if (centerPosition) points.push([centerPosition.lat, centerPosition.lng]);
    if (points.length === 0) return;

    if (points.length === 1) {
      map.flyTo(points[0], 13);
      return;
    }

    map.fitBounds(points, { padding: [36, 36], maxZoom: 14 });
  }, [centerPosition, churches]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%" }}
      className="z-0"
      aria-label="Carte des églises"
    />
  );
}
