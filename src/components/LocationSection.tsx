import React, { useState } from 'react';
import { MapPin, Phone, Navigation, Clock, Thermometer, CloudFog, Car, Sparkles, ExternalLink } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantData';

interface LocationSectionProps {
  address?: string;
  phone?: string;
  weekdayHours?: string;
  roomServiceHours?: string;
  landmark?: string;
}

export const LocationSection: React.FC<LocationSectionProps> = ({
  address,
  phone,
  weekdayHours,
  roomServiceHours,
  landmark,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('W94R+4WJ Murree Pakistan');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Sariya's Sip N Bite Mall Road Murree Lucky Kabana Hotel")}`;

  return (
    <section id="location" className="py-24 sm:py-32 bg-[#0a0b0d] text-[#ede8e1] border-t border-[#1c1e24]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Location Details */}
          <div className="lg:col-span-6">
            <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#c5a880] mb-3">
              <MapPin className="w-3.5 h-3.5 text-[#c5a880]" />
              <span>Mall Road Destination</span>
              <span aria-hidden="true" className="text-[#59554d]">·</span>
              <span>Central Murree</span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl font-normal text-[#f3ede4] tracking-tight leading-tight mb-6">
              Find Us in the <br />
              <span className="italic font-light text-[#c5a880]">Heart of Murree</span>
            </h2>

            <p className="text-sm sm:text-base text-[#b0aba0] font-light leading-relaxed mb-8">
              Sariya's Sip N Bite is prominently located within the esteemed Lucky Kabana Hotel right on the vibrant Mall Road. Easily accessible on foot during leisurely promenade strolls or via hotel vehicle access points.
            </p>

            {/* Core Address Block */}
            <div className="bg-[#121418] border border-[#22252e] p-6 mb-8 space-y-4">
              <div className="flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-[#c5a880] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#ede8e1]">
                    Address & Coordinates
                  </h3>
                  <p className="text-sm text-[#cdc7bb] mt-0.5">
                    {address || RESTAURANT_INFO.address}
                  </p>
                  <p className="text-xs text-[#c5a880] mt-0.5">
                    Located in {landmark || RESTAURANT_INFO.landmark}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 pt-3 border-t border-[#1e2129]">
                <Clock className="w-5 h-5 text-[#c5a880] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#ede8e1]">
                    Service Hours
                  </h3>
                  <p className="text-xs text-[#cdc7bb] mt-0.5">
                    Daily: {weekdayHours || RESTAURANT_INFO.hours.weekdays}
                  </p>
                  <p className="text-[11px] text-[#8a857b]">
                    {roomServiceHours || RESTAURANT_INFO.hours.roomService}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 pt-3 border-t border-[#1e2129]">
                <Phone className="w-5 h-5 text-[#c5a880] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#ede8e1]">
                    Direct Telephone
                  </h3>
                  <p className="text-sm text-[#cdc7bb] font-mono tabular-nums mt-0.5">
                    {phone || RESTAURANT_INFO.phone}
                  </p>
                  <p className="text-[11px] text-[#8a857b]">
                    Table reservations, takeaways & room inquiries
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons: Get Directions & Call */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider bg-[#c5a880] text-[#0e0f12] hover:bg-[#d8ba91] transition-colors"
              >
                <Navigation className="w-4 h-4" />
                <span>Get Directions</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>

              <a
                href={`tel:${RESTAURANT_INFO.phoneClean}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider border border-[#3b3f4d] text-[#ede8e1] hover:border-[#c5a880] hover:text-[#c5a880] transition-colors"
              >
                <Phone className="w-4 h-4 text-[#c5a880]" />
                <span>Call Restaurant</span>
              </a>

              <button
                onClick={handleCopyCode}
                className="text-xs uppercase tracking-wider text-[#8a857b] hover:text-[#c5a880] transition-colors text-center py-2"
              >
                {copiedCode ? 'Copied Plus Code!' : 'Copy Plus Code: W94R+4WJ'}
              </button>
            </div>
          </div>

          {/* Right Column: Architectural Map & Mountain Advisory */}
          <div className="lg:col-span-6 space-y-6">
            {/* Visual Architectural Map Representation */}
            <div className="relative aspect-[16/11] bg-[#14161a] border border-[#262830] overflow-hidden flex flex-col justify-between p-6">
              {/* Top Bar of Map Card */}
              <div className="relative z-10 flex items-center justify-between text-xs text-[#8a857b]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#c5a880] animate-ping" />
                  <span className="font-mono text-[#c5a880]">Mall Road, Murree Elevation 2,291m</span>
                </div>
                <span>Lucky Kabana Premise</span>
              </div>

              {/* Stylized Architectural Compass & Grid */}
              <div className="relative z-10 my-auto text-center py-8">
                <div className="inline-block p-4 border border-[#30333e] bg-[#0e0f12]/90 backdrop-blur-md mb-3">
                  <MapPin className="w-8 h-8 text-[#c5a880] mx-auto mb-1 animate-bounce" />
                  <h4 className="font-display text-xl text-[#f3ede4]">
                    Sariya's Sip N Bite
                  </h4>
                  <p className="text-xs text-[#a8a396] mt-0.5">
                    Inside Lucky Kabana Hotel
                  </p>
                  <p className="text-[11px] font-mono text-[#c5a880] mt-1">
                    Plus Code: W94R+4WJ
                  </p>
                </div>

                <p className="text-xs text-[#8a857b] max-w-sm mx-auto">
                  Direct walking access along the primary pedestrian stretch of Mall Road, 3 minutes from Murree General Post Office (GPO).
                </p>
              </div>

              {/* Bottom Quick-Action */}
              <div className="relative z-10 pt-4 border-t border-[#22252e] flex items-center justify-between text-xs">
                <span className="text-[#8a857b]">Latitude / Longitude: 33.906° N, 73.391° E</span>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#c5a880] hover:underline"
                >
                  Open in Google Maps &rarr;
                </a>
              </div>

              {/* Subtle architectural grid pattern background */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(#c5a880 1px, transparent 1px)`,
                  backgroundSize: '24px 24px',
                }}
              />
            </div>

            {/* Murree Alpine Advisory Bar */}
            <div className="bg-[#121418] border border-[#22252e] p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CloudFog className="w-5 h-5 text-[#c5a880] shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-[#ede8e1]">
                    Highland Evening Mist
                  </h5>
                  <p className="text-xs text-[#8a857b] mt-0.5 leading-relaxed">
                    Murree temperatures fall sharply after dusk. Indoor fireplace heating and hot blankets are provided on our outdoor terrace.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Car className="w-5 h-5 text-[#c5a880] shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-[#ede8e1]">
                    Mall Road Access & Parking
                  </h5>
                  <p className="text-xs text-[#8a857b] mt-0.5 leading-relaxed">
                    Pedestrian hours apply on Mall Road during peak evenings. Lucky Kabana Hotel valet and designated staging area are nearby.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
