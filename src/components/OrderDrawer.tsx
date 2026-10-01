import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  Utensils,
  ShoppingBag,
  History,
  Phone,
  RotateCcw,
  Sparkles,
  Award,
  Gift,
  Mountain,
  Crown,
  Check,
  Shield,
  Gem,
  Lock,
  Clock,
  Flame,
  Bell,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Volume2,
  TrendingUp,
  HeartHandshake,
  Coffee,
  Star,
} from 'lucide-react';
import { MenuItem, OrderItem, OrderRecord, OrderStatus } from '../types/restaurant';
import { RESTAURANT_INFO, SIGNATURE_DISHES, FULL_MENU } from '../data/restaurantData';
import { MonthlySpendingChart } from './MonthlySpendingChart';
import { OrderProgressTimeline } from './OrderProgressTimeline';
import {
  getStoredOrders,
  saveNewOrder,
  updateOrderStatus,
  advanceOrderStatus,
  saveOrderReview,
  DB_CHANGE_EVENT,
} from '../services/storageService';

interface OrderToast {
  id: string;
  orderId: string;
  title: string;
  message: string;
  timestamp: string;
  locationNote: string;
  itemsSummary: string;
}

interface OrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onReorderItems?: (items: OrderItem[]) => void;
  onAddRewardItem?: (rewardItem: MenuItem, notes?: string) => void;
  onAddToCart?: (item: MenuItem, quantity?: number, notes?: string) => void;
}

interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  maxPoints: number;
  tagline: string;
  perks: string[];
  theme: {
    text: string;
    border: string;
    bg: string;
    badgeBg: string;
    glow: string;
    iconColor: string;
    accent: string;
    label: string;
  };
}

const LOYALTY_TIERS: LoyaltyTier[] = [
  {
    id: 'bronze',
    name: 'Bronze Trailblazer',
    minPoints: 0,
    maxPoints: 249,
    tagline: 'Murree Highland Explorer',
    perks: ['1 pt earned per Rs 20 spent', 'Digital receipt archiving'],
    theme: {
      text: 'text-[#d9a066]',
      border: 'border-[#a87642]',
      bg: 'bg-gradient-to-br from-[#201812] to-[#120f0c]',
      badgeBg: 'bg-[#2e2015]',
      glow: 'shadow-[0_0_15px_rgba(207,163,107,0.15)]',
      iconColor: 'text-[#d9a066]',
      accent: '#d9a066',
      label: 'Bronze Tier',
    },
  },
  {
    id: 'silver',
    name: 'Silver Mountaineer',
    minPoints: 250,
    maxPoints: 749,
    tagline: 'Highland Dining Connoisseur',
    perks: ['Free Cake of the Day slice milestone', 'Priority room service at Lucky Kabana Hotel'],
    theme: {
      text: 'text-[#e2e8f0]',
      border: 'border-[#94a3b8]',
      bg: 'bg-gradient-to-br from-[#18202c] to-[#0f141d]',
      badgeBg: 'bg-[#232d3d]',
      glow: 'shadow-[0_0_20px_rgba(203,213,225,0.2)]',
      iconColor: 'text-[#e2e8f0]',
      accent: '#cbd5e1',
      label: 'Silver Tier',
    },
  },
  {
    id: 'gold',
    name: 'Gold Peak',
    minPoints: 750,
    maxPoints: 1499,
    tagline: 'Mall Road Distinguished Patron',
    perks: ['10% table dining privileges', 'Guaranteed heated terrace table reservation'],
    theme: {
      text: 'text-[#f6e05e]',
      border: 'border-[#d4af37]',
      bg: 'bg-gradient-to-br from-[#261f0f] to-[#141006]',
      badgeBg: 'bg-[#3b3017]',
      glow: 'shadow-[0_0_25px_rgba(212,175,55,0.25)]',
      iconColor: 'text-[#f6e05e]',
      accent: '#d4af37',
      label: 'Gold Tier',
    },
  },
  {
    id: 'platinum',
    name: 'Platinum Summit',
    minPoints: 1500,
    maxPoints: Infinity,
    tagline: 'Lucky Kabana Imperial Resident',
    perks: ['Chef’s private seasonal tasting course', 'Dedicated 24/7 mountain concierge line'],
    theme: {
      text: 'text-[#6ee7b7]',
      border: 'border-[#34d399]',
      bg: 'bg-gradient-to-br from-[#0c241e] to-[#05130f]',
      badgeBg: 'bg-[#153a31]',
      glow: 'shadow-[0_0_25px_rgba(52,211,153,0.25)]',
      iconColor: 'text-[#6ee7b7]',
      accent: '#34d399',
      label: 'Platinum Elite',
    },
  },
];

