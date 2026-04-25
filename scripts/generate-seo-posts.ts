/**
 * Script to generate 10 draft SEO blog posts in Supabase
 * targeting doctor acquisition keywords.
 *
 * Usage: bun run scripts/generate-seo-posts.ts
 * Or via Supabase: npx tsx scripts/generate-seo-posts.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

function loadEnv(filePath: string) {
  try {
    const content = readFileSync(filePath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIndex = trimmed.indexOf('=')
      if (eqIndex === -1) continue
      const key = trimmed.slice(0, eqIndex).trim()
      const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  } catch {
    // File not found, use existing env vars
  }
}

loadEnv(resolve(process.cwd(), '.env.local'))

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

interface BlogPostSeed {
  title: string
  slug: string
  excerpt: string
  meta_description: string
}

const posts: BlogPostSeed[] = [
  {
    title: 'Cómo digitalizar tu consultorio médico en 2026',
    slug: 'digitalizar-consultorio-medico-2026',
    excerpt: 'Guía paso a paso para transformar tu consultorio tradicional en una práctica digital: expediente clínico electrónico, agenda en línea, videoconsultas y más.',
    meta_description: 'Aprende cómo digitalizar tu consultorio médico en 2026. Expediente clínico electrónico, telemedicina, agenda online y herramientas con IA. Guía para médicos mexicanos.',
  },
  {
    title: 'Guía completa de expediente clínico electrónico para médicos mexicanos',
    slug: 'expediente-clinico-electronico-medicos',
    excerpt: 'Todo lo que necesitas saber sobre el expediente clínico electrónico: normativa NOM-024, beneficios, implementación y comparativa de plataformas en México.',
    meta_description: 'Guía completa del expediente clínico electrónico para médicos mexicanos: NOM-024-SSA3-2012, beneficios, implementación y mejores plataformas.',
  },
  {
    title: 'Cómo conseguir más pacientes sin pagar publicidad',
    slug: 'conseguir-pacientes-sin-publicidad',
    excerpt: 'Estrategias probadas de marketing médico para atraer pacientes sin invertir en anuncios. Perfil verificado, SEO local, WhatsApp Business y más.',
    meta_description: 'Descubre cómo conseguir más pacientes sin gastar en publicidad. Estrategias de marketing médico, SEO local y WhatsApp Business para doctores en México.',
  },
  {
    title: 'Telemedicina en México: Guía para médicos',
    slug: 'telemedicina-mexico-guia-medicos',
    excerpt: 'Panorama actual de la telemedicina en México: regulación, plataformas recomendadas, mejores prácticas y cómo empezar a ofrecer consultas en línea.',
    meta_description: 'Guía completa de telemedicina en México para médicos. Regulación, plataformas, requisitos legales y cómo ofrecer videoconsultas en tu práctica.',
  },
  {
    title: 'Ventajas de la receta electrónica en México',
    slug: 'ventajas-receta-electronica-mexico',
    excerpt: 'Cómo funciona la receta electrónica, requisitos legales según la COFEPRIS, beneficios para médicos y pacientes, y cómo implementarla en tu consultorio.',
    meta_description: 'Conoce las ventajas de la receta electrónica en México. Requisitos legales COFEPRIS, beneficios y cómo implementar recetas digitales en tu práctica médica.',
  },
  {
    title: 'Cómo optimizar tu perfil médico en línea',
    slug: 'optimizar-perfil-medico-en-linea',
    excerpt: 'Consejos prácticos para mejorar tu presencia digital como médico: fotos, descripción, reseñas, SEO y verificación de credenciales.',
    meta_description: 'Aprende a optimizar tu perfil médico en línea. Consejos de SEO, fotos profesionales, gestión de reseñas y verificación para atraer más pacientes.',
  },
  {
    title: 'WhatsApp para médicos: Cómo usar WhatsApp Business en tu consultorio',
    slug: 'whatsapp-medicos-business-consultorio',
    excerpt: 'Guía práctica para implementar WhatsApp Business en tu práctica médica: catálogo de servicios, mensajes automatizados, agenda de citas y más.',
    meta_description: 'WhatsApp Business para médicos mexicanos. Cómo usar WhatsApp en tu consultorio: catálogo, respuestas rápidas, agendar citas y comunicación con pacientes.',
  },
  {
    title: 'IA para médicos: Cómo la inteligencia artificial ayuda en consultas',
    slug: 'ia-para-medicos-consultas',
    excerpt: 'Descubre cómo la inteligencia artificial está transformando la práctica médica: notas clínicas automatizadas, apoyo diagnóstico y optimización de tiempo.',
    meta_description: 'Cómo la IA ayuda a médicos en consultas diarias: notas SOAP automáticas, apoyo diagnóstico, análisis de imágenes y optimización del tiempo clínico.',
  },
  {
    title: 'Doctoralia vs Doctor.mx: Comparativa completa 2026',
    slug: 'doctoralia-vs-doctor-mx-comparativa-2026',
    excerpt: 'Comparativa detallada entre Doctoralia y Doctor.mx: precios, funcionalidades, verificación SEP, IA clínica y más. ¿Cuál conviene más a médicos mexicanos?',
    meta_description: 'Comparativa Doctoralia vs Doctor.mx 2026. Precios ($2,400 vs $499/mes), verificación SEP, IA para notas clínicas, WhatsApp. La mejor opción para médicos mexicanos.',
  },
  {
    title: 'Marketing digital para médicos en México',
    slug: 'marketing-digital-medicos-mexico',
    excerpt: 'Estrategias de marketing digital específicas para médicos: presencia en línea, contenido médico, redes sociales y cómo atraer pacientes sin perder ética profesional.',
    meta_description: 'Guía de marketing digital para médicos en México. Estrategias éticas para atraer pacientes: SEO médico, redes sociales, contenido de salud y presencia digital.',
  },
]

async function main() {
  console.log('Generating SEO blog posts...\n')

  // Find or create the para-medicos category
  let categoryId: string | null = null
  const { data: existingCategory } = await supabase
    .from('blog_categories')
    .select('id')
    .eq('slug', 'para-medicos')
    .single()

  if (existingCategory) {
    categoryId = existingCategory.id
    console.log('Found para-medicos category:', categoryId)
  } else {
    const { data: newCategory, error: catError } = await supabase
      .from('blog_categories')
      .insert({ name: 'Para Médicos', slug: 'para-medicos', description: 'Recursos, guías y herramientas para médicos mexicanos que quieren digitalizar su práctica' })
      .select('id')
      .single()

    if (catError) {
      console.error('Failed to create category:', catError.message)
      process.exit(1)
    }
    categoryId = newCategory.id
    console.log('Created para-medicos category:', categoryId)
  }

  let created = 0
  let skipped = 0

  for (const post of posts) {
    const { data: existing } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', post.slug)
      .single()

    if (existing) {
      console.log(`  SKIP: ${post.slug} (already exists)`)
      skipped++
      continue
    }

    const { error } = await supabase
      .from('blog_posts')
      .insert({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: `# ${post.title}\n\n${post.excerpt}\n\n*Este artículo está en desarrollo. Próximamente contenido completo.*`,
        category_id: categoryId,
        status: 'draft',
        meta_description: post.meta_description,
      })

    if (error) {
      console.error(`  ERROR: ${post.slug} - ${error.message}`)
    } else {
      console.log(`  CREATED: ${post.title}`)
      created++
    }
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}, Total: ${posts.length}`)
}

main().catch(console.error)
