import { supabase } from '../../lib/supabase';

/**
 * Service for managing custom domains and subdomains for doctor profiles
 */
export class DomainService {
  /**
   * Creates a subdomain for a doctor on the doctor.mx domain
   * @param doctorId The ID of the doctor
   * @param subdomainPrefix The desired prefix for the subdomain (e.g., "drgarcia" for drgarcia.doctor.mx)
   * @returns The created subdomain record
   */
  async createSubdomain(doctorId: string, subdomainPrefix: string): Promise<any> {
    // Normalize subdomain (lowercase, remove special chars)
    const normalizedPrefix = subdomainPrefix
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();
    
    if (!normalizedPrefix) {
      throw new Error('Subdomain prefix cannot be empty');
    }
    
    // Check if subdomain is available
    const { data: existingSubdomain, error: checkError } = await supabase
      .from('doctor_domains')
      .select('*')
      .eq('subdomain_prefix', normalizedPrefix)
      .maybeSingle();
    
    if (checkError) {
      throw new Error(`Failed to check subdomain availability: ${checkError.message}`);
    }
    
    if (existingSubdomain) {
      throw new Error(`Subdomain "${normalizedPrefix}" is already taken.`);
    }
    
    // Create the subdomain record
    const { data, error } = await supabase
      .from('doctor_domains')
      .insert({
        doctor_id: doctorId,
        subdomain_prefix: normalizedPrefix,
        subdomain_url: `${normalizedPrefix}.doctor.mx`,
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create subdomain: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Registers a custom domain for a doctor
   * @param doctorId The ID of the doctor
   * @param customDomain The custom domain to register (e.g., "drgarcia.com")
   * @returns The created custom domain record
   */
  async registerCustomDomain(doctorId: string, customDomain: string): Promise<any> {
    // Normalize domain (lowercase, remove whitespace)
    const normalizedDomain = customDomain.toLowerCase().trim();
    
    if (!normalizedDomain) {
      throw new Error('Custom domain cannot be empty');
    }
    
    // Validate domain format
    const domainRegex = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;
    if (!domainRegex.test(normalizedDomain)) {
      throw new Error('Invalid domain format');
    }
    
    // Check if domain is already registered
    const { data: existingDomain, error: checkError } = await supabase
      .from('doctor_domains')
      .select('*')
      .eq('custom_domain', normalizedDomain)
      .maybeSingle();
    
    if (checkError) {
      throw new Error(`Failed to check domain availability: ${checkError.message}`);
    }
    
    if (existingDomain) {
      throw new Error(`Domain "${normalizedDomain}" is already registered.`);
    }
    
    // Generate verification code for domain ownership verification
    const verificationCode = `doctormx-verify-${Math.random().toString(36).substring(2, 15)}`;
    
    // Create the custom domain record
    const { data, error } = await supabase
      .from('doctor_domains')
      .insert({
        doctor_id: doctorId,
        custom_domain: normalizedDomain,
        verification_code: verificationCode,
        verification_status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to register custom domain: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Verifies domain ownership using DNS TXT record
   * @param domainId The ID of the domain record to verify
   * @returns The updated domain record
   */
  async verifyDomainOwnership(domainId: string): Promise<any> {
    // In real implementation, this would query DNS records and verify the TXT record
    // For simulation purposes, we'll just update the status
    
    const { data, error } = await supabase
      .from('doctor_domains')
      .update({
        verification_status: 'verified',
        verified_at: new Date().toISOString()
      })
      .eq('id', domainId)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to update domain verification: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Gets all domains for a doctor
   * @param doctorId The ID of the doctor
   * @returns Array of domain records
   */
  async getDoctorDomains(doctorId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('doctor_domains')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Failed to fetch doctor domains: ${error.message}`);
    }
    
    return data || [];
  }
  
  /**
   * Updates SSL certificate status for a domain
   * @param domainId The ID of the domain record
   * @param status The new SSL status
   * @returns The updated domain record
   */
  async updateSSLStatus(domainId: string, status: 'pending' | 'issued' | 'error'): Promise<any> {
    const { data, error } = await supabase
      .from('doctor_domains')
      .update({
        ssl_status: status,
        ssl_updated_at: new Date().toISOString()
      })
      .eq('id', domainId)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to update SSL status: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Deletes a domain record
   * @param domainId The ID of the domain record to delete
   * @returns True if successful
   */
  async deleteDomain(domainId: string): Promise<boolean> {
    const { error } = await supabase
      .from('doctor_domains')
      .delete()
      .eq('id', domainId);
    
    if (error) {
      throw new Error(`Failed to delete domain: ${error.message}`);
    }
    
    return true;
  }
}

export default new DomainService();