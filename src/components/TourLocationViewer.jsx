import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin } from "lucide-react";

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const tourIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function SetView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function TourLocationViewer({ coordinates }) {
  const { t } = useTranslation();

  // Helper to parse coordinates (string or number)
  const parseCoord = (value) => {
    if (value === undefined || value === null) return NaN;
    const num = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(num) ? NaN : num;
  };

  const lat = parseCoord(coordinates?.lat);
  const lng = parseCoord(coordinates?.lng);

  const isValidLocation =
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180;
  const location = isValidLocation ? { lat, lng } : null;

  if (!location) {
    return (
      <div className='card bg-base-100 shadow-xl'>
        <div className='card-body items-center text-center p-8'>
          <div className='w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4'>
            <MapPin className='w-8 h-8 text-amber-400' />
          </div>
          <h3 className='text-lg font-semibold text-stone-700 mb-2'>
            {t("tourLocationViewer.noLocationTitle", "No Location Available")}
          </h3>
          <p className='text-sm text-stone-400'>
            {t(
              "tourLocationViewer.noLocationMessage",
              "Coordinates for this tour have not been set."
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='card bg-base-100 shadow-xl'>
      <div className='card-body p-6'>
        <div className='rounded-lg overflow-hidden border border-base-300'>
          <MapContainer
            center={location}
            zoom={15}
            style={{ height: "400px", width: "100%" }}
          >
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            />
            <SetView center={location} zoom={15} />
            <Marker position={location} icon={tourIcon}>
              <Popup>
                <div className='p-2'>
                  <h3 className='font-bold text-sm mb-1'>
                    {t("tourLocationViewer.popupTitle", "Tour Location")}
                  </h3>
                  <p className='text-xs text-gray-600'>
                    {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        <div className='text-xs text-stone-400 mt-2 flex items-center gap-1'>
          <MapPin className='w-3 h-3' />
          <span>
            {t("tourLocationViewer.coordinatesLabel", "Coordinates")}:{" "}
            {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default TourLocationViewer;
