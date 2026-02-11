'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, ArrowRight, Check, Sparkles, Instagram } from 'lucide-react';
import { GradientButton } from '@/components/shared/GradientButton';
import { InterestSelector } from './InterestSelector';
import { cn } from '@/lib/utils';
import { InterestCategory } from '@/types/user';

type TravelerType = 'solo' | 'couple' | 'group' | 'family';
type BudgetLevel = 'budget' | 'moderate' | 'luxury';
type TravelPace = 'packed' | 'balanced' | 'slow';

interface OnboardingData {
  travelerType: TravelerType | null;
  interests: InterestCategory[];
  budgetLevel: BudgetLevel | null;
  travelPace: TravelPace | null;
  socialConnections: string[];
}

const totalSteps = 6;

export function OnboardingSteps() {
  const router = useRouter();
  const { update } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<OnboardingData>({
    travelerType: null,
    interests: [],
    budgetLevel: null,
    travelPace: null,
    socialConnections: [],
  });

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      // Save interests
      const interestsPayload = data.interests.map((category) => ({
        category,
        weight: 5,
      }));

      const interestsRes = await fetch('/api/users/me/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests: interestsPayload }),
      });

      if (!interestsRes.ok) {
        throw new Error('Failed to save interests');
      }

      // Save profile preferences (traveler type, budget, pace as bio metadata)
      const bioData = [
        data.travelerType && `Traveler: ${data.travelerType}`,
        data.budgetLevel && `Budget: ${data.budgetLevel}`,
        data.travelPace && `Pace: ${data.travelPace}`,
      ]
        .filter(Boolean)
        .join(' | ');

      await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: bioData }),
      });

      // Mark onboarding complete
      const onboardingRes = await fetch('/api/users/me/onboarding', {
        method: 'POST',
      });

      if (!onboardingRes.ok) {
        throw new Error('Failed to complete onboarding');
      }

      // Refresh the session so middleware knows onboarding is complete
      await update();

      router.push('/feed');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return data.travelerType !== null;
      case 2:
        return data.interests.length >= 3;
      case 3:
        return data.budgetLevel !== null;
      case 4:
        return data.travelPace !== null;
      case 5:
        return true;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Progress bar */}
      <div className="px-4 pt-4">
        <div className="max-w-lg mx-auto">
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  'h-1 flex-1 rounded-full transition-all duration-300',
                  index < currentStep
                    ? 'gradient-primary'
                    : index === currentStep
                    ? 'bg-[#667eea]/50'
                    : 'bg-gray-200'
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-lg w-full">
          {currentStep === 0 && <WelcomeStep />}
          {currentStep === 1 && (
            <TravelerTypeStep
              value={data.travelerType}
              onChange={(type) => setData(prev => ({ ...prev, travelerType: type }))}
            />
          )}
          {currentStep === 2 && (
            <InterestsStep
              value={data.interests}
              onChange={(interests) => setData(prev => ({ ...prev, interests }))}
            />
          )}
          {currentStep === 3 && (
            <BudgetStep
              value={data.budgetLevel}
              onChange={(level) => setData(prev => ({ ...prev, budgetLevel: level }))}
            />
          )}
          {currentStep === 4 && (
            <PaceStep
              value={data.travelPace}
              onChange={(pace) => setData(prev => ({ ...prev, travelPace: pace }))}
            />
          )}
          {currentStep === 5 && (
            <SocialStep
              value={data.socialConnections}
              onChange={(connections) => setData(prev => ({ ...prev, socialConnections: connections }))}
            />
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="px-4 pb-8">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          {currentStep > 0 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < totalSteps - 1 ? (
            <GradientButton
              onClick={handleNext}
              disabled={!canProceed()}
              className="min-w-[120px]"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </GradientButton>
          ) : (
            <GradientButton
              onClick={handleComplete}
              disabled={isSubmitting}
              className="min-w-[150px]"
            >
              {isSubmitting ? 'Finishing...' : "Let's go!"}
              <Sparkles className="w-4 h-4 ml-2" />
            </GradientButton>
          )}
        </div>
      </div>
    </div>
  );
}

function WelcomeStep() {
  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto">
        <span className="text-4xl text-white font-bold">P</span>
      </div>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome to Pioneer!</h1>
        <p className="text-lg text-gray-600">
          Let&apos;s personalize your experience. Answer a few quick questions to help us
          show you the best travel content.
        </p>
      </div>
      <div className="flex justify-center gap-4 text-sm text-gray-500">
        <span>Takes ~2 minutes</span>
        <span>5 questions</span>
      </div>
    </div>
  );
}

interface TravelerTypeStepProps {
  value: TravelerType | null;
  onChange: (type: TravelerType) => void;
}

