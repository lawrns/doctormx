export interface Specialist {
  id: string;
  name: string;
  specialty: string;
  address: string;
  phone?: string;
  rating?: number;
  distance?: number;
  source: 'local' | 'google';
  placeId?: string; // Para Google Places
  verified?: boolean; // Para doctores locales verificados
  photoUrl?: string;
  openNow?: boolean;
  website?: string;
}

export interface SpecialistSearchParams {
  specialty: string;
  city?: string;
  lat?: number;
  lon?: number;
  radius?: number; // en metros, default 5000
}

export interface SpecialistSearchResult {
  specialists: Specialist[];
  total: number;
  source: 'local' | 'google' | 'mixed';
  searchParams: SpecialistSearchParams;
}