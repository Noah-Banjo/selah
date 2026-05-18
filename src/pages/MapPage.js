import { useEffect, useMemo, useRef, useState } from 'react';
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

const stopLatLng = (s) => {
  if (Array.isArray(s.coords)) return s.coords;
  if (typeof s.lat === 'number' && typeof s.lng === 'number') return [s.lat, s.lng];
  return null;
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

  const [journeySearch, setJourneySearch] = useState('');

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

  const journeyEntries = useMemo(
    () =>
      Object.entries(journeys)
        .map(([id, j]) => ({ id, ...j }))
        .filter((j) => Array.isArray(j.stops) && j.stops.length > 0)
        .sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const filteredEntries = useMemo(() => {
    const q = journeySearch.trim().toLowerCase();
    if (!q) return journeyEntries;
    return journeyEntries.filter((j) => j.name.toLowerCase().includes(q));
  }, [journeyEntries, journeySearch]);

  const journeyBounds = useMemo(
    () =>
      journey
        ? journey.stops.map(stopLatLng).filter((c) => c !== null)
        : null,
    [journey]
  );

  const selectJourney = (id) => {
    const next = new URLSearchParams(searchParams);
    if (id) next.set('journey', id);
    else next.delete('journey');
    next.delete('location');
    setSearchParams(next, { replace: true });
    setJourneySearch('');
  };

  const clearJourney = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('journey');
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="map-page">
      <div className="map-controls">
        <div className="journey-picker">
          <span className="journey-picker__label">Trace a Journey</span>
          <div className="journey-picker__search">
            <span className="journey-picker__icon" aria-hidden="true">⌕</span>
            <input
              type="search"
              className="journey-picker__input"
              placeholder={`Search ${journeyEntries.length} characters…`}
              value={journeySearch}
              onChange={(e) => setJourneySearch(e.target.value)}
              aria-label="Search character journeys"
            />
            {journeySearch && (
              <button
                type="button"
                className="journey-picker__clear"
                onClick={() => setJourneySearch('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          <ul className="journey-picker__list" role="listbox">
            {filteredEntries.length === 0 ? (
              <li className="journey-picker__empty">No matches</li>
            ) : (
              filteredEntries.map((j) => {
                const active = j.id === journeyId;
                return (
                  <li key={j.id}>
                    <button
                      type="button"
                      className={`journey-picker__option${active ? ' journey-picker__option--active' : ''}`}
                      onClick={() => selectJourney(active ? null : j.id)}
                    >
                      <span
                        className="journey-picker__swatch"
                        style={{ backgroundColor: j.color }}
                        aria-hidden="true"
                      />
                      <span className="journey-picker__name">{j.name}</span>
                      <span className="journey-picker__count">{j.stops.length}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>

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
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
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
                {loc.hebrewOrGreekName && (
                  <span
                    className="map-popup__script"
                    lang={loc.scriptLang || (loc.testament === 'NT' ? 'grc' : 'he')}
                  >
                    {loc.hebrewOrGreekName}
                  </span>
                )}
                {loc.ancientName && (
                  <span className="map-popup__ancient">{loc.ancientName}</span>
                )}
                {(loc.modernName || loc.modernCountry) && (
                  <span className="map-popup__modern">
                    <span className="map-popup__modern-label">Modern:</span>{' '}
                    {loc.modernName ? `${loc.modernName}` : ''}
                    {loc.modernName && loc.modernCountry ? ', ' : ''}
                    {loc.modernCountry || ''}
                  </span>
                )}
                {loc.nameChange && (
                  <p className="map-popup__name-change">{loc.nameChange}</p>
                )}
                <p className="map-popup__significance">{loc.significance}</p>
                {loc.characters && loc.characters.length > 0 && (
                  <div className="map-popup__figures">
                    <span className="map-popup__label">Figures</span>
                    <ul className="map-popup__chip-list">
                      {loc.characters.map((c) => (
                        <li key={c} className="map-popup__chip">{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Popup>
            </CircleMarker>
          );
        })}

        {journey && (
          <>
            <Polyline
              positions={journey.stops.map(stopLatLng).filter((c) => c !== null)}
              pathOptions={{
                color: journey.color,
                weight: 3,
                opacity: 0.85,
                dashArray: '6 8',
              }}
            />
            {journey.stops.map((stop, i) => {
              const pos = stopLatLng(stop);
              if (!pos) return null;
              return (
                <Marker
                  key={`${journeyId}-${i}`}
                  position={pos}
                  icon={numberedIcon(i + 1, journey.color)}
                  zIndexOffset={1000}
                >
                  <Tooltip direction="top" offset={[0, -14]} opacity={1}>
                    <strong>
                      {i + 1}. {stop.name}
                    </strong>
                    <br />
                    <span style={{ color: '#cfcfc4' }}>
                      {stop.description || stop.note}
                    </span>
                  </Tooltip>
                </Marker>
              );
            })}
          </>
        )}
      </MapContainer>
    </div>
  );
}

export default MapPage;
