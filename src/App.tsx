import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Phone, Utensils, ShoppingBag, Bell, X } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { SignatureDishes } from './components/SignatureDishes';
import { SeasonalSpecialties } from './components/SeasonalSpecialties';
import { MenuSection } from './components/MenuSection';
import { GallerySection } from './components/GallerySection';
import { ReviewsSection } from './components/ReviewsSection';
import { LocationSection } from './components/LocationSection';
import { Footer } from './components/Footer';
import { ReservationModal } from './components/ReservationModal';
import { OrderDrawer } from './components/OrderDrawer';
import { ItemDetailModal } from './components/ItemDetailModal';
import { AdminControlCenter } from './components/admin/AdminControlCenter';
import { ConciergeChatWidget } from './components/ConciergeChatWidget';
import { MenuItem, OrderItem, OrderRecord } from './types/restaurant';
import { RESTAURANT_INFO, FULL_MENU, SIGNATURE_DISHES } from './data/restaurantData';
import { getStoredOrders, DB_CHANGE_EVENT } from './services/storageService';
import { api } from './services/apiService';

export default function App() {
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<MenuItem | null>(null);
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [globalReadyOrder, setGlobalReadyOrder] = useState<OrderRecord | null>(null);
  const prevGlobalOrdersRef = useRef<OrderRecord[]>([]);

  // Real persistent database state for public restaurant website
  const [publicContent, setPublicContent] = useState<Record<string, string>>({});
  const [publicMenuItems, setPublicMenuItems] = useState<MenuItem[]>(FULL_MENU);
  const [publicCategories, setPublicCategories] = useState<string[]>([]);

  const fetchPublicData = async () => {
    try {
      const [content, menuData] = await Promise.all([
        api.getPublicContent().catch(() => ({})),
        api.getPublicMenu().catch(() => ({ categories: [], items: [] })),
      ]);

      if (content && Object.keys(content).length > 0) {
        setPublicContent(content);
      }

      if (menuData && menuData.items && menuData.items.length > 0) {
        const mappedItems: MenuItem[] = menuData.items.map((it: any) => {
          const catSlug = (it.category_slug || '').toLowerCase();
          let category: any = 'Steaks';
          if (catSlug.includes('starter') || catSlug.includes('appetizer')) category = 'Starters';
          else if (catSlug.includes('pizza')) category = 'Pizza';
          else if (catSlug.includes('pasta')) category = 'Pasta';
          else if (catSlug.includes('steak')) category = 'Steaks';
          else if (catSlug.includes('burger')) category = 'Burgers';
          else if (catSlug.includes('shawarma')) category = 'Shawarma';
          else if (catSlug.includes('dessert')) category = 'Desserts';
          else if (catSlug.includes('cake')) category = 'Cakes';
          else if (catSlug.includes('beverage') || catSlug.includes('chai') || catSlug.includes('tea')) category = 'Beverages';

          return {
            id: it.id,
            name: it.name,
            category,
            description: it.description || '',
            price: it.price,
            isSignature: Boolean(it.is_featured),
            image: it.image,
            tag: it.badge || undefined,
            prepTime: it.preparation_time || '15–20 mins',
            spiceLevel: (it.spicy_level || 0) as any,
            dietary: it.spicy_level > 0 ? ['Spicy'] : undefined,
          };
        });

        setPublicMenuItems(mappedItems);

        if (menuData.categories && menuData.categories.length > 0) {
          setPublicCategories(menuData.categories.map((c: any) => c.name));
        }
      }
    } catch (err) {
      console.warn('Initial public database sync:', err);
    }
  };

  useEffect(() => {
    fetchPublicData();
  }, []);

  // Listen to real-time database updates for global 'Ready' notification
  useEffect(() => {
    const checkOrderTransitions = () => {
      const currentOrders = getStoredOrders();
      if (prevGlobalOrdersRef.current.length > 0) {
        currentOrders.forEach((newOrder) => {
          const prevOrder = prevGlobalOrdersRef.current.find((p) => p.id === newOrder.id);
          if (prevOrder && prevOrder.status === 'preparing' && newOrder.status === 'ready') {
            setGlobalReadyOrder(newOrder);
          }
        });
      }
      prevGlobalOrdersRef.current = currentOrders;
    };

    checkOrderTransitions();
    window.addEventListener(DB_CHANGE_EVENT, checkOrderTransitions);
    window.addEventListener('storage', checkOrderTransitions);
    return () => {
      window.removeEventListener(DB_CHANGE_EVENT, checkOrderTransitions);
      window.removeEventListener('storage', checkOrderTransitions);
    };
  }, []);

  const handleAddToCart = (item: MenuItem, quantity = 1, notes?: string) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.item.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.item.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { item, quantity, notes }];
    });
  };

  const handleReorderItems = (reorderList: OrderItem[]) => {
    setCartItems((prev) => {
      const updated = [...prev];
      reorderList.forEach((rItem) => {
        const existing = updated.find((i) => i.item.id === rItem.item.id);
        if (existing) {
          existing.quantity += rItem.quantity;
        } else {
          updated.push({ ...rItem });
        }
      });
      return updated;
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((orderItem) => {
          if (orderItem.item.id === itemId) {
            const nextQty = orderItem.quantity + delta;
            return nextQty > 0 ? { ...orderItem, quantity: nextQty } : null;
          }
          return orderItem;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.item.id !== itemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="min-h-screen bg-[#0e0f12] text-[#ede8e1] font-sans antialiased selection:bg-[#c5a880] selection:text-[#0e0f12]">
      {/* Announcement Banner synced from Database Settings */}
      {publicContent.announcement_active === '1' && publicContent.announcement_banner && (
        <div className="bg-[#1f1a10] border-b border-[#c5a880]/30 py-2 px-4 text-center text-xs text-[#e5c378] flex items-center justify-center gap-2 relative z-30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880] animate-pulse" />
          <span className="font-light tracking-wide">{publicContent.announcement_banner}</span>
        </div>
      )}

      {/* Top 3-Zone Navigation */}
      <Navbar
        onOpenReservation={() => setIsReservationOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        cartCount={totalCartCount}
      />

      <main>
        {/* Cinematic Murree Hero */}
        <Hero
          onOpenReservation={() => setIsReservationOpen(true)}
          heroHeading={publicContent.hero_heading}
          heroSubheading={publicContent.hero_subheading}
        />

        {/* An Experience Beyond Dining */}
        <AboutSection />

        {/* 6 Signature Dishes */}
        <SignatureDishes
          onAddToCart={(dish) => handleAddToCart(dish, 1)}
          onSelectDish={(dish) => setSelectedDetailItem(dish)}
          customDishes={publicMenuItems.filter((i) => i.isSignature)}
        />

        {/* Seasonal Specialties based on Murree High Altitude Weather */}
        <SeasonalSpecialties
          onAddToCart={(item, qty) => handleAddToCart(item, qty || 1)}
          onSelectItem={(item) => setSelectedDetailItem(item)}
        />

        {/* Complete Gastronomic Menu */}
        <MenuSection
          onAddToCart={(item) => handleAddToCart(item, 1)}
          onSelectItem={(item) => setSelectedDetailItem(item)}
          customMenuItems={publicMenuItems}
          customCategories={publicCategories}
        />

        {/* Atmosphere & Visual Gallery */}
        <GallerySection />

        {/* Guest Reviews & Quantitative Proof */}
        <ReviewsSection />

        {/* Find Us in the Heart of Murree */}
        <LocationSection
          address={publicContent.address}
          phone={publicContent.phone}
          weekdayHours={publicContent.weekday_hours}
          roomServiceHours={publicContent.room_service_hours}
        />
      </main>

      {/* Luxury Editorial Footer */}
      <Footer
        onOpenReservation={() => setIsReservationOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        restaurantName={publicContent.restaurant_name}
        hotelName={publicContent.hotel_name}
        phone={publicContent.phone}
        email={publicContent.email}
        address={publicContent.address}
      />

      {/* Modals & Slide-overs */}
      <ReservationModal
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
      />

      <OrderDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onReorderItems={handleReorderItems}
        onAddRewardItem={(rewardItem, notes) => handleAddToCart(rewardItem, 1, notes)}
        onAddToCart={(item, qty, notes) => handleAddToCart(item, qty || 1, notes)}
      />

      <ItemDetailModal
        item={selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Sariya's Admin Control Center (Full backend, 21 sections, RBAC & SQLite database) */}
      <AdminControlCenter
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onRefreshPublicData={fetchPublicData}
      />

      {/* Global Ready Toast Notification when OrderDrawer is closed */}
      {globalReadyOrder && !isCartOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-40 max-w-sm w-full bg-[#18150d] border-2 border-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.4)] p-4 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#2e230e] border border-[#d4af37] flex items-center justify-center text-[#fef08a] shrink-0 animate-bounce">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-display text-base font-bold text-[#fef08a] leading-tight">
                  Order Ready for Service!
                </h5>
                <p className="text-xs font-mono text-[#c5a880] mt-0.5">
                  {globalReadyOrder.id} · {globalReadyOrder.locationNote}
                </p>
                <p className="text-[11px] text-[#cdc7bb] mt-1 leading-snug">
                  Your meal has been prepared hot and is ready for service.
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsCartOpen(true);
                      setGlobalReadyOrder(null);
                    }}
                    className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider bg-[#d4af37] text-[#0e0f12] hover:bg-[#e5c378]"
                  >
                    Open Live Tracker &rarr;
                  </button>
                  <button
                    onClick={() => setGlobalReadyOrder(null)}
                    className="text-[11px] text-[#8a857b] hover:text-[#ede8e1]"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setGlobalReadyOrder(null)}
              className="p-1 text-[#8a857b] hover:text-[#ede8e1]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* AI Hotel & Dining Concierge Chat Widget */}
      <ConciergeChatWidget />

      {/* Floating Slim Mobile Action Bar (Strictly < 15% Viewport Height) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0e0f12]/95 backdrop-blur-md border-t border-[#252830] p-3 flex items-center gap-2">
        <button
          onClick={() => setIsReservationOpen(true)}
          className="flex-1 py-3 px-3 text-xs font-semibold uppercase tracking-wider bg-[#c5a880] text-[#0e0f12] flex items-center justify-center gap-1.5"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Reserve Table</span>
        </button>

        <a
          href={`tel:${RESTAURANT_INFO.phoneClean}`}
          className="p-3 bg-[#181a20] border border-[#2b2e38] text-[#ede8e1] flex items-center justify-center"
          aria-label="Call Restaurant"
        >
          <Phone className="w-4 h-4 text-[#c5a880]" />
        </a>

        {totalCartCount > 0 && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="p-3 bg-[#181a20] border border-[#c5a880] text-[#c5a880] flex items-center justify-center relative"
            aria-label="View Dining Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#c5a880] text-[#0e0f12] text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
              {totalCartCount}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
