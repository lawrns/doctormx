import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey ? '✅ Present' : '❌ Missing')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    // Test 1: Check connection
    console.log('\n📡 Test 1: Checking connection...')
    const { data, error } = await supabase.from('users').select('count').limit(1)

    if (error) {
      console.log('❌ Connection test failed:', error.message)
      console.log('Note: Table may not exist yet, which is okay for initial setup')
    } else {
      console.log('✅ Connected to Supabase successfully!')
    }

    // Test 2: Test authentication
    console.log('\n🔐 Test 2: Testing authentication system...')
    const { data: authData, error: authError } = await supabase.auth.getSession()

    if (authError) {
      console.log('❌ Auth test failed:', authError.message)
    } else {
      console.log('✅ Authentication system is working!')
      console.log('Current session:', authData.session ? 'Active' : 'None (expected)')
    }

    // Test 3: Try to create a test user (will fail if already exists)
    console.log('\n👤 Test 3: Testing user registration...')
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'Test123456!'

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User'
        }
      }
    })

    if (signUpError) {
      console.log('❌ Registration test failed:', signUpError.message)
    } else {
      console.log('✅ User registration works!')
      console.log('Test user created:', testEmail)
      console.log('User ID:', signUpData.user?.id)
      console.log('⚠️  Check your email for confirmation link (if email confirmation is enabled)')
    }

    console.log('\n✨ All tests completed!')

  } catch (err) {
    console.error('❌ Unexpected error:', err)
  }
}

testConnection()
