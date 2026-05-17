import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useOutbreaks } from '@/context/OutbreakContext';
import { formatDate, SEVERITY_COLORS, severityLabel } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Fix default marker icons in Vite bundler
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import icon from 'leaflet/dist/images/marker-icon.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: shadow,
});

function createSeverityIcon(severity) {
  const color = SEVERITY_COLORS[severity] || SEVERITY_COLORS.medium;
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  });
}

function FitBounds({ outbreaks }) {
  const map = useMap();
  useEffect(() => {
    if (!outbreaks.length) return;
    const bounds = L.latLngBounds(outbreaks.map((o) => [o.latitude, o.longitude]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 6 });
  }, [map, outbreaks]);
  return null;
}

export function OutbreakMap({ height = '500px' }) {
  const { outbreaks, loading, error } = useOutbreaks();

  const center = useMemo(() => {
    if (!outbreaks.length) return [20.5937, 78.9629];
    const lat = outbreaks.reduce((s, o) => s + o.latitude, 0) / outbreaks.length;
    const lng = outbreaks.reduce((s, o) => s + o.longitude, 0) / outbreaks.length;
    return [lat, lng];
  }, [outbreaks]);

  if (loading) {
    return <Skeleton className="w-full rounded-xl" style={{ height }} />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed bg-muted/50 p-8" style={{ height }}>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!outbreaks.length) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed bg-muted/50 p-8" style={{ height }}>
        <p className="text-sm text-muted-foreground">No outbreaks match your filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border shadow-sm" style={{ height }}>
      <MapContainer center={center} zoom={5} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds outbreaks={outbreaks} />
        {outbreaks.map((o) => (
          <Marker key={o._id} position={[o.latitude, o.longitude]} icon={createSeverityIcon(o.severity)}>
            <Popup>
              <div className="min-w-[180px] space-y-1 text-sm">
                <p className="font-semibold">{o.disease}</p>
                <p className="text-muted-foreground">{o.location}</p>
                <p>Cases: <strong>{o.cases.toLocaleString()}</strong></p>
                <Badge variant={o.severity}>{severityLabel(o.severity)}</Badge>
                <p className="text-xs text-muted-foreground">Reported: {formatDate(o.reportedAt)}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="flex flex-wrap gap-4 border-t bg-card px-4 py-2 text-xs">
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-health-low" /> Low</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-health-medium" /> Medium</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-health-high" /> High</span>
      </div>
    </div>
  );
}
