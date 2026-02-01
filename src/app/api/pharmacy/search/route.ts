import { NextRequest, NextResponse } from 'next/server';
import { pharmacyScraper } from '@/lib/pharmacy-scraper';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Cache duration: 5 minutes
const CACHE_DURATION_MS = 5 * 60 * 1000;

interface CachedResult {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CachedResult>();

/**
 * GET /api/pharmacy/search?q={query}
 * Search for medications across all pharmacies
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const useCache = searchParams.get('cache') !== 'false';

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `search:${query.toLowerCase()}`;
    if (useCache) {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
        return NextResponse.json({
          ...cached.data,
          cached: true,
          cachedAt: new Date(cached.timestamp).toISOString(),
        });
      }
    }

    // Search using scraper
    const startTime = Date.now();
    const results = await pharmacyScraper.searchAll(query);
    const searchTime = Date.now() - startTime;

    // Store in database for analytics
    await supabase.from('pharmacy_search_logs').insert({
      query,
      results_count: results.length,
      search_time_ms: searchTime,
      created_at: new Date().toISOString(),
    });

    const response = {
      query,
      results,
      total: results.length,
      searchTimeMs: searchTime,
      pharmacies: [...new Set(results.map(r => r.pharmacyId))],
    };

    // Cache the result
    cache.set(cacheKey, { data: response, timestamp: Date.now() });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Pharmacy search error:', error);
    return NextResponse.json(
      { error: 'Failed to search pharmacies' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pharmacy/compare
 * Compare prices for a specific medication
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { medicationName } = await request.json();

    if (!medicationName || medicationName.length < 3) {
      return NextResponse.json(
        { error: 'Medication name must be at least 3 characters' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `compare:${medicationName.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
      return NextResponse.json({
        ...cached.data,
        cached: true,
      });
    }

    const comparison = await pharmacyScraper.comparePrices(medicationName);

    // Cache the result
    cache.set(cacheKey, { data: comparison, timestamp: Date.now() });

    return NextResponse.json(comparison);
  } catch (error) {
    console.error('Price comparison error:', error);
    return NextResponse.json(
      { error: 'Failed to compare prices' },
      { status: 500 }
    );
  }
}
