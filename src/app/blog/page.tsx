'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PublicSectionHeading } from '@/components/PublicSectionHeading'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BookOpen,
  ChevronRight,
  Clock,
  Eye,
  ArrowRight,
  Loader2,
  TrendingUp,
  Calendar,
} from 'lucide-react'

interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string | null
  post_count?: number
}

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  featured_image: string | null
  published_at: string | null
  view_count: number
  created_at: string
  category?: BlogCategory | null
  author?: {
    full_name: string
    photo_url: string | null
  } | null
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null)

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/blog/categories')
        if (res.ok) {
          const data = await res.json()
          setCategories(data.categories || [])
        }
      } catch (err) {
        console.error('Error loading categories:', err)
      }
    }

    async function loadFeatured() {
      try {
        const res = await fetch('/api/blog/featured?limit=1')
        if (res.ok) {
          const data = await res.json()
          if (data.posts && data.posts.length > 0) {
            setFeaturedPost(data.posts[0])
          }
        }
      } catch (err) {
        console.error('Error loading featured:', err)
      }
    }

    Promise.all([loadCategories(), loadFeatured()])
  }, [])

  useEffect(() => {
    async function loadPosts() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set('limit', '12')
        if (activeCategory) params.set('category', activeCategory)

        const res = await fetch(`/api/blog?${params}`)
        if (res.ok) {
          const data = await res.json()
          setPosts(data.posts || [])
        }
      } catch (err) {
        console.error('Error loading posts:', err)
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [activeCategory])

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const estimateReadTime = (content: string) => {
    const words = content.split(/\s+/).length
    const minutes = Math.ceil(words / 200)
    return `${minutes} min de lectura`
  }

  return (
    <main className="min-h-screen bg-[#FDFCFB]">
      <Header />

      {/* Breadcrumb */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-4">
        <ol className="flex items-center gap-2 text-sm text-neutral-500">
          <li><Link href="/" className="hover:text-blue-600 transition-colors">Inicio</Link></li>
          <li><ChevronRight className="w-3 h-3" /></li>
          <li className="text-neutral-900 font-medium">Blog de Salud</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden public-section">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-200 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-100 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <PublicSectionHeading
              eyebrow="Articulos medicos"
              title="Blog de"
              accent="Salud"
              description="Articulos escritos por medicos certificados sobre salud, prevencion y bienestar para ti y tu familia."
            />
          </motion.div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="pb-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href={`/blog/${featuredPost.slug}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="overflow-hidden bg-white border-neutral-100 hover:shadow-lg transition-shadow group">
                  <div className="bg-gradient-to-br from-blue-600 to-violet-600 p-8 sm:p-12 text-white">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className="bg-white/20 text-white border-white/30">
                        <TrendingUp className="w-3 h-3 mr-1" /> Articulo destacado
                      </Badge>
                      {featuredPost.category && (
                        <Badge className="bg-white/10 text-white border-white/20">
                          {featuredPost.category.name}
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 group-hover:text-blue-100 transition-colors">
                      {featuredPost.title}
                    </h2>
                    <p className="text-blue-100 leading-relaxed mb-4 max-w-2xl">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-blue-200">
                      {featuredPost.author && (
                        <span>{featuredPost.author.full_name}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{formatDate(featuredPost.published_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />{estimateReadTime(featuredPost.content)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />{featuredPost.view_count}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Link>
          </div>
        </section>
      )}

      {/* Category Filter + Posts */}
      <section className="pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1">
              {/* Category Tabs */}
              <div className="mb-8 overflow-x-auto">
                <div className="flex gap-2 min-w-max pb-2">
                  <button
                    onClick={() => setActiveCategory('')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeCategory === ''
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    Todos
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.slug)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        activeCategory === cat.slug
                          ? 'bg-neutral-900 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Posts Grid */}
              {loading ? (
                <div className="text-center py-16 text-neutral-400">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                  Cargando articulos...
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-16 text-neutral-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay articulos en esta categoria.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-6">
                  {posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <Link href={`/blog/${post.slug}`} className="group block h-full">
                        <Card className="h-full p-0 overflow-hidden bg-white border-neutral-100 hover:shadow-md transition-all duration-200 group-hover:-translate-y-1">
                          {/* Image placeholder */}
                          <div className="h-48 bg-gradient-to-br from-neutral-100 to-neutral-50 relative overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <BookOpen className="w-12 h-12 text-neutral-200" />
                            </div>
                            {post.category && (
                              <div className="absolute top-4 left-4">
                                <Badge className="bg-white/90 text-neutral-700 border-neutral-200">
                                  {post.category.name}
                                </Badge>
                              </div>
                            )}
                          </div>

                          <div className="p-6">
                            <h3 className="font-semibold text-neutral-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                              {post.title}
                            </h3>
                            <p className="text-sm text-neutral-500 leading-relaxed line-clamp-3 mb-4">
                              {post.excerpt}
                            </p>

                            <div className="flex items-center justify-between text-xs text-neutral-400">
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(post.published_at)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />{post.view_count}
                                </span>
                              </div>
                              <span className="flex items-center gap-1 text-blue-600 font-medium group-hover:gap-2 transition-all">
                                Leer mas <ArrowRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="w-full lg:w-72 shrink-0 space-y-8">
              {/* Categories */}
              <Card className="p-6 bg-white border-neutral-100">
                <h3 className="font-semibold text-neutral-900 mb-4">Categorias</h3>
                <ul className="space-y-2">
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => setActiveCategory(cat.slug)}
                        className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                          activeCategory === cat.slug
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        <span>{cat.name}</span>
                        {cat.post_count !== undefined && (
                          <span className="text-xs text-neutral-400">{cat.post_count}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Recent Posts */}
              {posts.length > 3 && (
                <Card className="p-6 bg-white border-neutral-100">
                  <h3 className="font-semibold text-neutral-900 mb-4">Recientes</h3>
                  <ul className="space-y-3">
                    {posts.slice(0, 5).map((post) => (
                      <li key={post.id}>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="text-sm text-neutral-600 hover:text-blue-600 transition-colors line-clamp-2 leading-relaxed"
                        >
                          {post.title}
                        </Link>
                        <p className="text-xs text-neutral-400 mt-1">
                          {formatDate(post.published_at)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
