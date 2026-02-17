import { describe, it, expect } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

describe('Profile Creation Flow', () => {
  it('should create profile record in profiles table', async () => {
    const testEmail = `profile-test-${Date.now()}@test.com`
    const testPassword = 'TestPass123!'

    // Register new user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })

    expect(signUpError).toBeNull()
    expect(signUpData.user).toBeDefined()

    const userId = signUpData.user!.id

    // Simulate profile completion by inserting profile record
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: 'Test User',
        phone: '+525512345678',
        role: 'patient',
      })

    expect(insertError).toBeNull()

    // Verify profile record was created
    const { data: profileData, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    expect(selectError).toBeNull()
    expect(profileData).toBeDefined()
    expect(profileData?.full_name).toBe('Test User')
    expect(profileData?.role).toBe('patient')
  })

  it('should update profile record if it already exists', async () => {
    const testEmail = `profile-update-${Date.now()}@test.com`
    const testPassword = 'TestPass123!'

    // Register new user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })

    expect(signUpError).toBeNull()

    const userId = signUpData.user!.id

    // Insert initial profile record
    const { error: firstInsertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: 'Initial Name',
        role: 'patient',
      })

    expect(firstInsertError).toBeNull()

    // Try to insert again (should fail with duplicate key)
    const { error: duplicateError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: 'Updated Name',
        role: 'doctor',
      })

    expect(duplicateError).toBeDefined()
    expect(duplicateError?.code).toBe('23505') // Duplicate key error

    // Update the record instead
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: 'Updated Name',
        role: 'doctor',
      })
      .eq('id', userId)

    expect(updateError).toBeNull()

    // Verify update worked
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    expect(profileData?.full_name).toBe('Updated Name')
    expect(profileData?.role).toBe('doctor')
  })

  it('should create doctor record when role is doctor', async () => {
    const testEmail = `doctor-profile-${Date.now()}@test.com`
    const testPassword = 'TestPass123!'

    // Register new user
    const { data: signUpData } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })

    const userId = signUpData.user!.id

    // Create profile record with doctor role
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: 'Dr. Test Doctor',
        role: 'doctor',
      })

    expect(profileError).toBeNull()

    // Create doctor record - id references profiles(id)
    const { error: doctorError } = await supabase
      .from('doctors')
      .insert({
        id: userId,
        bio: 'Test doctor bio',
        price_cents: 50000,
        status: 'pending',
      })

    expect(doctorError).toBeNull()

    // Verify doctor record exists
    const { data: doctorData } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', userId)
      .single()

    expect(doctorData).toBeDefined()
    expect(doctorData?.status).toBe('pending')
  })

  it('should handle missing required fields', async () => {
    const testEmail = `invalid-profile-${Date.now()}@test.com`
    const testPassword = 'TestPass123!'

    // Register new user
    const { data: signUpData } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })

    const userId = signUpData.user!.id

    // Try to insert without full_name (required field)
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        // full_name is missing
        role: 'patient',
      })

    // Should fail due to NOT NULL constraint
    expect(error).toBeDefined()
  })
})
