import { createServiceClient } from '@/lib/supabase/server'

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
  post_count?: number
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  category_id: string | null
  featured_image: string | null
  author_id: string | null
  status: string
  published_at: string | null
  meta_description: string | null
  view_count: number
  created_at: string
  updated_at: string
  category?: BlogCategory | null
  author?: {
    full_name: string
    photo_url: string | null
  } | null
}

export async function getBlogPosts(options?: {
  categorySlug?: string
  limit?: number
  offset?: number
}): Promise<BlogPost[]> {
  const supabase = createServiceClient()
  const limit = options?.limit || 12
  const offset = options?.offset || 0

  let query = supabase
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(id, name, slug, description),
      author:profiles!blog_posts_author_id_fkey(full_name, photo_url)
    `)
    .eq('status', 'published')

  if (options?.categorySlug) {
    // First get the category ID from slug
    const { data: category } = await supabase
      .from('blog_categories')
      .select('id')
      .eq('slug', options.categorySlug)
      .single()

    if (category) {
      query = query.eq('category_id', category.id)
    } else {
      return []
    }
  }

  query = query
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }

  return (data || []) as unknown as BlogPost[]
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(id, name, slug, description),
      author:profiles!blog_posts_author_id_fkey(full_name, photo_url)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error) {
    console.error('Error fetching blog post:', error)
    return null
  }

  return data as unknown as BlogPost
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('blog_categories')
    .select(`
      *,
      post_count:blog_posts(count)
    `)
    .order('name')

  if (error) {
    console.error('Error fetching blog categories:', error)
    return []
  }

  return (data || []).map((cat: any) => ({
    ...cat,
    post_count: cat.post_count?.[0]?.count || 0,
  }))
}

export async function getFeaturedPosts(limit: number = 3): Promise<BlogPost[]> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(id, name, slug, description),
      author:profiles!blog_posts_author_id_fkey(full_name, photo_url)
    `)
    .eq('status', 'published')
    .order('view_count', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching featured posts:', error)
    return []
  }

  return (data || []) as unknown as BlogPost[]
}

export async function getRelatedPosts(postId: string, categoryId: string | null, limit: number = 3): Promise<BlogPost[]> {
  const supabase = createServiceClient()

  let query = supabase
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(id, name, slug, description),
      author:profiles!blog_posts_author_id_fkey(full_name, photo_url)
    `)
    .eq('status', 'published')
    .neq('id', postId)

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  query = query
    .order('published_at', { ascending: false })
    .limit(limit)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching related posts:', error)
    return []
  }

  return (data || []) as unknown as BlogPost[]
}

export async function incrementViewCount(id: string): Promise<void> {
  const supabase = createServiceClient()

  const { data: post } = await supabase
    .from('blog_posts')
    .select('view_count')
    .eq('id', id)
    .single()

  if (post) {
    await supabase
      .from('blog_posts')
      .update({ view_count: post.view_count + 1 })
      .eq('id', id)
  }
}
