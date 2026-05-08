import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Marker,
  Tooltip,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import locations from '../data/locations.json';
import journeys from '../data/journeys.json';

const CENTER = [31.7683, 35.2137];
const ZOOM = 5;

const MARKER_STYLE = {
  color: '#8a6f24',
  fillColor: '#C9A84C',
  fillOpacity: 0.9,
  weight: 2,
};

const MARKER_HOVER_STYLE = {
  ...MARKER_STYLE,
  fillColor: '#D9BC68',
  weight: 3,
};

const MARKER_DIM_STYLE = {
  color: '#3a3a3a',
  fillColor: '#5a5a5a',
  fillOpacity: 0.45,
  weight: 1,
};

function numberedIcon(n, color) {
  return L.divIcon({
    className: 'journey-icon',
    html: `<span class="journey-pin" style="--pin:${color}">${n}</span>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function MapEffects({ focusCoords, focusZoom, fitBounds }) {
  const map = useMap();
  useEffect(() => {
    if (focusCoords) {
      map.flyTo(focusCoords, focusZoom ?? 8, { duration: 1.1 });
    }
  }, [focusCoords, focusZoom, map]);

  useEffect(() => {
    if (fitBounds && fitBounds.length >= 2) {
      const bounds = L.latLngBounds(fitBounds);
      map.flyToBounds(bounds, { padding: [60, 60], duration: 1.1 });
    }
  }, [fitBounds, map]);

  return null;
}

function MapPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const focusedLocationId = searchParams.get('location');
  const journeyId = searchParams.get('journey');
  const journey = journeyId ? journeys[journeyId] : null;

  const markerRefs = useRef({});

  const focusedLocation = useMemo(
    () => locations.find((l) => l.id === focusedLocationId),
    [focusedLocationId]
  );

  useEffect(() => {
    if (!focusedLocationId) return;
    const ref = markerRefs.current[focusedLocationId];
    if (ref) {
      const t = setTimeout(() => ref.openPopup(), 250);
      return () => clearTimeout(t);
    }
  }, [focusedLocationId]);

  const journeyBounds = useMemo(
    () => (journey ? journey.stops.map((s) => s.coords) : null),
    [journey]
  );

  const handleJourneyChange = (e) => {
    const next = new URLSearchParams(searchParams);
    const value = e.target.value;
    if (value) {
      next.set('journey', value);
    } else {
      next.delete('journey');
    }
    next.delete('location');
    setSearchParams(next, { replace: true });
  };

  const clearJourney = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('journey');
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="map-page">
      <div className="map-controls">
        <label className="journey-select" htmlFor="journey-select">
          <span className="journey-select__label">Trace a Journey</span>
          <div className="journey-select__field">
            <select
              id="journey-select"
              value={journeyId ?? ''}
              onChange={handleJourneyChange}
            >
              <option value="">Select a character…</option>
              {Object.entries(journeys).map(([id, j]) => (
                <option key={id} value={id}>
                  {j.name}
                </option>
              ))}
            </select>
            <span className="journey-select__chevron" aria-hidden="true">▾</span>
          </div>
        </label>

        {journey && (
          <div className="journey-legend">
            <span
              className="journey-legend__swatch"
              style={{ backgroundColor: journey.color }}
              aria-hidden="true"
            />
            <div className="journey-legend__text">
              <span className="journey-legend__name">{journey.name}'s journey</span>
              <span className="journey-legend__desc">{journey.description}</span>
            </div>
            <button
              type="button"
              className="journey-legend__clear"
              onClick={clearJourney}
              aria-label="Clear journey"
            >
              ×
            </button>
          </div>
        )}
      </div>

      <MapContainer
        center={CENTER}
        zoom={ZOOM}
        scrollWheelZoom
        className="map"
        worldCopyJump
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapEffects
          focusCoords={focusedLocation?.coords}
          focusZoom={focusedLocation ? 8 : undefined}
          fitBounds={journey ? journeyBounds : null}
        />

        {locations.map((loc) => {
          const isFocused = focusedLocationId === loc.id;
          const baseStyle = journey
            ? MARKER_DIM_STYLE
            : isFocused
            ? MARKER_HOVER_STYLE
            : MARKER_STYLE;
          return (
            <CircleMarker
              key={loc.id}
              center={loc.coords}
              radius={isFocused ? 11 : 9}
              pathOptions={baseStyle}
              ref={(ref) => {
                if (ref) markerRefs.current[loc.id] = ref;
              }}
              eventHandlers={{
                mouseover: (e) =>
                  !journey && e.target.setStyle(MARKER_HOVER_STYLE),
                mouseout: (e) => e.target.setStyle(baseStyle),
              }}
            >
              <Popup className="map-popup">
                <h3 className="map-popup__name">{loc.name}</h3>
                <span className="map-popup__country">{loc.modernCountry}</span>
                <p className="map-popup__significance">{loc.significance}</p>
                <div className="map-popup__figures">
                  <span className="map-popup__label">Figures</span>
                  <span className="map-popup__list">
                    {loc.characters.join(' · ')}
                  </span>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {journey && (
          <>
            <Polyline
              positions={journey.stops.map((s) => s.coords)}
              pathOptions={{
                color: journey.color,
                weight: 3,
                opacity: 0.85,
                dashArray: '6 8',
              }}
            />
            {journey.stops.map((stop, i) => (
              <Marker
                key={`${journeyId}-${i}`}
                position={stop.coords}
                icon={numberedIcon(i + 1, journey.color)}
                zIndexOffset={1000}
              >
                <Tooltip direction="top" offset={[0, -14]} opacity={1}>
                  <strong>
                    {i + 1}. {stop.name}
                  </strong>
                  <br />
                  <span style={{ color: '#cfcfc4' }}>{stop.note}</span>
                </Tooltip>
              </Marker>
            ))}
          </>
        )}
      </MapContainer>
    </div>
  );
}

export default MapPage;
