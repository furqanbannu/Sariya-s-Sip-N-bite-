import React, { useState } from 'react';
import { Sparkles, Plus, Check } from 'lucide-react';
import { SIGNATURE_DISHES } from '../data/restaurantData';
import { MenuItem } from '../types/restaurant';

interface SignatureDishesProps {
  onAddToCart: (item: MenuItem) => void;
  onSelectDish: (item: MenuItem) => void;
  customDishes?: MenuItem[];
}

export const SignatureDishes: React.FC<SignatureDishesProps> = ({
  onAddToCart,
  onSelectDish,
  customDishes,
}) => {
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const displayDishes = customDishes && customDishes.length > 0 ? customDishes : SIGNATURE_DISHES;

  const handleAdd = (dish: MenuItem) => {
    onAddToCart(dish);
    setAddedIds((prev) => ({ ...prev, [dish.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [dish.id]: false }));
    }, 1500);
  };

  return (
    <section id="signatures" className="py-24 sm:py-32 bg-[#0a0b0d] text-[#ede8e1] border-t border-[#1c1e24]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#c5a880] mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#c5a880]" />
              <span>Epicurean Selection</span>
              <span aria-hidden="true" className="text-[#59554d]">·</span>
              <span>Chef's Signatures</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-normal text-[#f3ede4] tracking-tight leading-tight">
              Signature Creations
            </h2>
          </div>
          <p className="mt-4 md:mt-0 text-sm text-[#9a9488] max-w-md font-light leading-relaxed">
            Six iconic recipes refined for the mountain palate, pairing rich continental craft with fragrant Himalayan hospitality.
          </p>
        </div>

        {/* 6 Signature Dishes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayDishes.map((dish, idx) => (
            <div
              key={dish.id}
              className="group bg-[#121418] border border-[#22252e] hover:border-[#c5a880]/60 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Dish Visual Header */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#181a20]">
                {dish.image ? (
                  <img
                    src={dish.image}
                    alt={dish.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#181b22] to-[#0f1115]">
                    <span className="font-display text-2xl text-[#c5a880] italic mb-1">
                      {dish.name}
                    </span>
                    <span className="text-xs text-[#8c887f]">
                      Artisanal Culinary Presentation
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#121418] via-transparent to-transparent opacity-80" />

                {/* Natural Editorial Index & Category (NO PILL BADGES) */}
                <div className="absolute top-4 left-4 text-xs font-mono text-[#c5a880]/90 bg-[#0e0f12]/80 backdrop-blur-md px-2 py-1">
                  0{idx + 1} · {dish.category}
                </div>
              </div>

              {/* Dish Content Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-baseline justify-between gap-4 mb-2">
                    <h3
                      onClick={() => onSelectDish(dish)}
                      className="font-display text-xl font-medium text-[#f3ede4] hover:text-[#c5a880] transition-colors cursor-pointer"
                    >
                      {dish.name}
                    </h3>
                    <span className="font-sans font-semibold text-lg text-[#c5a880] tabular-nums whitespace-nowrap">
                      Rs {dish.price.toLocaleString()}
                    </span>
                  </div>

                  {/* Unboxed Metadata (Zero-Pill Discipline) */}
                  <div className="flex items-center gap-2 text-xs text-[#8a857b] mb-3">
                    <span>{dish.portion}</span>
                    <span aria-hidden="true">·</span>
                    <span>{dish.prepTime}</span>
                    {dish.tag && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#c5a880]">{dish.tag}</span>
                      </>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-[#b5af9f] font-light leading-relaxed line-clamp-3 mb-4">
                    {dish.description}
                  </p>

                  {dish.pairing && (
                    <div className="pt-3 border-t border-[#1e2129] text-[11px] text-[#918c82]">
                      <span className="text-[#c5a880]">Pairing:</span> {dish.pairing}
                    </div>
                  )}
                </div>

                {/* Card Action Controls */}
                <div className="mt-6 pt-4 border-t border-[#1e2129] flex items-center justify-between gap-3">
                  <button
                    onClick={() => onSelectDish(dish)}
                    className="text-xs uppercase tracking-wider text-[#dcd7cb] hover:text-[#c5a880] transition-colors font-medium underline underline-offset-4"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => handleAdd(dish)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      addedIds[dish.id]
                        ? 'bg-[#3e5f44] text-[#ede8e1]'
                        : 'bg-[#1e2129] text-[#ede8e1] hover:bg-[#c5a880] hover:text-[#0e0f12]'
                    }`}
                  >
                    {addedIds[dish.id] ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added</span>
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
          ))}
        </div>
      </div>
    </section>
  );
};