function TravelerTypeStep({ value, onChange }: TravelerTypeStepProps) {
  const options: { type: TravelerType; label: string; icon: string; description: string }[] = [
    { type: 'solo', label: 'Solo', icon: '🎒', description: 'I love exploring on my own' },
    { type: 'couple', label: 'Couple', icon: '💑', description: 'Traveling with my partner' },
    { type: 'group', label: 'Group', icon: '👥', description: 'Friends or travel buddies' },
    { type: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', description: 'Traveling with kids' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">How do you usually travel?</h2>
        <p className="text-gray-600">This helps us recommend the right places for you</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {options.map((option) => (
          <button
            key={option.type}
            onClick={() => onChange(option.type)}
            className={cn(
              'p-6 rounded-2xl border-2 text-left transition-all',
              value === option.type
                ? 'border-[#667eea] bg-[#667eea]/5'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            )}
          >
            <span className="text-3xl mb-3 block">{option.icon}</span>
            <span className="font-semibold text-gray-900 block">{option.label}</span>
            <span className="text-sm text-gray-500">{option.description}</span>
            {value === option.type && (
              <div className="mt-2 flex items-center text-[#667eea] text-sm font-medium">
                <Check className="w-4 h-4 mr-1" />
                Selected
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

interface InterestsStepProps {
  value: InterestCategory[];
  onChange: (interests: InterestCategory[]) => void;
}

function InterestsStep({ value, onChange }: InterestsStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">What interests you most?</h2>
        <p className="text-gray-600">Select at least 3 interests (you can change these later)</p>
      </div>
      <InterestSelector value={value} onChange={onChange} />
      <p className="text-center text-sm text-gray-500">
        {value.length} selected {value.length < 3 && `(${3 - value.length} more needed)`}
      </p>
    </div>
  );
}

interface BudgetStepProps {
  value: BudgetLevel | null;
  onChange: (level: BudgetLevel) => void;
}

function BudgetStep({ value, onChange }: BudgetStepProps) {
  const options: { level: BudgetLevel; label: string; icon: string; description: string }[] = [
    { level: 'budget', label: 'Budget-Friendly', icon: '💰', description: 'Hostels, street food, free activities' },
    { level: 'moderate', label: 'Moderate', icon: '💎', description: 'Mid-range hotels, nice restaurants' },
    { level: 'luxury', label: 'Luxury', icon: '👑', description: 'Premium experiences, fine dining' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">What&apos;s your travel budget style?</h2>
        <p className="text-gray-600">We&apos;ll show places that match your budget preferences</p>
      </div>
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.level}
            onClick={() => onChange(option.level)}
            className={cn(
              'w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4',
              value === option.level
                ? 'border-[#667eea] bg-[#667eea]/5'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            )}
          >
            <span className="text-3xl">{option.icon}</span>
            <div className="flex-1">
              <span className="font-semibold text-gray-900 block">{option.label}</span>
              <span className="text-sm text-gray-500">{option.description}</span>
            </div>
            {value === option.level && (
              <Check className="w-5 h-5 text-[#667eea]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

interface PaceStepProps {
  value: TravelPace | null;
  onChange: (pace: TravelPace) => void;
}

function PaceStep({ value, onChange }: PaceStepProps) {
  const options: { pace: TravelPace; label: string; icon: string; description: string }[] = [
    { pace: 'packed', label: 'Packed', icon: '🏃', description: 'See as much as possible, action-packed days' },
    { pace: 'balanced', label: 'Balanced', icon: '⚖️', description: 'Mix of activities and downtime' },
    { pace: 'slow', label: 'Slow', icon: '🐢', description: 'Take it easy, soak in the atmosphere' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">What&apos;s your travel pace?</h2>
        <p className="text-gray-600">This helps us suggest the right amount of activities</p>
      </div>
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.pace}
            onClick={() => onChange(option.pace)}
            className={cn(
              'w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4',
              value === option.pace
                ? 'border-[#667eea] bg-[#667eea]/5'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            )}
          >
            <span className="text-3xl">{option.icon}</span>
            <div className="flex-1">
              <span className="font-semibold text-gray-900 block">{option.label}</span>
              <span className="text-sm text-gray-500">{option.description}</span>
            </div>
            {value === option.pace && (
              <Check className="w-5 h-5 text-[#667eea]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

interface SocialStepProps {
  value: string[];
  onChange: (connections: string[]) => void;
}

function SocialStep({ value, onChange }: SocialStepProps) {
  const toggleConnection = (platform: string) => {
    if (value.includes(platform)) {
      onChange(value.filter(p => p !== platform));
    } else {
      onChange([...value, platform]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect your social accounts</h2>
        <p className="text-gray-600">Optional: Find friends and share your trips easily</p>
      </div>
      <div className="space-y-3">
        <button
          onClick={() => toggleConnection('instagram')}
          className={cn(
            'w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4',
            value.includes('instagram')
              ? 'border-[#E4405F] bg-[#E4405F]/5'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          )}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E4405F] via-[#C13584] to-[#FCAF45] flex items-center justify-center">
            <Instagram className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <span className="font-semibold text-gray-900 block">Instagram</span>
            <span className="text-sm text-gray-500">Share photos from your trips</span>
          </div>
          {value.includes('instagram') && (
            <Check className="w-5 h-5 text-[#E4405F]" />
          )}
        </button>

        <button
          onClick={() => toggleConnection('tiktok')}
          className={cn(
            'w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4',
            value.includes('tiktok')
              ? 'border-[#000000] bg-gray-100'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          )}
        >
          <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
            </svg>
          </div>
          <div className="flex-1">
            <span className="font-semibold text-gray-900 block">TikTok</span>
            <span className="text-sm text-gray-500">Share travel videos</span>
          </div>
          {value.includes('tiktok') && (
            <Check className="w-5 h-5 text-gray-900" />
          )}
        </button>
      </div>
      <p className="text-center text-sm text-gray-500">
        You can skip this step and connect later in settings
      </p>
    </div>
  );
}
