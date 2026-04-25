import { NextRequest, NextResponse } from 'next/server';
import { searchPharmacyProducts } from '@/lib/pharmacy-api';

/**
 * POST /api/pharmacy/compare
 * Compare prices for a specific medication using the pharmacy API abstraction.
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

    const searchResult = await searchPharmacyProducts(medicationName);

    const products = searchResult.products.sort((a, b) => a.price_cents - b.price_cents);
    const lowestPrice = products.length > 0 ? products[0].price_cents : 0;
    const highestPrice = products.length > 0 ? products[products.length - 1].price_cents : 0;
    const averagePrice = products.length > 0
      ? Math.round(products.reduce((sum, p) => sum + p.price_cents, 0) / products.length)
      : 0;

    return NextResponse.json({
      medicationName,
      results: products.map(p => ({
        pharmacyId: p.pharmacy,
        pharmacyName: p.pharmacy,
        product: p,
        totalPrice: p.price_cents,
        deliveryTime: 45,
        availability: p.in_stock ? 'in_stock' as const : 'out_of_stock' as const,
        savings: highestPrice - p.price_cents,
        savingsPercent: highestPrice > 0 ? ((highestPrice - p.price_cents) / highestPrice) * 100 : 0,
      })),
      lowestPrice,
      highestPrice,
      averagePrice,
      bestDeal: products.length > 0 ? {
        pharmacyId: products[0].pharmacy,
        productId: products[0].id,
        reason: `Mejor precio: $${(products[0].price_cents / 100).toFixed(2)} MXN`,
      } : undefined,
    });
  } catch (error) {
    console.error('Price comparison error:', error);
    return NextResponse.json(
      { error: 'Failed to compare prices' },
      { status: 500 }
    );
  }
}
