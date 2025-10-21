import { useState } from 'react';
import Button from './ui/Button';
import Icon from './ui/Icon';
import Alert from './ui/Alert';

export default function ReviewModal({ doctor, isOpen, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Por favor selecciona una calificación');
      return;
    }

    if (comment.trim().length < 10) {
      setError('El comentario debe tener al menos 10 caracteres');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (onSubmit) {
        onSubmit({
          rating,
          comment: comment.trim(),
          anonymous,
          doctorId: doctor.user_id,
          doctorName: doctor.full_name
        });
      }

      // Reset form
      setRating(0);
      setComment('');
      setAnonymous(false);
      onClose();
      
    } catch (error) {
      setError('Error al enviar la reseña. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className={`transition-colors ${
              star <= rating
                ? 'text-yellow-400 hover:text-yellow-500'
                : 'text-gray-300 hover:text-yellow-400'
            }`}
          >
            <Icon name="star" size="lg" />
          </button>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">
              Calificar a {doctor.full_name}
            </h3>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600"
            >
              <Icon name="x-mark" size="sm" />
            </button>
          </div>

          {error && (
            <Alert variant="error" message={error} className="mb-4" />
          )}

          <div className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-3">
                Calificación
              </label>
              <div className="flex items-center gap-3">
                {renderStars()}
                <span className="text-sm text-neutral-600">
                  {rating > 0 ? `${rating}/5` : 'Selecciona una calificación'}
                </span>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-3">
                Comentario
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                placeholder="Comparte tu experiencia con este doctor..."
                maxLength={500}
              />
              <div className="text-right text-xs text-neutral-500 mt-1">
                {comment.length}/500 caracteres
              </div>
            </div>

            {/* Anonymous Option */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700">
                  Publicar de forma anónima
                </span>
              </label>
            </div>

            {/* Guidelines */}
            <div className="bg-neutral-50 rounded-lg p-4">
              <h4 className="font-semibold text-neutral-900 mb-2 text-sm">
                <Icon name="information-circle" size="sm" className="inline mr-1" />
                Directrices para reseñas
              </h4>
              <ul className="text-xs text-neutral-600 space-y-1">
                <li>• Sé respetuoso y constructivo</li>
                <li>• Evita información médica específica</li>
                <li>• Comparte tu experiencia general</li>
                <li>• Las reseñas son verificadas</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                className="flex-1"
                loading={loading}
                disabled={rating === 0 || comment.trim().length < 10}
              >
                <Icon name="star" size="sm" className="mr-2" />
                Enviar Reseña
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
