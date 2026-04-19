import { NextResponse } from 'next/server'
import { getFeaturedPosts } from '@/lib/blog'

export async function GET() {
  try {
    const posts = await getFeaturedPosts(3)
    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Error fetching featured posts:', error)
    return NextResponse.json(
      { error: 'Error al obtener articulos destacados' },
      { status: 500 }
    )
  }
}
