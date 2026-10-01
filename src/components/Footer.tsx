import React from 'react';
import { Phone, MapPin, Facebook, ArrowUp, Mail } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantData';
import { AmbientSoundController } from './AmbientSoundController';

interface FooterProps {
  onOpenReservation: () => void;
  onOpenAdmin: () => void;
  restaurantName?: string;
  hotelName?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenReservation,
  onOpenAdmin,
  restaurantName,
  hotelName,
  phone,
  email,
  address,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#08090b] text-[#ede8e1] border-t border-[#1c1e24] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-[#1c1e24]">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <h3 className="font-display text-2xl sm:text-3xl text-[#f3ede4] tracking-tight mb-2">
              {restaurantName || RESTAURANT_INFO.name}
            </h3>
            <p className="font-serif italic text-base text-[#c5a880] mb-4">
              "{RESTAURANT_INFO.tagline}"
            </p>
            <p className="text-xs text-[#8a857b] font-light leading-relaxed max-w-sm mb-6">
              A luxury dining destination within {hotelName || 'Lucky Kabana Hotel'} on Mall Road, Murree. Celebrating artisanal steaks, wood-fired fusion pizzas, signature pastas, and mountain hospitality.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href={RESTAURANT_INFO.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Sariya's Sip N Bite Facebook page"
                className="w-9 h-9 flex items-center justify-center bg-[#14161a] border border-[#22252e] hover:border-[#c5a880] hover:text-[#c5a880] text-[#a19c90] transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={`tel:${phone || RESTAURANT_INFO.phoneClean}`}
                aria-label="Call Restaurant"
                className="w-9 h-9 flex items-center justify-center bg-[#14161a] border border-[#22252e] hover:border-[#c5a880] hover:text-[#c5a880] text-[#a19c90] transition-colors"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${email || RESTAURANT_INFO.email}`}
                aria-label="Email Reservations"
                className="w-9 h-9 flex items-center justify-center bg-[#14161a] border border-[#22252e] hover:border-[#c5a880] hover:text-[#c5a880] text-[#a19c90] transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#ede8e1] mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-[#8a857b]">
              <li>
                <a href="#about" className="hover:text-[#c5a880] transition-colors">
                  About the Restaurant
                </a>
              </li>
              <li>
                <a href="#signatures" className="hover:text-[#c5a880] transition-colors">
                  Signature Dishes
                </a>
              </li>
              <li>
                <a href="#menu" className="hover:text-[#c5a880] transition-colors">
                  Menu & Prices (Rs 1–1,000)
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-[#c5a880] transition-colors">
                  Atmosphere & Gallery
                </a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-[#c5a880] transition-colors">
                  Guest Reviews
                </a>
              </li>
              <li>
                <a href="#location" className="hover:text-[#c5a880] transition-colors">
                  Mall Road Location
                </a>
              </li>
              <li className="pt-2 border-t border-[#1c1e24]">
                <button
                  onClick={onOpenAdmin}
                  className="text-[#c5a880] hover:text-[#ede8e1] transition-colors text-left font-medium"
                >
                  Admin & Database Portal &rarr;
                </button>
              </li>
            </ul>
          </div>

          {/* Hospitality & Hours */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#ede8e1] mb-4">
              Hours & Service
            </h4>
            <div className="space-y-2 text-xs text-[#8a857b]">
              <p>
                <span className="text-[#cdc7bb] block">Dining Hall & Terrace</span>
                Monday – Sunday: 11:00 AM – 01:00 AM
              </p>
              <p className="pt-2">
                <span className="text-[#cdc7bb] block">Lucky Kabana Hotel Residents</span>
                Room dining available 24 Hours
              </p>
              <p className="pt-2">
                <span className="text-[#cdc7bb] block">Reservations & Pre-Orders</span>
                Available daily via phone and online
              </p>
            </div>
          </div>

          {/* Contact & Address */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#ede8e1] mb-4">
              Hospitality Desk
            </h4>
            <div className="space-y-3 text-xs text-[#8a857b]">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#c5a880] shrink-0 mt-0.5" />
                <span>{RESTAURANT_INFO.address} (Lucky Kabana Hotel)</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
                <a href={`tel:${RESTAURANT_INFO.phoneClean}`} className="hover:text-[#c5a880] font-mono tabular-nums">
                  {RESTAURANT_INFO.phone}
                </a>
              </div>
              <div className="pt-2">
                <button
                  onClick={onOpenReservation}
                  className="w-full py-2.5 px-4 text-xs font-semibold uppercase tracking-wider bg-[#c5a880] text-[#0e0f12] hover:bg-[#d8ba91] transition-colors text-center"
                >
                  Book Table for Tonight
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Ambient Atmosphere Soundscape Controller */}
        <AmbientSoundController />

        {/* Bottom Bar: Quiet Copyright & Return to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6e6a62]">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} {RESTAURANT_INFO.name}. All rights reserved.</span>
            <span aria-hidden="true">·</span>
            <span>Lucky Kabana Hotel, Mall Road Murree</span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-[#8a857b] hover:text-[#c5a880] transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
