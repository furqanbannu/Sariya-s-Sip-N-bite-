import React, { useState } from 'react';
import { Star, MessageSquarePlus, CheckCircle2, Quote, Sparkles } from 'lucide-react';
import { REVIEWS_DATA, RESTAURANT_INFO } from '../data/restaurantData';
import { Review } from '../types/restaurant';

export const ReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>(REVIEWS_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAuthor, setNewAuthor] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newOccasion, setNewOccasion] = useState('Dinner Dining');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) return;

    const addedReview: Review = {
      id: `user-rev-${Date.now()}`,
      author: newAuthor,
      city: newCity || 'Murree Visitor',
      rating: newRating,
      date: 'Just now',
      comment: newComment,
      occasion: newOccasion,
      source: 'Verified Guest Submission',
      verified: true,
    };

    setReviews([addedReview, ...reviews]);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsModalOpen(false);
      setNewAuthor('');
      setNewCity('');
      setNewComment('');
    }, 1800);
  };

  return (
    <section id="reviews" className="py-24 sm:py-32 bg-[#0e0f12] text-[#ede8e1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Quantitative Proof */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#c5a880] mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#c5a880]" />
              <span>Guest Impressions</span>
              <span aria-hidden="true" className="text-[#59554d]">·</span>
              <span>Verified Feedback</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-normal text-[#f3ede4] tracking-tight leading-tight">
              Voices of Murree Travelers
            </h2>
          </div>

          <div className="mt-6 md:mt-0 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Score Display (Clean Editorial Math, No Gimmick Cockpit) */}
            <div className="flex items-center gap-3 bg-[#14161a] border border-[#22252e] px-4 py-2.5">
              <div className="flex items-center gap-1 text-[#c5a880]">
                <Star className="w-4 h-4 fill-[#c5a880]" />
                <span className="font-sans font-semibold text-lg tabular-nums text-[#ede8e1]">
                  {RESTAURANT_INFO.rating}
                </span>
                <span className="text-xs text-[#8a857b]">/ 5.0</span>
              </div>
              <span className="text-[#363a47]">|</span>
              <span className="text-xs text-[#9a9488]">
                {RESTAURANT_INFO.reviewsCount} Google Reviews
              </span>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#0e0f12] bg-[#c5a880] hover:bg-[#d8ba91] transition-colors"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>Share Experience</span>
            </button>
          </div>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#121418] border border-[#22252e] p-6 sm:p-7 flex flex-col justify-between hover:border-[#c5a880]/50 transition-colors"
            >
              <div>
                {/* Rating Stars & Occasion (Zero-Pill Discipline) */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-1 text-[#c5a880]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating
                            ? 'fill-[#c5a880] text-[#c5a880]'
                            : 'text-[#363a47]'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="text-xs text-[#8a857b]">
                    {rev.occasion || 'Dining Guest'}
                  </span>
                </div>

                <Quote className="w-6 h-6 text-[#2d303b] mb-2" />

                <p className="text-xs sm:text-sm text-[#cbc6b9] font-light leading-relaxed mb-6 italic">
                  "{rev.comment}"
                </p>
              </div>

              {/* Author & Verification Info */}
              <div className="pt-4 border-t border-[#1e2129] flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-semibold text-[#f3ede4]">{rev.author}</h4>
                  <div className="flex items-center gap-1 text-[11px] text-[#8a857b] mt-0.5">
                    {rev.city && <span>{rev.city}</span>}
                    <span aria-hidden="true">·</span>
                    <span>{rev.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-[#c5a880]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#c5a880]" />
                  <span>Verified</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Submission Modal */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 bg-[#07080a]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full bg-[#121418] border border-[#2b2e38] p-6 sm:p-8"
          >
            <div className="mb-6">
              <span className="text-xs uppercase tracking-widest text-[#c5a880] block mb-1">
                Guest Feedback
              </span>
              <h3 className="font-display text-2xl text-[#f3ede4]">
                Share Your Dining Experience
              </h3>
              <p className="text-xs text-[#9a9488] mt-1">
                Your review helps other travelers and families visiting Mall Road, Murree.
              </p>
            </div>

            {submitted ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-[#c5a880] mx-auto mb-3" />
                <h4 className="font-display text-xl text-[#f3ede4]">
                  Thank You for Your Feedback
                </h4>
                <p className="text-xs text-[#9a9488] mt-1">
                  Your review has been published to the guest impressions wall.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#9a9488] mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      placeholder="e.g. Tariq Abbasi"
                      className="w-full px-3.5 py-2.5 bg-[#181a20] border border-[#2a2d36] text-sm text-[#ede8e1] focus:border-[#c5a880] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#9a9488] mb-1.5">
                      City of Origin
                    </label>
                    <input
                      type="text"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="e.g. Islamabad, Lahore"
                      className="w-full px-3.5 py-2.5 bg-[#181a20] border border-[#2a2d36] text-sm text-[#ede8e1] focus:border-[#c5a880] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#9a9488] mb-1.5">
                    Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="p-1 text-[#c5a880] hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= newRating
                              ? 'fill-[#c5a880] text-[#c5a880]'
                              : 'text-[#363a47]'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs text-[#9a9488] ml-2">
                      {newRating} out of 5 stars
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#9a9488] mb-1.5">
                    Dining Occasion
                  </label>
                  <select
                    value={newOccasion}
                    onChange={(e) => setNewOccasion(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#181a20] border border-[#2a2d36] text-sm text-[#ede8e1] focus:border-[#c5a880] focus:outline-none"
                  >
                    <option value="Family Dinner">Family Dinner</option>
                    <option value="Weekend Getaway">Weekend Getaway</option>
                    <option value="Hotel Stay">Lucky Kabana Hotel Guest</option>
                    <option value="Afternoon Tea">Afternoon Tea & Cake</option>
                    <option value="Friends Gathering">Friends Gathering</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#9a9488] mb-1.5">
                    Review Thoughts
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share what you enjoyed most about the steak, pizza, tea, view, or hospitality..."
                    className="w-full px-3.5 py-2.5 bg-[#181a20] border border-[#2a2d36] text-sm text-[#ede8e1] focus:border-[#c5a880] focus:outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#252830]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 text-xs uppercase tracking-wider text-[#9a9488] hover:text-[#ede8e1]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider bg-[#c5a880] text-[#0e0f12] hover:bg-[#d8ba91]"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
