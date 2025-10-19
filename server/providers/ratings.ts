import { supabaseAdmin } from '../lib/supabase.js';

export interface DoctorReview {
  id: string;
  doctor_id: string;
  patient_id: string;
  consult_id?: string;
  rating: number;
  review_text?: string;
  response_time_rating?: number;
  professionalism_rating?: number;
  clarity_rating?: number;
  is_verified_patient: boolean;
  is_anonymous: boolean;
  status: 'pending' | 'published' | 'hidden' | 'flagged';
  created_at: string;
  updated_at: string;
  patient_name?: string;
  patient_avatar?: string;
  helpful_count?: number;
  doctor_response?: {
    id: string;
    response_text: string;
    created_at: string;
  };
}

export interface DoctorStats {
  doctor_id: string;
  total_reviews: number;
  total_ratings: number;
  average_rating: number;
  five_star_count: number;
  four_star_count: number;
  three_star_count: number;
  two_star_count: number;
  one_star_count: number;
  total_consultations: number;
  response_time_avg_minutes: number;
  professionalism_avg: number;
  clarity_avg: number;
  response_time_avg: number;
  last_review_at?: string;
  updated_at: string;
}

export interface ReviewSubmission {
  doctor_id: string;
  consult_id?: string;
  rating: number;
  review_text?: string;
  response_time_rating?: number;
  professionalism_rating?: number;
  clarity_rating?: number;
  is_anonymous?: boolean;
}

// Submit a doctor review
export async function submitDoctorReview(reviewData: ReviewSubmission, patientId: string): Promise<DoctorReview> {
  try {
    console.log('⭐ Submitting doctor review:', { doctorId: reviewData.doctor_id, patientId });

    // Check if patient already reviewed this doctor
    const { data: existingReview, error: checkError } = await supabaseAdmin
      .from('doctor_reviews')
      .select('id')
      .eq('doctor_id', reviewData.doctor_id)
      .eq('patient_id', patientId)
      .single();

    if (existingReview) {
      throw new Error('Ya has dejado una reseña para este doctor');
    }

    // Insert the review
    const { data: review, error } = await supabaseAdmin
      .from('doctor_reviews')
      .insert({
        doctor_id: reviewData.doctor_id,
        patient_id: patientId,
        consult_id: reviewData.consult_id,
        rating: reviewData.rating,
        review_text: reviewData.review_text,
        response_time_rating: reviewData.response_time_rating,
        professionalism_rating: reviewData.professionalism_rating,
        clarity_rating: reviewData.clarity_rating,
        is_anonymous: reviewData.is_anonymous || false,
        status: 'published'
      })
      .select(`
        *,
        users!doctor_reviews_patient_id_fkey(name, avatar_url)
      `)
      .single();

    if (error) throw error;

    console.log('✅ Doctor review submitted:', review.id);

    // Update doctor stats
    await updateDoctorStats(reviewData.doctor_id);

    return {
      id: review.id,
      doctor_id: review.doctor_id,
      patient_id: review.patient_id,
      consult_id: review.consult_id,
      rating: review.rating,
      review_text: review.review_text,
      response_time_rating: review.response_time_rating,
      professionalism_rating: review.professionalism_rating,
      clarity_rating: review.clarity_rating,
      is_verified_patient: review.is_verified_patient,
      is_anonymous: review.is_anonymous,
      status: review.status,
      created_at: review.created_at,
      updated_at: review.updated_at,
      patient_name: review.users?.name,
      patient_avatar: review.users?.avatar_url
    };

  } catch (error) {
    console.error('❌ Error submitting doctor review:', error);
    throw error;
  }
}

// Get doctor rating and statistics
export async function getDoctorRating(doctorId: string): Promise<DoctorStats | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('doctor_stats')
      .select('*')
      .eq('doctor_id', doctorId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No stats found, return default values
        return {
          doctor_id: doctorId,
          total_reviews: 0,
          total_ratings: 0,
          average_rating: 0,
          five_star_count: 0,
          four_star_count: 0,
          three_star_count: 0,
          two_star_count: 0,
          one_star_count: 0,
          total_consultations: 0,
          response_time_avg_minutes: 0,
          professionalism_avg: 0,
          clarity_avg: 0,
          response_time_avg: 0,
          updated_at: new Date().toISOString()
        };
      }
      throw error;
    }

    return {
      doctor_id: data.doctor_id,
      total_reviews: data.total_reviews || 0,
      total_ratings: data.total_ratings || 0,
      average_rating: data.average_rating || 0,
      five_star_count: data.five_star_count || 0,
      four_star_count: data.four_star_count || 0,
      three_star_count: data.three_star_count || 0,
      two_star_count: data.two_star_count || 0,
      one_star_count: data.one_star_count || 0,
      total_consultations: data.total_consultations || 0,
      response_time_avg_minutes: data.response_time_avg_minutes || 0,
      professionalism_avg: data.professionalism_avg || 0,
      clarity_avg: data.clarity_avg || 0,
      response_time_avg: data.response_time_avg || 0,
      last_review_at: data.last_review_at,
      updated_at: data.updated_at
    };

  } catch (error) {
    console.error('❌ Error getting doctor rating:', error);
    throw error;
  }
}

