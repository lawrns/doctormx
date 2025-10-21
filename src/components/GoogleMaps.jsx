import { useEffect, useRef, useState } from 'react';
import Icon from './ui/Icon';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCJD2boUXqXJ1ifBWTCOe5tw9izXBclB-o';

export default function GoogleMaps({ 
  doctors = [], 
  center = { lat: 19.4326, lng: -99.1332 }, // Mexico City default
  zoom = 10,
  height = '400px',
  showSearch = true,
  onDoctorSelect = null,
  className = ''
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState(doctors);

  // Load Google Maps script
  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: center,
      zoom: zoom,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    mapInstanceRef.current = map;

    // Add markers for doctors
    addDoctorMarkers(map, filteredDoctors);

    return () => {
      // Cleanup markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, [isLoaded, filteredDoctors, center, zoom]);

  // Filter doctors based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDoctors(doctors);
      return;
    }

    const filtered = doctors.filter(doctor => {
      const query = searchQuery.toLowerCase();
      return (
        doctor.full_name?.toLowerCase().includes(query) ||
        doctor.specialties?.some(spec => spec.toLowerCase().includes(query)) ||
        doctor.location?.toLowerCase().includes(query) ||
        doctor.clinic_address?.toLowerCase().includes(query)
      );
    });

    setFilteredDoctors(filtered);
  }, [searchQuery, doctors]);

  const addDoctorMarkers = (map, doctorsList) => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    doctorsList.forEach((doctor, index) => {
      if (!doctor.clinic_address) return;

      // Geocode address to get coordinates
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: doctor.clinic_address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          
          // Create custom marker icon
          const markerIcon = {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="#3B82F6" stroke="#ffffff" stroke-width="2"/>
                <path d="M20 8c-6.627 0-12 5.373-12 12 0 8 12 16 12 16s12-8 12-16c0-6.627-5.373-12-12-12zm0 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="#ffffff"/>
              </svg>
            `)}`,
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 20)
          };

          const marker = new window.google.maps.Marker({
            position: location,
            map: map,
            title: doctor.full_name,
            icon: markerIcon,
            animation: window.google.maps.Animation.DROP
          });

          // Create info window
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; max-width: 300px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #1F2937;">
                  ${doctor.full_name}
                </h3>
                <p style="margin: 0 0 4px 0; font-size: 14px; color: #3B82F6; font-weight: 500;">
                  ${doctor.specialties?.join(', ') || 'Especialidad no especificada'}
                </p>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #6B7280;">
                  ${doctor.clinic_address}
                </p>
                <div style="margin: 8px 0 0 0; display: flex; gap: 8px;">
                  <span style="font-size: 12px; color: #059669;">
                    ⭐ ${doctor.rating_avg || 4.5}/5
                  </span>
                  <span style="font-size: 12px; color: #6B7280;">
                    📞 ${doctor.phone || 'No disponible'}
                  </span>
                </div>
                <div style="margin: 8px 0 0 0;">
                  <button 
                    onclick="window.selectDoctor('${doctor.user_id}')"
                    style="
                      background: #3B82F6; 
                      color: white; 
                      border: none; 
                      padding: 6px 12px; 
                      border-radius: 4px; 
                      font-size: 12px; 
                      cursor: pointer;
                    "
                  >
                    Ver Perfil
                  </button>
                </div>
              </div>
            `
          });

          // Add click event to marker
          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });

          // Add click event to info window button
          window.selectDoctor = (doctorId) => {
            if (onDoctorSelect) {
              onDoctorSelect(doctorId);
            }
          };

          markersRef.current.push(marker);
        }
      });
    });
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center">
          <Icon name="map" size="lg" className="text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Search Bar */}
      {showSearch && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar doctores por nombre, especialidad o ubicación..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-10 py-3 bg-white border border-gray-300 rounded-lg shadow-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Icon 
              name="magnifying-glass" 
              size="sm" 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Icon name="x-mark" size="sm" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="rounded-lg shadow-lg"
        style={{ height }}
      />

      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-white rounded-lg shadow-lg p-2 space-y-2">
          <button
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + 1);
              }
            }}
            className="block w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
            title="Acercar"
          >
            <Icon name="plus" size="sm" />
          </button>
          <button
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() - 1);
              }
            }}
            className="block w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
            title="Alejar"
          >
            <Icon name="minus" size="sm" />
          </button>
        </div>
      </div>

      {/* Results Counter */}
      {searchQuery && (
        <div className="absolute top-20 left-4 z-10">
          <div className="bg-white rounded-lg shadow-lg px-3 py-2">
            <p className="text-sm text-gray-600">
              {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 'es' : ''} encontrado{filteredDoctors.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Component for showing doctor location on profile page
export function DoctorLocationMap({ doctor, height = '300px' }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !doctor?.clinic_address) return;

    const mapElement = document.getElementById('doctor-location-map');
    if (!mapElement) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: doctor.clinic_address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        
        const map = new window.google.maps.Map(mapElement, {
          center: location,
          zoom: 15,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        const marker = new window.google.maps.Marker({
          position: location,
          map: map,
          title: doctor.full_name,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="#3B82F6" stroke="#ffffff" stroke-width="2"/>
                <path d="M20 8c-6.627 0-12 5.373-12 12 0 8 12 16 12 16s12-8 12-16c0-6.627-5.373-12-12-12zm0 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="#ffffff"/>
              </svg>
            `)}`,
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 20)
          }
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 300px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #1F2937;">
                ${doctor.full_name}
              </h3>
              <p style="margin: 0 0 4px 0; font-size: 14px; color: #3B82F6; font-weight: 500;">
                ${doctor.specialties?.join(', ') || 'Especialidad no especificada'}
              </p>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #6B7280;">
                ${doctor.clinic_address}
              </p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      }
    });
  }, [isLoaded, doctor]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height }}>
        <div className="text-center">
          <Icon name="map" size="lg" className="text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        id="doctor-location-map"
        className="rounded-lg shadow-lg"
        style={{ height }}
      />
    </div>
  );
}
