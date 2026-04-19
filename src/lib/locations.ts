import { createClient } from '@/lib/supabase/server';

export interface City {
  id: string;
  name: string;
  slug: string;
  state: string;
  state_code: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  population: number | null;
  is_major: boolean;
}

export interface District {
  id: string;
  name: string;
  slug: string;
  city_id: string;
  latitude: number | null;
  longitude: number | null;
  postal_code: string | null;
  city?: City;
}

export async function getCities(state?: string, majorOnly = false): Promise<City[]> {
  const supabase = await createClient();
  let query = supabase.from('cities').select('*').eq('is_active', true).order('name');
  if (state) query = query.eq('state', state);
  if (majorOnly) query = query.eq('is_major', true);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getCityBySlug(slug: string): Promise<City | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('cities').select('*').eq('slug', slug).single();
  if (error) return null;
  return data;
}

export async function getMajorCities(): Promise<City[]> {
  return getCities(undefined, true);
}

export async function getDistricts(citySlug: string): Promise<District[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('districts')
    .select('*, city:cities(*)')
    .eq('is_active', true)
    .eq('cities.slug', citySlug)
    .order('name');
  if (error) throw error;
  return data;
}

export async function getDistrictBySlug(citySlug: string, districtSlug: string): Promise<District | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('districts')
    .select('*, city:cities!inner(*)')
    .eq('slug', districtSlug)
    .eq('cities.slug', citySlug)
    .single();
  if (error) return null;
  return data;
}

export async function getStates(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('cities').select('state').order('state');
  if (error) throw error;
  return [...new Set(data.map((c) => c.state))];
}

export async function searchCities(query: string, limit = 10): Promise<City[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .ilike('name', `${query}%`)
    .eq('is_active', true)
    .order('population', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}
