import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBlogPostBySlug, getRelatedPosts, incrementViewCount } from '@/lib/blog'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ChevronRight,
  Calendar,
  Clock,
  Eye,
  ArrowRight,
  Share2,
  ArrowLeft,
  BookOpen,
} from 'lucide-react'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    return {
      title: 'Articulo no encontrado | Blog de Salud | Doctor.mx',
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://doctor.mx'

  return {
    title: `${post.title} | Blog de Salud | Doctor.mx`,
    description: post.meta_description || post.excerpt || `Articulo sobre ${post.category?.name || 'salud'} en el blog de Doctor.mx`,
    keywords: `${post.category?.name || 'salud'}, blog de salud, ${post.title.split(' ').slice(0, 5).join(', ')}`,
    authors: post.author ? [{ name: post.author.full_name }] : [{ name: 'Doctor.mx' }],
    openGraph: {
      title: post.title,
      description: post.excerpt || post.meta_description || '',
      type: 'article',
      publishedTime: post.published_at || undefined,
      authors: post.author ? [post.author.full_name] : ['Doctor.mx'],
      tags: post.category ? [post.category.name] : [],
      url: `${siteUrl}/blog/${post.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.meta_description || '',
    },
    alternates: {
      canonical: `${siteUrl}/blog/${post.slug}`,
    },
  }
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function estimateReadTime(content: string) {
  const words = content.split(/\s+/).length
  const minutes = Math.ceil(words / 200)
  return `${minutes} min de lectura`
}

function renderMarkdownToHtml(markdown: string) {
  let html = markdown
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold text-neutral-900 mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-neutral-900 mt-10 mb-4">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-neutral-900 mt-12 mb-6">$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-neutral-900">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Numbered lists
    .replace(/^(\d+)\. (.+)$/gm, '<li class="text-neutral-700 leading-relaxed ml-6 list-decimal">$2</li>')
    // Bullet lists
    .replace(/^- (.+)$/gm, '<li class="text-neutral-700 leading-relaxed ml-6 list-disc">$1</li>')
    // Paragraphs (split on double newlines)
    .replace(/\n\n/g, '</p><p class="text-neutral-700 leading-relaxed mb-4">')
    // Line breaks within paragraphs
    .replace(/\n(?!<)/g, '<br/>')

  if (!html.startsWith('<h')) {
    html = `<p class="text-neutral-700 leading-relaxed mb-4">${html}</p>`
  }

  return html
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  // Increment view count in the background
  incrementViewCount(post.id).catch(() => {})

  const relatedPosts = await getRelatedPosts(post.id, post.category_id, 3)
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://doctor.mx'

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.meta_description,
    image: post.featured_image ? `${siteUrl}${post.featured_image}` : undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: post.author
      ? {
          '@type': 'Person',
          name: post.author.full_name,
        }
      : {
          '@type': 'Organization',
          name: 'Doctor.mx',
        },
    publisher: {
      '@type': 'Organization',
      name: 'Doctor.mx',
      url: siteUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`,
    },
  }

  return (
    <main className="min-h-screen bg-[#FDFCFB]">
      <Header />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-4">
        <ol className="flex items-center gap-2 text-sm text-neutral-500 flex-wrap">
          <li><Link href="/" className="hover:text-blue-600 transition-colors">Inicio</Link></li>
          <li><ChevronRight className="w-3 h-3" /></li>
          <li><Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link></li>
          {post.category && (
            <>
              <li><ChevronRight className="w-3 h-3" /></li>
              <li>
                <Link
                  href={`/blog?category=${post.category.slug}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {post.category.name}
                </Link>
              </li>
            </>
          )}
          <li><ChevronRight className="w-3 h-3" /></li>
          <li className="text-neutral-900 font-medium truncate max-w-[200px]">{post.title}</li>
        </ol>
      </nav>

      {/* Article Header */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-blue-600 transition-colors mb-6"
          >
            <ArrowLeft className="w-3 h-3" />Volver al blog
          </Link>

          {post.category && (
            <Badge variant="secondary" className="mb-4">
              {post.category.name}
            </Badge>
          )}

          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight mb-4">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg text-neutral-600 leading-relaxed mb-6">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center gap-4 flex-wrap text-sm text-neutral-500 border-b border-neutral-100 pb-6">
            {post.author && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-medium text-neutral-700">{post.author.full_name}</span>
              </div>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(post.published_at)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {estimateReadTime(post.content)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {post.view_count} vistas
            </span>
          </div>
        </header>

        {/* Article Content */}
        <div
          className="prose-custom max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(post.content) }}
        />

        {/* Share */}
        <div className="border-t border-neutral-100 pt-6 mb-12">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Share2 className="w-4 h-4" />
              <span>Compartir:</span>
            </div>
            <div className="flex gap-2">
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${siteUrl}/blog/${post.slug}`)}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-neutral-100 text-sm text-neutral-600 hover:bg-neutral-200 transition-colors"
              >
                Twitter
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${siteUrl}/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-neutral-100 text-sm text-neutral-600 hover:bg-neutral-200 transition-colors"
              >
                Facebook
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${post.title} ${siteUrl}/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-emerald-50 text-sm text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Articulos relacionados</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.map((relPost) => (
              <Link key={relPost.id} href={`/blog/${relPost.slug}`} className="group">
                <Card className="h-full p-0 overflow-hidden bg-white border-neutral-100 hover:shadow-md transition-all group-hover:-translate-y-1">
                  <div className="h-36 bg-gradient-to-br from-neutral-100 to-neutral-50 flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-neutral-200" />
                  </div>
                  <div className="p-5">
                    {relPost.category && (
                      <Badge variant="secondary" className="text-xs mb-2">{relPost.category.name}</Badge>
                    )}
                    <h3 className="font-semibold text-neutral-900 text-sm group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                      {relPost.title}
                    </h3>
                    <p className="text-xs text-neutral-400">
                      {formatDate(relPost.published_at)}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="border-t border-neutral-100 bg-neutral-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-3">Necesitas consulta medica?</h2>
          <p className="text-neutral-500 mb-6">
            Agenda una consulta en linea con un doctor certificado. Rapido, seguro y profesional.
          </p>
          <Link href="/doctors">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white px-8">
              Agendar consulta <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
