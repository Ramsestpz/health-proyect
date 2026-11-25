import { useEffect, useRef } from 'react';
import { MapContainer, Marker, Polygon, Popup, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import LocationForm from './LocationForm';
import LocationPopup from './LocationPopup';
import { LEON_CENTER, TILE_ATTRIBUTION, TILE_URL, categoryIcon, draftIcon, polygonToLatLngs, toLatLng } from '../utils/map';

/**
 * Herramientas de dibujo de zonas con Leaflet-Geoman.
 * Al terminar un polígono se lee como GeoJSON ([lng, lat]) y se pasa a onDrawn;
 * la capa temporal se quita porque la zona real se pinta desde MongoDB.
 */
function ZoneDrawControl({ onDrawn }) {
  const map = useMap();
  const onDrawnRef = useRef(onDrawn);
  useEffect(() => {
    onDrawnRef.current = onDrawn;
  }, [onDrawn]);

  useEffect(() => {
    map.pm.setLang('es');
    map.pm.addControls({
      position: 'topleft',
      drawPolygon: true,
      drawRectangle: true,
      drawMarker: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawCircle: false,
      drawText: false,
      editMode: false,
      dragMode: false,
      cutPolygon: false,
      removalMode: false,
      rotateMode: false,
    });
    map.pm.setPathOptions({ color: '#e4572e', fillOpacity: 0.15, weight: 2 });

    const handleCreate = (e) => {
      const geojson = e.layer.toGeoJSON(); // Feature<Polygon> con coordenadas [lng, lat]
      map.removeLayer(e.layer);
      onDrawnRef.current(geojson.geometry.coordinates);
    };
    map.on('pm:create', handleCreate);
    return () => {
      map.off('pm:create', handleCreate);
      map.pm.removeControls();
    };
  }, [map]);

  return null;
}

/**
 * Maneja el clic en el mapa para registrar una ubicación exacta.
 * Ignora el clic si se está dibujando una zona o si el clic solo sirvió para cerrar un popup.
 */
function ClickToRegister({ onMapClick }) {
  const lastPopupClose = useRef(0);
  const map = useMapEvents({
    popupclose: () => {
      lastPopupClose.current = Date.now();
    },
    click: (e) => {
      if (map.pm?.globalDrawModeEnabled()) return;
      if (Date.now() - lastPopupClose.current < 250) return;
      onMapClick([e.latlng.lng, e.latlng.lat]); // GeoJSON: [longitud, latitud]
    },
  });
  return null;
}

/**
 * Contenedor del contenido de los popups.
 * React procesa el clic (y re-renderiza el popup) antes que Leaflet; si el clic sigue subiendo,
 * Leaflet ya no encuentra el botón dentro del popup, lo toma como clic en el mapa y cierra el popup.
 * Detener la propagación aquí lo evita.
 */
const PopupBody = ({ children }) => <div onClick={(e) => e.stopPropagation()}>{children}</div>;

// Mueve la cámara cuando se selecciona una fila de la tabla o una zona de la lista.
function MapFocus({ focus, markerRefs }) {
  const map = useMap();
  useEffect(() => {
    if (!focus) return;
    if (focus.type === 'location') {
      map.flyTo(toLatLng(focus.coordinates), 16, { duration: 0.8 });
      map.once('moveend', () => markerRefs.current[focus.id]?.openPopup());
    }
    if (focus.type === 'zone') {
      map.flyToBounds(L.latLngBounds(polygonToLatLngs(focus.geometry)), { padding: [40, 40], duration: 0.8 });
    }
  }, [focus, map, markerRefs]);
  return null;
}

export default function HealthMap({ locations, zones, categories, draft, setDraft, onCreate, onUpdate, onDelete, onZoneDrawn, focus, height = 560 }) {
  const markerRefs = useRef({});
  const draftRef = useRef(null);

  // Abre automáticamente el popup del punto nuevo
  useEffect(() => {
    if (draft) setTimeout(() => draftRef.current?.openPopup(), 0);
  }, [draft]);

  return (
    <MapContainer center={LEON_CENTER} zoom={13} style={{ height }} className="w-full rounded-2xl" scrollWheelZoom>
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
      <ZoneDrawControl onDrawn={onZoneDrawn} />
      <ClickToRegister onMapClick={setDraft} />
      <MapFocus focus={focus} markerRefs={markerRefs} />

      {/* Zonas guardadas en MongoDB (GeoJSON Polygon) */}
      {zones.map((zone) => (
        <Polygon
          key={zone._id}
          positions={polygonToLatLngs(zone.geometry)}
          pathOptions={{ color: zone.color, weight: 2, fillOpacity: 0.12, dashArray: zone.type === 'Riesgo sanitario' ? '6 6' : undefined, pmIgnore: true }}
        >
          <Tooltip sticky>
            <b>{zone.name}</b> · {zone.type}
          </Tooltip>
        </Polygon>
      ))}

      {/* Ubicaciones exactas (GeoJSON Point) */}
      {locations.map((location) => (
        <Marker
          key={location._id}
          position={toLatLng(location.geometry.coordinates)}
          icon={categoryIcon(location.category, { closed: location.status === 'Cerrado' })}
          ref={(ref) => {
            if (ref) markerRefs.current[location._id] = ref;
            else delete markerRefs.current[location._id];
          }}
          pmIgnore
        >
          <Popup minWidth={280} maxWidth={320}>
            <PopupBody>
              <LocationPopup location={location} categories={categories} onUpdate={onUpdate} onDelete={onDelete} />
            </PopupBody>
          </Popup>
        </Marker>
      ))}

      {/* Punto nuevo: formulario de registro dentro del popup */}
      {draft && (
        <Marker position={toLatLng(draft)} icon={draftIcon} ref={draftRef} pmIgnore eventHandlers={{ popupclose: () => setDraft(null) }}>
          <Popup minWidth={280} maxWidth={320}>
            <PopupBody>
              <p className="mb-2 font-display text-lg font-extrabold text-ink">Nueva ubicación</p>
              <LocationForm
                key={draft.join(',')}
                coordinates={draft}
                categories={categories}
                submitLabel="Registrar"
                onCancel={() => setDraft(null)}
                onSubmit={onCreate}
              />
            </PopupBody>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
