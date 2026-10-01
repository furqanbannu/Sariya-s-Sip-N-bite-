import { MenuItem } from '../types/restaurant';
import { FULL_MENU } from '../data/restaurantData';

export type WeatherConditionKey = 'chilly_mist' | 'alpine_snow' | 'mountain_rain' | 'sunny_ridge';

export interface WeatherConditionInfo {
  key: WeatherConditionKey;
  label: string;
  seasonLabel: string;
  tempC: number;
  feelsLikeC: number;
  humidity: number;
  windSpeedKmh: number;
  windDirection: string;
  visibilityKm: number;
  barometerHpa: number;
  elevation: string;
  headline: string;
  culinaryAdvisory: string;
  atmosphereTheme: {
    badgeBg: string;
    badgeText: string;
    borderColor: string;
    gradientBg: string;
    accentGlow: string;
  };
  recommendedItemIds: string[];
  dishWeatherNotes: Record<string, string>;
  bundle: {
    title: string;
    badge: string;
    description: string;
    itemIds: string[];
    discountPercent: number;
  };
}

export const MURREE_WEATHER_PRESETS: Record<WeatherConditionKey, WeatherConditionInfo> = {
  chilly_mist: {
    key: 'chilly_mist',
    label: 'Chilly Pine Mist',
    seasonLabel: 'Autumn Evening Fog',
    tempC: 11,
    feelsLikeC: 9,
    humidity: 89,
    windSpeedKmh: 14,
    windDirection: 'SSE from Kashmir Ridge',
    visibilityKm: 1.8,
    barometerHpa: 1018,
    elevation: '2,291m · Mall Road',
    headline: 'Thick Pine Fog Blankets Mall Road Ridge',
    culinaryAdvisory:
      'High humidity and crisp 11°C air demand warming spices, slow-simmered cream sauces, and steaming highland beverages brewed over open flame.',
    atmosphereTheme: {
      badgeBg: 'bg-[#1a202c]/80',
      badgeText: 'text-[#90cdf4]',
      borderColor: 'border-[#4a5568]',
      gradientBg: 'from-[#0e121a] via-[#121622] to-[#0c0d12]',
      accentGlow: 'rgba(144, 205, 244, 0.15)',
    },
    recommendedItemIds: ['sk-1', 'bv-1', 'bv-3', 'st-4', 'ds-1'],
    dishWeatherNotes: {
      'sk-1': 'Rich wild mushroom tarragon cream cuts through the dense evening mist.',
      'bv-1': 'Simmered with crushed green cardamom & cinnamon warmth to thaw cold hands.',
      'bv-3': 'Melted Swiss chocolate and toasted marshmallows — the ultimate cozy refuge.',
      'st-4': 'Flash-fried button mushrooms with molten cheese provide instant hearth warmth.',
      'ds-1': 'Flowing molten dark chocolate served oven-hot straight from our pastry station.',
    },
    bundle: {
      title: 'Mall Road Mist Warmer Pair',
      badge: 'Weather Special · 15% Off',
      description: 'Italian Chicken Steak + Hot Alpine Tea + Warm Garlic Baguette',
      itemIds: ['sk-1', 'bv-1', 'st-2'],
      discountPercent: 15,
    },
  },
  alpine_snow: {
    key: 'alpine_snow',
    label: 'Alpine Flurries & Frost',
    seasonLabel: 'Sub-Zero Winter Ridge',
    tempC: 1,
    feelsLikeC: -3,
    humidity: 94,
    windSpeedKmh: 24,
    windDirection: 'NE from Nathiagali',
    visibilityKm: 0.9,
    barometerHpa: 1024,
    elevation: '2,291m · Mall Road',
    headline: 'Sub-Zero Snow Flurries Dusting Pine Needles',
    culinaryAdvisory:
      'Mall Road temperatures have dipped near freezing. We recommend cast iron sizzling platters, peppery gravies, and traditional pink noon chai.',
    atmosphereTheme: {
      badgeBg: 'bg-[#1e293b]/90',
      badgeText: 'text-[#e2e8f0]',
      borderColor: 'border-[#64748b]',
      gradientBg: 'from-[#0f172a] via-[#111827] to-[#0c0e14]',
      accentGlow: 'rgba(226, 232, 240, 0.2)',
    },
    recommendedItemIds: ['sk-2', 'ds-2', 'bv-5', 'pz-1', 'pa-3'],
    dishWeatherNotes: {
      'sk-2': 'Cracked Tellicherry peppercorn demi-glace ignites internal body heat.',
      'ds-2': 'Sizzles loudly on cast iron, releasing rich walnut and melted dark cocoa steam.',
      'bv-5': 'Authentic salted Kashmiri tea boiled with pistachios & clotted highland cream.',
      'pz-1': 'Wood-fired bubbling mozzarella with spicy malai chunks right off the stones.',
      'pa-3': 'Fiery crushed chili arrabiata sauce that delivers instant warming kicks.',
    },
    bundle: {
      title: 'Hearth & Snow Sizzler Feast',
      badge: 'Snowfall Feast · 18% Off',
      description: 'Black Pepper Steak + Sizzling Brownie + Kashmiri Pink Noon Chai',
      itemIds: ['sk-2', 'ds-2', 'bv-5'],
      discountPercent: 18,
    },
  },
  mountain_rain: {
    key: 'mountain_rain',
    label: 'Highland Rain & Thunder',
    seasonLabel: 'Pine Forest Monsoon Showers',
    tempC: 15,
    feelsLikeC: 14,
    humidity: 96,
    windSpeedKmh: 18,
    windDirection: 'SW Monsoon Current',
    visibilityKm: 2.5,
    barometerHpa: 1012,
    elevation: '2,291m · Mall Road',
    headline: 'Torrential Mountain Showers Drumming the Roof',
    culinaryAdvisory:
      'Crispy fried appetizers and hearty double-cream pastas are the locals’ favorite comfort food while rain washes over the Himalayan cedar pines.',
    atmosphereTheme: {
      badgeBg: 'bg-[#1a2e29]/80',
      badgeText: 'text-[#6ee7b7]',
      borderColor: 'border-[#2d6a4f]',
      gradientBg: 'from-[#0b1916] via-[#0f1e1a] to-[#0a0f0d]',
      accentGlow: 'rgba(110, 231, 183, 0.15)',
    },
    recommendedItemIds: ['st-1', 'st-3', 'pa-1', 'bv-1', 'pa-2'],
    dishWeatherNotes: {
      'st-1': 'Panko-crusted fresh river fish fillets fried golden crisp to complement the rain.',
      'st-3': 'Murree wildflower honey chili glaze with tangy crunch — perfection indoors.',
      'pa-1': 'Velvety garlic parmesan double cream pasta served steaming in a deep bowl.',
      'bv-1': 'Freshly pounded cardamom and hot whole milk for listening to the rain.',
      'pa-2': 'Crispy chicken schnitzel bites layered over comforting rose arrabiata sauce.',
    },
    bundle: {
      title: 'Rainy Ridge Comfort Trio',
      badge: 'Monsoon Special · 12% Off',
      description: 'Crispy Finger Fish + Spicy Buffalo Wings + Mountain Karak Chai',
      itemIds: ['st-1', 'st-3', 'bv-1'],
      discountPercent: 12,
    },
  },
  sunny_ridge: {
    key: 'sunny_ridge',
    label: 'Crisp Mountain Sunshine',
    seasonLabel: 'High-Altitude Clear Ridge',
    tempC: 22,
    feelsLikeC: 22,
    humidity: 46,
    windSpeedKmh: 10,
    windDirection: 'Mild Mountain Updraft',
    visibilityKm: 18.0,
    barometerHpa: 1016,
    elevation: '2,291m · Mall Road',
    headline: 'Unobstructed Alpine Panorama & Kashmir Views',
    culinaryAdvisory:
      'Clear skies and crisp Himalayan sunshine make our outdoor terrace the prime perch for chilled artisanal mocktails, gourmet burgers, and fresh pizzas.',
    atmosphereTheme: {
      badgeBg: 'bg-[#2d2415]/80',
      badgeText: 'text-[#f6ad55]',
      borderColor: 'border-[#744210]',
      gradientBg: 'from-[#19140c] via-[#1a150e] to-[#0d0c0a]',
      accentGlow: 'rgba(246, 173, 85, 0.18)',
    },
    recommendedItemIds: ['bv-2', 'bg-1', 'sh-1', 'pz-4', 'ds-3'],
    dishWeatherNotes: {
      'bv-2': 'Crushed mint, freshly squeezed mountain lemon, and sparkling ice on the terrace.',
      'bg-1': '180g smashed beef patty on toasted brioche with smoked cheddar and pickles.',
      'sh-1': 'Artisanal pita with slow-roasted chicken and garlic toum under the sunny canopy.',
      'pz-4': 'Fresh buffalo mozzarella medallions and aromatic mountain basil oil.',
      'ds-3': 'Chilled saffron kheer infused with cardamom and crushed pistachios.',
    },
    bundle: {
      title: 'Terrace Sunshine Duo',
      badge: 'Terrace Special · 10% Off',
      description: 'Gourmet Charcoal Beef Burger + Fresh Mint & Lime Margarita',
      itemIds: ['bg-1', 'bv-2'],
      discountPercent: 10,
    },
  },
};

const WEATHER_STORAGE_KEY = 'sariyas_murree_weather_override';

export function getInitialMurreeWeather(): WeatherConditionKey {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(WEATHER_STORAGE_KEY) as WeatherConditionKey | null;
    if (saved && MURREE_WEATHER_PRESETS[saved]) {
      return saved;
    }
  }
  // Default to authentic Murree autumn mist
  return 'chilly_mist';
}

export function setStoredMurreeWeather(key: WeatherConditionKey) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(WEATHER_STORAGE_KEY, key);
  }
}

export function getRecommendedItemsForWeather(conditionKey: WeatherConditionKey): {
  item: MenuItem;
  weatherNote: string;
}[] {
  const preset = MURREE_WEATHER_PRESETS[conditionKey] || MURREE_WEATHER_PRESETS.chilly_mist;
  const items: { item: MenuItem; weatherNote: string }[] = [];

  for (const id of preset.recommendedItemIds) {
    const found = FULL_MENU.find((m) => m.id === id);
    if (found) {
      items.push({
        item: found,
        weatherNote:
          preset.dishWeatherNotes[id] ||
          'Specially recommended for current Murree mountain weather.',
      });
    }
  }

  return items;
}
