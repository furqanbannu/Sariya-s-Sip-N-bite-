import React, { useState } from 'react';
import { X, Plus, Minus, Check, Clock, Utensils, Sparkles, Leaf, Flame } from 'lucide-react';
import { MenuItem } from '../types/restaurant';

interface ItemDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number, notes?: string) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [isAdded, setIsAdded] = useState(false);

  if (!item) return null;

  const handleAdd = () => {
    onAddToCart(item, quantity, notes);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[#07080a]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-xl w-full bg-[#121418] border border-[#2b2e38] overflow-hidden shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-[#ede8e1] hover:text-[#c5a880] bg-[#0e0f12]/80 transition-colors"
          aria-label="Close Dish Details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Visual Hero */}
        <div className="relative aspect-[16/9] w-full bg-[#16181f]">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#1b1e26] to-[#0f1115]">
              <span className="font-display text-3xl text-[#c5a880] italic mb-1">
                {item.name}
              </span>
              <span className="text-xs text-[#8a857b]">
                Murree Highland Artisan Recipe
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#121418] via-transparent to-transparent opacity-90" />
        </div>

        {/* Details Content */}
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#c5a880] mb-1">
                <span>{item.category}</span>
                {item.tag && (
                  <>
                    <span aria-hidden="true" className="text-[#59554d]">·</span>
                    <span>{item.tag}</span>
                  </>
                )}
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-medium text-[#f3ede4]">
                {item.name}
              </h3>
            </div>
            <span className="font-sans font-semibold text-2xl text-[#c5a880] tabular-nums whitespace-nowrap">
              Rs {item.price.toLocaleString()}
            </span>
          </div>

          {/* Unboxed Metadata (Zero-Pill Discipline) */}
          <div className="flex items-center gap-3 text-xs text-[#8a857b] mb-4">
            {item.portion && <span>Portion: {item.portion}</span>}
            {item.prepTime && (
              <>
                <span aria-hidden="true">·</span>
                <span>Prep: {item.prepTime}</span>
              </>
            )}
          </div>

          {/* Dietary Badges (Zero-Pill Discipline) */}
          {item.dietary && item.dietary.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {item.dietary.map((diet) => (
                <span
                  key={diet}
                  className={`text-[11px] uppercase font-semibold tracking-wider flex items-center gap-1.5 px-2 py-1 border ${
                    diet === 'Vegetarian'
                      ? 'text-[#7fb385] border-[#3e5f44]/60 bg-[#162018]'
                      : diet === 'Gluten-Free'
                      ? 'text-[#e5c378] border-[#5e4b25]/60 bg-[#211b10]'
                      : 'text-[#f87171] border-[#5f2b2b]/60 bg-[#241313]'
                  }`}
                >
                  {diet === 'Vegetarian' && <Leaf className="w-3 h-3" />}
                  {diet === 'Gluten-Free' && <Sparkles className="w-3 h-3" />}
                  {diet === 'Spicy' && <Flame className="w-3 h-3" />}
                  <span>{diet}</span>
                </span>
              ))}
            </div>
          )}

          <p className="text-sm text-[#cdc7bb] font-light leading-relaxed mb-6">
            {item.description}
          </p>

          {item.pairing && (
            <div className="p-3 bg-[#16181f] border border-[#22252e] text-xs text-[#a19c90] mb-6">
              <span className="text-[#c5a880] font-medium">Sommelier & Chef Recommendation: </span>
              {item.pairing}
            </div>
          )}

          {/* Notes input */}
          <div className="mb-6">
            <label className="block text-xs uppercase tracking-wider text-[#9a9488] mb-1.5">
              Special Preparation Instructions
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Mild spice, extra sauce, well done..."
              className="w-full px-3.5 py-2.5 bg-[#181a20] border border-[#262830] text-xs text-[#ede8e1] focus:border-[#c5a880] focus:outline-none"
            />
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-[#1e2129] flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-[#181a20] border border-[#262830] px-2 py-1.5">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1 text-[#8a857b] hover:text-[#ede8e1]"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-sm tabular-nums text-[#f3ede4] px-2">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-1 text-[#8a857b] hover:text-[#ede8e1]"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleAdd}
              className={`flex-1 py-3 px-6 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
                isAdded
                  ? 'bg-[#3e5f44] text-[#ede8e1]'
                  : 'bg-[#c5a880] text-[#0e0f12] hover:bg-[#d8ba91]'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Order</span>
                </>
              ) : (
                <>
                  <span>Add to Order · Rs {(item.price * quantity).toLocaleString()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
