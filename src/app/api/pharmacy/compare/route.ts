import { NextRequest, NextResponse } from 'next/server';
import { pharmacyScraper } from '@/lib/pharmacy-scraper';

/**
 * POST /api/pharmacy/compare
 * Compare prices for a specific medication.
 */
export async function POST(request: NextRequest) {
  try {
    const { medicationName } = await request.json();

    if (!medicationName || medicationName.length < 3) {
      return NextResponse.json(
        { error: 'Medication name must be at least 3 characters' },
        { status: 400 }
      );
    }

    const comparison = await pharmacyScraper.comparePrices(medicationName);

    return NextResponse.json(comparison);
  } catch (error) {
    console.error('Price comparison error:', error);
    return NextResponse.json(
      { error: 'Failed to compare prices' },
      { status: 500 }
    );
  }
}
