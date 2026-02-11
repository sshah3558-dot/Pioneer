'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { GradientButton } from '@/components/shared/GradientButton';

interface City {
  id: string;
  name: string;
  country?: { name: string };
}

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateTripModal({ isOpen, onClose, onCreated }: CreateTripModalProps) {
  const [title, setTitle] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (citySearch.length < 2) {
      setCities([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/cities?search=${encodeURIComponent(citySearch)}`);
        if (res.ok) {
          const data = await res.json();
          setCities(data.cities || []);
        }
      } catch {
        // ignore search errors
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [citySearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCity || !title.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityId: selectedCity.id,
          title: title.trim(),
          description: description.trim() || undefined,
          startDate: startDate ? new Date(startDate).toISOString() : undefined,
          endDate: endDate ? new Date(endDate).toISOString() : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Failed to create trip');
      }

      onCreated();
      onClose();
      // Reset form
      setTitle('');
      setCitySearch('');
      setSelectedCity(null);
      setStartDate('');
      setEndDate('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold gradient-text-135">Create New Trip</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trip Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Summer in Barcelona"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            {selectedCity ? (
              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl">
                <span className="font-semibold text-purple-700">
                  {selectedCity.name}
                  {selectedCity.country ? `, ${selectedCity.country.name}` : ''}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCity(null);
                    setCitySearch('');
                  }}
                  className="ml-auto text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Input
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  placeholder="Search for a city..."
                />
                {cities.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                    {cities.map((city) => (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => {
                          setSelectedCity(city);
                          setCitySearch('');
                          setCities([]);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                      >
                        {city.name}{city.country ? `, ${city.country.name}` : ''}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you excited about?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <GradientButton
            type="submit"
            fullWidth
            disabled={isLoading || !selectedCity || !title.trim()}
          >
            {isLoading ? 'Creating...' : 'Create Trip'}
          </GradientButton>
        </form>
      </div>
    </div>
  );
}
