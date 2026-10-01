import React, { useState } from 'react';
import {
  CloudFog,
  Snowflake,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Gauge,
  Compass,
  Plus,
  Check,
  Sparkles,
  ShoppingBag,
  Info,
  ChevronRight,
  Flame,
  Coffee,
} from 'lucide-react';
import { MenuItem } from '../types/restaurant';
import {
  WeatherConditionKey,
  MURREE_WEATHER_PRESETS,
  getInitialMurreeWeather,
  setStoredMurreeWeather,
  getRecommendedItemsForWeather,
} from '../services/weatherService';

interface SeasonalSpecialtiesProps {
  onAddToCart: (item: MenuItem, quantity?: number) => void;
  onSelectItem: (item: MenuItem) => void;
}

export const SeasonalSpecialties: React.FC<SeasonalSpecialtiesProps> = ({
  onAddToCart,
  onSelectItem,
}) => {
  const [currentWeatherKey, setCurrentWeatherKey] = useState<WeatherConditionKey>(
    getInitialMurreeWeather()
  );
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});
  const [bundleAdded, setBundleAdded] = useState(false);

  const activeWeather = MURREE_WEATHER_PRESETS[currentWeatherKey];
  const recommendedDishes = getRecommendedItemsForWeather(currentWeatherKey);

  const handleWeatherChange = (key: WeatherConditionKey) => {
    setCurrentWeatherKey(key);
    setStoredMurreeWeather(key);
    setBundleAdded(false);
  };

  const handleAddDish = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(item, 1);
    setAddedItemIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [item.id]: false }));
    }, 1400);
  };

  const handleAddBundle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const bundleItems = recommendedDishes
      .filter((d) => activeWeather.bundle.itemIds.includes(d.item.id))
      .map((d) => d.item);

    bundleItems.forEach((item) => {
      onAddToCart(item, 1);
    });

    setBundleAdded(true);
    setTimeout(() => setBundleAdded(false), 2000);
  };

  // Weather Condition Icon Helper
  const getWeatherIcon = (key: WeatherConditionKey, className = 'w-5 h-5') => {
    switch (key) {
      case 'chilly_mist':
        return <CloudFog className={className} />;
      case 'alpine_snow':
        return <Snowflake className={className} />;
      case 'mountain_rain':
        return <CloudRain className={className} />;
      case 'sunny_ridge':
        return <Sun className={className} />;
    }
  };

  // Calculate bundle pricing
  const bundleItems = recommendedDishes
    .filter((d) => activeWeather.bundle.itemIds.includes(d.item.id))
    .map((d) => d.item);
  const bundleRegularPrice = bundleItems.reduce((acc, curr) => acc + curr.price, 0);
  const bundleDiscountedPrice = Math.round(
    bundleRegularPrice * (1 - activeWeather.bundle.discountPercent / 100)
  );

  return (
    <section
      id="seasonal-specialties"
      className="relative py-20 sm:py-28 bg-gradient-to-b from-[#0b0c10] via-[#0f1118] to-[#0e0f12] text-[#ede8e1] border-b border-[#232733] overflow-hidden"
    >
      {/* Subtle Background Glow corresponding to current weather atmosphere */}
      <div
        className="absolute top-0 right-1/4 w-[600px] h-[350px] pointer-events-none rounded-full blur-[140px] opacity-20 transition-all duration-700"
        style={{ backgroundColor: activeWeather.atmosphereTheme.accentGlow }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 pb-8 border-b border-[#222530]">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2.5 text-xs tracking-widest uppercase text-[#c5a880] mb-3 font-mono">
              <span className="inline-block w-2 h-2 rounded-full bg-[#c5a880] animate-pulse" />
              <span>Murree Live Weather Kitchen Service</span>
              <span aria-hidden="true" className="text-[#59554d]">·</span>
              <span>Elevation 2,291m</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-normal text-[#f3ede4] tracking-tight leading-tight mb-3">
              Seasonal Specialties
            </h2>
            <p className="text-sm sm:text-base text-[#9a9488] font-light leading-relaxed">
              In Murree’s high Himalayan air, appetite shifts with the mountain mist. Our kitchen
              dynamically tailors recommended fare, warming spices, and cast-iron sizzlers to
              today’s weather on Mall Road.
            </p>
          </div>

          {/* Real-time Weather Simulator Selector (Zero-Pill Discipline) */}
          <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
            <span className="text-[11px] uppercase tracking-wider text-[#8a857b] font-mono">
              Simulate Murree Atmosphere:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-[#13151c] border border-[#262834]">
              {(
                [
                  'chilly_mist',
                  'alpine_snow',
                  'mountain_rain',
                  'sunny_ridge',
                ] as WeatherConditionKey[]
              ).map((wKey) => {
                const preset = MURREE_WEATHER_PRESETS[wKey];
                const isSelected = currentWeatherKey === wKey;
                return (
                  <button
                    key={wKey}
                    type="button"
                    onClick={() => handleWeatherChange(wKey)}
                    className={`flex items-center gap-2 px-3 py-2 text-xs transition-all ${
                      isSelected
                        ? 'bg-[#c5a880] text-[#0e0f12] font-semibold shadow-md'
                        : 'text-[#9a9488] hover:text-[#ede8e1] hover:bg-[#1a1d26]'
                    }`}
                  >
                    {getWeatherIcon(wKey, 'w-3.5 h-3.5')}
                    <span className="whitespace-nowrap">{preset.label.split(' ')[0]}</span>
                    <span className="text-[10px] font-mono opacity-80">
                      {preset.tempC}°C
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Weather Station Banner & Sensory Metrics */}
        <div className="mb-10 bg-[#12151e] border border-[#252834] p-5 sm:p-6 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Condition Overview */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="p-3.5 bg-[#181b26] border border-[#2d3242] text-[#c5a880] shrink-0">
                {getWeatherIcon(currentWeatherKey, 'w-8 h-8')}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-[10px] uppercase font-mono tracking-wider font-semibold bg-[#1a202c] border border-[#333b4d] text-[#c5a880]">
                    Current Reading
                  </span>
                  <span className="text-xs text-[#8a857b]">
                    Mall Road, Murree Hills
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <h3 className="text-2xl sm:text-3xl font-display font-medium text-[#f3ede4]">
                    {activeWeather.label}
                  </h3>
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-[#c5a880]">
                    {activeWeather.tempC}°C
                  </span>
                  <span className="text-xs text-[#8a857b] font-mono">
                    (Feels like {activeWeather.feelsLikeC}°C)
                  </span>
                </div>
                <p className="text-xs text-[#cdc7bb] mt-1 font-light max-w-xl">
                  {activeWeather.headline}
                </p>
              </div>
            </div>

            {/* Alpine Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t md:border-t-0 md:border-l border-[#222532] pt-4 md:pt-0 md:pl-6 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#78746c] flex items-center gap-1 uppercase tracking-wider">
                  <Droplets className="w-3 h-3 text-[#c5a880]" />
                  Humidity
                </span>
                <p className="font-mono text-sm text-[#ede8e1] font-semibold">
                  {activeWeather.humidity}%
                </p>
                <span className="text-[10px] text-[#8a857b] block">High Altitude</span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-[#78746c] flex items-center gap-1 uppercase tracking-wider">
                  <Wind className="w-3 h-3 text-[#c5a880]" />
                  Wind
                </span>
                <p className="font-mono text-sm text-[#ede8e1] font-semibold">
                  {activeWeather.windSpeedKmh} km/h
                </p>
                <span className="text-[10px] text-[#8a857b] block truncate max-w-[90px]">
                  {activeWeather.windDirection.split(' ')[0]}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-[#78746c] flex items-center gap-1 uppercase tracking-wider">
                  <Gauge className="w-3 h-3 text-[#c5a880]" />
                  Barometer
                </span>
                <p className="font-mono text-sm text-[#ede8e1] font-semibold">
                  {activeWeather.barometerHpa} hPa
                </p>
                <span className="text-[10px] text-[#8a857b] block">Steady Ridge</span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-[#78746c] flex items-center gap-1 uppercase tracking-wider">
                  <Compass className="w-3 h-3 text-[#c5a880]" />
                  Visibility
                </span>
                <p className="font-mono text-sm text-[#ede8e1] font-semibold">
                  {activeWeather.visibilityKm} km
                </p>
                <span className="text-[10px] text-[#8a857b] block">Pine Ridge</span>
              </div>
            </div>
          </div>

          {/* Kitchen Advisory Banner */}
          <div className="mt-5 pt-4 border-t border-[#232733] flex items-start gap-3 bg-[#0d0e14] p-3.5 border border-[#1e212b]">
            <Info className="w-4 h-4 text-[#c5a880] shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-[#bbb5a7]">
              <span className="font-semibold text-[#c5a880] uppercase tracking-wider mr-1.5 font-mono text-[11px]">
                Brigade Kitchen Advisory:
              </span>
              {activeWeather.culinaryAdvisory}
            </div>
          </div>
        </div>

        {/* Highlighted Seasonal Dishes Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-normal text-[#f3ede4]">
                Chef's Weather-Matched Selections
              </h3>
              <p className="text-xs text-[#8a857b] mt-0.5">
                Recommended dishes tailored specifically to warm, satisfy, and balance your dining experience in {activeWeather.tempC}°C mountain air.
              </p>
            </div>
            <span className="hidden sm:inline-block text-xs font-mono text-[#c5a880]">
              Showing {recommendedDishes.length} matches
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedDishes.map(({ item, weatherNote }) => {
              const isAdded = addedItemIds[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="group bg-[#13151c] border border-[#252834] hover:border-[#c5a880]/60 transition-all duration-300 flex flex-col justify-between cursor-pointer overflow-hidden shadow-lg hover:shadow-2xl"
                >
                  {/* Card Image Area with Weather Badge */}
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[#0d0e13]">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[#161822] text-[#69655d] p-4 text-center">
                        <Flame className="w-8 h-8 text-[#c5a880]/60 mb-2" />
                        <span className="font-display text-sm text-[#cdc7bb]">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-[#8a857b] mt-1">
                          Freshly prepared to order
                        </span>
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#13151c] via-[#13151c]/30 to-transparent" />

                    {/* Weather match badge */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider bg-[#0e0f14]/90 backdrop-blur-sm text-[#c5a880] border border-[#c5a880]/40 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-[#c5a880]" />
                        <span>Best in {activeWeather.tempC}°C</span>
                      </span>
                      {item.isSignature && (
                        <span className="px-2 py-1 text-[10px] font-mono uppercase bg-[#c5a880] text-[#0e0f12] font-bold">
                          Signature
                        </span>
                      )}
                    </div>

                    {/* Category pill */}
                    <div className="absolute bottom-3 left-3 text-[11px] font-mono uppercase tracking-wider text-[#9a9488]">
                      {item.category} · {item.portion || 'Chef Serving'}
                    </div>
                  </div>

                  {/* Card Content Area */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="font-display text-lg sm:text-xl font-medium text-[#f3ede4] group-hover:text-[#c5a880] transition-colors leading-snug">
                          {item.name}
                        </h4>
                        <span className="font-mono text-base font-semibold text-[#c5a880] shrink-0">
                          Rs {item.price.toLocaleString()}
                        </span>
                      </div>

                      <p className="text-xs text-[#9a9488] line-clamp-2 leading-relaxed mb-4">
                        {item.description}
                      </p>

                      {/* Chef's Weather Rationale Callout */}
                      <div className="p-2.5 bg-[#171924] border-l-2 border-[#c5a880] text-[11px] text-[#cdc7bb] mb-4 space-y-0.5">
                        <div className="flex items-center gap-1 text-[10px] uppercase font-mono text-[#c5a880]">
                          <span>Weather Pairing Note</span>
                        </div>
                        <p className="italic leading-normal">
                          "{weatherNote}"
                        </p>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-[#222532] flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectItem(item);
                        }}
                        className="text-xs text-[#8a857b] hover:text-[#ede8e1] flex items-center gap-1 font-mono transition-colors"
                      >
                        Details <ChevronRight className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleAddDish(item, e)}
                        className={`px-3.5 py-2 text-xs font-semibold uppercase tracking-wider font-mono flex items-center gap-1.5 transition-all ${
                          isAdded
                            ? 'bg-[#1b3a27] text-[#7fb385] border border-[#3e5f44]'
                            : 'bg-[#c5a880] text-[#0e0f12] hover:bg-[#d8ba91]'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added!</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Order</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Curated Weather Bundle Deal (Special Gastronomic Pairing) */}
        {bundleItems.length > 0 && (
          <div className="p-6 sm:p-8 bg-gradient-to-r from-[#171a24] via-[#1a1e2b] to-[#141620] border-2 border-[#c5a880]/50 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a880]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider font-bold bg-[#c5a880] text-[#0e0f12]">
                    {activeWeather.bundle.badge}
                  </span>
                  <span className="text-xs text-[#8a857b] font-mono">
                    Curated Kitchen Pairing
                  </span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-normal text-[#f3ede4]">
                  {activeWeather.bundle.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#cdc7bb] font-light leading-relaxed">
                  {activeWeather.bundle.description}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] text-[#8a857b]">Includes:</span>
                  {bundleItems.map((bItem, idx) => (
                    <span
                      key={bItem.id}
                      className="px-2 py-0.5 bg-[#0f1118] border border-[#2a2e3d] text-[11px] text-[#ede8e1]"
                    >
                      {bItem.name} {idx < bundleItems.length - 1 ? '' : ''}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price & Add Bundle CTA */}
              <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-[#262a3a]">
                <div className="text-left lg:text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-xs line-through text-[#78746c] font-mono">
                      Rs {bundleRegularPrice.toLocaleString()}
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#142318] text-[#7fb385] border border-[#3e5f44]">
                      Save {activeWeather.bundle.discountPercent}%
                    </span>
                  </div>
                  <div className="font-mono text-2xl sm:text-3xl font-bold text-[#c5a880]">
                    Rs {bundleDiscountedPrice.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-[#8a857b] font-mono block">
                    All taxes included
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddBundle}
                  className={`px-6 py-3 text-xs sm:text-sm font-semibold uppercase tracking-wider font-mono flex items-center gap-2 transition-all ${
                    bundleAdded
                      ? 'bg-[#1b3a27] text-[#7fb385] border border-[#3e5f44]'
                      : 'bg-[#c5a880] text-[#0e0f12] hover:bg-[#d8ba91] shadow-lg hover:shadow-xl'
                  }`}
                >
                  {bundleAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Pairing Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Order Weather Bundle</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
