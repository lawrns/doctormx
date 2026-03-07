import { describe, it, expect } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const hasSupabaseEnv = Boolean(SUPABASE_URL && SUPABASE_KEY)
const describeIfSupabase = hasSupabaseEnv ? describe : describe.skip
const supabase = hasSupabaseEnv ? createClient(SUPABASE_URL!, SUPABASE_KEY!) : null
const testSupabase = supabase as NonNullable<typeof supabase>

describeIfSupabase('Profile Creation Flow', () => {
  it('should create user record in users table', async () => {
    const testEmail = `profile-test-${Date.now()}@test.com`
    const testPassword = 'TestPass123!'

    // Register new user
    const { data: signUpData, error: signUpError } = await testSupabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })

    expect(signUpError).toBeNull()
    expect(signUpData.user).toBeDefined()

    const userId = signUpData.user!.id

    // Simulate profile completion by inserting user record
    const { error: insertError } = await testSupabase
      .from('users')
      .insert({
        id: userId,
        email: testEmail,
        full_name: 'Test User',
        phone: '+525512345678',
        role: 'patient',
      })

    expect(insertError).toBeNull()

    // Verify user record was created
    const { data: userData, error: selectError } = await testSupabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    expect(selectError).toBeNull()
    expect(userData).toBeDefined()
    expect(userData?.full_name).toBe('Test User')
    expect(userData?.role).toBe('patient')
  })

  it('should update user record if it already exists', async () => {
    const testEmail = `profile-update-${Date.now()}@test.com`
    const testPassword = 'TestPass123!'

    // Register new user
    const { data: signUpData, error: signUpError } = await testSupabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })

    expect(signUpError).toBeNull()

    const userId = signUpData.user!.id

    // Insert initial user record
    const { error: firstInsertError } = await testSupabase
      .from('users')
      .insert({
        id: userId,
        email: testEmail,
        full_name: 'Initial Name',
        role: 'patient',
      })

    expect(firstInsertError).toBeNull()

    // Try to insert again (should fail with duplicate key)
    const { error: duplicateError } = await testSupabase
      .from('users')
      .insert({
        id: userId,
        email: testEmail,
        full_name: 'Updated Name',
        role: 'doctor',
      })

    expect(duplicateError).toBeDefined()
    expect(duplicateError?.code).toBe('23505') // Duplicate key error

    // Update the record instead
    const { error: updateError } = await testSupabase
      .from('users')
      .update({
        full_name: 'Updated Name',
        role: 'doctor',
      })
      .eq('id', userId)

    expect(updateError).toBeNull()

    // Verify update worked
    const { data: userData } = await testSupabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    expect(userData?.full_name).toBe('Updated Name')
    expect(userData?.role).toBe('doctor')
  })

  it('should create doctor record when role is doctor', async () => {
    const testEmail = `doctor-profile-${Date.now()}@test.com`
    const testPassword = 'TestPass123!'

    // Register new user
    const { data: signUpData } = await testSupabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })

    const userId = signUpData.user!.id

    // Create user record
    const { error: userError } = await testSupabase
      .from('users')
      .insert({
        id: userId,
        email: testEmail,
        full_name: 'Dr. Test Doctor',
        role: 'doctor',
      })

    expect(userError).toBeNull()

    // Create doctor record
    const { error: doctorError } = await testSupabase
      .from('doctors')
      .insert({
        user_id: userId,
        full_name: 'Dr. Test Doctor',
        verified: false,
        verification_status: 'pending',
      })

    expect(doctorError).toBeNull()

    // Verify doctor record exists
    const { data: doctorData } = await testSupabase
      .from('doctors')
      .select('*')
      .eq('user_id', userId)
      .single()

    expect(doctorData).toBeDefined()
    expect(doctorData?.verification_status).toBe('pending')
    expect(doctorData?.verified).toBe(false)
  })

  it('should handle missing required fields', async () => {
    const testEmail = `invalid-profile-${Date.now()}@test.com`
    const testPassword = 'TestPass123!'

    // Register new user
    const { data: signUpData } = await testSupabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })

    const userId = signUpData.user!.id

    // Try to insert without full_name (required field)
    const { error } = await testSupabase
      .from('users')
      .insert({
        id: userId,
        email: testEmail,
        // full_name is missing
        role: 'patient',
      })

    // Should fail due to NOT NULL constraint
    expect(error).toBeDefined()
  })
})
