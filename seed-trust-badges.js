import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function seedTrustBadges() {
  try {
    console.log('🏆 Starting trust badges seeding...');

    // Get all verified doctors
    const { data: doctors, error: doctorsError } = await supabase
      .from('doctors')
      .select('user_id, license_status, cedula, specialties')
      .eq('license_status', 'verified');

    if (doctorsError) {
      throw doctorsError;
    }

    console.log(`📋 Found ${doctors.length} verified doctors`);

    const badgeTypes = [
      {
        badge_type: 'sep_verified',
        title: 'Cédula SEP Verificada',
        description: 'Cédula profesional verificada por la Secretaría de Educación Pública',
        icon: '🏥',
        color: 'green'
      },
      {
        badge_type: 'nom_004',
        title: 'NOM-004-SSA3-2012',
        description: 'Cumple con normativa para recetas electrónicas',
        icon: '📋',
        color: 'blue'
      },
      {
        badge_type: 'nom_024',
        title: 'NOM-024-SSA3-2012',
        description: 'Cumple con normativa para telemedicina',
        icon: '💻',
        color: 'purple'
      },
      {
        badge_type: 'data_privacy',
        title: 'LFPDPPP',
        description: 'Cumple con Ley Federal de Protección de Datos Personales',
        icon: '🛡️',
        color: 'indigo'
      },
      {
        badge_type: 'security_certified',
        title: 'Certificado de Seguridad',
        description: 'Certificado de seguridad de datos médicos',
        icon: '🔒',
        color: 'red'
      },
      {
        badge_type: 'professional_insurance',
        title: 'Seguro Profesional',
        description: 'Seguro de responsabilidad profesional',
        icon: '📄',
        color: 'yellow'
      },
      {
        badge_type: 'telemedicine_certified',
        title: 'Telemedicina Certificada',
        description: 'Certificado en telemedicina',
        icon: '📱',
        color: 'pink'
      },
      {
        badge_type: 'patient_safety',
        title: 'Seguridad del Paciente',
        description: 'Comprometido con la seguridad del paciente',
        icon: '✅',
        color: 'emerald'
      }
    ];

    let totalBadgesCreated = 0;

    for (const doctor of doctors) {
      console.log(`👨‍⚕️ Processing doctor: ${doctor.user_id}`);

      // Create badges for each doctor
      for (const badgeType of badgeTypes) {
        try {
          const { data: existingBadge, error: checkError } = await supabase
            .from('doctor_badges')
            .select('id')
            .eq('doctor_id', doctor.user_id)
            .eq('badge_type', badgeType.badge_type)
            .eq('is_active', true)
            .single();

          if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
          }

          // Only create if badge doesn't exist
          if (!existingBadge) {
            const { data: badge, error: badgeError } = await supabase
              .from('doctor_badges')
              .insert({
                doctor_id: doctor.user_id,
                badge_type: badgeType.badge_type,
                title: badgeType.title,
                description: badgeType.description,
                is_active: true,
                verified_at: new Date().toISOString(),
                metadata: {
                  icon: badgeType.icon,
                  color: badgeType.color,
                  cedula: doctor.cedula,
                  specialties: doctor.specialties,
                  verified_by: 'platform_automated'
                }
              })
              .select()
              .single();

            if (badgeError) {
              console.error(`❌ Error creating badge ${badgeType.badge_type} for doctor ${doctor.user_id}:`, badgeError);
            } else {
              console.log(`✅ Created badge: ${badgeType.title} for doctor ${doctor.user_id}`);
              totalBadgesCreated++;
            }
          } else {
            console.log(`⏭️ Badge ${badgeType.badge_type} already exists for doctor ${doctor.user_id}`);
          }
        } catch (error) {
          console.error(`❌ Error processing badge ${badgeType.badge_type} for doctor ${doctor.user_id}:`, error);
        }
      }
    }

    console.log(`🎉 Trust badges seeding completed!`);
    console.log(`📊 Total badges created: ${totalBadgesCreated}`);
    console.log(`👨‍⚕️ Doctors processed: ${doctors.length}`);

  } catch (error) {
    console.error('❌ Error seeding trust badges:', error);
    process.exit(1);
  }
}

// Run the seeding
seedTrustBadges();

