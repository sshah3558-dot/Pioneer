import Link from 'next/link';
import Image from 'next/image';
import { SignupForm } from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="text-2xl font-bold gradient-primary-text">Pioneer</span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
            <p className="mt-2 text-gray-600">
              Start discovering amazing places with Pioneer
            </p>
          </div>

          {/* Form */}
          <SignupForm />
        </div>
      </div>

      {/* Right side - Image (hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 gradient-secondary opacity-90" />
        <Image
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=1600&fit=crop"
          alt="Travel adventure"
          fill
          priority
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Your Journey Starts Here
          </h2>
          <p className="text-xl text-white/90 max-w-md">
            Share your travel experiences, discover hidden gems, and connect with fellow adventurers.
          </p>
          <div className="mt-8 flex gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">50K+</div>
              <div className="text-white/80 text-sm">Places</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">25K+</div>
              <div className="text-white/80 text-sm">Travelers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">100+</div>
              <div className="text-white/80 text-sm">Cities</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
