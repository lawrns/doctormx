import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://lbxfierdgiewuslpgrhs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxieGZpZXJkZ2lld3VzbHBncmhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTgxODcxMywiZXhwIjoyMDgxMzk0NzEzfQ.OT4O2aDXsd23x7K138N_cgNT_YW60iT76XhfLCgyupo',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function createTestUsers() {
  console.log('🔐 Creando usuarios de prueba...\n')

  const users = [
    {
      email: 'paciente@test.com',
      password: 'test123',
      full_name: 'Juan Pérez',
      phone: '5512345678',
      role: 'patient'
    },
    {
      email: 'doctor@test.com',
      password: 'test123',
      full_name: 'Dra. María González',
      phone: '5587654321',
      role: 'doctor',
      doctor_data: {
        bio: 'Médico general con 10 años de experiencia',
        license_number: 'MED-12345',
        years_experience: 10,
        city: 'Ciudad de México',
        state: 'CDMX',
        specialty: 'Medicina General'
      }
    },
    {
      email: 'admin@test.com',
      password: 'test123',
      full_name: 'Admin Sistema',
      phone: '5511223344',
      role: 'admin'
    }
  ]

  for (const user of users) {
    console.log(`📝 Creando ${user.role}: ${user.email}`)

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        full_name: user.full_name
      }
    })

    if (authError) {
      console.error(`❌ Error creando auth user: ${authError.message}`)
      continue
    }

    console.log(`✅ Auth user creado: ${authData.user.id}`)

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role
      })

    if (profileError) {
      console.error(`❌ Error creando profile: ${profileError.message}`)
      continue
    }

    console.log(`✅ Profile creado`)

    // If doctor, create doctor record
    if (user.role === 'doctor' && user.doctor_data) {
      const { error: doctorError } = await supabase
        .from('doctors')
        .insert({
          id: authData.user.id,
          bio: user.doctor_data.bio,
          license_number: user.doctor_data.license_number,
          years_experience: user.doctor_data.years_experience,
          city: user.doctor_data.city,
          state: user.doctor_data.state,
          country: 'MX',
          price_cents: 50000, // $500 MXN
          currency: 'MXN',
          status: 'approved'
        })

      if (doctorError) {
        console.error(`❌ Error creando doctor: ${doctorError.message}`)
      } else {
        console.log(`✅ Doctor creado y aprobado`)
      }
    }

    console.log('')
  }

  console.log('✅ Usuarios de prueba creados!\n')
  console.log('📋 CREDENCIALES:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('👤 Paciente:')
  console.log('   Email: paciente@test.com')
  console.log('   Pass:  test123\n')
  console.log('👨‍⚕️ Doctor:')
  console.log('   Email: doctor@test.com')
  console.log('   Pass:  test123\n')
  console.log('👑 Admin:')
  console.log('   Email: admin@test.com')
  console.log('   Pass:  test123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

createTestUsers().catch(console.error)
