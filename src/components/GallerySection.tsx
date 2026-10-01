import React, { useState } from 'react';
import { Camera, X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { GALLERY_ITEMS } from '../data/restaurantData';
import { GalleryItem } from '../types/restaurant';

export const GallerySection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'interior' | 'dishes' | 'terrace'>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  const filteredItems = GALLERY_ITEMS.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const currentIndex = selectedPhoto
    ? filteredItems.findIndex((item) => item.id === selectedPhoto.id)
    : -1;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setSelectedPhoto(filteredItems[currentIndex - 1]);
    } else {
      setSelectedPhoto(filteredItems[filteredItems.length - 1]);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < filteredItems.length - 1) {
      setSelectedPhoto(filteredItems[currentIndex + 1]);
    } else {
      setSelectedPhoto(filteredItems[0]);
    }
  };

  return (
    <section id="gallery" className="py-24 sm:py-32 bg-[#0a0b0d] text-[#ede8e1] border-t border-[#1c1e24]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14">
          <div>
            <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#c5a880] mb-3">
              <Camera className="w-3.5 h-3.5 text-[#c5a880]" />
              <span>Editorial Visuals</span>
              <span aria-hidden="true" className="text-[#59554d]">·</span>
              <span>Murree Atmosphere</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-normal text-[#f3ede4] tracking-tight leading-tight">
              Spaces & Creations
            </h2>
          </div>

          {/* Clean Segmented Filter Controls (Buttons, Not Pills) */}
          <div className="mt-6 md:mt-0 flex items-center gap-1 border border-[#22252e] bg-[#121418] p-1">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors ${
                activeCategory === 'all'
                  ? 'bg-[#c5a880] text-[#0e0f12] font-semibold'
                  : 'text-[#9a9488] hover:text-[#ede8e1]'
              }`}
            >
              All Views
            </button>
            <button
              onClick={() => setActiveCategory('interior')}
              className={`px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors ${
                activeCategory === 'interior'
                  ? 'bg-[#c5a880] text-[#0e0f12] font-semibold'
                  : 'text-[#9a9488] hover:text-[#ede8e1]'
              }`}
            >
              Interiors
            </button>
            <button
              onClick={() => setActiveCategory('dishes')}
              className={`px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors ${
                activeCategory === 'dishes'
                  ? 'bg-[#c5a880] text-[#0e0f12] font-semibold'
                  : 'text-[#9a9488] hover:text-[#ede8e1]'
              }`}
            >
              Dishes
            </button>
            <button
              onClick={() => setActiveCategory('terrace')}
              className={`px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors ${
                activeCategory === 'terrace'
                  ? 'bg-[#c5a880] text-[#0e0f12] font-semibold'
                  : 'text-[#9a9488] hover:text-[#ede8e1]'
              }`}
            >
              Terrace
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setSelectedPhoto(item)}
              className={`group relative overflow-hidden bg-[#16171b] border border-[#242730] cursor-pointer ${
                idx === 0 ? 'md:col-span-2 lg:col-span-2 aspect-[16/9]' : 'aspect-[4/3]'
              }`}
            >
              <img
                src={item.image}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0f12]/90 via-[#0e0f12]/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

              {/* Hover inspect overlay icon */}
              <div className="absolute top-4 right-4 p-2 bg-[#0e0f12]/80 backdrop-blur-sm text-[#c5a880] opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="w-4 h-4" />
              </div>

              {/* Caption */}
              <div className="absolute bottom-5 left-5 right-5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#c5a880] block mb-1">
                  {item.category}
                </span>
                <h3 className="font-display text-lg sm:text-xl font-medium text-[#f3ede4] leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-[#a9a499] line-clamp-2 mt-1 font-light opacity-90">
                  {item.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-[#07080a]/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full bg-[#121418] border border-[#2b2e38] overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 text-[#ede8e1] hover:text-[#c5a880] bg-[#0e0f12]/80 transition-colors"
              aria-label="Close Lightbox"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Navigation Arrows */}
            {filteredItems.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2.5 text-[#ede8e1] hover:text-[#c5a880] bg-[#0e0f12]/80 transition-colors"
                  aria-label="Previous Photo"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2.5 text-[#ede8e1] hover:text-[#c5a880] bg-[#0e0f12]/80 transition-colors"
                  aria-label="Next Photo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Main Image */}
            <div className="relative aspect-[16/10] w-full bg-[#0a0b0d]">
              <img
                src={selectedPhoto.image}
                alt={selectedPhoto.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Modal Info Bar */}
            <div className="p-6 bg-[#0f1115] border-t border-[#22252e] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#c5a880] mb-1">
                  <span>{selectedPhoto.category}</span>
                  <span aria-hidden="true" className="text-[#59554d]">·</span>
                  <span>Photo {currentIndex + 1} of {filteredItems.length}</span>
                </div>
                <h3 className="font-display text-xl text-[#f3ede4]">
                  {selectedPhoto.title}
                </h3>
                <p className="text-xs text-[#9a9488] mt-1 max-w-xl">
                  {selectedPhoto.caption}
                </p>
              </div>

              <div className="text-xs text-[#8a857b] whitespace-nowrap">
                Lucky Kabana Hotel · Mall Road Murree
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
