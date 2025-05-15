import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';



export default function ActivityMap({ onReady }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
  const saved = localStorage.getItem('mapView');
  const initialView = saved ? JSON.parse(saved) : { lat: 35.6812, lng: 139.7671, zoom: 13 };

  const mapInstance = L.map(mapRef.current).setView([initialView.lat, initialView.lng], initialView.zoom);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(mapInstance);

  const reiwaIcon = L.icon({
    iconUrl: '/images/re_pin.png',
    iconSize: [52, 52],        // サイズ調整（画像サイズに応じて）
    iconAnchor: [20, 52],      // アイコンの位置（下辺中央）
    popupAnchor: [0, -52]      // ポップアップの位置調整
  });

  L.marker([35.6812, 139.7671], { icon: reiwaIcon })
    .addTo(mapInstance)
    .bindPopup("📍 サンプルピン：東京駅");

  // 📝 パン・ズーム終了時に保存
  mapInstance.on('moveend', () => {
    const center = mapInstance.getCenter();
    const zoom = mapInstance.getZoom();
    localStorage.setItem('mapView', JSON.stringify({ lat: center.lat, lng: center.lng, zoom }));
  });

  setMap(mapInstance);
  setTimeout(() => mapInstance.invalidateSize(), 200);

  if (onReady) {
    onReady(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          mapInstance.setView([latitude, longitude], 15);
        },
        () => {
          alert("現在地を取得できませんでした");
        }
      );
    });
  }

  return () => mapInstance.remove();
}, []);


  return (
    <div ref={mapRef} id="activity-map" style={{ height: '100%', width: '100%' }}></div>
  );
}

// useEffect の外に書く（上でも下でもOK）
function getReiwaIcon(dateStr, hasDeadline) {
  const today = new Date();
  const postDate = new Date(dateStr);
  const diffDays = Math.floor((today - postDate) / (1000 * 60 * 60 * 24));

  let iconUrl = '/images/re_pin_fade.png';

  if (hasDeadline) {
    iconUrl = '/images/re_pin_event.png';
  } else if (diffDays <= 7) {
    iconUrl = '/images/re_pin_normal.png';
  } else if (diffDays <= 14) {
    iconUrl = '/images/re_pin_mid.png';
  }

  return L.icon({
    iconUrl,
    iconSize: [52, 52],
    iconAnchor: [26, 52],
    popupAnchor: [0, -52]
  });
}
