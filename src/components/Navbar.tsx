import React, { useState, useEffect } from 'react';
import { Phone, Calendar, ShoppingBag, Menu as MenuIcon, X, MapPin, Database } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantData';

interface NavbarProps {
  onOpenReservation: () => void;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  cartCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenReservation,
  onOpenCart,
  onOpenAdmin,
  cartCount,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0e0f12]/95 backdrop-blur-md border-b border-[#252830] py-3.5 shadow-2xl'
            : 'bg-gradient-to-b from-[#0a0b0d]/90 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Zone 1: Single text element Brand Zone wordmark */}
          <a
            href="#"
            className="font-display text-2xl sm:text-3xl font-medium tracking-tight text-[#f3ede4] hover:text-[#c5a880] transition-colors whitespace-nowrap"
          >
            Sariya's Sip N Bite
          </a>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs tracking-wider uppercase text-[#c7c2b8]">
            <a
              href="#about"
              className="hover:text-[#c5a880] transition-colors py-1"
            >
              About
            </a>
            <a
              href="#signatures"
              className="hover:text-[#c5a880] transition-colors py-1"
            >
              Signatures
            </a>
            <a
              href="#seasonal-specialties"
              className="hover:text-[#c5a880] transition-colors py-1 flex items-center gap-1.5"
            >
              <span>Seasonal</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880]" />
            </a>
            <a
              href="#menu"
              className="hover:text-[#c5a880] transition-colors py-1"
            >
              Menu
            </a>
            <a
              href="#gallery"
              className="hover:text-[#c5a880] transition-colors py-1"
            >
              Gallery
            </a>
            <a
              href="#reviews"
              className="hover:text-[#c5a880] transition-colors py-1"
            >
              Reviews
            </a>
            <a
              href="#location"
              className="hover:text-[#c5a880] transition-colors py-1"
            >
              Contact
            </a>
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenCart}
              aria-label="View Dining Order"
              className="relative p-2.5 text-[#ded8cb] hover:text-[#c5a880] transition-colors"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#c5a880] text-[#0e0f12] text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenReservation}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#0e0f12] bg-[#c5a880] hover:bg-[#d8ba91] transition-colors rounded-none whitespace-nowrap"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Reserve Table</span>
            </button>

            {/* Admin Control Center trigger */}
            <button
              onClick={onOpenAdmin}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-[#c5a880] hover:text-[#0e0f12] bg-[#1a1712] hover:bg-[#c5a880] border border-[#c5a880]/50 transition-all whitespace-nowrap"
              title="Sariya's Admin Control Center"
            >
              <Database className="w-3 h-3 text-[#c5a880] group-hover:text-[#0e0f12]" />
              <span>Admin Center</span>
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#ede8e1] hover:text-[#c5a880] transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 stroke-[1.5]" />
              ) : (
                <MenuIcon className="w-6 h-6 stroke-[1.5]" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 lg:hidden bg-[#0e0f12]/98 backdrop-blur-xl flex flex-col pt-24 px-6 pb-8 border-b border-[#252830]">
          <div className="flex flex-col gap-6 text-center">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="font-display text-2xl text-[#ede8e1] hover:text-[#c5a880] transition-colors"
            >
              About The Dining Hall
            </a>
            <a
              href="#signatures"
              onClick={() => setMobileMenuOpen(false)}
              className="font-display text-2xl text-[#ede8e1] hover:text-[#c5a880] transition-colors"
            >
              Signature Dishes
            </a>
            <a
              href="#seasonal-specialties"
              onClick={() => setMobileMenuOpen(false)}
              className="font-display text-2xl text-[#c5a880] hover:text-[#ede8e1] transition-colors flex items-center justify-center gap-2"
            >
              <span>Seasonal Specialties</span>
              <span className="text-xs font-mono uppercase px-2 py-0.5 border border-[#c5a880]/50 text-[#c5a880]">Weather Matched</span>
            </a>
            <a
              href="#menu"
              onClick={() => setMobileMenuOpen(false)}
              className="font-display text-2xl text-[#ede8e1] hover:text-[#c5a880] transition-colors"
            >
              Full Menu & Pricing
            </a>
            <a
              href="#gallery"
              onClick={() => setMobileMenuOpen(false)}
              className="font-display text-2xl text-[#ede8e1] hover:text-[#c5a880] transition-colors"
            >
              Atmosphere & Gallery
            </a>
            <a
              href="#reviews"
              onClick={() => setMobileMenuOpen(false)}
              className="font-display text-2xl text-[#ede8e1] hover:text-[#c5a880] transition-colors"
            >
              Guest Reviews ({RESTAURANT_INFO.reviewsCount})
            </a>
            <a
              href="#location"
              onClick={() => setMobileMenuOpen(false)}
              className="font-display text-2xl text-[#ede8e1] hover:text-[#c5a880] transition-colors"
            >
              Mall Road Location
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="font-display text-xl text-[#c5a880] hover:text-[#ede8e1] transition-colors flex items-center justify-center gap-2"
            >
              <Database className="w-4 h-4" />
              <span>Admin Control Center</span>
            </button>
          </div>

          <div className="mt-auto pt-6 border-t border-[#252830] flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenReservation();
              }}
              className="w-full py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-[#0e0f12] bg-[#c5a880] hover:bg-[#d8ba91] transition-colors"
            >
              Reserve a Table
            </button>
            <a
              href={`tel:${RESTAURANT_INFO.phoneClean}`}
              className="w-full py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#ede8e1] border border-[#343844] hover:border-[#c5a880] transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-3.5 h-3.5 text-[#c5a880]" />
              <span>Call +92 42 111 797 979</span>
            </a>
            <div className="flex items-center justify-center gap-1.5 text-xs text-[#8c887f] pt-1">
              <MapPin className="w-3 h-3 text-[#c5a880]" />
              <span>Lucky Kabana Hotel, Mall Road, Murree</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
