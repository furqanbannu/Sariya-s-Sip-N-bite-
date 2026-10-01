import React, { useState } from 'react';
import { ArrowDown, Calendar, Utensils, Mountain } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantData';

interface HeroProps {
  onOpenReservation: () => void;
  heroHeading?: string;
  heroSubheading?: string;
}

export const Hero: React.FC<HeroProps> = ({ onOpenReservation, heroHeading, heroSubheading }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <section className="relative min-h-[92vh] sm:min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0b0d]">
      {/* Background Image Container with Zero-Broken-Image Fallback */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-[#14161a] relative">
          <img
            src={RESTAURANT_INFO.images.hero}
            alt="Sariya's Sip N Bite luxury dining hall overlooking Murree hills"
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover object-center transition-opacity duration-1000 scale-105 animate-pulse-none ${
              imageLoaded ? 'opacity-70' : 'opacity-0'
            }`}
          />
          {/* Measured Scrim for WCAG AA readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0f12] via-[#0e0f12]/60 to-[#0a0b0d]/75" />
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#0e0f12]/30 to-[#0e0f12]/80" />
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-16 flex flex-col items-center">
        {/* Unboxed Location & Hotel Metadata (Zero-Pill Discipline) */}
        <div className="flex items-center gap-2.5 text-xs tracking-widest uppercase text-[#c5a880] mb-6">
          <span className="flex items-center gap-1.5">
            <Mountain className="w-3.5 h-3.5 text-[#c5a880]" />
            Murree, Pakistan
          </span>
          <span aria-hidden="true" className="text-[#59554d]">·</span>
          <span>Lucky Kabana Hotel</span>
          <span aria-hidden="true" className="text-[#59554d]">·</span>
          <span>Mall Road</span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal text-[#f5eedf] tracking-tight leading-[1.08] max-w-4xl text-balance mb-6">
          {heroHeading || (
            <>
              A Taste of Murree, <span className="italic font-light text-[#c5a880]">Elevated.</span>
            </>
          )}
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-lg md:text-xl text-[#d4cfc5] font-light max-w-2xl text-balance leading-relaxed mb-10">
          {heroSubheading || "Sariya's Sip N Bite — where exceptional food, refined hospitality and the charm of Mall Road come together."}
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 w-full sm:w-auto">
          <a
            href="#menu"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-[#0e0f12] bg-[#c5a880] hover:bg-[#d8ba91] transition-all duration-200"
          >
            <Utensils className="w-4 h-4" />
            <span>Explore Menu</span>
          </a>

          <button
            onClick={onOpenReservation}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-[#ede8e1] border border-[#524e46] hover:border-[#c5a880] hover:text-[#c5a880] bg-[#0e0f12]/40 backdrop-blur-sm transition-all duration-200"
          >
            <Calendar className="w-4 h-4 text-[#c5a880]" />
            <span>Reserve a Table</span>
          </button>
        </div>

        {/* Quiet Editorial Fact Strip */}
        <div className="mt-16 sm:mt-20 pt-8 border-t border-[#252830]/80 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 w-full max-w-3xl text-left">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[#8a857b]">Elevation</p>
            <p className="text-base font-medium text-[#ede8e1] tabular-nums mt-0.5">2,291m</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[#8a857b]">Price Range</p>
            <p className="text-base font-medium text-[#ede8e1] mt-0.5">{RESTAURANT_INFO.priceRange}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[#8a857b]">Guest Rating</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-base font-medium text-[#c5a880] tabular-nums">{RESTAURANT_INFO.rating}</span>
              <span className="text-xs text-[#8a857b]">/ 5.0 ({RESTAURANT_INFO.reviewsCount} reviews)</span>
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[#8a857b]">Dining Hours</p>
            <p className="text-base font-medium text-[#ede8e1] tabular-nums mt-0.5">11 AM – 1 AM Daily</p>
          </div>
        </div>
      </div>

      {/* Gentle Scroll Indicator */}
      <a
        href="#about"
        aria-label="Scroll to about section"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[#8a857b] hover:text-[#c5a880] transition-colors p-2 hidden md:block"
      >
        <ArrowDown className="w-4 h-4 animate-bounce" />
      </a>
    </section>
  );
};
