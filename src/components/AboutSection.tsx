import React, { useState } from 'react';
import { Mountain, Hotel, Sparkles, Clock, Compass } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantData';

export const AboutSection: React.FC = () => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <section id="about" className="py-24 sm:py-32 bg-[#0e0f12] text-[#ede8e1] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Eyebrow */}
        <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#c5a880] mb-4">
          <span>The Murree Culinary Haven</span>
          <span aria-hidden="true" className="text-[#59554d]">·</span>
          <span>Lucky Kabana Hotel</span>
        </div>

        {/* Section Heading & Subtitle */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-6">
            <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-normal text-[#f3ede4] tracking-tight leading-[1.15] text-balance mb-6">
              An Experience <br />
              <span className="italic font-light text-[#c5a880]">Beyond Dining</span>
            </h2>

            <p className="text-base sm:text-lg text-[#cdc7bb] font-light leading-relaxed mb-6">
              Discover a refined dining experience in the heart of Murree. Sariya's Sip N Bite combines welcoming hospitality, contemporary presentation and a diverse menu designed for families, couples and travelers.
            </p>

            <p className="text-sm sm:text-base text-[#9a9488] leading-relaxed mb-8">
              Perched inside the renowned Lucky Kabana Hotel on historic Mall Road, our restaurant was envisioned as a sanctuary from the bustling mountain avenues. Here, crisp pine-scented breezes meet the warm glow of artisanal timber architecture and candlelit tables.
            </p>

            {/* Architectural Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#252830]">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#f3ede4] flex items-center gap-2">
                  <Hotel className="w-4 h-4 text-[#c5a880]" />
                  Hotel Residence Dining
                </h3>
                <p className="text-xs text-[#9a9488] mt-1.5 leading-relaxed">
                  Direct lift and lobby access inside Lucky Kabana Hotel, offering effortless room service and private dining.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#f3ede4] flex items-center gap-2">
                  <Mountain className="w-4 h-4 text-[#c5a880]" />
                  Alpine Panorama
                </h3>
                <p className="text-xs text-[#9a9488] mt-1.5 leading-relaxed">
                  Floor-to-ceiling windows and a mountain terrace framing the mist-shrouded Himalayan foothills.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#f3ede4] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#c5a880]" />
                  Culinary Range
                </h3>
                <p className="text-xs text-[#9a9488] mt-1.5 leading-relaxed">
                  From sizzled Italian chicken steaks to authentic Malai Boti pizzas and handmade cakes baked each morning.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#f3ede4] flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#c5a880]" />
                  Mall Road Heart
                </h3>
                <p className="text-xs text-[#9a9488] mt-1.5 leading-relaxed">
                  Located precisely at W94R+4WJ, steps away from central viewpoints, shopping, and scenic strolls.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Visual Showcase */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[16/11] overflow-hidden bg-[#16171b] border border-[#262830]">
              <img
                src={RESTAURANT_INFO.images.terrace}
                alt="Lucky Kabana Hotel dining terrace overlooking Mall Road Murree"
                referrerPolicy="no-referrer"
                onLoad={() => setImageLoaded(true)}
                className={`w-full h-full object-cover transition-all duration-700 hover:scale-105 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0f12]/90 via-transparent to-transparent pointer-events-none" />
              
              {/* Overlay Caption Card */}
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-[#0e0f12]/90 backdrop-blur-md border border-[#2b2e38]">
                <div className="flex items-center justify-between text-xs text-[#c5a880] mb-1">
                  <span className="uppercase tracking-widest">Mountain Terrace & Lounge</span>
                  <span className="text-[#8a857b]">Lucky Kabana Wing</span>
                </div>
                <p className="text-xs text-[#d1cbc0] leading-snug">
                  Heated outdoor armchairs and evening lanterns create the ultimate cozy retreat as Murree temperatures drop at dusk.
                </p>
              </div>
            </div>

            {/* Quiet Supporting Metric Box */}
            <div className="mt-4 flex items-center justify-between py-3 px-4 bg-[#14161a] border border-[#242730] text-xs text-[#9a9488]">
              <span>Mall Road Landmark · W94R+4WJ</span>
              <span className="text-[#f3ede4] font-medium">Open 11:00 AM to 01:00 AM</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
