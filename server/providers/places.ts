import { Specialist, SpecialistSearchParams } from '../types/specialist.js';
import { config } from '../config.js';

interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  opening_hours?: {
    open_now: boolean;
  };
  formatted_phone_number?: string;
  website?: string;
  photos?: Array<{
    photo_reference: string;
  }>;
}

interface GooglePlacesResponse {
  results: GooglePlace[];
  status: string;
  error_message?: string;
}

// Función para calcular distancia entre dos puntos (fórmula de Haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Radio de la Tierra en metros
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Función para obtener URL de foto de Google Places
function getPhotoUrl(photoReference: string): string {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${config.googleApiKey}`;
}

// Convertir resultado de Google Places a nuestro formato
function convertGooglePlaceToSpecialist(
  place: GooglePlace, 
  specialty: string,
  userLat?: number,
  userLon?: number
): Specialist {
  const distance = userLat && userLon 
    ? calculateDistance(userLat, userLon, place.geometry.location.lat, place.geometry.location.lng)
    : undefined;

  return {
    id: `google-${place.place_id}`,
    name: place.name,
    specialty: specialty,
    address: place.formatted_address,
    phone: place.formatted_phone_number,
    rating: place.rating,
    distance: distance ? Math.round(distance) : undefined,
    source: 'google',
    placeId: place.place_id,
    verified: false,
    photoUrl: place.photos?.[0] ? getPhotoUrl(place.photos[0].photo_reference) : undefined,
    openNow: place.opening_hours?.open_now,
    website: place.website
  };
}

export async function findGoogleSpecialists(params: SpecialistSearchParams): Promise<Specialist[]> {
  if (!config.isGoogleConfigured()) {
    console.warn('Google API Key no configurada');
    return [];
  }

  try {
    // Mapear especialidad al inglés para Google Places
    const englishSpecialty = config.specialtyMapping[params.specialty.toLowerCase()] || params.specialty;
    
    // Construir query de búsqueda
    let query = `${englishSpecialty} doctor`;
    if (params.city) {
      query += ` in ${params.city}`;
    }

    // Construir URL de Google Places API
    const baseUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
    const searchParams = new URLSearchParams({
      query,
      key: config.googleApiKey,
      type: 'doctor',
      language: 'es'
    });

    // Agregar ubicación si está disponible
    if (params.lat && params.lon) {
      searchParams.append('location', `${params.lat},${params.lon}`);
      searchParams.append('radius', (params.radius || config.defaultRadius).toString());
    }

    const url = `${baseUrl}?${searchParams.toString()}`;
    
    console.log(`Buscando en Google Places: ${englishSpecialty} en ${params.city || 'ubicación actual'}`);
    
    const response = await fetch(url);
    const data: GooglePlacesResponse = await response.json();

    if (data.status !== 'OK') {
      console.error('Error en Google Places API:', data.status, data.error_message);
      return [];
    }

    // Convertir resultados y limitar a maxResults
    const specialists = data.results
      .slice(0, config.maxResults)
      .map(place => convertGooglePlaceToSpecialist(
        place, 
        params.specialty,
        params.lat,
        params.lon
      ));

    // Ordenar por distancia si está disponible
    if (params.lat && params.lon) {
      specialists.sort((a, b) => {
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });
    }

    console.log(`Encontrados ${specialists.length} especialistas en Google Places`);
    return specialists;

  } catch (error) {
    console.error('Error al buscar en Google Places:', error);
    return [];
  }
}