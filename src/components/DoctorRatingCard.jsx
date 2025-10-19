import React, { useState, useEffect } from 'react';
import Icon from './ui/Icon';
import Button from './ui/Button';
import Card from './ui/Card';
import LoadingSpinner from './ui/LoadingSpinner';

const DoctorRatingCard = ({ doctorId, showAll = false }) => {
  const [rating, setRating] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviews, setShowReviews] = useState(false);

  useEffect(() => {
    fetchRatingData();
  }, [doctorId]);

  const fetchRatingData = async () => {
    try {
      setLoading(true);
      
      // Fetch rating statistics
      const ratingResponse = await fetch(`/api/doctors/${doctorId}/rating`);
      const ratingData = await ratingResponse.json();
      
      if (ratingResponse.ok) {
        setRating(ratingData.rating);
      }

      // Fetch recent reviews
      const reviewsResponse = await fetch(`/api/doctors/${doctorId}/reviews?limit=3`);
      const reviewsData = await reviewsResponse.json();
      
      if (reviewsResponse.ok) {
        setReviews(reviewsData.reviews);
      }

    } catch (error) {
      console.error('Error fetching rating data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating, size = 'sm') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon key={i} name="star" size={size} color="warning" className="text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Icon key="half" name="star" size={size} color="warning" className="text-yellow-400 opacity-50" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Icon key={`empty-${i}`} name="star" size={size} color="gray" className="text-gray-300" />
      );
    }

    return stars;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center">
          <LoadingSpinner size="sm" />
          <span className="ml-2 text-gray-600">Cargando calificaciones...</span>
        </div>
      </Card>
    );
  }

  if (!rating || rating.total_reviews === 0) {
    return (
      <Card className="p-4">
        <div className="text-center text-gray-500">
          <Icon name="star" size="lg" color="gray" className="mx-auto mb-2" />
          <p>Sin calificaciones aún</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      {/* Rating Summary */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {rating.average_rating.toFixed(1)}
            </div>
            <div className="flex items-center gap-1">
              {renderStars(rating.average_rating)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">
              {rating.total_reviews} {rating.total_reviews === 1 ? 'reseña' : 'reseñas'}
            </div>
            <div className="text-xs text-gray-500">
              Basado en consultas verificadas
            </div>
          </div>
        </div>
        
        {showAll && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReviews(!showReviews)}
          >
            {showReviews ? 'Ocultar' : 'Ver todas'}
          </Button>
        )}
      </div>

      {/* Rating Breakdown */}
      <div className="space-y-2 mb-4">
        {[5, 4, 3, 2, 1].map(star => {
          const count = rating[`${star}_star_count`] || 0;
          const percentage = rating.total_reviews > 0 ? (count / rating.total_reviews) * 100 : 0;
          
          return (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-8 text-gray-600">{star}</span>
              <Icon name="star" size="sm" color="warning" className="text-yellow-400" />
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-gray-600 text-right">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Recent Reviews */}
      {reviews.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 text-sm">Reseñas Recientes</h4>
          {reviews.slice(0, showReviews ? reviews.length : 2).map(review => (
            <div key={review.id} className="border-t pt-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {review.patient_name?.charAt(0) || 'P'}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {review.is_anonymous ? 'Paciente verificado' : review.patient_name}
                    </div>
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating, 'xs')}
                      <span className="text-xs text-gray-500">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {review.review_text && (
                <p className="text-sm text-gray-700 mb-2">
                  {review.review_text.length > 150 
                    ? `${review.review_text.substring(0, 150)}...` 
                    : review.review_text
                  }
                </p>
              )}

              {/* Detailed Ratings */}
              {(review.response_time_rating || review.professionalism_rating || review.clarity_rating) && (
                <div className="flex gap-4 text-xs text-gray-600">
                  {review.response_time_rating && (
                    <div className="flex items-center gap-1">
                      <Icon name="clock" size="xs" color="gray" />
                      <span>Tiempo: {review.response_time_rating}/5</span>
                    </div>
                  )}
                  {review.professionalism_rating && (
                    <div className="flex items-center gap-1">
                      <Icon name="user-group" size="xs" color="gray" />
                      <span>Profesionalismo: {review.professionalism_rating}/5</span>
                    </div>
                  )}
                  {review.clarity_rating && (
                    <div className="flex items-center gap-1">
                      <Icon name="chat-bubble-left-right" size="xs" color="gray" />
                      <span>Claridad: {review.clarity_rating}/5</span>
                    </div>
                  )}
                </div>
              )}

              {/* Doctor Response */}
              {review.doctor_response && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name="user-group" size="xs" color="primary" />
                    <span className="text-xs font-medium text-blue-800">Respuesta del doctor</span>
                  </div>
                  <p className="text-xs text-blue-700">
                    {review.doctor_response.response_text}
                  </p>
                  <div className="text-xs text-blue-600 mt-1">
                    {formatDate(review.doctor_response.created_at)}
                  </div>
                </div>
              )}

              {/* Helpful Votes */}
              {review.helpful_count > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <Icon name="hand-thumb-up" size="xs" color="success" />
                  <span className="text-xs text-gray-600">
                    {review.helpful_count} {review.helpful_count === 1 ? 'útil' : 'útiles'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Write Review Button */}
      {showAll && (
        <div className="mt-4 pt-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              // This would open a review modal or navigate to review page
              console.log('Open review form for doctor:', doctorId);
            }}
          >
            <Icon name="pencil" size="sm" className="mr-2" />
            Escribir Reseña
          </Button>
        </div>
      )}
    </Card>
  );
};

export default DoctorRatingCard;
