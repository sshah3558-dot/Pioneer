'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/fetcher';
import { Loader2, Check, MapPin } from 'lucide-react';

const CATEGORIES = [
  'RESTAURANT', 'CAFE', 'BAR', 'MUSEUM', 'PARK', 'BEACH',
  'VIEWPOINT', 'MARKET', 'HOTEL', 'HIDDEN_GEM', 'OTHER',
] as const;

interface CityResult {
  id: string;
  name: string;
  country: { name: string };
}

export function QuickAdd() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('RESTAURANT');
  const [address, setAddress] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [cityId, setCityId] = useState('');
  const [cityResults, setCityResults] = useState<CityResult[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCities = async (query: string) => {
    setCityQuery(query);
    setCityId('');
    if (query.length < 2) {
      setCityResults([]);
      setShowCityDropdown(false);
      return;
    }
    try {
      const data = await apiFetch<{ cities: CityResult[] }>(`/api/cities?search=${encodeURIComponent(query)}`);
      setCityResults(data.cities || []);
      setShowCityDropdown(true);
    } catch {
      setCityResults([]);
    }
  };

  const selectCity = (city: CityResult) => {
    setCityId(city.id);
    setCityQuery(`${city.name}, ${city.country.name}`);
    setShowCityDropdown(false);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !cityId || !address.trim()) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await apiFetch('/api/places', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          category,
          cityId,
          address: address.trim(),
        }),
      });

      setSuccess(true);
      setName('');
      setAddress('');
      setCityQuery('');
      setCityId('');
      queryClient.invalidateQueries({ queryKey: ['places'] });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add place');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = !name.trim() || !cityId || !address.trim() || isSubmitting;

  return (
    <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 rounded-2xl shadow-lg p-6">
      <h3 className="font-bold text-lg mb-4 gradient-text-135">Quick Add Place</h3>
      <div className="space-y-3">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Place name" className="w-full px-4 py-2.5 rounded-xl border-2 border-purple-300 dark:border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white dark:bg-gray-800 dark:text-gray-100" />

        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border-2 border-purple-300 dark:border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white dark:bg-gray-800 dark:text-gray-100">
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
          ))}
        </select>

        <div className="relative">
          <input type="text" value={cityQuery} onChange={(e) => searchCities(e.target.value)} onFocus={() => cityResults.length > 0 && setShowCityDropdown(true)} placeholder="Search city..." className="w-full px-4 py-2.5 rounded-xl border-2 border-purple-300 dark:border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white dark:bg-gray-800 dark:text-gray-100" />
          {showCityDropdown && cityResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-lg max-h-40 overflow-y-auto">
              {cityResults.map(city => (
                <button key={city.id} onClick={() => selectCity(city)} className="w-full text-left px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-sm flex items-center gap-2 dark:text-gray-100">
                  <MapPin className="w-3 h-3 text-purple-500" />
                  {city.name}, {city.country.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" className="w-full px-4 py-2.5 rounded-xl border-2 border-purple-300 dark:border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white dark:bg-gray-800 dark:text-gray-100" />

        {error && <p className="text-red-500 text-xs">{error}</p>}

        {success ? (
          <div className="w-full bg-green-500 text-white py-2.5 rounded-xl font-semibold text-center flex items-center justify-center gap-2 text-sm">
            <Check className="w-4 h-4" /> Place Added!
          </div>
        ) : (
          <button onClick={handleSubmit} disabled={isDisabled} className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Add Place
          </button>
        )}
      </div>
    </div>
  );
}
