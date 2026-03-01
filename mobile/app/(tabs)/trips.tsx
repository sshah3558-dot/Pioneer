import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FlatList,
  RefreshControl,
  View,
  Text,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Plus, X, Search, MapPin, ChevronRight } from 'lucide-react-native';
import { api } from '../../lib/api';
import { useDebounce } from '../../lib/hooks/useDebounce';
import TripCard from '../../components/trips/TripCard';
import type { TripCard as TripCardType, PaginatedResponse, CreateTripInput } from '../../../shared/types';

interface CityResult {
  id: string;
  name: string;
  country: { name: string };
}

function CreateTripModal({
  visible,
  onClose,
  onCreated,
}: {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<CityResult | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCityResults, setShowCityResults] = useState(false);

  const debouncedCitySearch = useDebounce(citySearch, 300);

  const { data: cityResults, isLoading: citiesLoading } = useQuery({
    queryKey: ['citySearch', debouncedCitySearch],
    queryFn: () =>
      api.get<{ items: CityResult[] }>(
        `/api/cities?search=${encodeURIComponent(debouncedCitySearch)}&pageSize=10`
      ),
    enabled: debouncedCitySearch.length >= 2,
  });

  const resetForm = useCallback(() => {
    setTitle('');
    setCitySearch('');
    setSelectedCity(null);
    setStartDate('');
    setEndDate('');
    setIsPublic(true);
    setShowCityResults(false);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleSelectCity = useCallback((city: CityResult) => {
    setSelectedCity(city);
    setCitySearch(`${city.name}, ${city.country.name}`);
    setShowCityResults(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a trip title.');
      return;
    }
    if (!selectedCity) {
      Alert.alert('Required', 'Please search and select a city.');
      return;
    }

    setSubmitting(true);
    try {
      const body: CreateTripInput = {
        cityId: selectedCity.id,
        title: title.trim(),
        isPublic,
      };
      if (startDate.trim()) body.startDate = startDate.trim();
      if (endDate.trim()) body.endDate = endDate.trim();

      await api.post('/api/trips', body);
      resetForm();
      onCreated();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create trip');
    } finally {
      setSubmitting(false);
    }
  }, [title, selectedCity, startDate, endDate, isPublic, resetForm, onCreated]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-white dark:bg-gray-950"
      >
        {/* Header */}
        <SafeAreaView>
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <Pressable onPress={handleClose} hitSlop={8}>
              <X size={24} color="#6B7280" />
            </Pressable>
            <Text className="text-lg font-bold text-gray-900 dark:text-white">New Trip</Text>
            <Pressable
              onPress={handleSubmit}
              disabled={submitting}
              className={`px-4 py-1.5 rounded-full ${submitting ? 'bg-purple-300' : 'bg-purple-600'}`}
            >
              <Text className="text-white text-sm font-semibold">
                {submitting ? 'Creating...' : 'Create'}
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>

        <ScrollView className="flex-1 px-4 pt-6" keyboardShouldPersistTaps="handled">
          {/* Title */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Trip Title *
            </Text>
            <TextInput
              className="border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-900 text-base"
              placeholder="e.g., Tokyo Adventure 2026"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
          </View>

          {/* City search */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Destination *
            </Text>
            <View className="relative">
              <View className="flex-row items-center border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-900">
                <Search size={16} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-2 text-gray-900 dark:text-white text-base"
                  placeholder="Search for a city..."
                  placeholderTextColor="#9CA3AF"
                  value={citySearch}
                  onChangeText={(text) => {
                    setCitySearch(text);
                    setSelectedCity(null);
                    setShowCityResults(true);
                  }}
                  onFocus={() => {
                    if (citySearch.length >= 2) setShowCityResults(true);
                  }}
                />
                {selectedCity && (
                  <Pressable
                    onPress={() => {
                      setCitySearch('');
                      setSelectedCity(null);
                    }}
                    hitSlop={8}
                  >
                    <X size={16} color="#9CA3AF" />
                  </Pressable>
                )}
              </View>

              {/* City results dropdown */}
              {showCityResults && debouncedCitySearch.length >= 2 && !selectedCity && (
                <View className="border border-gray-200 dark:border-gray-700 rounded-xl mt-1 bg-white dark:bg-gray-900 overflow-hidden">
                  {citiesLoading ? (
                    <View className="py-4 items-center">
                      <ActivityIndicator size="small" color="#7C3AED" />
                    </View>
                  ) : (cityResults?.items || []).length === 0 ? (
                    <View className="py-4 items-center">
                      <Text className="text-gray-500 dark:text-gray-400 text-sm">
                        No cities found
                      </Text>
                    </View>
                  ) : (
                    (cityResults?.items || []).map((city) => (
                      <Pressable
                        key={city.id}
                        onPress={() => handleSelectCity(city)}
                        className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800"
                      >
                        <MapPin size={16} color="#7C3AED" />
                        <Text className="text-gray-900 dark:text-white text-sm ml-2 flex-1">
                          {city.name}, {city.country.name}
                        </Text>
                        <ChevronRight size={14} color="#9CA3AF" />
                      </Pressable>
                    ))
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Date inputs */}
          <View className="flex-row gap-3 mb-5">
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Start Date
              </Text>
              <TextInput
                className="border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-900 text-base"
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
                value={startDate}
                onChangeText={setStartDate}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                End Date
              </Text>
              <TextInput
                className="border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-900 text-base"
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
                value={endDate}
                onChangeText={setEndDate}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>

          {/* Public/Private toggle */}
          <View className="flex-row items-center justify-between mb-8 bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3">
            <View>
              <Text className="text-sm font-medium text-gray-900 dark:text-white">
                Public Trip
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Others can see and follow your trip
              </Text>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: '#D1D5DB', true: '#A78BFA' }}
              thumbColor={isPublic ? '#7C3AED' : '#F3F4F6'}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function SkeletonCard() {
  return (
    <View className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
      <View className="w-full aspect-[16/9] bg-gray-200 dark:bg-gray-800" />
      <View className="px-4 py-3">
        <View className="w-3/4 h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <View className="w-1/2 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
        <View className="w-2/3 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
      </View>
      <View className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex-row justify-between">
        <View className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        <View className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
      </View>
    </View>
  );
}

export default function TripsScreen() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['trips'],
    queryFn: () =>
      api.get<PaginatedResponse<TripCardType>>('/api/trips?userId=me&page=1&pageSize=20'),
  });

  const handleTripCreated = useCallback(() => {
    setShowCreateModal(false);
    queryClient.invalidateQueries({ queryKey: ['trips'] });
  }, [queryClient]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">My Trips</Text>
        <Pressable
          onPress={() => setShowCreateModal(true)}
          className="w-10 h-10 rounded-full bg-purple-600 items-center justify-center"
          hitSlop={8}
        >
          <Plus size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Content */}
      {isLoading && !data ? (
        <View className="px-4 pt-4 gap-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={data?.items || []}
          renderItem={({ item }) => <TripCard trip={item} />}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#7C3AED"
              colors={['#7C3AED']}
            />
          }
          contentContainerStyle={{ padding: 16, gap: 12 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center py-20">
              <View className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/30 items-center justify-center mb-4">
                <Plus size={32} color="#7C3AED" />
              </View>
              <Text className="text-gray-700 dark:text-gray-300 text-lg font-semibold">
                No trips yet
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 mt-1 text-sm text-center px-8">
                Start planning your next adventure
              </Text>
              <Pressable
                onPress={() => setShowCreateModal(true)}
                className="mt-5 bg-purple-600 rounded-full px-6 py-2.5"
              >
                <Text className="text-white font-semibold text-sm">Create a Trip</Text>
              </Pressable>
            </View>
          }
        />
      )}

      {/* Create trip modal */}
      <CreateTripModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleTripCreated}
      />
    </SafeAreaView>
  );
}
