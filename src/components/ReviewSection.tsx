import { useState, useEffect } from 'react';
import { Star, Send, User, Loader2, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../api';
import { cn } from '../utils';

interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface ReviewSectionProps {
  propertyId: number;
  isAuthenticated: boolean;
  onReviewPosted?: () => void;
}

export default function ReviewSection({ propertyId, isAuthenticated, onReviewPosted }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [propertyId]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const data = await api.getReviews(propertyId);
      setReviews(data);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await api.postReview({
        property_id: propertyId,
        rating,
        comment
      }, localStorage.getItem('token') || '');
      
      setComment('');
      setRating(5);
      await fetchReviews();
      if (onReviewPosted) onReviewPosted();
    } catch (err) {
      console.error('Failed to post review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] uppercase tracking-widest font-black text-slate-400">Отзывы ({reviews.length})</h4>
        <div className="h-px flex-1 bg-slate-100 mx-6" />
      </div>

      {/* Review Form */}
      {isAuthenticated ? (
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="text-xs font-black text-slate-500 uppercase tracking-wider">Ваша оценка:</div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform active:scale-125"
                  >
                    <Star
                      size={24}
                      fill={(hoveredRating || rating) >= star ? "#f59e0b" : "none"}
                      className={cn(
                        "transition-colors",
                        (hoveredRating || rating) >= star ? "text-amber-500" : "text-slate-300"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Расскажите о ваших впечатлениях от этого места..."
                className="w-full bg-white border border-slate-200 rounded-2xl p-6 text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none min-h-[120px] resize-none"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting || !comment.trim()}
                className="absolute bottom-4 right-4 bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:grayscale transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
              >
                {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 text-center">
          <p className="text-sm font-bold text-slate-500">Пожалуйста, войдите, чтобы оставить отзыв.</p>
        </div>
      )}

      {/* Review List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-slate-200" size={32} />
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid gap-6">
            <AnimatePresence>
              {reviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                        <User size={20} className="text-slate-400" />
                      </div>
                      <div>
                        <div className="font-black text-slate-900 text-sm leading-tight">{review.user_name}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                          {new Date(review.created_at).toLocaleDateString('ru-RU', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg border border-amber-100 text-xs font-black">
                      <Star size={12} fill="currentColor" />
                      {review.rating}
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">
                    {review.comment}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 px-8 bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <MessageCircle size={28} className="text-slate-200" />
            </div>
            <h5 className="font-black text-slate-900 text-lg mb-2">Отзывов пока нет</h5>
            <p className="text-slate-400 text-xs font-bold max-w-xs mx-auto">Станьте первым, кто поделится своим опытом пребывания в этом месте!</p>
          </div>
        )}
      </div>
    </div>
  );
}