// Get doctor reviews with pagination
export async function getDoctorReviews(
  doctorId: string, 
  limit: number = 10, 
  offset: number = 0,
  includeResponses: boolean = true
): Promise<{ reviews: DoctorReview[], total: number }> {
  try {
    // Get total count
    const { count, error: countError } = await supabaseAdmin
      .from('doctor_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('doctor_id', doctorId)
      .eq('status', 'published');

    if (countError) throw countError;

    // Get reviews with patient info
    let query = supabaseAdmin
      .from('doctor_reviews')
      .select(`
        *,
        users!doctor_reviews_patient_id_fkey(name, avatar_url),
        review_helpfulness(id, is_helpful)
      `)
      .eq('doctor_id', doctorId)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (includeResponses) {
      query = query.select(`
        *,
        users!doctor_reviews_patient_id_fkey(name, avatar_url),
        review_helpfulness(id, is_helpful),
        doctor_review_responses!doctor_review_responses_review_id_fkey(
          id,
          response_text,
          created_at,
          status
        )
      `);
    }

    const { data: reviews, error } = await query;

    if (error) throw error;

    const formattedReviews: DoctorReview[] = reviews.map(review => ({
      id: review.id,
      doctor_id: review.doctor_id,
      patient_id: review.patient_id,
      consult_id: review.consult_id,
      rating: review.rating,
      review_text: review.review_text,
      response_time_rating: review.response_time_rating,
      professionalism_rating: review.professionalism_rating,
      clarity_rating: review.clarity_rating,
      is_verified_patient: review.is_verified_patient,
      is_anonymous: review.is_anonymous,
      status: review.status,
      created_at: review.created_at,
      updated_at: review.updated_at,
      patient_name: review.is_anonymous ? 'Paciente verificado' : review.users?.name,
      patient_avatar: review.is_anonymous ? null : review.users?.avatar_url,
      helpful_count: review.review_helpfulness?.filter(h => h.is_helpful).length || 0,
      doctor_response: review.doctor_review_responses?.[0] ? {
        id: review.doctor_review_responses[0].id,
        response_text: review.doctor_review_responses[0].response_text,
        created_at: review.doctor_review_responses[0].created_at
      } : undefined
    }));

    return {
      reviews: formattedReviews,
      total: count || 0
    };

  } catch (error) {
    console.error('❌ Error getting doctor reviews:', error);
    throw error;
  }
}

// Update doctor statistics
export async function updateDoctorStats(doctorId: string): Promise<void> {
  try {
    // Calculate stats from reviews
    const { data: stats, error } = await supabaseAdmin
      .from('doctor_reviews')
      .select('rating, response_time_rating, professionalism_rating, clarity_rating, created_at')
      .eq('doctor_id', doctorId)
      .eq('status', 'published');

    if (error) throw error;

    const totalReviews = stats.length;
    const averageRating = totalReviews > 0 ? stats.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;
    
    const ratingCounts = {
      five: stats.filter(r => r.rating === 5).length,
      four: stats.filter(r => r.rating === 4).length,
      three: stats.filter(r => r.rating === 3).length,
      two: stats.filter(r => r.rating === 2).length,
      one: stats.filter(r => r.rating === 1).length
    };

    const avgResponseTime = totalReviews > 0 ? 
      stats.reduce((sum, r) => sum + (r.response_time_rating || 0), 0) / totalReviews : 0;
    
    const avgProfessionalism = totalReviews > 0 ? 
      stats.reduce((sum, r) => sum + (r.professionalism_rating || 0), 0) / totalReviews : 0;
    
    const avgClarity = totalReviews > 0 ? 
      stats.reduce((sum, r) => sum + (r.clarity_rating || 0), 0) / totalReviews : 0;

    const lastReviewAt = totalReviews > 0 ? 
      stats.reduce((latest, r) => r.created_at > latest ? r.created_at : latest, stats[0].created_at) : null;

    // Upsert stats
    await supabaseAdmin
      .from('doctor_stats')
      .upsert({
        doctor_id: doctorId,
        total_reviews: totalReviews,
        total_ratings: totalReviews,
        average_rating: Math.round(averageRating * 100) / 100,
        five_star_count: ratingCounts.five,
        four_star_count: ratingCounts.four,
        three_star_count: ratingCounts.three,
        two_star_count: ratingCounts.two,
        one_star_count: ratingCounts.one,
        professionalism_avg: Math.round(avgProfessionalism * 100) / 100,
        clarity_avg: Math.round(avgClarity * 100) / 100,
        response_time_avg: Math.round(avgResponseTime * 100) / 100,
        last_review_at: lastReviewAt,
        updated_at: new Date().toISOString()
      });

    console.log('✅ Doctor stats updated:', doctorId);

  } catch (error) {
    console.error('❌ Error updating doctor stats:', error);
    throw error;
  }
}

// Flag a review for moderation
export async function flagReviewForModeration(
  reviewId: string, 
  reason: string, 
  description?: string, 
  flaggedBy?: string
): Promise<void> {
  try {
    await supabaseAdmin
      .from('review_flags')
      .insert({
        review_id: reviewId,
        flagged_by: flaggedBy,
        reason: reason,
        description: description,
        status: 'pending'
      });

    console.log('✅ Review flagged for moderation:', reviewId);

  } catch (error) {
    console.error('❌ Error flagging review:', error);
    throw error;
  }
}

// Moderate a review
export async function moderateReview(
  reviewId: string, 
  action: 'approve' | 'hide' | 'flag', 
  moderatorId: string, 
  notes?: string
): Promise<void> {
  try {
    const status = action === 'approve' ? 'published' : action === 'hide' ? 'hidden' : 'flagged';

    await supabaseAdmin
      .from('doctor_reviews')
      .update({
        status: status,
        moderation_notes: notes,
        moderated_by: moderatorId,
        moderated_at: new Date().toISOString()
      })
      .eq('id', reviewId);

    console.log('✅ Review moderated:', reviewId, action);

  } catch (error) {
    console.error('❌ Error moderating review:', error);
    throw error;
  }
}

// Vote on review helpfulness
export async function voteReviewHelpfulness(
  reviewId: string, 
  userId: string, 
  isHelpful: boolean
): Promise<void> {
  try {
    await supabaseAdmin
      .from('review_helpfulness')
      .upsert({
        review_id: reviewId,
        user_id: userId,
        is_helpful: isHelpful
      });

    console.log('✅ Review helpfulness vote recorded:', reviewId, isHelpful);

  } catch (error) {
    console.error('❌ Error voting on review helpfulness:', error);
    throw error;
  }
}

// Respond to a review (doctor)
export async function respondToReview(
  reviewId: string, 
  doctorId: string, 
  responseText: string
): Promise<void> {
  try {
    await supabaseAdmin
      .from('doctor_review_responses')
      .insert({
        review_id: reviewId,
        doctor_id: doctorId,
        response_text: responseText,
        status: 'published'
      });

    console.log('✅ Doctor response added:', reviewId);

  } catch (error) {
    console.error('❌ Error responding to review:', error);
    throw error;
  }
}

// Get review statistics for admin
export async function getReviewStatistics(): Promise<{
  totalReviews: number;
  averageRating: number;
  pendingFlags: number;
  recentReviews: number;
}> {
  try {
    const { data: reviews, error: reviewsError } = await supabaseAdmin
      .from('doctor_reviews')
      .select('rating, created_at');

    if (reviewsError) throw reviewsError;

    const { count: flagsCount, error: flagsError } = await supabaseAdmin
      .from('review_flags')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (flagsError) throw flagsError;

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? 
      reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentReviews = reviews.filter(r => new Date(r.created_at) > sevenDaysAgo).length;

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 100) / 100,
      pendingFlags: flagsCount || 0,
      recentReviews
    };

  } catch (error) {
    console.error('❌ Error getting review statistics:', error);
    return {
      totalReviews: 0,
      averageRating: 0,
      pendingFlags: 0,
      recentReviews: 0
    };
  }
}