import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type { InterestCategory } from '../../shared/types';

const TOTAL_STEPS = 6;

const TRAVELER_TYPES = [
  { id: 'solo', label: 'Solo', icon: '🧭' },
  { id: 'couple', label: 'Couple', icon: '💑' },
  { id: 'group', label: 'Group', icon: '👥' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
] as const;

const INTEREST_OPTIONS: { id: InterestCategory; label: string }[] = [
  { id: 'FOOD_DRINK', label: 'Food & Drink' },
  { id: 'ART_CULTURE', label: 'Art & Culture' },
  { id: 'OUTDOORS_NATURE', label: 'Outdoors & Nature' },
  { id: 'NIGHTLIFE', label: 'Nightlife' },
  { id: 'SHOPPING', label: 'Shopping' },
  { id: 'HISTORY', label: 'History' },
  { id: 'ADVENTURE', label: 'Adventure' },
  { id: 'RELAXATION', label: 'Relaxation' },
  { id: 'PHOTOGRAPHY', label: 'Photography' },
  { id: 'LOCAL_EXPERIENCES', label: 'Local Experiences' },
  { id: 'ARCHITECTURE', label: 'Architecture' },
  { id: 'MUSIC', label: 'Music' },
  { id: 'SPORTS', label: 'Sports' },
  { id: 'WELLNESS', label: 'Wellness' },
];

const BUDGET_OPTIONS = [
  { id: 'budget', label: 'Budget', description: 'Smart spending, great value' },
  { id: 'moderate', label: 'Moderate', description: 'Balanced comfort & cost' },
  { id: 'luxury', label: 'Luxury', description: 'Premium experiences' },
] as const;

const PACE_OPTIONS = [
  { id: 'packed', label: 'Packed', description: 'See everything possible' },
  { id: 'balanced', label: 'Balanced', description: 'Mix of busy & relaxed' },
  { id: 'slow', label: 'Slow', description: 'Deep dive, take your time' },
] as const;

type TravelerType = (typeof TRAVELER_TYPES)[number]['id'];
type BudgetLevel = (typeof BUDGET_OPTIONS)[number]['id'];
type TravelPace = (typeof PACE_OPTIONS)[number]['id'];

export default function OnboardingScreen() {
  const { refreshUser } = useAuth();
  const [step, setStep] = useState(0);
  const [travelerType, setTravelerType] = useState<TravelerType | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<InterestCategory[]>([]);
  const [budgetLevel, setBudgetLevel] = useState<BudgetLevel | null>(null);
  const [travelPace, setTravelPace] = useState<TravelPace | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleInterest = (id: InterestCategory) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return true; // Welcome
      case 1: return travelerType !== null;
      case 2: return selectedInterests.length >= 3;
      case 3: return budgetLevel !== null;
      case 4: return travelPace !== null;
      case 5: return true; // Complete
      default: return false;
    }
  };

  const handleNext = async () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    setError('');

    try {
      // Save interests
      const interests = selectedInterests.map((cat) => ({
        category: cat,
        weight: 5,
      }));
      await api.post('/api/users/me/interests', { interests });

      // Save preferences as bio
      const prefs = { travelerType, budgetLevel, travelPace };
      await api.patch('/api/users/me', { bio: JSON.stringify(prefs) });

      // Mark onboarding complete
      await api.post('/api/users/me/onboarding');

      // Refresh user data in auth context
      await refreshUser();

      // Navigate to feed
      router.replace('/(tabs)/feed');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setIsSaving(false);
    }
  };

  // Step indicator dots
  const StepDots = () => (
    <View className="flex-row justify-center gap-2 mt-4">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <View
          key={i}
          className={`h-2 rounded-full ${
            i === step
              ? 'w-8 bg-purple-600'
              : i < step
              ? 'w-2 bg-purple-300'
              : 'w-2 bg-gray-200 dark:bg-gray-700'
          }`}
        />
      ))}
    </View>
  );

  // Step 0: Welcome
  const WelcomeStep = () => (
    <View className="flex-1 justify-center items-center px-8">
      <Text className="text-6xl mb-6">🌍</Text>
      <Text className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-3">
        Welcome to Pioneer!
      </Text>
      <Text className="text-lg text-gray-500 dark:text-gray-400 text-center leading-7">
        Let's personalize your experience so we can help you discover amazing places.
      </Text>
    </View>
  );

  // Step 1: Traveler Type
  const TravelerTypeStep = () => (
    <View className="flex-1 px-8 pt-8">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
        How do you usually travel?
      </Text>
      <Text className="text-base text-gray-500 dark:text-gray-400 text-center mb-8">
        This helps us tailor recommendations
      </Text>
      <View className="flex-row flex-wrap justify-center gap-4">
        {TRAVELER_TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            className={`w-[42%] aspect-square rounded-2xl items-center justify-center border-2 ${
              travelerType === type.id
                ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
            }`}
            onPress={() => setTravelerType(type.id)}
            activeOpacity={0.7}
          >
            <Text className="text-4xl mb-2">{type.icon}</Text>
            <Text
              className={`text-base font-semibold ${
                travelerType === type.id
                  ? 'text-purple-600'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Step 2: Interests
  const InterestsStep = () => (
    <View className="flex-1 px-8 pt-8">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
        What interests you most?
      </Text>
      <Text className="text-base text-gray-500 dark:text-gray-400 text-center mb-8">
        Select at least 3 categories
      </Text>
      <View className="flex-row flex-wrap justify-center gap-3">
        {INTEREST_OPTIONS.map((interest) => {
          const isSelected = selectedInterests.includes(interest.id);
          return (
            <TouchableOpacity
              key={interest.id}
              className={`px-4 py-2.5 rounded-full border ${
                isSelected
                  ? 'border-purple-600 bg-purple-600'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
              }`}
              onPress={() => toggleInterest(interest.id)}
              activeOpacity={0.7}
            >
              <Text
                className={`text-sm font-medium ${
                  isSelected
                    ? 'text-white'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {interest.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text className="text-sm text-gray-400 dark:text-gray-500 text-center mt-4">
        {selectedInterests.length} of 3 minimum selected
      </Text>
    </View>
  );

  // Step 3: Budget
  const BudgetStep = () => (
    <View className="flex-1 px-8 pt-8">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
        What's your typical travel budget?
      </Text>
      <Text className="text-base text-gray-500 dark:text-gray-400 text-center mb-8">
        We'll match recommendations to your style
      </Text>
      <View className="gap-4">
        {BUDGET_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.id}
            className={`rounded-2xl p-5 border-2 ${
              budgetLevel === option.id
                ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
            }`}
            onPress={() => setBudgetLevel(option.id)}
            activeOpacity={0.7}
          >
            <Text
              className={`text-lg font-semibold mb-1 ${
                budgetLevel === option.id
                  ? 'text-purple-600'
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {option.label}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {option.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Step 4: Travel Pace
  const PaceStep = () => (
    <View className="flex-1 px-8 pt-8">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
        What's your ideal travel pace?
      </Text>
      <Text className="text-base text-gray-500 dark:text-gray-400 text-center mb-8">
        Everyone explores differently
      </Text>
      <View className="gap-4">
        {PACE_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.id}
            className={`rounded-2xl p-5 border-2 ${
              travelPace === option.id
                ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
            }`}
            onPress={() => setTravelPace(option.id)}
            activeOpacity={0.7}
          >
            <Text
              className={`text-lg font-semibold mb-1 ${
                travelPace === option.id
                  ? 'text-purple-600'
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {option.label}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {option.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Step 5: Complete
  const CompleteStep = () => (
    <View className="flex-1 justify-center items-center px-8">
      <View className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mb-6">
        <Check size={40} color="#22C55E" strokeWidth={3} />
      </View>
      <Text className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-3">
        You're all set!
      </Text>
      <Text className="text-lg text-gray-500 dark:text-gray-400 text-center leading-7">
        Your experience has been personalized. Time to explore amazing places with Pioneer.
      </Text>
      {error ? (
        <View className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 mt-6 w-full">
          <Text className="text-red-600 dark:text-red-400 text-sm text-center">
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );

  const steps = [
    WelcomeStep,
    TravelerTypeStep,
    InterestsStep,
    BudgetStep,
    PaceStep,
    CompleteStep,
  ];

  const CurrentStep = steps[step];

  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      {/* Safe area spacer */}
      <View style={{ paddingTop: insets.top }}>
        <StepDots />
      </View>

      {/* Step Content */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <CurrentStep />
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="px-8 pb-10 pt-4">
        {step === TOTAL_STEPS - 1 ? (
          /* Final step: Start Exploring */
          <TouchableOpacity
            className={`rounded-xl py-4 items-center ${
              isSaving ? 'bg-purple-400' : 'bg-purple-600 active:bg-purple-700'
            }`}
            onPress={handleComplete}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Start Exploring
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <View className="flex-row gap-4">
            {step > 0 && (
              <TouchableOpacity
                className="flex-1 rounded-xl py-4 items-center border-2 border-gray-200 dark:border-gray-700"
                onPress={handleBack}
                activeOpacity={0.8}
              >
                <Text className="text-gray-700 dark:text-gray-300 font-semibold text-base">
                  Back
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              className={`rounded-xl py-4 items-center ${
                step > 0 ? 'flex-1' : 'w-full'
              } ${
                canProceed()
                  ? 'bg-purple-600 active:bg-purple-700'
                  : 'bg-gray-300 dark:bg-gray-700'
              }`}
              onPress={handleNext}
              disabled={!canProceed()}
              activeOpacity={0.8}
            >
              <Text
                className={`font-semibold text-base ${
                  canProceed()
                    ? 'text-white'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {step === 0 ? 'Get Started' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
