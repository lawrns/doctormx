import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://oxlbametpfubwnrmrbsv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bGJhbWV0cGZ1Ynducm1yYnN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDYyMDE2NCwiZXhwIjoyMDU2MTk2MTY0fQ.IZzt64ThZ3fIT3kaeukLa_BcPoulQozfqMGl96bTW-8',
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
      email: 'testpatient2026@doctory.com',
      password: 'TestPass123!',
      full_name: 'Juan Pérez',
      phone: '5512345678',
      role: 'patient'
    },
    {
      email: 'testdoctor2026@doctory.com',
      password: 'TestPass123!',
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
      email: 'testadmin2026@doctory.com',
      password: 'TestPass123!',
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

    // Create user record
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role
      })

    if (userError) {
      console.error(`❌ Error creando user: ${userError.message}`)
      continue
    }

    console.log(`✅ User record creado`)

    // If doctor, create doctor record
    if (user.role === 'doctor' && user.doctor_data) {
      const { error: doctorError } = await supabase
        .from('doctors')
        .insert({
          user_id: authData.user.id,
          full_name: user.full_name,
          bio: user.doctor_data.bio,
          cedula: user.doctor_data.license_number,
          specialty: user.doctor_data.specialty,
          city: user.doctor_data.city,
          state: user.doctor_data.state,
          verified: true,
          verification_status: 'verified'
        })

      if (doctorError) {
        console.error(`❌ Error creando doctor: ${doctorError.message}`)
      } else {
        console.log(`✅ Doctor creado y verificado`)
      }
    }

    console.log('')
  }

  console.log('✅ Usuarios de prueba creados!\n')
  console.log('📋 CREDENCIALES:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('👤 Paciente:')
  console.log('   Email: testpatient2026@doctory.com')
  console.log('   Pass:  TestPass123!\n')
  console.log('👨‍⚕️ Doctor:')
  console.log('   Email: testdoctor2026@doctory.com')
  console.log('   Pass:  TestPass123!\n')
  console.log('👑 Admin:')
  console.log('   Email: testadmin2026@doctory.com')
  console.log('   Pass:  TestPass123!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

createTestUsers().catch(console.error)
