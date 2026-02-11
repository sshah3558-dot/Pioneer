'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatedRatingStars } from '@/components/shared/AnimatedRatingStars';

const vibeTags = ['Must Visit', 'Instagram Worthy', 'Budget Friendly', 'Family Friendly', 'Romantic', 'Local Favorite'];

interface RatingState {
  overall: number;
  value: number;
  authenticity: number;
  crowdLevel: number;
}

interface PlaceResult {
  id: string;
  name: string;
  cityName: string;
  countryName: string;
  category: string;
}

const ratingLabels = (rating: number) => (rating > 0 ? `${rating}/5` : 'Not rated');

export function ReviewForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [placeSearch, setPlaceSearch] = useState('');
  const [placeResults, setPlaceResults] = useState<PlaceResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [ratings, setRatings] = useState<RatingState>({
    overall: 0,
    value: 0,
    authenticity: 0,
    crowdLevel: 0,
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [photos, setPhotos] = useState<{ id: number; url: string; name: string }[]>([]);
  const [reviewText, setReviewText] = useState('');
  const [title, setTitle] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValid = ratings.overall > 0 && reviewText.length >= 10 && selectedPlace !== null;

  // Debounced place search
  useEffect(() => {
    if (placeSearch.length < 2) {
      setPlaceResults([]);
      return;
    }
    setSearchLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places?search=${encodeURIComponent(placeSearch)}&pageSize=5`);
        if (res.ok) {
          const data = await res.json();
          setPlaceResults(
            (data.items || []).map((p: PlaceResult) => ({
              id: p.id,
              name: p.name,
              cityName: p.cityName,
              countryName: p.countryName,
              category: p.category,
            }))
          );
        }
      } catch {
        // ignore
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [placeSearch]);

  const handleRate = (category: keyof RatingState, value: number) => {
    setRatings((prev) => ({ ...prev, [category]: value }));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (photos.length >= 6) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotos((prev) => [
          ...prev,
          { id: Math.random(), url: event.target?.result as string, name: file.name },
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removePhoto = (id: number) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = async () => {
    if (!isValid || !selectedPlace) return;
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeId: selectedPlace.id,
          overallRating: ratings.overall,
          valueRating: ratings.value || undefined,
          authenticityRating: ratings.authenticity || undefined,
          crowdRating: ratings.crowdLevel || undefined,
          title: title.trim() || undefined,
          content: reviewText,
          visitedAt: visitDate ? new Date(visitDate).toISOString() : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Failed to submit review');
      }

      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['myReviews'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });

      // Redirect to profile after a moment
      setTimeout(() => router.push('/profile'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingCards = [
    { key: 'overall' as const, emoji: '✨', label: 'Overall Experience', subtitle: 'How was it overall?', bg: 'bg-gradient-to-r from-yellow-50 to-orange-50' },
    { key: 'value' as const, emoji: '💰', label: 'Value for Money', subtitle: 'Worth the price?', bg: 'bg-gradient-to-r from-green-50 to-emerald-50' },
    { key: 'authenticity' as const, emoji: '🌟', label: 'Authenticity', subtitle: 'Genuine local experience?', bg: 'bg-gradient-to-r from-blue-50 to-indigo-50' },
    { key: 'crowdLevel' as const, emoji: '👥', label: 'Crowd Level', subtitle: 'How busy was it? (lower is better)', bg: 'bg-gradient-to-r from-purple-50 to-pink-50' },
  ];

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-b-4 border-purple-500 animate-slide-up">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-white text-3xl font-bold shadow-xl relative overflow-hidden animate-pulse-glow">
            <span className="relative z-10">P</span>
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Share Your Adventure!</h1>
            <p className="text-lg text-gray-600 mb-3">Help fellow pioneers discover amazing places</p>
            {selectedPlace && (
              <div className="flex items-center gap-3 text-purple-600 bg-purple-50 px-4 py-2 rounded-full inline-flex">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-semibold">
                  {selectedPlace.name}, {selectedPlace.cityName}, {selectedPlace.countryName}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 space-y-8 animate-slide-up">
        {/* Place Search */}
        <div>
          <h2 className="text-2xl font-bold mb-4 gradient-text-135 flex items-center gap-2">
            <span>📍</span> Which place are you reviewing?
          </h2>
          {selectedPlace ? (
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-2xl">
              <div className="flex-1">
                <p className="font-bold text-gray-800">{selectedPlace.name}</p>
                <p className="text-sm text-gray-600">{selectedPlace.cityName}, {selectedPlace.countryName}</p>
              </div>
              <button
                onClick={() => { setSelectedPlace(null); setPlaceSearch(''); }}
                className="text-gray-400 hover:text-gray-600 px-3 py-1 rounded-full hover:bg-white"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                type="text"
                value={placeSearch}
                onChange={(e) => setPlaceSearch(e.target.value)}
                placeholder="Search for a place..."
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 text-lg transition-all"
              />
              {searchLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Searching...</div>
              )}
              {placeResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-10 max-h-60 overflow-y-auto">
                  {placeResults.map((place) => (
                    <button
                      key={place.id}
                      onClick={() => {
                        setSelectedPlace(place);
                        setPlaceSearch('');
                        setPlaceResults([]);
                      }}
                      className="w-full text-left px-5 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                    >
                      <p className="font-semibold text-gray-800">{place.name}</p>
                      <p className="text-sm text-gray-500">{place.cityName}, {place.countryName}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Title (optional) */}
        <div>
          <h2 className="text-2xl font-bold mb-4 gradient-text-135 flex items-center gap-2">
            <span>📝</span> Review Title (optional)
          </h2>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your review a catchy title..."
            className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 text-lg transition-all"
          />
        </div>

        {/* Visit Date */}
        <div>
          <h2 className="text-2xl font-bold mb-4 gradient-text-135 flex items-center gap-2">
            <span>📅</span> When did you visit?
          </h2>
          <input
            type="date"
            value={visitDate}
            max={todayStr}
            onChange={(e) => setVisitDate(e.target.value)}
            className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 text-lg font-medium transition-all"
          />
        </div>

        {/* Rating Categories */}
        <div className="space-y-5">
          <h2 className="text-2xl font-bold mb-4 gradient-text-135 flex items-center gap-2">
            <span>⭐</span> Rate Your Experience
          </h2>
          {ratingCards.map((card) => (
            <div key={card.key} className={`${card.bg} rounded-2xl p-6 shadow-md border-l-4 border-transparent hover:border-l-[#667eea] hover:translate-x-1 transition-all`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{card.emoji}</span>
                  <div>
                    <span className="font-bold text-gray-800 text-lg block">{card.label}</span>
                    <span className="text-sm text-gray-500">{card.subtitle}</span>
                  </div>
                </div>
                <span className="text-lg font-bold text-purple-600 bg-white px-4 py-2 rounded-full shadow">
                  {ratingLabels(ratings[card.key])}
                </span>
              </div>
              <AnimatedRatingStars
                rating={ratings[card.key]}
                onRate={(val) => handleRate(card.key, val)}
              />
            </div>
          ))}
        </div>

        {/* Vibe Tags */}
        <div>
          <h2 className="text-2xl font-bold mb-4 gradient-text-135 flex items-center gap-2">
            <span>🏷️</span> Add Some Vibes (Optional)
          </h2>
          <div className="flex flex-wrap gap-3">
            {vibeTags.map((tag) => {
              const isActive = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border-2 hover:-translate-y-0.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#f093fb] to-[#f5576c] text-white border-[#f5576c] scale-105 shadow-[0_6px_20px_rgba(245,87,108,0.4)]'
                      : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md border-transparent'
                  }`}
                >
                  {isActive ? '✓ ' : ''}{tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Photo Upload */}
        <div>
          <h2 className="text-2xl font-bold mb-4 gradient-text-135 flex items-center gap-2">
            <span>📸</span> Share Your Pics
          </h2>
          <p className="text-gray-600 mb-4">A picture is worth a thousand words!</p>
          <div className="grid grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="photo-preview">
                <img src={photo.url} alt={photo.name} className="w-full h-40 object-cover" />
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="remove-btn absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {photos.length < 6 && (
              <label className="upload-zone h-40 rounded-2xl flex flex-col items-center justify-center cursor-pointer">
                <svg className="w-12 h-12 text-purple-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-semibold text-gray-600">Add Photos</span>
                <span className="text-xs text-gray-400 mt-1">Up to 6 images</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Review Text */}
        <div>
          <h2 className="text-2xl font-bold mb-4 gradient-text-135 flex items-center gap-2">
            <span>✍️</span> Tell Your Story
          </h2>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="What made this place special? Any insider tips for fellow pioneers? Share the magic!"
            rows={6}
            className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 resize-none text-lg transition-all"
          />
          <div className={`mt-2 text-sm font-medium flex items-center gap-2 ${reviewText.length >= 10 ? 'text-green-600' : 'text-gray-500'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {reviewText.length} characters {reviewText.length < 10 ? '(minimum 10 to submit)' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 animate-slide-up">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm mb-4">
            {error}
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className={`w-full py-6 rounded-2xl font-bold text-2xl transition-all relative overflow-hidden ${
            submitted
              ? 'text-white'
              : isValid
              ? 'text-white hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(102,126,234,0.4)]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          style={
            submitted
              ? { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }
              : isValid
              ? { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
              : undefined
          }
        >
          <span className="relative z-10">
            {submitted
              ? 'Review Submitted! Thank you!'
              : isSubmitting
              ? 'Submitting...'
              : isValid
              ? 'Share Your Experience!'
              : 'Complete the required fields'}
          </span>
        </button>
        {isValid && !submitted && (
          <p className="text-center text-lg text-gray-600 mt-4 font-medium animate-fade-in">
            Your review will help fellow pioneers discover amazing places!
          </p>
        )}
      </div>
    </div>
  );
}
