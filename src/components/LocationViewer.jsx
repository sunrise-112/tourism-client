import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin, AlertCircle } from "lucide-react";

// Services
import settingsService from "../services/adminSettings";

// ---------- FIX FOR DEFAULT MARKER ICONS (CRITICAL) ----------
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});
// -------------------------------------------------------------

// Optional: custom red marker (but default will work now)
const agencyIcon = new L.Icon({
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

function LocationViewer({ isPublic }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [agencyLocation, setAgencyLocation] = useState(null);
  const [agencyAddress, setAgencyAddress] = useState("");
  const [agencyName, setAgencyName] = useState("");

  const fetchAgencyLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await settingsService.get();
      const lat = response?.lat;
      const lng = response?.lng;
      const name =
        response?.company_name || t("locationViewer.defaultAgencyName");

      if (lat && lng) {
        const location = {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        };
        setAgencyLocation(location);
        setAgencyName(name);
        reverseGeocode(location.lat, location.lng);
      } else {
        setError(t("locationViewer.errors.locationNotSet"));
      }
    } catch (err) {
      console.error(t("locationViewer.errors.fetchFailed"), err);
      setError(t("locationViewer.errors.failedToLoad"));
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data.display_name) setAgencyAddress(data.display_name);
    } catch (error) {
      console.error(t("locationViewer.errors.reverseGeocodeFailed"), error);
    }
  };

  const LocationInfo = ({ agencyLocation, agencyName, agencyAddress, t }) => (
    <>
      <h2 className='card-title text-lg mb-4'>
        <MapPin className='w-5 h-5' />
        {t("locationViewer.title")}
      </h2>
      {agencyLocation && (
        <div className='alert alert-info mb-4'>
          <MapPin className='w-5 h-5' />
          <div className='flex-1'>
            <h3 className='font-medium'>{agencyName}</h3>
            {agencyAddress && (
              <p className='text-sm opacity-80'>{agencyAddress}</p>
            )}
            <p className='text-xs opacity-70 mt-1'>
              {t("locationViewer.coordinates")}:{" "}
              {parseFloat(agencyLocation.lat).toFixed(6)},{" "}
              {parseFloat(agencyLocation.lng).toFixed(6)}
            </p>
          </div>
        </div>
      )}
    </>
  );

  useEffect(() => {
    fetchAgencyLocation();
  }, []);

  if (loading) {
    return (
      <div className='card bg-base-100 shadow-xl'>
        <div className='card-body items-center'>
          <span className='loading loading-spinner loading-lg'></span>
          <p className='text-base-content/60'>
            {t("locationViewer.loadingData")}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='card bg-base-100 shadow-xl'>
        <div className='card-body'>
          <div className='alert alert-error'>
            <AlertCircle className='w-5 h-5' />
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='card bg-base-100 shadow-xl'>
      <div className='card-body p-6'>
        {!isPublic && (
          <LocationInfo {...{ agencyLocation, agencyName, agencyAddress, t }} />
        )}

        <div className='rounded-lg overflow-hidden border border-base-300'>
          <MapContainer
            center={agencyLocation || { lat: 30.4278, lng: -9.5981 }}
            zoom={15}
            style={{ height: "400px", width: "100%" }}
          >
            {/* Satellite imagery */}
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            />
            <SetView center={agencyLocation} zoom={15} />
            {agencyLocation && (
              <Marker position={agencyLocation} icon={agencyIcon}>
                <Popup>
                  <div className='p-2'>
                    <h3 className='font-bold text-sm mb-1'>{agencyName}</h3>
                    {agencyAddress && (
                      <p className='text-xs mb-2'>{agencyAddress}</p>
                    )}
                    <p className='text-xs text-gray-600'>
                      {parseFloat(agencyLocation.lat).toFixed(6)},{" "}
                      {parseFloat(agencyLocation.lng).toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        {/*  <div className='alert alert-sm mt-4'>
          <MapPin className='w-4 h-4' />
          <div className='text-sm'>{t("locationViewer.helperText")}</div>
        </div> */}
      </div>
    </div>
  );
}

export default LocationViewer;
