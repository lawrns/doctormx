// Pharmacy Affiliate Click Tracking API
// POST: Record a pharmacy click and return redirect URL with affiliate parameters

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { trackPharmacyClick, getProductById } from '@/lib/pharmacy-api'
import { logger } from '@/lib/observability/logger'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const { product_id, pharmacy, prescription_id } = body

    if (!product_id || !pharmacy) {
      return NextResponse.json(
        { error: 'product_id and pharmacy are required' },
        { status: 400 }
      )
    }

    const product = await getProductById(product_id)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    await trackPharmacyClick(
      product_id,
      pharmacy,
      user?.id || undefined,
      prescription_id || undefined
    )

    return NextResponse.json({
      success: true,
      redirect_url: product.affiliate_url,
      product: {
        id: product.id,
        name: product.name,
        price_cents: product.price_cents,
        pharmacy: product.pharmacy,
      },
    })
  } catch (error) {
    logger.error('Pharmacy track-click error:', { error })
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    )
  }
}
