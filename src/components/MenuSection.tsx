import React, { useState, useMemo } from 'react';
import { Search, Plus, Check, SlidersHorizontal, Leaf, Flame, Sparkles, X } from 'lucide-react';
import { FULL_MENU } from '../data/restaurantData';
import { MenuCategory, MenuItem, DietaryPreference } from '../types/restaurant';

interface MenuSectionProps {
  onAddToCart: (item: MenuItem) => void;
  onSelectItem: (item: MenuItem) => void;
  customMenuItems?: MenuItem[];
  customCategories?: string[];
}

const CATEGORIES: MenuCategory[] = [
  'Starters',
  'Pizza',
  'Pasta',
  'Steaks',
  'Burgers',
  'Shawarma',
  'Desserts',
  'Cakes',
  'Beverages',
];

const DIETARY_OPTIONS: Array<{
  id: DietaryPreference;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  activeClasses: string;
  badgeClasses: string;
  accentColor: string;
}> = [
  {
    id: 'Vegetarian',
    label: 'Vegetarian',
    icon: Leaf,
    activeClasses: 'bg-[#1b2b20] border-[#3e5f44] text-[#7fb385] ring-1 ring-[#7fb385]/30',
    badgeClasses: 'text-[#7fb385] border-[#3e5f44]/60 bg-[#162018]',
    accentColor: '#7fb385',
  },
  {
    id: 'Gluten-Free',
    label: 'Gluten-Free',
    icon: Sparkles,
    activeClasses: 'bg-[#292213] border-[#5e4b25] text-[#e5c378] ring-1 ring-[#e5c378]/30',
    badgeClasses: 'text-[#e5c378] border-[#5e4b25]/60 bg-[#211b10]',
    accentColor: '#e5c378',
  },
  {
    id: 'Spicy',
    label: 'Spicy',
    icon: Flame,
    activeClasses: 'bg-[#2b1717] border-[#5f2b2b] text-[#f87171] ring-1 ring-[#f87171]/30',
    badgeClasses: 'text-[#f87171] border-[#5f2b2b]/60 bg-[#241313]',
    accentColor: '#f87171',
  },
];

