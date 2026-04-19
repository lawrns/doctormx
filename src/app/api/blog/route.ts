import { NextRequest, NextResponse } from 'next/server'
import { getBlogPosts, getFeaturedPosts } from '@/lib/blog'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const categorySlug = searchParams.get('category') || undefined
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = parseInt(searchParams.get('offset') || '0')
    const featured = searchParams.get('featured') === 'true'

    if (featured) {
      const featuredLimit = parseInt(searchParams.get('limit') || '3')
      const posts = await getFeaturedPosts(featuredLimit)
      return NextResponse.json({ posts })
    }

    const posts = await getBlogPosts({
      categorySlug,
      limit,
      offset,
    })

    return NextResponse.json({
      posts,
      pagination: {
        limit,
        offset,
        hasMore: posts.length === limit,
      },
    })
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { error: 'Error al obtener articulos' },
      { status: 500 }
    )
  }
}
