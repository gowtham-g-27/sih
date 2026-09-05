import React, { useState } from 'react';
import { Star, MessageSquare, Tag, X, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const serviceTags = [
  '⚡ Punctual',
  '🎖️ Highly Skilled',
  '🤝 Polite & Courteous',
  '🦺 Safety Equipped',
  '💰 Fair Cooperative Price',
  '✨ Clean Work'
];

export default function ReviewModal({ bookingId, onClose, onSubmit }) {
  const { t } = useAuth();
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState(['⚡ Punctual', '🎖️ Highly Skilled']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!bookingId) return null;

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(bookingId, score, selectedTags.join(', '), comment);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 border border-sky-100 relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <div className="bg-amber-50 text-amber-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-2 border border-amber-200 shadow-xs">
            <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
          </div>
          <h3 className="text-xl font-black text-slate-900">{t('rateWorkerTitle')}</h3>
          <p className="text-xs text-slate-500">{t('bookingId')}{bookingId}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Interactive Star Selection */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
              {t('ratingLabel')}
            </label>
            <div className="flex items-center gap-2 p-3 bg-sky-50/50 rounded-2xl border border-sky-100 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setScore(star)}
                  className="p-1.5 focus:outline-none transition transform hover:scale-125"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= score
                        ? 'text-amber-500 fill-amber-400'
                        : 'text-slate-300'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review Tags Selection */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" /> {t('reviewTags')}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {serviceTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                    selectedTags.includes(tag)
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Comment input */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> {t('reviewComment')}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe the technician's professionalism, timeliness, and workmanship..."
              className="w-full border border-slate-300 rounded-2xl p-3 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none h-20 resize-none bg-slate-50 focus:bg-white transition"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-2xl font-bold text-xs transition"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-1/2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white py-3.5 rounded-2xl font-black text-xs shadow-md transition disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : t('submitReview')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