export const OrderDrawer: React.FC<OrderDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onReorderItems,
  onAddRewardItem,
  onAddToCart,
}) => {
  const [activeTab, setActiveTab] = useState<'cart' | 'history'>('cart');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'active' | 'delivered'>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<'dine_in' | 'room_service' | 'takeaway'>('dine_in');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [locationNote, setLocationNote] = useState('');
  const [pastOrders, setPastOrders] = useState<OrderRecord[]>([]);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);
  const [redeemedPerkId, setRedeemedPerkId] = useState<string | null>(null);
  const [activeToast, setActiveToast] = useState<OrderToast | null>(null);
  const [showSpendingChart, setShowSpendingChart] = useState(true);
  const [tipOption, setTipOption] = useState<0 | 5 | 10 | 15 | 'custom'>(10);
  const [customTipInput, setCustomTipInput] = useState<string>('');
  const [addedPairingId, setAddedPairingId] = useState<string | null>(null);
  const [activeReviewOrderId, setActiveReviewOrderId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewSubmittedOrderId, setReviewSubmittedOrderId] = useState<string | null>(null);
  const prevOrdersRef = useRef<OrderRecord[]>([]);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Synthesized fine dining concierge chime using Web Audio API
  const playConciergeChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Harmonic 1: High crisp chime
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now); // A5 note
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 1.2);

      // Harmonic 2: Resonant bell overtone
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1760, now + 0.04); // A6 overtone
      gain2.gain.setValueAtTime(0.06, now + 0.04);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.04);
      osc2.stop(now + 0.9);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  const triggerReadyToast = (order: OrderRecord) => {
    playConciergeChime();

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    const itemsSummary = order.items
      .map((i) => `${i.quantity}x ${i.item.name}`)
      .slice(0, 2)
      .join(', ') + (order.items.length > 2 ? ` +${order.items.length - 2} more` : '');

    setActiveToast({
      id: `toast-${Date.now()}`,
      orderId: order.id,
      title: 'Order Ready for Service!',
      message: `Your meal has been prepared & plated hot by the Lucky Kabana kitchen. Expediting now to ${order.locationNote}.`,
      timestamp: 'Just now',
      locationNote: order.locationNote,
      itemsSummary,
    });

    // Auto dismiss after 10s
    toastTimeoutRef.current = setTimeout(() => {
      setActiveToast(null);
    }, 10000);
  };

  // Sync past orders from storage & detect status change from 'preparing' -> 'ready'
  const syncOrdersFromDb = () => {
    const currentOrders = getStoredOrders();

    if (prevOrdersRef.current && prevOrdersRef.current.length > 0) {
      currentOrders.forEach((newOrder) => {
        const prevOrder = prevOrdersRef.current.find((p) => p.id === newOrder.id);
        // Specifically detect status change from 'preparing' to 'ready'
        if (prevOrder && prevOrder.status === 'preparing' && newOrder.status === 'ready') {
          triggerReadyToast(newOrder);
        }
        // Specifically detect status transition to 'delivered' to prompt review
        if (prevOrder && prevOrder.status !== 'delivered' && newOrder.status === 'delivered') {
          setActiveReviewOrderId(newOrder.id);
          setReviewRating(5);
          setReviewComment('');
          setActiveTab('history');
        }
      });
    }

    prevOrdersRef.current = currentOrders;
    setPastOrders(currentOrders);
  };

  useEffect(() => {
    syncOrdersFromDb();

    const handleSync = () => {
      syncOrdersFromDb();
    };

    window.addEventListener(DB_CHANGE_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(DB_CHANGE_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  // Active Orders (In Progress)
  const activeLiveOrders = pastOrders.filter(
    (o) => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready'
  );

  // Filtered Orders for History tab
  const filteredPastOrders = pastOrders.filter((o) => {
    if (historyFilter === 'active') {
      return o.status === 'pending' || o.status === 'preparing' || o.status === 'ready';
    }
    if (historyFilter === 'delivered') {
      return o.status === 'delivered';
    }
    return true;
  });

  // Mountain Hospitality Loyalty Program Calculations
  const validPastOrders = pastOrders.filter((o) => o.status !== 'cancelled');
  const totalSpent = validPastOrders.reduce((sum, o) => sum + o.total, 0);
  
  // Rate: 1 Mountain Hospitality Point for every Rs 20 spent
  const hospitalityPoints = Math.floor(totalSpent / 20);

  // Determine Active Tier
  const currentTierObj =
    LOYALTY_TIERS.find(
      (t) => hospitalityPoints >= t.minPoints && hospitalityPoints <= t.maxPoints
    ) || LOYALTY_TIERS[0];

  const currentTierIndex = LOYALTY_TIERS.findIndex((t) => t.id === currentTierObj.id);
  const nextTierObj = LOYALTY_TIERS[currentTierIndex + 1] || null;

  const pointsToNext = nextTierObj
    ? Math.max(0, nextTierObj.minPoints - hospitalityPoints)
    : 0;

  const tierProgressPercent = nextTierObj
    ? Math.min(
        100,
        Math.max(
          5,
          Math.round(
            ((hospitalityPoints - currentTierObj.minPoints) /
              (nextTierObj.minPoints - currentTierObj.minPoints)) *
              100
          )
        )
      )
    : 100;

  // Available loyalty rewards
  const LOYALTY_REWARDS = [
    {
      id: 'reward-chai',
      title: 'Complimentary Mountain Karak Chai',
      cost: 100,
      description: 'Clay kulhad brewed with cardamom & condensed milk.',
      menuItem: FULL_MENU.find((m) => m.id === 'bv-1') || {
        id: 'reward-chai-item',
        name: 'Murree Mountain Karak Chai (Complimentary Reward)',
        category: 'Beverages' as const,
        description: 'Complimentary loyalty perk earned via Mountain Hospitality Points.',
        price: 0,
      },
    },
    {
      id: 'reward-cake',
      title: 'Free Cake of the Day Slice',
      cost: 250,
      description: 'Fresh daily pastry baked in-house by our master chef.',
      menuItem: SIGNATURE_DISHES[5] ? { ...SIGNATURE_DISHES[5], price: 0, name: `${SIGNATURE_DISHES[5].name} (Complimentary Reward)` } : {
        id: 'reward-cake-item',
        name: 'Cake of the Day (Complimentary Reward)',
        category: 'Cakes' as const,
        description: 'Complimentary loyalty perk earned via Mountain Hospitality Points.',
        price: 0,
      },
    },
    {
      id: 'reward-starter',
      title: 'Chef’s Artisanal Starter Basket',
      cost: 500,
      description: 'Crisp finger fish or mozzarella garlic baguette.',
      menuItem: FULL_MENU[0] ? { ...FULL_MENU[0], price: 0, name: `${FULL_MENU[0].name} (Complimentary Reward)` } : {
        id: 'reward-starter-item',
        name: 'Starter Plate (Complimentary Reward)',
        category: 'Starters' as const,
        description: 'Complimentary loyalty perk earned via Mountain Hospitality Points.',
        price: 0,
      },
    },
  ];

  const foodSubtotal = items.reduce(
    (sum, orderItem) => sum + orderItem.item.price * orderItem.quantity,
    0
  );

  const calculatedTipAmount = useMemo(() => {
    if (tipOption === 'custom') {
      const parsed = parseFloat(customTipInput);
      return !isNaN(parsed) && parsed > 0 ? Math.round(parsed) : 0;
    }
    if (tipOption === 0) return 0;
    return Math.round((foodSubtotal * tipOption) / 100);
  }, [foodSubtotal, tipOption, customTipInput]);

  const finalTotalAmount = foodSubtotal + calculatedTipAmount;

  // Curate dynamic complementary drinks and desserts based on cart contents
  const recommendedPairings = useMemo<Array<{
    item: MenuItem;
    reason: string;
    badge: 'Drink Pairing' | 'Dessert Pairing';
  }>>(() => {
    if (items.length === 0) return [];

    const cartIds = new Set(items.map((i) => i.item.id));
    const hasBeverage = items.some((i) => i.item.category === 'Beverages');
    const hasDessert = items.some((i) => i.item.category === 'Desserts' || i.item.category === 'Cakes');
    const hasSteak = items.some((i) => i.item.category === 'Steaks');
    const hasPizzaOrPasta = items.some((i) => i.item.category === 'Pizza' || i.item.category === 'Pasta');
    const hasSpicy = items.some(
      (i) => i.item.dietary?.includes('Spicy') || (i.item.spiceLevel && i.item.spiceLevel > 0)
    );

    const candidates: Array<{
      item: MenuItem;
      reason: string;
      badge: 'Drink Pairing' | 'Dessert Pairing';
    }> = [];

    // 1. DRINK PAIRING
    const margarita = FULL_MENU.find((i) => i.id === 'bv-2'); // Fresh Mint & Lime Margarita
    const karakChai = FULL_MENU.find((i) => i.id === 'bv-1'); // Murree Mountain Karak Chai
    const hotChoc = FULL_MENU.find((i) => i.id === 'bv-3'); // Alpine Hot Chocolate
    const pinkChai = FULL_MENU.find((i) => i.id === 'bv-5'); // Kashmiri Pink Noon Chai

    if (hasSpicy && margarita && !cartIds.has(margarita.id)) {
      candidates.push({
        item: margarita,
        reason: 'Cooling garden mint & citrus blend to balance mountain spices',
        badge: 'Drink Pairing',
      });
    } else if (hasSteak && margarita && !cartIds.has(margarita.id)) {
      candidates.push({
        item: margarita,
        reason: "Sommelier's recommended palate cleanser for flame-seared steaks",
        badge: 'Drink Pairing',
      });
    } else if (hasPizzaOrPasta && hotChoc && !cartIds.has(hotChoc.id)) {
      candidates.push({
        item: hotChoc,
        reason: 'Velvety Swiss chocolate to complement savory pastas & pizzas',
        badge: 'Drink Pairing',
      });
    } else if (karakChai && !cartIds.has(karakChai.id)) {
      candidates.push({
        item: karakChai,
        reason: 'Authentic cardamom-infused mountain brew for cold evenings',
        badge: 'Drink Pairing',
      });
    } else if (pinkChai && !cartIds.has(pinkChai.id)) {
      candidates.push({
        item: pinkChai,
        reason: 'Ceremonial slow-brewed pink tea with crushed pistachios',
        badge: 'Drink Pairing',
      });
    }

    // 2. DESSERT PAIRING
    const lavaCake = FULL_MENU.find((i) => i.id === 'ds-1'); // Belgian Molten Lava Cake
    const cakeOfDay = FULL_MENU.find((i) => i.id === 'ck-1'); // Cake of the Day
    const skilletBrownie = FULL_MENU.find((i) => i.id === 'ds-2'); // Sizzling Hot Iron Skillet Brownie
    const kheer = FULL_MENU.find((i) => i.id === 'ds-3'); // Traditional Saffron Highland Kheer

    if (hasSteak && lavaCake && !cartIds.has(lavaCake.id)) {
      candidates.push({
        item: lavaCake,
        reason: 'Warm molten dark chocolate center with vanilla bean ice cream',
        badge: 'Dessert Pairing',
      });
    } else if (cakeOfDay && !cartIds.has(cakeOfDay.id)) {
      candidates.push({
        item: cakeOfDay,
        reason: "Artisanal daily patisserie baked fresh in Murree's kitchen",
        badge: 'Dessert Pairing',
      });
    } else if (skilletBrownie && !cartIds.has(skilletBrownie.id)) {
      candidates.push({
        item: skilletBrownie,
        reason: 'Fudgy walnut brownie sizzling on cast iron with vanilla bean gelato',
        badge: 'Dessert Pairing',
      });
    } else if (kheer && !cartIds.has(kheer.id)) {
      candidates.push({
        item: kheer,
        reason: 'Kashmiri saffron & cardamom rice pudding in earthen pot',
        badge: 'Dessert Pairing',
      });
    } else if (lavaCake && !cartIds.has(lavaCake.id)) {
      candidates.push({
        item: lavaCake,
        reason: 'Warm dark chocolate souffle with flowing molten core',
        badge: 'Dessert Pairing',
      });
    }

    // Fallback if needed
    if (candidates.length < 2) {
      const remainingItems = FULL_MENU.filter(
        (i) =>
          (i.category === 'Beverages' || i.category === 'Desserts' || i.category === 'Cakes') &&
          !cartIds.has(i.id) &&
          !candidates.some((c) => c.item.id === i.id)
      );
      if (remainingItems.length > 0) {
        const fallback = remainingItems[0];
        candidates.push({
          item: fallback,
          reason: fallback.category === 'Beverages' ? 'Highland thirst-quencher' : 'Chef’s recommended sweet finish',
          badge: fallback.category === 'Beverages' ? 'Drink Pairing' : 'Dessert Pairing',
        });
      }
    }

    return candidates.slice(0, 2);
  }, [items]);

  const handleAddPairing = (pairingItem: MenuItem) => {
    if (onAddToCart) {
      onAddToCart(pairingItem, 1);
    } else if (onAddRewardItem) {
      onAddRewardItem(pairingItem);
    }
    setAddedPairingId(pairingItem.id);
    setTimeout(() => {
      setAddedPairingId(null);
    }, 1500);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || !guestName.trim()) return;

    const saved = saveNewOrder({
      items: [...items],
      subtotal: foodSubtotal,
      tipAmount: calculatedTipAmount,
      tipPercentage: tipOption,
      total: finalTotalAmount,
      orderType,
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim(),
      locationNote: locationNote.trim() || (orderType === 'dine_in' ? 'Main Dining Hall' : 'Lucky Kabana Hotel'),
      estimatedTime: '20–25 mins',
    });

    setConfirmedOrder(saved);
  };

  const handleReorder = (order: OrderRecord) => {
    if (onReorderItems) {
      onReorderItems(order.items);
      setActiveTab('cart');
    }
  };

  const handleAdvanceStatus = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = advanceOrderStatus(orderId);
    if (nextStatus === 'delivered') {
      setActiveReviewOrderId(orderId);
      setReviewRating(5);
      setReviewComment('');
      setActiveTab('history');
    }
    syncOrdersFromDb();
  };

  const handleOpenRateMeal = (orderId: string) => {
    const targetOrder = pastOrders.find((o) => o.id === orderId);
    setActiveReviewOrderId(orderId);
    setReviewRating(targetOrder?.rating || 5);
    setReviewComment(targetOrder?.reviewComment || '');
  };

  const handleSubmitReview = (orderId: string) => {
    saveOrderReview(orderId, reviewRating, reviewComment);
    syncOrdersFromDb();
    playConciergeChime();
    setReviewSubmittedOrderId(orderId);
    setTimeout(() => {
      setActiveReviewOrderId(null);
      setReviewSubmittedOrderId(null);
      setReviewComment('');
      setReviewRating(5);
    }, 1800);
  };

  const handleClaimReward = (reward: (typeof LOYALTY_REWARDS)[0]) => {
    if (hospitalityPoints < reward.cost) return;

    if (onAddRewardItem) {
      onAddRewardItem(reward.menuItem, 'Mountain Hospitality Loyalty Reward');
    }
    setRedeemedPerkId(reward.id);
    setTimeout(() => {
      setRedeemedPerkId(null);
      setActiveTab('cart');
    }, 1200);
  };

  const handleDone = () => {
    setConfirmedOrder(null);
    onClearCart();
    setActiveTab('history');
  };

  const getTierIcon = (id: string, className = 'w-4 h-4') => {
    switch (id) {
      case 'bronze':
        return <Mountain className={className} />;
      case 'silver':
        return <Shield className={className} />;
      case 'gold':
        return <Crown className={className} />;
      case 'platinum':
        return <Gem className={className} />;
      default:
        return <Mountain className={className} />;
    }
  };

  // Helper for status styling & labels
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'preparing':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#f6ad55] uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#f6ad55] animate-ping" />
            Preparing in Kitchen
          </span>
        );
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e5c378] uppercase tracking-wider">
            <Bell className="w-3.5 h-3.5 text-[#e5c378]" />
            Ready for Service
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7fb385] uppercase tracking-wider">
            <CheckCircle className="w-3.5 h-3.5 text-[#7fb385]" />
            Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#c96a6a] uppercase tracking-wider">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#d4cfc5] uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-[#8a857b]" />
            Order Received
          </span>
        );
    }
  };

  const getStepProgressNumber = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 1;
      case 'preparing':
        return 2;
      case 'ready':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 1;
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[#07080a]/85 backdrop-blur-sm flex justify-end"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#121418] border-l border-[#252830] h-full flex flex-col justify-between p-6 shadow-2xl overflow-y-auto"
      >
        {/* Drawer Header & Tabs */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-[#22252e] mb-4">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#c5a880]" />
              <div>
                <h3 className="font-display text-2xl text-[#f3ede4] leading-none">
                  Guest Dining
                </h3>
                {/* Visual Active Tier Mini Badge */}
                <div className="flex items-center gap-1.5 mt-1 text-[11px]">
                  <span className={`${currentTierObj.theme.text} flex items-center gap-1 font-semibold`}>
                    {getTierIcon(currentTierObj.id, 'w-3 h-3')}
                    {currentTierObj.name}
                  </span>
                  <span className="text-[#59554d]" aria-hidden="true">·</span>
                  <span className="font-mono text-[#8a857b] tabular-nums">
                    {hospitalityPoints} pts
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#8a857b] hover:text-[#ede8e1] transition-colors"
              aria-label="Close Order Bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* REAL-TIME TOAST NOTIFICATION / VISUAL ALERT BANNER */}
          {activeToast && (
            <div className="mb-4 p-4 bg-gradient-to-r from-[#241c0e] via-[#1a150c] to-[#120f09] border-2 border-[#d4af37] shadow-[0_0_25px_rgba(212,175,55,0.35)] animate-in fade-in slide-in-from-top-3 duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/20 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-[#2e230e] border border-[#d4af37] flex items-center justify-center text-[#f6e05e] shrink-0 animate-bounce">
                    <Bell className="w-5 h-5 text-[#f6e05e]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#7fb385] animate-ping" />
                      <h4 className="font-display text-lg font-bold text-[#fef08a] leading-none">
                        {activeToast.title}
                      </h4>
                    </div>
                    <p className="text-xs font-mono font-semibold text-[#c5a880] mt-1">
                      {activeToast.orderId} · {activeToast.itemsSummary}
                    </p>
                    <p className="text-[11px] text-[#e2ded5] mt-1 leading-relaxed">
                      {activeToast.message}
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                      <button
                        onClick={() => {
                          setActiveTab('history');
                          setExpandedOrderId(activeToast.orderId);
                          setActiveToast(null);
                        }}
                        className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider bg-[#d4af37] text-[#0e0f12] hover:bg-[#e5c378] transition-colors"
                      >
                        View in Live Tracker &rarr;
                      </button>
                      <button
                        onClick={() => setActiveToast(null)}
                        className="text-[11px] text-[#8a857b] hover:text-[#ede8e1] uppercase tracking-wider"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveToast(null)}
                  className="p-1 text-[#8a857b] hover:text-[#ede8e1] transition-colors"
                  aria-label="Dismiss Alert"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Segmented Tab Controls (Zero-Pill Discipline) */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#0e0f12] border border-[#22252e] mb-5">
            <button
              onClick={() => setActiveTab('cart')}
              className={`py-2 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'cart'
                  ? 'bg-[#c5a880] text-[#0e0f12]'
                  : 'text-[#9a9488] hover:text-[#ede8e1]'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Current Order ({items.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 relative ${
                activeTab === 'history'
                  ? 'bg-[#c5a880] text-[#0e0f12]'
                  : 'text-[#9a9488] hover:text-[#ede8e1]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Order History & Live Status ({pastOrders.length})</span>
              {activeLiveOrders.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#f6ad55] animate-ping absolute top-2 right-2" />
              )}
            </button>
          </div>

          {/* TAB 1: CURRENT ORDER CART */}
          {activeTab === 'cart' && (
            <>
              {/* Subtle Loyalty Notice if user has points */}
              {hospitalityPoints > 0 && !confirmedOrder && (
                <div
                  onClick={() => setActiveTab('history')}
                  className={`mb-4 p-3 border transition-colors cursor-pointer flex items-center justify-between text-xs ${currentTierObj.theme.bg} ${currentTierObj.theme.border}`}
                >
                  <div className="flex items-center gap-2">
                    <span className={currentTierObj.theme.iconColor}>
                      {getTierIcon(currentTierObj.id, 'w-4 h-4')}
                    </span>
                    <span className="text-[#cdc7bb]">
                      <strong className={currentTierObj.theme.text}>{currentTierObj.name}</strong> ·{' '}
                      <span className="font-mono text-[#f3ede4] font-semibold">{hospitalityPoints} pts</span> available
                    </span>
                  </div>
                  <span className="text-[11px] text-[#c5a880] flex items-center gap-0.5 font-medium">
                    View Perks &rarr;
                  </span>
                </div>
              )}

              {confirmedOrder ? (
                /* Order Confirmed State */
                <div className="py-6 text-center">
                  <div className="w-12 h-12 bg-[#1b251e] border border-[#3e5f44] flex items-center justify-center mx-auto mb-4 text-[#c5a880]">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h4 className="font-display text-2xl text-[#f3ede4] mb-2">
                    Sent to Murree Kitchen
                  </h4>
                  <p className="text-xs text-[#9a9488] mb-4">
                    Our culinary team at Lucky Kabana Hotel has received your order and added it to the live queue.
                  </p>

                  {/* Visual Step-by-Step Progress Timeline */}
                  <div className="mb-6 text-left">
                    <OrderProgressTimeline
                      status={confirmedOrder.status}
                      estimatedTime={confirmedOrder.estimatedTime}
                      orderType={confirmedOrder.orderType}
                      orderId={confirmedOrder.id}
                      onAdvance={() => {
                        const nextSt = advanceOrderStatus(confirmedOrder.id);
                        setConfirmedOrder({ ...confirmedOrder, status: nextSt });
                        syncOrdersFromDb();
                      }}
                    />
                  </div>

                  {/* Loyalty Points Earned Notification */}
                  <div className="p-3 bg-[#181b22] border border-[#c5a880]/40 text-xs text-[#ede8e1] mb-6 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#c5a880]">
                      <Sparkles className="w-3.5 h-3.5" />
                      Mountain Hospitality Points
                    </span>
                    <span className="font-mono font-bold text-[#c5a880]">
                      +{Math.floor(confirmedOrder.total / 20)} pts earned
                    </span>
                  </div>

                  <div className="bg-[#0e0f12] border border-[#22252e] p-5 text-left mb-6 text-xs space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-[#8a857b]">Order Number:</span>
                      <span className="font-mono text-[#c5a880] font-bold">
                        {confirmedOrder.id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8a857b]">Status:</span>
                      <span>{getStatusBadge(confirmedOrder.status)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8a857b]">Destination:</span>
                      <span className="text-[#ede8e1]">{confirmedOrder.locationNote}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8a857b]">Estimated Prep:</span>
                      <span className="text-[#ede8e1] font-medium">
                        {confirmedOrder.estimatedTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8a857b]">Food Subtotal:</span>
                      <span className="text-[#ede8e1] tabular-nums font-mono">
                        Rs {(confirmedOrder.subtotal ?? confirmedOrder.total).toLocaleString()}
                      </span>
                    </div>
                    {(confirmedOrder.tipAmount ?? 0) > 0 && (
                      <div className="flex justify-between text-[#c5a880]">
                        <span className="flex items-center gap-1">
                          <HeartHandshake className="w-3.5 h-3.5" />
                          <span>Staff Gratuity ({confirmedOrder.tipPercentage === 'custom' ? 'Custom' : `${confirmedOrder.tipPercentage}%`}):</span>
                        </span>
                        <span className="tabular-nums font-mono font-semibold">
                          +Rs {confirmedOrder.tipAmount?.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-[#1f222a] font-semibold text-sm">
                      <span className="text-[#ede8e1]">Total Payable:</span>
                      <span className="text-[#c5a880] tabular-nums">
                        Rs {confirmedOrder.total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <button
                      onClick={handleDone}
                      className="w-full py-3 text-xs font-semibold uppercase tracking-wider bg-[#c5a880] text-[#0e0f12] hover:bg-[#d8ba91]"
                    >
                      Track Order Live in History &rarr;
                    </button>
                    <a
                      href={`tel:${RESTAURANT_INFO.phoneClean}`}
                      className="w-full py-2.5 text-xs font-semibold uppercase tracking-wider border border-[#393d4a] hover:border-[#c5a880] text-[#ede8e1] flex items-center justify-center gap-2"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#c5a880]" />
                      <span>Call Kitchen Hotline</span>
                    </a>
                  </div>
                </div>
              ) : items.length === 0 ? (
                /* Empty Cart State */
                <div className="py-16 text-center">
                  <Utensils className="w-10 h-10 text-[#2a2d37] mx-auto mb-3" />
                  <p className="font-display text-xl text-[#d4cfc5] mb-1">
                    Your dining tray is empty
                  </p>
                  <p className="text-xs text-[#8a857b] mb-6 max-w-xs mx-auto">
                    Select steaks, pizzas, or our famous Malai Boti Pizza from the menu to curate your meal.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider bg-[#c5a880] text-[#0e0f12] hover:bg-[#d8ba91]"
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                /* Active Cart Items */
                <div className="space-y-4">
                  <div className="space-y-3 max-h-[38vh] overflow-y-auto pr-1">
                    {items.map(({ item, quantity, notes }) => (
                      <div
                        key={item.id}
                        className="p-3.5 bg-[#16181f] border border-[#22252e] flex items-center justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-[#f3ede4] truncate">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-[#8a857b] mt-0.5">
                            <span>{item.category}</span>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#c5a880] font-mono tabular-nums">
                              {item.price === 0 ? 'Complimentary Perk' : `Rs ${item.price.toLocaleString()}`}
                            </span>
                          </div>
                          {notes && (
                            <p className="text-[10px] text-[#9a9488] italic mt-1 truncate">
                              Note: {notes}
                            </p>
                          )}
                        </div>

                        {/* Quantity Counter */}
                        <div className="flex items-center gap-1.5 bg-[#0e0f12] border border-[#282b35] px-1.5 py-1">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="p-1 text-[#8a857b] hover:text-[#ede8e1]"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-mono tabular-nums text-[#f3ede4] px-1">
                            {quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="p-1 text-[#8a857b] hover:text-[#ede8e1]"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1 text-[#6e6a62] hover:text-[#c5a880]"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* RECOMMENDED PAIRINGS SECTION (Drink or Dessert complementary suggestions) */}
                  {recommendedPairings.length > 0 && (
                    <div className="p-4 bg-[#14161f] border border-[#252834] space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#20232d]">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#20232d] border border-[#3b3f4f] flex items-center justify-center text-[#c5a880]">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <h4 className="font-display text-sm font-semibold text-[#f3ede4] leading-tight">
                              Recommended Pairings
                            </h4>
                            <p className="text-[10px] text-[#8a857b]">
                              Sommelier & pastry selections to complement your meal
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-mono text-[#c5a880] tracking-wider">
                          Curated
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {recommendedPairings.map((pairing) => (
                          <div
                            key={pairing.item.id}
                            className="p-3 bg-[#0d0f14] border border-[#222530] flex flex-col justify-between hover:border-[#c5a880]/50 transition-colors"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-1 mb-1">
                                <span className="text-[9px] uppercase tracking-wider font-semibold text-[#c5a880] flex items-center gap-1">
                                  {pairing.badge === 'Drink Pairing' ? (
                                    <Coffee className="w-2.5 h-2.5" />
                                  ) : (
                                    <Sparkles className="w-2.5 h-2.5" />
                                  )}
                                  <span>{pairing.badge}</span>
                                </span>
                                <span className="font-mono text-xs font-bold text-[#ede8e1] tabular-nums">
                                  Rs {pairing.item.price.toLocaleString()}
                                </span>
                              </div>

                              <h5 className="font-display text-sm font-medium text-[#f3ede4] leading-snug">
                                {pairing.item.name}
                              </h5>
                              <p className="text-[10px] text-[#938e82] line-clamp-2 mt-1 leading-snug">
                                {pairing.reason}
                              </p>
                            </div>

                            <div className="pt-2.5 mt-2 border-t border-[#1d2029] flex items-center justify-between">
                              <span className="text-[10px] text-[#716d65]">
                                {pairing.item.portion || pairing.item.category}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleAddPairing(pairing.item)}
                                className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors border flex items-center gap-1 ${
                                  addedPairingId === pairing.item.id
                                    ? 'bg-[#3e5f44] text-[#ede8e1] border-[#3e5f44]'
                                    : 'bg-[#1a1c24] hover:bg-[#c5a880] text-[#ede8e1] hover:text-[#0e0f12] border-[#2b2f3d]'
                                }`}
                              >
                                {addedPairingId === pairing.item.id ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>Added</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3 h-3" />
                                    <span>Add to Tray</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Service & Guest Details */}
                  <div className="pt-3 border-t border-[#22252e] space-y-3">
                    <label className="block text-xs uppercase tracking-wider text-[#9a9488]">
                      Service Format
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => setOrderType('dine_in')}
                        className={`p-2 text-xs uppercase font-medium border ${
                          orderType === 'dine_in'
                            ? 'border-[#c5a880] bg-[#c5a880] text-[#0e0f12] font-semibold'
                            : 'border-[#242730] text-[#8a857b]'
                        }`}
                      >
                        Dine-In
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderType('room_service')}
                        className={`p-2 text-xs uppercase font-medium border ${
                          orderType === 'room_service'
                            ? 'border-[#c5a880] bg-[#c5a880] text-[#0e0f12] font-semibold'
                            : 'border-[#242730] text-[#8a857b]'
                        }`}
                      >
                        Hotel Room
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderType('takeaway')}
                        className={`p-2 text-xs uppercase font-medium border ${
                          orderType === 'takeaway'
                            ? 'border-[#c5a880] bg-[#c5a880] text-[#0e0f12] font-semibold'
                            : 'border-[#242730] text-[#8a857b]'
                        }`}
                      >
                        Takeaway
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      <input
                        type="text"
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Guest Name *"
                        className="px-3 py-2 bg-[#16181f] border border-[#242730] text-xs text-[#ede8e1] focus:border-[#c5a880] focus:outline-none"
                      />
                      <input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="Phone (Optional)"
                        className="px-3 py-2 bg-[#16181f] border border-[#242730] text-xs text-[#ede8e1] focus:border-[#c5a880] focus:outline-none"
                      />
                      <input
                        type="text"
                        value={locationNote}
                        onChange={(e) => setLocationNote(e.target.value)}
                        placeholder={
                          orderType === 'room_service'
                            ? 'Room # (e.g. 204)'
                            : orderType === 'dine_in'
                            ? 'Table / Terrace Seat'
                            : 'Pickup Time'
                        }
                        className="px-3 py-2 bg-[#16181f] border border-[#242730] text-xs text-[#ede8e1] focus:border-[#c5a880] focus:outline-none"
                      />
                    </div>

                    {/* TIPPING / CULINARY GRATUITY OPTION */}
                    <div className="pt-3 border-t border-[#22252e] space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs uppercase tracking-wider text-[#9a9488] flex items-center gap-1.5 font-medium">
                          <HeartHandshake className="w-3.5 h-3.5 text-[#c5a880]" />
                          <span>Culinary & Staff Gratuity</span>
                        </label>
                        <span className="text-[11px] font-mono font-semibold text-[#c5a880]">
                          {calculatedTipAmount === 0 ? 'No tip' : `+Rs ${calculatedTipAmount.toLocaleString()}`}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#7d7970]">
                        100% of tips are distributed directly to our mountain culinary brigade and service team.
                      </p>

                      {/* Segmented Preset Buttons (Zero-Pill Discipline) */}
                      <div className="grid grid-cols-5 gap-1 text-center">
                        {[
                          { label: 'None', value: 0 },
                          { label: '5%', value: 5 },
                          { label: '10%', value: 10 },
                          { label: '15%', value: 15 },
                          { label: 'Custom', value: 'custom' },
                        ].map((opt) => {
                          const isSelected = tipOption === opt.value;
                          return (
                            <button
                              key={opt.label}
                              type="button"
                              onClick={() => {
                                setTipOption(opt.value as any);
                                if (opt.value !== 'custom') {
                                  setCustomTipInput('');
                                }
                              }}
                              className={`py-2 px-1 text-xs uppercase font-medium border transition-colors ${
                                isSelected
                                  ? 'border-[#c5a880] bg-[#c5a880] text-[#0e0f12] font-semibold'
                                  : 'border-[#242730] text-[#8a857b] hover:text-[#ede8e1]'
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Tip Input Field */}
                      {tipOption === 'custom' && (
                        <div className="pt-1 flex items-center gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#8a857b]">
                              Rs
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="50"
                              value={customTipInput}
                              onChange={(e) => setCustomTipInput(e.target.value)}
                              placeholder="Enter custom gratuity amount (e.g. 200)"
                              className="w-full pl-9 pr-3 py-2 bg-[#16181f] border border-[#242730] text-xs text-[#ede8e1] focus:border-[#c5a880] focus:outline-none font-mono"
                            />
                          </div>
                          {customTipInput && Number(customTipInput) > 0 && (
                            <span className="text-[11px] text-[#7fb385] font-mono whitespace-nowrap">
                              ✓ Rs {Number(customTipInput).toLocaleString()} added
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 2: ORDER HISTORY & REAL-TIME STATUS TRACKER */}
          {activeTab === 'history' && (
            <div className="space-y-5">
              {/* RATE YOUR MEAL PROMPT (Appears after status transitions to 'Delivered') */}
              {(() => {
                const orderToReview = pastOrders.find((o) => o.id === activeReviewOrderId);
                if (!orderToReview || orderToReview.status !== 'delivered') return null;

                return (
                  <div className="p-5 bg-gradient-to-br from-[#1c1811] via-[#14120e] to-[#0e0e11] border-2 border-[#c5a880] relative overflow-hidden shadow-2xl animate-in fade-in-50 duration-300">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#2a2416] border border-[#c5a880] flex items-center justify-center text-[#c5a880] shrink-0 mt-0.5 shadow-[0_0_12px_rgba(197,168,128,0.3)]">
                          <Star className="w-4 h-4 fill-[#c5a880]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#c5a880] font-bold">
                              Meal Delivered · Rate Your Experience
                            </span>
                          </div>
                          <h4 className="font-display text-lg font-semibold text-[#f3ede4] mt-0.5">
                            How was your dining experience?
                          </h4>
                          <p className="text-xs text-[#9a9488]">
                            Order <span className="font-mono text-[#c5a880]">{orderToReview.id}</span> · {orderToReview.locationNote} ({orderToReview.items.map((i) => i.item.name).join(', ')})
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveReviewOrderId(null)}
                        className="p-1 text-[#8a857b] hover:text-[#ede8e1]"
                        aria-label="Dismiss Review Prompt"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {reviewSubmittedOrderId === orderToReview.id ? (
                      <div className="p-4 bg-[#142318] border border-[#3e5f44] text-center my-2 space-y-1">
                        <CheckCircle className="w-6 h-6 text-[#7fb385] mx-auto mb-1" />
                        <p className="text-xs font-semibold text-[#ede8e1]">
                          Thank you for your rating & feedback!
                        </p>
                        <p className="text-[11px] text-[#7fb385] font-mono">
                          +50 Mountain Hospitality points credited to your account.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 pt-1">
                        {/* Interactive Star Rating Selector */}
                        <div className="bg-[#0f1014] p-3 border border-[#27262b] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((starValue) => {
                              const isFilled = (hoverRating || reviewRating) >= starValue;
                              return (
                                <button
                                  key={starValue}
                                  type="button"
                                  onClick={() => setReviewRating(starValue)}
                                  onMouseEnter={() => setHoverRating(starValue)}
                                  onMouseLeave={() => setHoverRating(0)}
                                  className="p-1 focus:outline-none transition-transform hover:scale-125"
                                  aria-label={`${starValue} Stars`}
                                >
                                  <Star
                                    className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${
                                      isFilled
                                        ? 'text-[#c5a880] fill-[#c5a880] drop-shadow-[0_0_8px_rgba(197,168,128,0.5)]'
                                        : 'text-[#373945]'
                                    }`}
                                  />
                                </button>
                              );
                            })}
                          </div>

                          <span className="text-xs font-mono font-semibold text-[#c5a880]">
                            {reviewRating === 5
                              ? '5/5 · Exceptional Alpine Cuisine!'
                              : reviewRating === 4
                              ? '4/5 · Very Good & Flavorful'
                              : reviewRating === 3
                              ? '3/5 · Good Mountain Dining'
                              : reviewRating === 2
                              ? '2/5 · Fair – Needed Attention'
                              : '1/5 · Unsatisfactory'}
                          </span>
                        </div>

                        {/* Quick Praise Tags (Zero-Pill Discipline) */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] uppercase tracking-wider text-[#8a857b] mr-1">
                            Quick Praise:
                          </span>
                          {[
                            'Sizzling Hot',
                            'Perfect Spicing',
                            'Tender & Juicy',
                            'Scenic Presentation',
                            'Prompt Delivery',
                          ].map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                setReviewComment((prev) => {
                                  if (prev.includes(tag)) return prev;
                                  return prev ? `${prev} · ${tag}` : tag;
                                });
                              }}
                              className="px-2 py-1 text-[10px] uppercase font-medium bg-[#14161f] border border-[#2a2d38] text-[#9a9488] hover:border-[#c5a880] hover:text-[#ede8e1] transition-colors"
                            >
                              + {tag}
                            </button>
                          ))}
                        </div>

                        {/* Comment Input */}
                        <div>
                          <textarea
                            rows={2}
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Tell our chef about the steaks, sauce, spice balance, or mountain service (optional)..."
                            className="w-full p-2.5 bg-[#0f1014] border border-[#252834] text-xs text-[#ede8e1] placeholder-[#6e6a62] focus:border-[#c5a880] focus:outline-none"
                          />
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] font-mono text-[#c5a880]">
                            ★ Earns +50 Mountain Hospitality points
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveReviewOrderId(null)}
                              className="px-3 py-1.5 text-xs text-[#8a857b] hover:text-[#ede8e1]"
                            >
                              Maybe Later
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSubmitReview(orderToReview.id)}
                              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-[#c5a880] text-[#0e0f12] hover:bg-[#d8ba91] transition-colors font-mono"
                            >
                              Submit Review
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
              {/* SECTION A: REAL-TIME ACTIVE ORDER LIVE TRACKER (If active orders exist) */}
              {activeLiveOrders.length > 0 && (
                <div className="p-5 bg-[#14161f] border-2 border-[#f6ad55]/60 relative overflow-hidden shadow-2xl">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#f6ad55] animate-ping" />
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#f6ad55] font-bold">
                          Live Kitchen Pipeline · Real-Time Updates
                        </span>
                      </div>
                      <h4 className="font-display text-xl text-[#f3ede4] mt-0.5">
                        Active Order: <span className="font-mono text-[#c5a880]">{activeLiveOrders[0].id}</span>
                      </h4>
                      <p className="text-xs text-[#8a857b]">
                        {activeLiveOrders[0].locationNote} · {activeLiveOrders[0].items.length} Courses
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs text-[#f6ad55] font-bold block">
                        {activeLiveOrders[0].estimatedTime}
                      </span>
                      <div className="flex items-center justify-end gap-1.5 mt-1.5 flex-wrap">
                        <button
                          onClick={(e) => handleAdvanceStatus(activeLiveOrders[0].id, e)}
                          className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider bg-[#222838] hover:bg-[#c5a880] text-[#ede8e1] hover:text-[#0e0f12] transition-colors border border-[#3b445c] flex items-center gap-1"
                          title="Advance Kitchen Milestone"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Advance</span>
                        </button>

                        <button
                          onClick={() => {
                            updateOrderStatus(activeLiveOrders[0].id, 'ready', 'Plated hot by executive chef');
                            syncOrdersFromDb();
                            triggerReadyToast({ ...activeLiveOrders[0], status: 'ready' });
                          }}
                          className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider bg-[#d4af37]/20 hover:bg-[#d4af37] text-[#fef08a] hover:text-[#0e0f12] transition-colors border border-[#d4af37] flex items-center gap-1"
                          title="Test Order Ready Toast & Audio Chime"
                        >
                          <Bell className="w-3 h-3 text-[#d4af37]" />
                          <span>Test 'Ready' Toast</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Step-by-Step Visual Progress Timeline */}
                  <div className="mt-3">
                    <OrderProgressTimeline
                      status={activeLiveOrders[0].status}
                      estimatedTime={activeLiveOrders[0].estimatedTime}
                      orderType={activeLiveOrders[0].orderType}
                      orderId={activeLiveOrders[0].id}
                      onAdvance={() => {
                        advanceOrderStatus(activeLiveOrders[0].id);
                        syncOrdersFromDb();
                      }}
                    />
                  </div>
                </div>
              )}

              {/* SECTION: RECHARTS DATA VISUALIZATION - MONTHLY SPENDING TREND */}
              {pastOrders.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="text-[11px] uppercase tracking-wider text-[#9a9488] font-semibold flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-[#c5a880]" />
                      <span>Monthly Spending Trend (Recharts)</span>
                    </span>
                    <button
                      onClick={() => setShowSpendingChart((prev) => !prev)}
                      className="text-[11px] text-[#c5a880] hover:text-[#ede8e1] transition-colors"
                    >
                      {showSpendingChart ? 'Minimize Analytics' : 'Expand Monthly Analytics'}
                    </button>
                  </div>
                  {showSpendingChart && <MonthlySpendingChart orders={pastOrders} />}
                </div>
              )}

              {/* SECTION C: MOUNTAIN HOSPITALITY LOYALTY CARD & TIER BADGES */}
              <div className={`p-5 border relative overflow-hidden ${currentTierObj.theme.bg} ${currentTierObj.theme.border} ${currentTierObj.theme.glow}`}>
                {/* Subtle Ambient Radial Highlight */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                {/* Badge Hero Lockup */}
                <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    {/* Visual Insignia Crest */}
                    <div className={`w-12 h-12 flex items-center justify-center border ${currentTierObj.theme.badgeBg} ${currentTierObj.theme.border} shadow-lg`}>
                      <span className={currentTierObj.theme.iconColor}>
                        {getTierIcon(currentTierObj.id, 'w-6 h-6 stroke-[1.75]')}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`font-display text-xl font-bold tracking-tight ${currentTierObj.theme.text}`}>
                          {currentTierObj.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-[#a19c90]">
                        {currentTierObj.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Active Status Marker */}
                  <div className="text-right">
                    <span className={`text-[10px] uppercase tracking-wider font-semibold font-mono block ${currentTierObj.theme.text}`}>
                      ● {currentTierObj.theme.label}
                    </span>
                    <span className="text-[10px] text-[#8a857b]">Mountain Club</span>
                  </div>
                </div>

                {/* Quantitative Spend & Points Counters */}
                <div className="grid grid-cols-2 gap-3 py-3 border-y border-white/10 mb-3 relative z-10 text-xs">
                  <div>
                    <span className="text-[11px] text-[#8a857b] block">Total Dining Spend</span>
                    <span className="font-mono text-lg font-bold text-[#ede8e1] tabular-nums">
                      Rs {totalSpent.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-[#8a857b] block">Hospitality Points</span>
                    <span className={`font-mono text-lg font-bold tabular-nums ${currentTierObj.theme.text}`}>
                      {hospitalityPoints.toLocaleString()} <span className="text-xs font-normal">pts</span>
                    </span>
                  </div>
                </div>

                {/* Progress Bar to Next Tier Badge */}
                <div className="relative z-10 mb-4">
                  <div className="flex items-center justify-between text-[11px] text-[#8a857b] mb-1.5">
                    <span>Accrual: 1 pt per Rs 20 spent</span>
                    {nextTierObj ? (
                      <span className="text-[#cdc7bb]">
                        <strong className="text-[#ede8e1] font-mono">{pointsToNext}</strong> pts to{' '}
                        <span className={nextTierObj.theme.text}>{nextTierObj.name}</span>
                      </span>
                    ) : (
                      <span className="text-[#6ee7b7] font-semibold">Pinnacle Tier Achieved</span>
                    )}
                  </div>
                  <div className="w-full h-1.5 bg-[#0e0f12] overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${tierProgressPercent}%`,
                        backgroundColor: currentTierObj.theme.accent,
                      }}
                    />
                  </div>
                </div>

                {/* VISUAL TIER SPECTRUM BADGES SHOWCASE */}
                <div className="relative z-10 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] uppercase tracking-wider text-[#9a9488]">
                      Tier Badges Spectrum
                    </span>
                    <span className="text-[10px] text-[#8a857b]">4 Tiers</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {LOYALTY_TIERS.map((tier) => {
                      const isCurrent = tier.id === currentTierObj.id;
                      const isAchieved = hospitalityPoints >= tier.minPoints;

                      return (
                        <div
                          key={tier.id}
                          className={`p-2.5 border transition-all text-center flex flex-col items-center justify-between ${
                            isCurrent
                              ? `${tier.theme.badgeBg} ${tier.theme.border} ring-1 ring-white/20 shadow-md`
                              : isAchieved
                              ? 'bg-[#14161d] border-[#252834] opacity-85'
                              : 'bg-[#0f1115] border-[#1d2028] opacity-50'
                          }`}
                        >
                          <div className={`p-1.5 rounded-none mb-1.5 ${tier.theme.iconColor}`}>
                            {getTierIcon(tier.id, 'w-4 h-4')}
                          </div>

                          <h5 className={`text-[11px] font-semibold tracking-tight truncate w-full ${isCurrent ? tier.theme.text : 'text-[#ede8e1]'}`}>
                            {tier.name}
                          </h5>

                          <span className="text-[10px] font-mono text-[#8a857b] tabular-nums mt-0.5">
                            {tier.minPoints}+ pts
                          </span>

                          <div className="mt-1.5 pt-1 border-t border-white/5 w-full text-[9px] uppercase tracking-wider font-semibold">
                            {isCurrent ? (
                              <span className={tier.theme.text}>Active</span>
                            ) : isAchieved ? (
                              <span className="text-[#7fb385] flex items-center justify-center gap-0.5">
                                <Check className="w-2.5 h-2.5" /> Achieved
                              </span>
                            ) : (
                              <span className="text-[#6e6a62] flex items-center justify-center gap-0.5">
                                <Lock className="w-2.5 h-2.5" /> Locked
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Redeemable Loyalty Perks Section */}
                <div className="relative z-10 pt-4 mt-4 border-t border-white/10">
                  <span className="text-[11px] uppercase tracking-wider text-[#9a9488] block mb-2 flex items-center gap-1.5">
                    <Gift className="w-3 h-3 text-[#c5a880]" />
                    <span>Redeemable Mountain Perks</span>
                  </span>

                  <div className="space-y-2">
                    {LOYALTY_REWARDS.map((reward) => {
                      const canRedeem = hospitalityPoints >= reward.cost;
                      const isRedeemed = redeemedPerkId === reward.id;

                      return (
                        <div
                          key={reward.id}
                          className="p-2.5 bg-[#0f1115] border border-[#242732] flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium text-[#ede8e1] truncate">
                                {reward.title}
                              </h5>
                              <span className="font-mono text-[10px] text-[#c5a880] tabular-nums whitespace-nowrap">
                                ({reward.cost} pts)
                              </span>
                            </div>
                            <p className="text-[10px] text-[#8a857b] truncate mt-0.5">
                              {reward.description}
                            </p>
                          </div>

                          <button
                            onClick={() => handleClaimReward(reward)}
                            disabled={!canRedeem || isRedeemed}
                            className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                              isRedeemed
                                ? 'bg-[#3e5f44] text-[#ede8e1]'
                                : canRedeem
                                ? 'bg-[#c5a880] text-[#0e0f12] hover:bg-[#d8ba91]'
                                : 'bg-[#1b1c22] text-[#6b6860] cursor-not-allowed border border-[#252830]'
                            }`}
                          >
                            {isRedeemed ? (
                              <span className="flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>Claimed</span>
                              </span>
                            ) : canRedeem ? (
                              <span>Claim Perk</span>
                            ) : (
                              <span>Locked</span>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SECTION C: PAST ORDERS ARCHIVE WITH REAL-TIME STATUS FIELD */}
              <div className="pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#22252e] mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#f3ede4]">Order History</span>
                    <span className="text-[11px] text-[#8a857b]">({filteredPastOrders.length} records)</span>
                  </div>

                  {/* Status Filter Tabs (Buttons, Zero-Pill Discipline) */}
                  <div className="flex items-center gap-1 text-xs">
                    <button
                      onClick={() => setHistoryFilter('all')}
                      className={`px-2.5 py-1 uppercase tracking-wider text-[10px] font-medium border transition-colors ${
                        historyFilter === 'all'
                          ? 'bg-[#c5a880] text-[#0e0f12] border-[#c5a880]'
                          : 'bg-[#14161a] text-[#8a857b] border-[#22252e] hover:text-[#ede8e1]'
                      }`}
                    >
                      All ({pastOrders.length})
                    </button>
                    <button
                      onClick={() => setHistoryFilter('active')}
                      className={`px-2.5 py-1 uppercase tracking-wider text-[10px] font-medium border transition-colors ${
                        historyFilter === 'active'
                          ? 'bg-[#c5a880] text-[#0e0f12] border-[#c5a880]'
                          : 'bg-[#14161a] text-[#8a857b] border-[#22252e] hover:text-[#ede8e1]'
                      }`}
                    >
                      Active Live ({activeLiveOrders.length})
                    </button>
                    <button
                      onClick={() => setHistoryFilter('delivered')}
                      className={`px-2.5 py-1 uppercase tracking-wider text-[10px] font-medium border transition-colors ${
                        historyFilter === 'delivered'
                          ? 'bg-[#c5a880] text-[#0e0f12] border-[#c5a880]'
                          : 'bg-[#14161a] text-[#8a857b] border-[#22252e] hover:text-[#ede8e1]'
                      }`}
                    >
                      Delivered ({pastOrders.filter((o) => o.status === 'delivered').length})
                    </button>
                  </div>
                </div>

                {filteredPastOrders.length === 0 ? (
                  <div className="py-12 text-center">
                    <History className="w-8 h-8 text-[#2a2d37] mx-auto mb-2" />
                    <p className="font-display text-lg text-[#d4cfc5] mb-1">
                      No matching orders found
                    </p>
                    <p className="text-xs text-[#8a857b] mb-4 max-w-xs mx-auto">
                      Switch filters or place an order to see real-time updates.
                    </p>
                    <button
                      onClick={() => setHistoryFilter('all')}
                      className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider bg-[#c5a880] text-[#0e0f12]"
                    >
                      View All Orders
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[44vh] overflow-y-auto pr-1">
                    {filteredPastOrders.map((order) => {
                      const isExpanded = expandedOrderId === order.id;
                      const isActiveOrder =
                        order.status === 'pending' ||
                        order.status === 'preparing' ||
                        order.status === 'ready';

                      return (
                        <div
                          key={order.id}
                          className={`p-4 bg-[#14161a] border transition-colors ${
                            isActiveOrder
                              ? 'border-[#f6ad55]/70 shadow-lg'
                              : 'border-[#242730] hover:border-[#c5a880]/50'
                          }`}
                        >
                          {/* Order Record Header with Status Field */}
                          <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#1f222a]">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs text-[#c5a880]">
                                  {order.id}
                                </span>
                                <span className="text-[11px] uppercase tracking-wider text-[#ede8e1] font-medium">
                                  · {order.orderType.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#8a857b] mt-0.5">
                                {order.formattedDate} · {order.guestName}
                              </p>
                            </div>

                            {/* Status Badge & Dynamic ETA */}
                            <div className="text-right">
                              {getStatusBadge(order.status)}
                              <span className="text-[11px] text-[#8a857b] block mt-0.5 font-mono">
                                {order.estimatedTime}
                              </span>
                            </div>
                          </div>

                          {/* Visual Step-by-Step Progress Timeline for Active Orders */}
                          {isActiveOrder && (
                            <div className="my-2.5">
                              <OrderProgressTimeline
                                status={order.status}
                                estimatedTime={order.estimatedTime}
                                orderType={order.orderType}
                                orderId={order.id}
                                compact={true}
                                onAdvance={() => {
                                  advanceOrderStatus(order.id);
                                  syncOrdersFromDb();
                                }}
                              />
                            </div>
                          )}

                          {/* Items Breakdown */}
                          <div className="py-2.5 space-y-1 text-xs text-[#b8b2a5]">
                            {order.items.map((itemObj, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-[11px]"
                              >
                                <span>
                                  {itemObj.quantity}x {itemObj.item.name}
                                </span>
                                <span className="text-[#8a857b] font-mono tabular-nums">
                                  Rs {(itemObj.item.price * itemObj.quantity).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Expandable Live Status Timeline Stepper */}
                          {isExpanded && (
                            <div className="my-2.5 p-3 bg-[#0d0f14] border border-[#222530] text-xs">
                              <span className="text-[10px] uppercase tracking-wider text-[#c5a880] font-semibold block mb-2">
                                Live Kitchen Timestamp Audit
                              </span>

                              <div className="space-y-2">
                                {(order.statusHistory || [
                                  { status: order.status, timestamp: order.formattedDate },
                                ]).map((historyItem, hIdx) => (
                                  <div
                                    key={hIdx}
                                    className="flex items-start gap-2 text-[11px]"
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#c5a880] mt-1.5 shrink-0" />
                                    <div className="flex-1">
                                      <span className="uppercase font-semibold text-[#ede8e1]">
                                        {historyItem.status}:
                                      </span>{' '}
                                      <span className="text-[#9a9488]">
                                        {historyItem.note || 'Logged in system'}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-[#6e6a62] font-mono">
                                      {historyItem.timestamp}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              {isActiveOrder && (
                                <div className="mt-3 pt-2 border-t border-[#1d202b] flex items-center justify-between">
                                  <span className="text-[10px] text-[#8a857b]">
                                    Simulate next kitchen milestone:
                                  </span>
                                  <button
                                    onClick={(e) => handleAdvanceStatus(order.id, e)}
                                    className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider bg-[#222736] hover:bg-[#c5a880] text-[#ede8e1] hover:text-[#0e0f12] transition-colors"
                                  >
                                    Advance to Next Status &rarr;
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Delivered Order Review Status / Prompt */}
                          {order.status === 'delivered' && (
                            <div className="my-2.5">
                              {order.rating ? (
                                <div className="p-3 bg-[#111218] border border-[#2b2a22] text-xs space-y-1">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-[#c5a880]">
                                      {[1, 2, 3, 4, 5].map((s) => (
                                        <Star
                                          key={s}
                                          className={`w-3.5 h-3.5 ${
                                            s <= (order.rating || 0)
                                              ? 'text-[#c5a880] fill-[#c5a880]'
                                              : 'text-[#383a45]'
                                          }`}
                                        />
                                      ))}
                                      <span className="text-[11px] font-mono font-bold ml-1.5 text-[#ede8e1]">
                                        {order.rating}/5 Stars
                                      </span>
                                      <span className="text-[10px] text-[#7fb385] ml-1">
                                        · Verified Dining Feedback
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenRateMeal(order.id)}
                                      className="text-[10px] uppercase font-semibold text-[#8a857b] hover:text-[#c5a880] transition-colors"
                                    >
                                      Edit Review
                                    </button>
                                  </div>
                                  {order.reviewComment && (
                                    <p className="text-[11px] text-[#cdc7bb] italic pt-0.5">
                                      "{order.reviewComment}"
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div className="p-2.5 bg-[#181611] border border-[#3e3422] flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <Star className="w-3.5 h-3.5 text-[#c5a880] fill-[#c5a880]" />
                                    <div>
                                      <span className="text-[11px] font-medium text-[#ede8e1] block">
                                        Meal Delivered · Share Your Thoughts
                                      </span>
                                      <span className="text-[9px] text-[#8a857b]">
                                        Help our Murree kitchen brigade maintain 5-star quality
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenRateMeal(order.id)}
                                    className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider bg-[#c5a880] text-[#0e0f12] hover:bg-[#d8ba91] transition-colors whitespace-nowrap"
                                  >
                                    ★ Rate Your Meal (+50 pts)
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Card Footer: Total, Timeline Toggle, Reorder */}
                          <div className="pt-2.5 border-t border-[#1f222a] flex items-center justify-between">
                            <div>
                              <span className="text-[10px] uppercase text-[#8a857b] block">
                                Total Spent
                              </span>
                              <span className="font-mono text-sm font-semibold text-[#f3ede4] tabular-nums">
                                Rs {order.total.toLocaleString()}
                              </span>
                              {(order.tipAmount ?? 0) > 0 && (
                                <span className="text-[10px] text-[#8a857b] block font-mono">
                                  (inc. Rs {order.tipAmount?.toLocaleString()} tip)
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Toggle Timeline */}
                              <button
                                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                className="text-[11px] text-[#8a857b] hover:text-[#c5a880] transition-colors flex items-center gap-0.5"
                              >
                                <span>Status Timeline</span>
                                {isExpanded ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                              </button>

                              <button
                                onClick={() => handleReorder(order)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-[#1f222a] hover:bg-[#c5a880] text-[#ede8e1] hover:text-[#0e0f12] transition-colors border border-[#2b2e38]"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Reorder All</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions (When on Cart tab with items) */}
        {activeTab === 'cart' && !confirmedOrder && items.length > 0 && (
          <div className="pt-4 border-t border-[#22252e] space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[#8a857b]">
                <span>Food & Drink Subtotal:</span>
                <span className="font-mono text-[#ede8e1]">
                  Rs {foodSubtotal.toLocaleString()}
                </span>
              </div>
              {calculatedTipAmount > 0 && (
                <div className="flex items-center justify-between text-[#c5a880]">
                  <span className="flex items-center gap-1">
                    <HeartHandshake className="w-3.5 h-3.5" />
                    <span>Staff Gratuity ({tipOption === 'custom' ? 'Custom' : `${tipOption}%`}):</span>
                  </span>
                  <span className="font-mono font-semibold">
                    +Rs {calculatedTipAmount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex items-baseline justify-between pt-2 border-t border-[#22252e]">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-[#f3ede4] block">
                    Final Bill Total
                  </span>
                  <span className="text-[10px] text-[#c5a880]">
                    Will earn +{Math.floor(finalTotalAmount / 20)} Mountain Hospitality points
                  </span>
                </div>
                <span className="font-sans text-xl font-bold text-[#c5a880] tabular-nums">
                  Rs {finalTotalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#6e6a62]">
              Tax included. Payment upon service via Cash, Card, or Lucky Kabana Room Bill.
            </p>

            <button
              onClick={handlePlaceOrder}
              disabled={!guestName.trim()}
              className="w-full py-3.5 text-xs font-semibold uppercase tracking-wider bg-[#c5a880] text-[#0e0f12] hover:bg-[#d8ba91] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {guestName.trim() ? 'Confirm & Place Order' : 'Enter Guest Name to Proceed'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