export const MenuSection: React.FC<MenuSectionProps> = ({
  onAddToCart,
  onSelectItem,
  customMenuItems,
  customCategories,
}) => {
  const activeFullMenu = customMenuItems && customMenuItems.length > 0 ? customMenuItems : FULL_MENU;
  const activeCategories = customCategories && customCategories.length > 0 ? customCategories : CATEGORIES;

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDietary, setSelectedDietary] = useState<DietaryPreference[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const toggleDietary = (pref: DietaryPreference) => {
    setSelectedDietary((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const filteredItems = useMemo(() => {
    return activeFullMenu.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDietary =
        selectedDietary.length === 0 ||
        selectedDietary.every((pref) => item.dietary?.includes(pref));
      return matchesCategory && matchesSearch && matchesDietary;
    });
  }, [activeFullMenu, selectedCategory, searchQuery, selectedDietary]);

  const handleAdd = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(item);
    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  return (
    <section id="menu" className="py-24 sm:py-32 bg-[#0e0f12] text-[#ede8e1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="flex items-center justify-center gap-2 text-xs tracking-widest uppercase text-[#c5a880] mb-3">
            <span>Dining Room & Terrace</span>
            <span aria-hidden="true" className="text-[#59554d]">·</span>
            <span>Murree High Altitude Kitchen</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-normal text-[#f3ede4] tracking-tight leading-tight mb-4">
            The Gastronomic Menu
          </h2>
          <p className="text-sm sm:text-base text-[#9a9488] font-light leading-relaxed">
            Prepared fresh to order using premium dairy, hill spices, and culinary precision. Every dish reflects our Rs 1–1,000 value commitment.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 pb-6 border-b border-[#22252e]">
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a857b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pastas, pizzas, steaks..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#14161a] border border-[#262830] text-sm text-[#ede8e1] placeholder-[#6e6a62] focus:outline-none focus:border-[#c5a880] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8a857b] hover:text-[#ede8e1]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Pricing Assurance Note (Zero-Pill Discipline) */}
          <div className="text-xs text-[#9a9488] flex items-center gap-2">
            <span>Prices inclusive of all taxes</span>
            <span aria-hidden="true">·</span>
            <a
              href="#seasonal-specialties"
              className="text-[#c5a880] hover:text-[#d8ba91] transition-colors flex items-center gap-1 font-mono uppercase text-[11px]"
            >
              <span>Weather-Matched Specialties</span>
              <span>↑</span>
            </a>
          </div>
        </div>

        {/* DIETARY PREFERENCES FILTER COMPONENT (Zero-Pill Discipline) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 p-3.5 bg-[#12141a] border border-[#22252e]">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-[#9a9488] font-medium flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#c5a880]" />
              <span>Dietary Filter</span>
            </span>
            <span className="text-[11px] text-[#6e6a62] hidden sm:inline">
              (Toggle to filter items)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {DIETARY_OPTIONS.map((opt) => {
              const isSelected = selectedDietary.includes(opt.id);
              const count = FULL_MENU.filter((item) => {
                const inCat = selectedCategory === 'All' || item.category === selectedCategory;
                return inCat && item.dietary?.includes(opt.id);
              }).length;
              const Icon = opt.icon;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleDietary(opt.id)}
                  className={`px-3 py-1.5 text-xs uppercase font-medium border flex items-center gap-1.5 transition-colors ${
                    isSelected
                      ? `${opt.activeClasses} font-semibold`
                      : 'bg-[#16181f] border-[#252833] text-[#8a857b] hover:text-[#ede8e1] hover:border-[#383d4c]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{opt.label}</span>
                  <span className="font-mono text-[10px] opacity-80 tabular-nums">
                    ({count})
                  </span>
                </button>
              );
            })}

            {/* Clear Dietary Filters */}
            {selectedDietary.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedDietary([])}
                className="px-2.5 py-1.5 text-[11px] uppercase tracking-wider text-[#c5a880] hover:text-[#ede8e1] flex items-center gap-1 border border-transparent hover:border-[#3b3529] transition-colors"
              >
                <X className="w-3 h-3" />
                <span>Clear Dietary</span>
              </button>
            )}
          </div>
        </div>

        {/* Interactive Segmented Category Filter (Buttons, Not Pills) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-10 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors border ${
              selectedCategory === 'All'
                ? 'bg-[#c5a880] text-[#0e0f12] border-[#c5a880] font-semibold'
                : 'bg-[#14161a] text-[#b0aba0] border-[#22252e] hover:border-[#424653] hover:text-[#f3ede4]'
            }`}
          >
            All Courses ({activeFullMenu.length})
          </button>
          {activeCategories.map((cat: any) => {
            const catName = typeof cat === 'string' ? cat : cat.name;
            const count = activeFullMenu.filter((item) => {
              const inCat = item.category.toLowerCase() === catName.toLowerCase();
              const matchesDiet =
                selectedDietary.length === 0 ||
                selectedDietary.every((d) => item.dietary?.includes(d));
              return inCat && matchesDiet;
            }).length;
            const isActive = selectedCategory.toLowerCase() === catName.toLowerCase();
            return (
              <button
                key={catName}
                onClick={() => setSelectedCategory(catName)}
                className={`px-4 py-2 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors border ${
                  isActive
                    ? 'bg-[#c5a880] text-[#0e0f12] border-[#c5a880] font-semibold'
                    : 'bg-[#14161a] text-[#b0aba0] border-[#22252e] hover:border-[#424653] hover:text-[#f3ede4]'
                }`}
              >
                {catName} ({count})
              </button>
            );
          })}
        </div>

        {/* Menu Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="py-20 text-center border border-[#22252e] bg-[#14161a] p-8">
            <p className="font-display text-2xl text-[#f3ede4] mb-2">No culinary items found</p>
            <p className="text-xs text-[#8a857b] mb-4 max-w-md mx-auto">
              We couldn't find items matching your criteria
              {selectedDietary.length > 0 && ` for dietary preference (${selectedDietary.join(', ')})`}
              {searchQuery && ` with keyword "${searchQuery}"`}.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedDietary([]);
              }}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-[#c5a880] text-[#0e0f12] hover:bg-[#d8ba91]"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="group bg-[#121418] border border-[#22252e] hover:border-[#c5a880]/60 p-6 flex flex-col justify-between transition-all duration-300 cursor-pointer"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-display text-lg sm:text-xl font-medium text-[#f3ede4] group-hover:text-[#c5a880] transition-colors leading-snug">
                      {item.name}
                    </h3>
                    <span className="font-sans font-semibold text-base text-[#c5a880] tabular-nums whitespace-nowrap">
                      Rs {item.price.toLocaleString()}
                    </span>
                  </div>

                  {/* Clean unboxed metadata (NO PILLS) */}
                  <div className="flex items-center gap-2 text-[11px] text-[#8a857b] mb-2.5">
                    <span>{item.category}</span>
                    {item.portion && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{item.portion}</span>
                      </>
                    )}
                    {item.prepTime && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{item.prepTime}</span>
                      </>
                    )}
                    {item.tag && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#c5a880]">{item.tag}</span>
                      </>
                    )}
                  </div>

                  {/* Dietary Preference Markers (Zero-Pill Discipline) */}
                  {item.dietary && item.dietary.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      {item.dietary.map((diet) => {
                        const opt = DIETARY_OPTIONS.find((o) => o.id === diet);
                        const Icon = opt?.icon || Leaf;
                        return (
                          <span
                            key={diet}
                            className={`text-[10px] uppercase font-semibold tracking-wider flex items-center gap-1 px-1.5 py-0.5 border ${
                              opt?.badgeClasses || 'text-[#7fb385] border-[#3e5f44]/60 bg-[#162018]'
                            }`}
                          >
                            <Icon className="w-2.5 h-2.5" />
                            <span>{diet}</span>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <p className="text-xs text-[#a39e92] font-light leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#1e2129] flex items-center justify-between">
                  <span className="text-xs text-[#8a857b] group-hover:text-[#c5a880] transition-colors flex items-center gap-1">
                    Details & Ingredients &rarr;
                  </span>

                  <button
                    onClick={(e) => handleAdd(item, e)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      addedIds[item.id]
                        ? 'bg-[#3e5f44] text-[#ede8e1]'
                        : 'bg-[#1a1c22] text-[#ede8e1] hover:bg-[#c5a880] hover:text-[#0e0f12] border border-[#2a2d36]'
                    }`}
                  >
                    {addedIds[item.id] ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
