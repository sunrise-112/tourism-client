import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { LocateIcon, Search, MapPin, X } from "lucide-react";

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

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 13);
  }, [center, map]);
  return null;
}

function LocationPicker({ onChange, initialPosition = null }) {
  const { t } = useTranslation();
  const [position, setPosition] = useState(initialPosition);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState("below");

  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Reverse geocode
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data.display_name) {
        setSelectedAddress(data.display_name);
        setSearchQuery(data.display_name);
      }
    } catch (error) {
      console.error(t("locationPicker.errors.reverseGeocodeFailed"), error);
    }
  };

  // Update position when initialPosition changes
  useEffect(() => {
    if (initialPosition?.lat && initialPosition?.lng) {
      const newPosition = {
        lat: parseFloat(initialPosition.lat),
        lng: parseFloat(initialPosition.lng),
      };
      setPosition(newPosition);
      reverseGeocode(newPosition.lat, newPosition.lng);
    }
  }, [initialPosition]);

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        onChange(e.latlng);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
        setShowDropdown(false);
      },
    });
    return null;
  };

  const useMyLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      alert(t("locationPicker.errors.notSupported"));
      setLoading(false);
      return;
    }
    if (
      window.location.protocol !== "https:" &&
      window.location.hostname !== "localhost"
    ) {
      alert(t("locationPicker.errors.httpsRequired"));
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (location) => {
        const newPosition = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        };
        setPosition(newPosition);
        onChange(newPosition);
        reverseGeocode(newPosition.lat, newPosition.lng);
        setLoading(false);
        setShowDropdown(false);
      },
      (error) => {
        let errorMessage = t("locationPicker.errors.unableToGet");
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = t("locationPicker.errors.permissionDenied");
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = t("locationPicker.errors.positionUnavailable");
            break;
          case error.TIMEOUT:
            errorMessage = t("locationPicker.errors.timeout");
            break;
          default:
            errorMessage = t("locationPicker.errors.unknownError");
        }
        alert(errorMessage);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const searchLocation = async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
      setShowDropdown(data.length > 0);
    } catch (error) {
      console.error(t("locationPicker.errors.searchFailed"), error);
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchLocation(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Determine dropdown position
  useEffect(() => {
    if (showDropdown && searchContainerRef.current) {
      const rect = searchContainerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 240;
      setDropdownPosition(spaceBelow < dropdownHeight ? "above" : "below");
    }
  }, [showDropdown, searchResults]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Escape key to close dropdown
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") setShowDropdown(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleSelectResult = (result) => {
    const newPosition = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    };
    setPosition(newPosition);
    onChange(newPosition);
    setSearchQuery(result.display_name);
    setSelectedAddress(result.display_name);
    setSearchResults([]);
    setShowDropdown(false);
    if (searchInputRef.current) searchInputRef.current.blur();
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  return (
    <div className='bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden'>
      <div className='p-6'>
        <h2 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
          <MapPin className='w-5 h-5' />
          {t("locationPicker.title")}
        </h2>

        {/* Search Input with dropdown */}
        <div className='mb-4' ref={searchContainerRef}>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            {t("locationPicker.searchLabel")}
          </label>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <Search className='w-5 h-5 text-gray-400' />
            </div>
            <input
              ref={searchInputRef}
              type='text'
              placeholder={t("locationPicker.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowDropdown(true);
              }}
              className='w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className='absolute inset-y-0 right-0 pr-3 flex items-center'
              >
                <X className='w-5 h-5 text-gray-400 hover:text-gray-600' />
              </button>
            )}

            {/* Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div
                className={`absolute ${
                  dropdownPosition === "above"
                    ? "bottom-full mb-2"
                    : "top-full mt-2"
                } left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto`}
              >
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    onClick={() => handleSelectResult(result)}
                    className='px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors'
                  >
                    <div className='flex items-start gap-2'>
                      <MapPin className='w-4 h-4 mt-1 text-blue-600 flex-shrink-0' />
                      <span className='text-sm text-gray-700'>
                        {result.display_name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searching && (
              <div className='absolute top-full left-0 mt-2 flex items-center gap-2'>
                <div className='w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
                <span className='text-sm text-gray-500'>
                  {t("locationPicker.searching")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Use My Location Button */}
        <button
          onClick={useMyLocation}
          disabled={loading}
          className='inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4'
        >
          {loading ? (
            <>
              <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
              {t("locationPicker.gettingLocation")}
            </>
          ) : (
            <>
              <LocateIcon className='w-5 h-5' />
              {t("locationPicker.useMyLocation")}
            </>
          )}
        </button>

        {/* Selected Address Display */}
        {selectedAddress && (
          <div className='bg-blue-50 border border-blue-200 rounded-md p-3 flex items-start gap-2 mb-4'>
            <MapPin className='w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5' />
            <div className='flex-1'>
              <h3 className='font-medium text-blue-800'>
                {t("locationPicker.selectedLocation")}
              </h3>
              <p className='text-sm text-blue-700'>{selectedAddress}</p>
            </div>
          </div>
        )}

        {/* Coordinates Display */}
        {position && (
          <div className='flex border border-gray-200 rounded-md overflow-hidden mb-4'>
            <div className='px-4 py-2 border-r border-gray-200 flex-1'>
              <div className='text-xs text-gray-500'>
                {t("locationPicker.latitude")}
              </div>
              <div className='text-sm font-medium text-gray-900'>
                {parseFloat(position.lat).toFixed(6)}
              </div>
            </div>
            <div className='px-4 py-2 flex-1'>
              <div className='text-xs text-gray-500'>
                {t("locationPicker.longitude")}
              </div>
              <div className='text-sm font-medium text-gray-900'>
                {parseFloat(position.lng).toFixed(6)}
              </div>
            </div>
          </div>
        )}

        {/* Map Container with REAL WORLD SATELLITE VIEW */}
        <div className='rounded-lg overflow-hidden border border-gray-200'>
          <MapContainer
            center={position}
            zoom={13}
            style={{ height: "400px", width: "100%" }}
          >
            {/* ESRI World Imagery – high-resolution satellite tiles */}
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            />
            <MapEvents />
            {position && <Marker position={position} />}
            {position && <ChangeView center={position} />}
          </MapContainer>
        </div>

        <div className='text-sm text-gray-500 mt-4'>
          {t("locationPicker.helperText")}
        </div>
      </div>
    </div>
  );
}

export default LocationPicker;
