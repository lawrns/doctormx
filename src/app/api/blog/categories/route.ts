import { NextResponse } from 'next/server'
import { getBlogCategories } from '@/lib/blog'

export async function GET() {
  try {
    const categories = await getBlogCategories()
    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching blog categories:', error)
    return NextResponse.json(
      { error: 'Error al obtener categorias' },
      { status: 500 }
    )
  }
}
