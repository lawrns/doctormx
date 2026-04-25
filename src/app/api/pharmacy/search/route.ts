import { NextRequest, NextResponse } from 'next/server';
import { searchPharmacyProducts } from '@/lib/pharmacy-api';
import { createServiceClient } from '@/lib/supabase/server';

// Cache duration: 5 minutes
const CACHE_DURATION_MS = 5 * 60 * 1000;

interface CachedResult {
  data: Record<string, unknown>;
  timestamp: number;
}

const cache = new Map<string, CachedResult>();

/**
 * GET /api/pharmacy/search?q={query}
 * Search for medications across all pharmacies using the pharmacy API abstraction
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const useCache = searchParams.get('cache') !== 'false';

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

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

    const startTime = Date.now();
    const results = await searchPharmacyProducts(query);
    const searchTime = Date.now() - startTime;

    // Store in database for analytics
    try {
      await supabase.from('pharmacy_search_logs').insert({
        query,
        results_count: results.total_results,
        search_time_ms: searchTime,
        created_at: new Date().toISOString(),
      });
    } catch {
      // Non-critical
    }

    const response = {
      query,
      products: results.products,
      pharmacies: results.pharmacies,
      total: results.total_results,
      searchTimeMs: searchTime,
    };

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
