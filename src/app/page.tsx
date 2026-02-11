import Link from 'next/link';
import { GradientButton } from '@/components/shared/GradientButton';
import { TripCard } from '@/components/trips/TripCard';
import { PlaceCard } from '@/components/places/PlaceCard';
import { mockTrips, mockPlaces } from '@/lib/mock-data';
import { MapPin, Users, Star, Sparkles, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold gradient-primary-text">Pioneer</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Log in
            </Link>
            <Link href="/signup">
              <GradientButton size="sm">Sign up</GradientButton>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Discover{' '}
              <span className="gradient-primary-text">Together</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              The community-powered travel platform where you discover places through the
              trips of people you trust. Rate, review, and share your adventures.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <GradientButton size="lg" className="w-full sm:w-auto">
                  Start Exploring
                  <ArrowRight className="w-5 h-5 ml-2" />
                </GradientButton>
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-center"
              >
                I have an account
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 md:gap-16 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold gradient-primary-text">50K+</div>
              <div className="text-gray-500 text-sm">Places</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-primary-text">25K+</div>
              <div className="text-gray-500 text-sm">Travelers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-primary-text">100+</div>
              <div className="text-gray-500 text-sm">Cities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-primary-text">4.8</div>
              <div className="text-gray-500 text-sm">Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why travelers love Pioneer
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Follow Trusted Travelers
              </h3>
              <p className="text-gray-600">
                Discover places through people with similar tastes. No more generic recommendations.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                <Star className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Honest Reviews
              </h3>
              <p className="text-gray-600">
                Real ratings across multiple categories. Know what to expect before you visit.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                AI-Powered Discovery
              </h3>
              <p className="text-gray-600">
                Get personalized recommendations based on your interests, budget, and travel style.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trips Preview Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Recent Trips</h2>
              <p className="text-gray-600">See where our community is traveling</p>
            </div>
            <Link href="/signup" className="text-[#667eea] font-medium hover:underline">
              View all
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockTrips.slice(0, 3).map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </div>
      </section>

      {/* Places Preview Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-[#667eea] text-sm font-medium mb-1">
                <MapPin className="w-4 h-4" />
                Lisbon, Portugal
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Top-Rated Places</h2>
              <p className="text-gray-600">Hidden gems loved by our community</p>
            </div>
            <Link href="/signup" className="text-[#667eea] font-medium hover:underline">
              Explore more
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="gradient-primary rounded-3xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to start your journey?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of travelers discovering the world through authentic, community-powered
              recommendations.
            </p>
            <Link href="/signup">
              <button className="px-8 py-4 bg-white text-[#667eea] font-semibold rounded-xl hover:bg-white/90 transition-colors">
                Create Free Account
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <span className="gradient-primary-text font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold">Pioneer</span>
            </div>

            <div className="flex gap-8 text-gray-400 text-sm">
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>

            <p className="text-gray-400 text-sm">
              2024 Pioneer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
