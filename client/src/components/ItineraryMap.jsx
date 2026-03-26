import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  Tooltip,
} from "react-leaflet";

export default function ItineraryMap({ center, mapPoints = [] }) {
  const mapCenter = center
    ? [center.lat, center.lng]
    : mapPoints.length > 0
      ? [mapPoints[0].lat, mapPoints[0].lng]
      : [20.5937, 78.9629];

  return (
    <div className="h-[26rem] overflow-hidden rounded-[1.75rem] border border-white/10">
      <MapContainer center={mapCenter} zoom={14} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {center ? (
          <CircleMarker
            center={[center.lat, center.lng]}
            radius={10}
            pathOptions={{ color: "#22d3ee", fillColor: "#22d3ee", fillOpacity: 0.9 }}
          >
            <Popup>Your anchor location</Popup>
          </CircleMarker>
        ) : null}

        {mapPoints.map((point) => (
          <CircleMarker
            key={point.id}
            center={[point.lat, point.lng]}
            radius={12}
            pathOptions={{ color: "#f472b6", fillColor: "#f472b6", fillOpacity: 0.85 }}
          >
            <Tooltip permanent direction="top" offset={[0, -12]}>
              <span className="text-xs font-semibold">{point.order}</span>
            </Tooltip>
            <Popup>
              <div className="space-y-1 text-sm">
                <p className="font-semibold">{point.title}</p>
                <p>
                  {point.startTime} - {point.endTime}
                </p>
                <p>{point.reason}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
