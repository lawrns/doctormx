import { X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, X, ZoomIn, ZoomOut } from '../../components/icons/IconProvider';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  address: string;
  rating: number;
  price: number;
  image: string;
  isPremium: boolean;
}

interface MapProps {
  doctors: Doctor[];
  selectedDoctor: string | null;
  onDoctorSelect: (doctorId: string) => void;
  onClose?: () => void;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const SearchMap: React.FC<MapProps> = ({ 
  doctors, 
  selectedDoctor, 
  onDoctorSelect,
  onClose 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [infoWindow, setInfoWindow] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load Google Maps API
  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    const googleMapsApiKey = 'YOUR_API_KEY'; // Should be replaced with environment variable
    
    // Define the callback function
    window.initMap = () => {
      setIsLoaded(true);
    };

    // Load the Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      setLoadError('No se pudo cargar el mapa. Por favor, inténtalo de nuevo más tarde.');
    };

    document.head.appendChild(script);

    return () => {
      window.initMap = undefined;
      document.head.removeChild(script);
    };
  }, []);

  // Initialize map when API is loaded
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    try {
      // Create a new map
      const googleMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: 19.4326, lng: -99.1332 }, // Mexico City
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: false,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // Create info window
      const googleInfoWindow = new window.google.maps.InfoWindow();

      setMap(googleMap);
      setInfoWindow(googleInfoWindow);
    } catch (error) {
      console.error('Error initializing map:', error);
      setLoadError('Error al inicializar el mapa. Por favor, recarga la página.');
    }
  }, [isLoaded]);

  // Add markers when map is initialized or doctors change
  useEffect(() => {
    if (!map || !infoWindow) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    
    const bounds = new window.google.maps.LatLngBounds();
    const newMarkers: any[] = [];
    
    // Mock locations for demo (in real app, these would come from the API)
    const mockLocations: Record<string, { lat: number, lng: number }> = {
      'Ciudad de México': { lat: 19.4326, lng: -99.1332 },
      'Guadalajara': { lat: 20.6597, lng: -103.3496 },
      'Monterrey': { lat: 25.6866, lng: -100.3161 },
      'Puebla': { lat: 19.0414, lng: -98.2063 },
      'Querétaro': { lat: 20.5931, lng: -100.3928 }
    };
    
    // Create a marker for each doctor
    doctors.forEach((doctor, index) => {
      const location = mockLocations[doctor.location] || mockLocations['Ciudad de México'];
      
      // Add a slight offset to prevent markers from overlapping exactly
      const lat = location.lat + (Math.random() - 0.5) * 0.01;
      const lng = location.lng + (Math.random() - 0.5) * 0.01;
      
      const position = new window.google.maps.LatLng(lat, lng);
      
      // Custom marker with different color for premium doctors
      const marker = new window.google.maps.Marker({
        position,
        map,
        title: doctor.name,
        animation: window.google.maps.Animation.DROP,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: doctor.isPremium ? '#1E40AF' : '#2563EB',
          fillOpacity: 1,
          strokeWeight: 0,
          scale: 10,
        },
        zIndex: doctor.isPremium ? 1000 : 1
      });
      
      // Add click event listener to marker
      marker.addListener('click', () => {
        onDoctorSelect(doctor.id);
        
        // Info window content
        const content = `
          <div class="p-2">
            <h3 class="font-bold text-gray-900">${doctor.name}</h3>
            <p class="text-blue-600">${doctor.specialty}</p>
            <p class="text-gray-600 mt-1">${doctor.address}</p>
            <p class="text-gray-900 font-semibold mt-1">$${doctor.price}</p>
          </div>
        `;
        
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
      });
      
      // Highlight selected doctor
      if (selectedDoctor === doctor.id) {
        marker.setIcon({
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#047857', // Green
          fillOpacity: 1,
          strokeWeight: 0,
          scale: 12,
        });
        marker.setZIndex(2000);
        
        // Open info window for selected doctor
        const content = `
          <div class="p-2">
            <h3 class="font-bold text-gray-900">${doctor.name}</h3>
            <p class="text-blue-600">${doctor.specialty}</p>
            <p class="text-gray-600 mt-1">${doctor.address}</p>
            <p class="text-gray-900 font-semibold mt-1">$${doctor.price}</p>
          </div>
        `;
        
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
      }
      
      newMarkers.push(marker);
      bounds.extend(position);
    });
    
    // Fit the map to the bounds
    if (newMarkers.length > 0) {
      map.fitBounds(bounds);
      
      // Zoom out a bit to give some padding
      const listener = window.google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
        const zoom = map.getZoom();
        map.setZoom(zoom > 14 ? 14 : zoom);
      });
    }
    
    setMarkers(newMarkers);
    
    // Clean up
    return () => {
      newMarkers.forEach(marker => marker.setMap(null));
    };
  }, [map, infoWindow, doctors, selectedDoctor, onDoctorSelect]);

  // Zoom controls
  const handleZoomIn = () => {
    if (map) {
      const currentZoom = map.getZoom();
      map.setZoom(currentZoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (map) {
      const currentZoom = map.getZoom();
      map.setZoom(currentZoom - 1);
    }
  };

  if (loadError) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100 p-4">
        <div className="text-center">
          <MapPin size={24} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {/* Map container */}
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg overflow-hidden"
        aria-label="Mapa de ubicación de médicos"
      ></div>
      
      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
        <button
          onClick={handleZoomIn}
          className="bg-white p-2 rounded-full shadow-md text-gray-700 hover:bg-gray-50"
          aria-label="Acercar"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-white p-2 rounded-full shadow-md text-gray-700 hover:bg-gray-50"
          aria-label="Alejar"
        >
          <ZoomOut size={18} />
        </button>
      </div>
      
      {/* Close button for mobile */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md text-gray-700 hover:bg-gray-50 md:hidden"
          aria-label="Cerrar mapa"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default SearchMap;