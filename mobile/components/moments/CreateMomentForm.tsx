import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus, X, MapPin, Check } from 'lucide-react-native';
import { api } from '../../lib/api';
import StarRating from '../shared/StarRating';
import type { PlaceCard } from '../../../shared/types';

interface CreateMomentFormProps {
  onSuccess: () => void;
}

const MAX_CHARS = 2000;
const MAX_IMAGES = 3;
const SEARCH_DEBOUNCE_MS = 400;

interface SelectedImage {
  uri: string;
  id: string;
}

export default function CreateMomentForm({ onSuccess }: CreateMomentFormProps) {
  // Content
  const [content, setContent] = useState('');

  // Images
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);

  // Place search
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeResults, setPlaceResults] = useState<PlaceCard[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceCard | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ratings
  const [overallRating, setOverallRating] = useState(0);
  const [valueRating, setValueRating] = useState(0);
  const [authenticityRating, setAuthenticityRating] = useState(0);
  const [crowdRating, setCrowdRating] = useState(0);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Pick images
  const pickImages = async () => {
    const remaining = MAX_IMAGES - selectedImages.length;
    if (remaining <= 0) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: remaining,
    });

    if (!result.canceled && result.assets) {
      const newImages: SelectedImage[] = result.assets.map((asset) => ({
        uri: asset.uri,
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      }));
      setSelectedImages((prev) => [...prev, ...newImages].slice(0, MAX_IMAGES));
    }
  };

  const removeImage = (id: string) => {
    setSelectedImages((prev) => prev.filter((img) => img.id !== id));
  };

  // Place search with debounce
  const handlePlaceSearch = useCallback(
    (query: string) => {
      setPlaceQuery(query);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (query.trim().length < 2) {
        setPlaceResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const data = await api.get<{ items: PlaceCard[] }>(
            `/api/places?search=${encodeURIComponent(query.trim())}`
          );
          setPlaceResults(data.items || []);
        } catch {
          setPlaceResults([]);
        } finally {
          setIsSearching(false);
        }
      }, SEARCH_DEBOUNCE_MS);
    },
    []
  );

  const selectPlace = (place: PlaceCard) => {
    setSelectedPlace(place);
    setPlaceQuery('');
    setPlaceResults([]);
  };

  const clearPlace = () => {
    setSelectedPlace(null);
  };

  // Validation
  const hasSubRatings = valueRating > 0 || authenticityRating > 0 || crowdRating > 0;
  const ratingError = hasSubRatings && overallRating === 0;

  const canSubmit =
    content.trim().length > 0 &&
    content.length <= MAX_CHARS &&
    !ratingError &&
    !isSubmitting;

  // Submit
  const handleSubmit = async () => {
    if (!canSubmit) return;

    setError('');
    setIsSubmitting(true);

    try {
      // Upload images
      const imageUrls: string[] = [];
      for (const image of selectedImages) {
        const { url } = await api.upload(image.uri);
        imageUrls.push(url);
      }

      // Create moment
      await api.post('/api/posts', {
        content: content.trim(),
        imageUrl: imageUrls[0] || undefined,
        imageUrl2: imageUrls[1] || undefined,
        imageUrl3: imageUrls[2] || undefined,
        overallRating: overallRating > 0 ? overallRating : undefined,
        valueRating: valueRating > 0 ? valueRating : undefined,
        authenticityRating: authenticityRating > 0 ? authenticityRating : undefined,
        crowdRating: crowdRating > 0 ? crowdRating : undefined,
        placeId: selectedPlace?.id,
      });

      // Reset form
      setContent('');
      setSelectedImages([]);
      setSelectedPlace(null);
      setOverallRating(0);
      setValueRating(0);
      setAuthenticityRating(0);
      setCrowdRating(0);

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create moment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const screenWidth = Dimensions.get('window').width;
  const thumbSize = (screenWidth - 64) / 3;

  return (
    <View className="px-4 py-4">
      {/* Error */}
      {error ? (
        <View className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 mb-4">
          <Text className="text-red-600 dark:text-red-400 text-sm text-center">
            {error}
          </Text>
        </View>
      ) : null}

      {/* Text Input */}
      <View className="mb-4">
        <TextInput
          className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white min-h-[120px]"
          placeholder="Share your experience..."
          placeholderTextColor="#9CA3AF"
          value={content}
          onChangeText={(text) => setContent(text.slice(0, MAX_CHARS))}
          multiline
          textAlignVertical="top"
          editable={!isSubmitting}
        />
        <Text
          className={`text-xs mt-1 text-right ${
            content.length > MAX_CHARS * 0.9
              ? 'text-red-500'
              : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          {content.length}/{MAX_CHARS}
        </Text>
      </View>

      {/* Image Picker */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Photos ({selectedImages.length}/{MAX_IMAGES})
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {selectedImages.map((image) => (
            <View
              key={image.id}
              style={{ width: thumbSize, height: thumbSize }}
              className="rounded-xl overflow-hidden"
            >
              <Image
                source={{ uri: image.uri }}
                style={{ width: thumbSize, height: thumbSize }}
                contentFit="cover"
              />
              <TouchableOpacity
                className="absolute top-1 right-1 bg-black/60 rounded-full p-1"
                onPress={() => removeImage(image.id)}
              >
                <X size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          {selectedImages.length < MAX_IMAGES ? (
            <TouchableOpacity
              style={{ width: thumbSize, height: thumbSize }}
              className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 items-center justify-center bg-gray-50 dark:bg-gray-900"
              onPress={pickImages}
              disabled={isSubmitting}
              activeOpacity={0.7}
            >
              <ImagePlus size={24} color="#9CA3AF" />
              <Text className="text-xs text-gray-400 mt-1">Add</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Place Search */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Location
        </Text>
        {selectedPlace ? (
          <View className="flex-row items-center bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-xl px-3 py-2.5">
            <MapPin size={16} color="#7C3AED" />
            <Text className="flex-1 ml-2 text-sm text-purple-700 dark:text-purple-300 font-medium">
              {selectedPlace.name}
              {selectedPlace.cityName ? `, ${selectedPlace.cityName}` : ''}
            </Text>
            <TouchableOpacity onPress={clearPlace} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={16} color="#7C3AED" />
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View className="flex-row items-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3">
              <MapPin size={16} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-2 py-3 text-base text-gray-900 dark:text-white"
                placeholder="Search for a place..."
                placeholderTextColor="#9CA3AF"
                value={placeQuery}
                onChangeText={handlePlaceSearch}
                editable={!isSubmitting}
              />
              {isSearching ? (
                <ActivityIndicator size="small" color="#7C3AED" />
              ) : null}
            </View>

            {/* Search Results Dropdown */}
            {placeResults.length > 0 ? (
              <View className="mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden max-h-[200px]">
                <FlatList
                  data={placeResults}
                  keyExtractor={(item) => item.id}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      className="flex-row items-center px-3 py-3 border-b border-gray-100 dark:border-gray-800"
                      onPress={() => selectPlace(item)}
                      activeOpacity={0.7}
                    >
                      <MapPin size={14} color="#9CA3AF" />
                      <View className="ml-2 flex-1">
                        <Text className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </Text>
                        {item.cityName || item.neighborhood ? (
                          <Text className="text-xs text-gray-500 dark:text-gray-400">
                            {[item.neighborhood, item.cityName, item.countryName]
                              .filter(Boolean)
                              .join(', ')}
                          </Text>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            ) : null}
          </View>
        )}
      </View>

      {/* Ratings */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Ratings
        </Text>
        <View className="gap-3">
          <StarRating
            rating={overallRating}
            onRatingChange={setOverallRating}
            label={`Overall${hasSubRatings ? ' (required)' : ''}`}
          />
          <StarRating
            rating={valueRating}
            onRatingChange={setValueRating}
            label="Value"
            size={24}
          />
          <StarRating
            rating={authenticityRating}
            onRatingChange={setAuthenticityRating}
            label="Authenticity"
            size={24}
          />
          <StarRating
            rating={crowdRating}
            onRatingChange={setCrowdRating}
            label="Crowd Level"
            size={24}
          />
        </View>
        {ratingError ? (
          <Text className="text-xs text-red-500 mt-2">
            Overall rating is required when other ratings are given.
          </Text>
        ) : null}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        className={`rounded-xl py-4 items-center mt-2 ${
          canSubmit
            ? 'bg-purple-600 active:bg-purple-700'
            : 'bg-gray-300 dark:bg-gray-700'
        }`}
        onPress={handleSubmit}
        disabled={!canSubmit}
        activeOpacity={0.8}
      >
        {isSubmitting ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator color="#fff" size="small" />
            <Text className="text-white font-semibold text-base">
              {selectedImages.length > 0 ? 'Uploading...' : 'Posting...'}
            </Text>
          </View>
        ) : (
          <Text className="text-white font-semibold text-base">Share Moment</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
