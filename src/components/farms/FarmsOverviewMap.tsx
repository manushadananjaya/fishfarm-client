import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { FishFarmMapDto } from '../../types';

// Fix Leaflet default icon paths broken by Vite
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const NORWAY_CENTER: [number, number] = [65.5, 14.0];
const NORWAY_ZOOM = 5;

// ── Custom branded marker icon ─────────────────────────────────────────────

function createFarmIcon(farmCode: string, isHighlighted = false): L.DivIcon {
  const bg    = isHighlighted ? '#C0392B' : '#003D7A';
  const shade = isHighlighted ? '#96251A' : '#002050';

  return L.divIcon({
    className: '',
    iconAnchor: [30, 46],
    popupAnchor: [0, -48],
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 3px 8px rgba(0,0,0,0.38));">
        <div style="
          background:${bg};
          color:#fff;
          border:2px solid rgba(255,255,255,0.5);
          border-radius:8px;
          padding:4px 9px;
          font-family:Inter,system-ui,sans-serif;
          font-size:10.5px;
          font-weight:700;
          letter-spacing:0.05em;
          white-space:nowrap;
          min-width:54px;
          text-align:center;
          line-height:1.4;
          transition:background .15s;
        ">${farmCode}</div>
        <div style="
          width:0;height:0;
          border-left:7px solid transparent;
          border-right:7px solid transparent;
          border-top:9px solid ${shade};
          margin-top:-1px;
        "></div>
      </div>
    `,
  });
}

// ── Auto-fit to all farms on first load ────────────────────────────────────

function FitBoundsOnLoad({ farms }: { farms: FishFarmMapDto[] }) {
  const map    = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (farms.length === 0 || fitted.current) return;
    if (farms.length === 1) {
      map.setView([farms[0].gpsLatitude, farms[0].gpsLongitude], 11);
    } else {
      map.fitBounds(
        L.latLngBounds(farms.map((f) => [f.gpsLatitude, f.gpsLongitude])),
        { padding: [56, 56], maxZoom: 12 },
      );
    }
    fitted.current = true;
  }, [farms, map]);

  return null;
}

// ── External fit-all trigger ───────────────────────────────────────────────

function FitAllOnTrigger({ farms, trigger }: { farms: FishFarmMapDto[]; trigger: number }) {
  const map      = useMap();
  const prevTrig = useRef(0);

  useEffect(() => {
    if (trigger === 0 || trigger === prevTrig.current || farms.length === 0) return;
    prevTrig.current = trigger;
    if (farms.length === 1) {
      map.setView([farms[0].gpsLatitude, farms[0].gpsLongitude], 11);
    } else {
      map.fitBounds(
        L.latLngBounds(farms.map((f) => [f.gpsLatitude, f.gpsLongitude])),
        { padding: [56, 56], maxZoom: 12 },
      );
    }
  }, [trigger, farms, map]);

  return null;
}

// ── Viewport change tracker ────────────────────────────────────────────────

function ViewportTracker({
  farms,
  onVisibleChange,
}: {
  farms: FishFarmMapDto[];
  onVisibleChange: (ids: Set<string>) => void;
}) {
  const map = useMapEvents({
    moveend: () => update(),
    zoomend: () => update(),
  });

  const update = useCallback(() => {
    const bounds  = map.getBounds();
    const visible = new Set(
      farms
        .filter((f) => bounds.contains(L.latLng(f.gpsLatitude, f.gpsLongitude)))
        .map((f) => f.id),
    );
    onVisibleChange(visible);
  }, [farms, map, onVisibleChange]);

  useEffect(() => { update(); }, [update]);

  return null;
}

// ── FlyTo controller — exposes imperative flyTo via ref ────────────────────

export interface FarmsOverviewMapHandle {
  flyTo: (lat: number, lng: number, zoom?: number) => void;
}

function FlyToController({
  handle,
}: {
  handle: React.MutableRefObject<FarmsOverviewMapHandle | null>;
}) {
  const map = useMap();

  useEffect(() => {
    handle.current = {
      flyTo: (lat, lng, zoom = 10) => {
        map.flyTo([lat, lng], zoom, { duration: 1.1 });
      },
    };
  }, [map, handle]);

  return null;
}

// ── Main component ─────────────────────────────────────────────────────────

interface FarmsOverviewMapProps {
  farms: FishFarmMapDto[];
  /** External trigger: increment to fit all farms */
  fitTrigger?: number;
  highlightedId?: string | null;
  onMarkerClick?: (id: string) => void;
  onVisibleChange?: (visibleIds: Set<string>) => void;
}

const FarmsOverviewMap = forwardRef<FarmsOverviewMapHandle, FarmsOverviewMapProps>(
  function FarmsOverviewMap(
    { farms, fitTrigger = 0, highlightedId = null, onMarkerClick, onVisibleChange },
    ref,
  ) {
    const handleRef = useRef<FarmsOverviewMapHandle | null>(null);

    // Forward the imperative handle to the parent
    useImperativeHandle(ref, () => ({
      flyTo: (lat, lng, zoom) => handleRef.current?.flyTo(lat, lng, zoom),
    }));

    const handleVisible = useCallback(
      (ids: Set<string>) => { onVisibleChange?.(ids); },
      [onVisibleChange],
    );

    return (
      <MapContainer
        center={NORWAY_CENTER}
        zoom={NORWAY_ZOOM}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
        zoomControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {farms.map((farm) => (
          <Marker
            key={farm.id}
            position={[farm.gpsLatitude, farm.gpsLongitude]}
            icon={createFarmIcon(farm.farmCode, farm.id === highlightedId)}
            eventHandlers={{
              click: () => onMarkerClick?.(farm.id),
            }}
          />
        ))}

        <FitBoundsOnLoad farms={farms} />
        <FitAllOnTrigger farms={farms} trigger={fitTrigger} />
        <ViewportTracker farms={farms} onVisibleChange={handleVisible} />
        <FlyToController handle={handleRef} />
      </MapContainer>
    );
  },
);

export default FarmsOverviewMap;
