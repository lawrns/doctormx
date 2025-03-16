export interface Dentist {
  id: string;
  clinic_name: string;
  clinic_id?: string;
  address: string;
  phone?: string;
  description?: string;
  has_review: boolean;
  review_rating?: number;
  review_quote?: string;
  review_text?: string;
  review_person?: string;
  location: string;
  is_verified: boolean;
  is_premium: boolean;
  website?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  created_at: Date;
  updated_at: Date;
}

export interface DentistService {
  id: string;
  dentist_id: string;
  service_name: string;
  description?: string;
  created_at: Date;
}

export interface DentistPrice {
  id: string;
  dentist_id: string;
  service_name: string;
  price_min?: number;
  price_max?: number;
  created_at: Date;
}

export interface DentistReview {
  id: string;
  dentist_id: string;
  rating: number;
  review_text?: string;
  reviewer_name?: string;
  reviewer_location?: string;
  review_date?: Date;
  created_at: Date;
}

export interface DentistImage {
  id: string;
  dentist_id: string;
  image_url: string;
  image_type?: string;
  created_at: Date;
}

export interface DentistInsurance {
  id: string;
  dentist_id: string;
  insurance_name: string;
  created_at: Date;
}

export interface DentistLanguage {
  id: string;
  dentist_id: string;
  language_name: string;
  created_at: Date;
}