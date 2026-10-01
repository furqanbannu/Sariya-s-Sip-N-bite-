import { OrderRecord, OrderStatus, ConfirmedReservation, MenuItem } from '../types/restaurant';
import { FULL_MENU, SIGNATURE_DISHES } from '../data/restaurantData';
import { api } from './apiService';

const ORDERS_STORAGE_KEY = 'sariyas_orders_v1';
const RESERVATIONS_STORAGE_KEY = 'sariyas_reservations_v1';
const MENU_STORAGE_KEY = 'sariyas_menu_v1';

// Seed initial orders so the restaurant database and guest history have realistic history
const INITIAL_SEED_ORDERS: OrderRecord[] = [
  {
    id: 'ORD-9420',
    items: [
      {
        item: SIGNATURE_DISHES[0], // Italian Chicken Steak
        quantity: 1,
        notes: 'Mild pepper mushroom glaze',
      },
      {
        item: SIGNATURE_DISHES[3], // Crispy Pasta
        quantity: 1,
      },
      {
        item: FULL_MENU.find((i) => i.id === 'bv-1') || FULL_MENU[FULL_MENU.length - 1], // Karak Chai
        quantity: 2,
      },
    ],
    total: 2100,
    orderType: 'dine_in',
    guestName: 'Zubair Shah',
    guestPhone: '+92 300 7711223',
    locationNote: 'Terrace Table 6 (Mountain View)',
    status: 'preparing',
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    formattedDate: 'Just 12 mins ago',
    estimatedTime: '8–12 mins remaining',
    statusHistory: [
      { status: 'pending', timestamp: '12 mins ago', note: 'Order confirmed & sent to kitchen' },
      { status: 'preparing', timestamp: '8 mins ago', note: 'Executive Chef seared chicken steaks' },
    ],
  },
  {
    id: 'ORD-9104',
    items: [
      {
        item: SIGNATURE_DISHES[0], // Italian Chicken Steak
        quantity: 2,
        notes: 'Extra mushroom sauce',
      },
      {
        item: FULL_MENU.find((i) => i.id === 'bv-2') || FULL_MENU[FULL_MENU.length - 2], // Mint Margarita
        quantity: 2,
      },
    ],
    total: 2540,
    orderType: 'dine_in',
    guestName: 'Hamza Tariq',
    guestPhone: '+92 300 5541298',
    locationNote: 'Terrace Table 4 (Pine View)',
    status: 'delivered',
    createdAt: new Date(Date.now() - 3600000 * 26).toISOString(),
    formattedDate: 'Yesterday at 08:45 PM',
    estimatedTime: 'Delivered',
    statusHistory: [
      { status: 'pending', timestamp: 'Yesterday at 08:20 PM' },
      { status: 'preparing', timestamp: 'Yesterday at 08:25 PM' },
      { status: 'ready', timestamp: 'Yesterday at 08:40 PM' },
      { status: 'delivered', timestamp: 'Yesterday at 08:45 PM' },
    ],
  },
  {
    id: 'ORD-8842',
    items: [
      {
        item: SIGNATURE_DISHES[1], // Malai Boti Pizza
        quantity: 1,
      },
      {
        item: SIGNATURE_DISHES[2], // Special Pasta
        quantity: 1,
      },
      {
        item: FULL_MENU.find((i) => i.id === 'bv-1') || FULL_MENU[FULL_MENU.length - 1], // Karak Chai
        quantity: 2,
      },
    ],
    total: 2030,
    orderType: 'room_service',
    guestName: 'Ayesha Khan',
    guestPhone: '+92 321 9874561',
    locationNote: 'Room 304, Lucky Kabana Hotel',
    status: 'delivered',
    createdAt: new Date(Date.now() - 3600000 * 50).toISOString(),
    formattedDate: '2 days ago at 09:15 PM',
    estimatedTime: 'Delivered',
  },
  {
    id: 'ORD-7619',
    items: [
      {
        item: SIGNATURE_DISHES[4], // Lebanese Shawarma
        quantity: 3,
      },
      {
        item: SIGNATURE_DISHES[5], // Cake of the Day
        quantity: 2,
      },
    ],
    total: 2190,
    orderType: 'takeaway',
    guestName: 'Dr. Shahzad Mir',
    guestPhone: '+92 333 4455667',
    locationNote: 'Mall Road Promenade Pickup',
    status: 'delivered',
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    formattedDate: '4 days ago at 05:20 PM',
    estimatedTime: 'Delivered',
  },
  {
    id: 'ORD-6512',
    items: [
      {
        item: SIGNATURE_DISHES[0], // Italian Chicken Steak
        quantity: 2,
      },
      {
        item: SIGNATURE_DISHES[1], // Malai Boti Pizza
        quantity: 1,
      },
    ],
    total: 3450,
    orderType: 'dine_in',
    guestName: 'Hamza Tariq',
    guestPhone: '+92 300 5541298',
    locationNote: 'Main Dining Hall Table 8',
    status: 'delivered',
    createdAt: new Date('2026-08-18T19:30:00Z').toISOString(),
    formattedDate: 'Aug 18, 2026 at 07:30 PM',
    estimatedTime: 'Delivered',
  },
  {
    id: 'ORD-5840',
    items: [
      {
        item: SIGNATURE_DISHES[2], // Special Pasta
        quantity: 2,
      },
      {
        item: FULL_MENU.find((i) => i.id === 'bv-2') || FULL_MENU[FULL_MENU.length - 2],
        quantity: 3,
      },
    ],
    total: 2680,
    orderType: 'room_service',
    guestName: 'Hamza Tariq',
    guestPhone: '+92 300 5541298',
    locationNote: 'Room 204, Lucky Kabana Hotel',
    status: 'delivered',
    createdAt: new Date('2026-07-24T20:45:00Z').toISOString(),
    formattedDate: 'Jul 24, 2026 at 08:45 PM',
    estimatedTime: 'Delivered',
  },
  {
    id: 'ORD-4920',
    items: [
      {
        item: SIGNATURE_DISHES[1], // Malai Boti Pizza
        quantity: 2,
      },
      {
        item: SIGNATURE_DISHES[4], // Lebanese Shawarma
        quantity: 2,
      },
    ],
    total: 3380,
    orderType: 'dine_in',
    guestName: 'Hamza Tariq',
    guestPhone: '+92 300 5541298',
    locationNote: 'Alpine Terrace Table 2',
    status: 'delivered',
    createdAt: new Date('2026-06-12T21:15:00Z').toISOString(),
    formattedDate: 'Jun 12, 2026 at 09:15 PM',
    estimatedTime: 'Delivered',
  },
  {
    id: 'ORD-3810',
    items: [
      {
        item: SIGNATURE_DISHES[0], // Italian Chicken Steak
        quantity: 1,
      },
      {
        item: SIGNATURE_DISHES[5], // Cake of the Day
        quantity: 1,
      },
    ],
    total: 1670,
    orderType: 'takeaway',
    guestName: 'Hamza Tariq',
    guestPhone: '+92 300 5541298',
    locationNote: 'Mall Road Pickup',
    status: 'delivered',
    createdAt: new Date('2026-05-05T18:20:00Z').toISOString(),
    formattedDate: 'May 05, 2026 at 06:20 PM',
    estimatedTime: 'Delivered',
  },
];

const INITIAL_SEED_RESERVATIONS: ConfirmedReservation[] = [
  {
    fullName: 'Kamran Ashraf',
    phone: '+92 301 8847291',
    email: 'kamran.a@gmail.com',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '08:30 PM',
    guests: 4,
    seatingArea: 'terrace',
    specialRequests: 'Celebrating anniversary, need quiet corner table with scenic mist view',
    confirmationCode: 'SB-8491',
    createdAt: '11:30 AM',
    tableNumber: 'T-2 (Alpine Terrace)',
  },
  {
    fullName: 'Zainab Abbasi',
    phone: '+92 312 9012345',
    email: 'zainab.abbasi@hotmail.com',
    date: new Date().toISOString().split('T')[0],
    time: '09:00 PM',
    guests: 6,
    seatingArea: 'fireplace',
    specialRequests: 'Family gathering with elderly parents, please keep near indoor heater',
    confirmationCode: 'SB-5219',
    createdAt: '03:15 PM',
    tableNumber: 'F-1 (Hearth Lounge)',
  },
];

export const DB_CHANGE_EVENT = 'sariyas_db_sync';

function notifyDbChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DB_CHANGE_EVENT));
  }
}

// Order Management
export function getStoredOrders(): OrderRecord[] {
  if (typeof window === 'undefined') return INITIAL_SEED_ORDERS;
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_SEED_ORDERS));
      return INITIAL_SEED_ORDERS;
    }
    return JSON.parse(raw) as OrderRecord[];
  } catch (err) {
    console.error('Failed reading orders database', err);
    return INITIAL_SEED_ORDERS;
  }
}

export function saveNewOrder(
  data: Omit<OrderRecord, 'id' | 'createdAt' | 'formattedDate' | 'status'> & {
    status?: OrderStatus;
  }
): OrderRecord {
  const currentOrders = getStoredOrders();
  const now = new Date();
  const status: OrderStatus = data.status || 'pending';
  
  const newOrder: OrderRecord = {
    ...data,
    id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    status,
    createdAt: now.toISOString(),
    formattedDate: `Today at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    estimatedTime: data.estimatedTime || '20–25 mins',
    statusHistory: [
      {
        status,
        timestamp: 'Just now',
        note: 'Order confirmed and sent to Murree kitchen',
      },
    ],
  };

  const updatedOrders = [newOrder, ...currentOrders];
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updatedOrders));
    notifyDbChange();
  } catch (err) {
    console.error('Failed to persist order to storage', err);
  }

  // Background sync to real backend SQLite database
  try {
    api.createPublicOrder({
      orderNumber: newOrder.id,
      guestName: newOrder.guestName,
      guestPhone: newOrder.guestPhone,
      orderType: newOrder.orderType,
      locationNote: newOrder.locationNote,
      items: newOrder.items.map((oi) => ({
        id: oi.item.id,
        name: oi.item.name,
        price: oi.item.price,
        quantity: oi.quantity,
      })),
      subtotal: newOrder.total,
      discount: 0,
      tip: 0,
      total: newOrder.total,
    }).catch((err) => {
      console.warn('Backend order sync note:', err?.message || err);
    });
  } catch (e) {
    // Ignore offline errors
  }

  return newOrder;
}

export function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string
): void {
  const currentOrders = getStoredOrders();
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const updated = currentOrders.map((o) => {
    if (o.id !== orderId) return o;

    const existingHistory = o.statusHistory || [
      { status: o.status, timestamp: o.formattedDate },
    ];

    let dynamicEstimatedTime = o.estimatedTime;
    if (status === 'preparing') dynamicEstimatedTime = '10–15 mins remaining';
    if (status === 'ready') dynamicEstimatedTime = 'Ready for table/pickup now';
    if (status === 'delivered') dynamicEstimatedTime = 'Delivered & Completed';
    if (status === 'cancelled') dynamicEstimatedTime = 'Cancelled';

    return {
      ...o,
      status,
      updatedAt: now.toISOString(),
      estimatedTime: dynamicEstimatedTime,
      statusHistory: [
        ...existingHistory,
        {
          status,
          timestamp: `Today at ${timeStr}`,
          note: note || (
            status === 'preparing'
              ? 'Chef is preparing courses'
              : status === 'ready'
              ? 'Order plated & ready for service'
              : status === 'delivered'
              ? 'Served to guest'
              : undefined
          ),
        },
      ],
    };
  });

  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
    notifyDbChange();
  } catch (err) {
    console.error('Failed updating order status in storage', err);
  }
}

export function advanceOrderStatus(orderId: string): OrderStatus {
  const currentOrders = getStoredOrders();
  const order = currentOrders.find((o) => o.id === orderId);
  if (!order) return 'pending';

  let nextStatus: OrderStatus = 'pending';
  if (order.status === 'pending') nextStatus = 'preparing';
  else if (order.status === 'preparing') nextStatus = 'ready';
  else if (order.status === 'ready') nextStatus = 'delivered';
  else return order.status;

  updateOrderStatus(orderId, nextStatus);
  return nextStatus;
}

export function deleteOrder(orderId: string): void {
  const currentOrders = getStoredOrders();
  const filtered = currentOrders.filter((o) => o.id !== orderId);
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(filtered));
    notifyDbChange();
  } catch (err) {
    console.error('Failed deleting order from storage', err);
  }
}

export function saveOrderReview(
  orderId: string,
  rating: number,
  comment?: string
): OrderRecord | null {
  const currentOrders = getStoredOrders();
  const now = new Date();
  let updatedRecord: OrderRecord | null = null;

  const updated = currentOrders.map((o) => {
    if (o.id !== orderId) return o;
    const reviewed: OrderRecord = {
      ...o,
      rating,
      reviewComment: comment?.trim() || undefined,
      reviewedAt: now.toISOString(),
    };
    updatedRecord = reviewed;
    return reviewed;
  });

  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
    notifyDbChange();
  } catch (err) {
    console.error('Failed saving order review in storage', err);
  }

  return updatedRecord;
}

// Reservation Management
export function getStoredReservations(): ConfirmedReservation[] {
  if (typeof window === 'undefined') return INITIAL_SEED_RESERVATIONS;
  try {
    const raw = localStorage.getItem(RESERVATIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(INITIAL_SEED_RESERVATIONS));
      return INITIAL_SEED_RESERVATIONS;
    }
    return JSON.parse(raw) as ConfirmedReservation[];
  } catch (err) {
    console.error('Failed reading reservations database', err);
    return INITIAL_SEED_RESERVATIONS;
  }
}

export function saveNewReservation(reservation: ConfirmedReservation): void {
  const current = getStoredReservations();
  const updated = [reservation, ...current];
  try {
    localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(updated));
    notifyDbChange();
  } catch (err) {
    console.error('Failed saving reservation to storage', err);
  }

  // Background sync to real backend SQLite database
  try {
    api.createPublicReservation({
      fullName: reservation.fullName,
      phone: reservation.phone,
      email: reservation.email,
      date: reservation.date,
      time: reservation.time,
      guests: reservation.guests,
      seatingArea: reservation.seatingArea,
      selectedTableId: reservation.selectedTableId,
      selectedTableName: reservation.tableNumber,
      specialRequests: reservation.specialRequests,
    }).catch((err) => {
      console.warn('Backend reservation sync note:', err?.message || err);
    });
  } catch (e) {
    // Ignore offline errors
  }
}

export function deleteReservation(confirmationCode: string): void {
  const current = getStoredReservations();
  const filtered = current.filter((r) => r.confirmationCode !== confirmationCode);
  try {
    localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(filtered));
    notifyDbChange();
  } catch (err) {
    console.error('Failed deleting reservation from storage', err);
  }
}

// Menu Overrides & In-Stock Management
export function getStoredMenu(): MenuItem[] {
  if (typeof window === 'undefined') return FULL_MENU;
  try {
    const raw = localStorage.getItem(MENU_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(FULL_MENU));
      return FULL_MENU;
    }
    return JSON.parse(raw) as MenuItem[];
  } catch (err) {
    return FULL_MENU;
  }
}

export function updateMenuItem(id: string, updates: Partial<MenuItem>): void {
  const currentMenu = getStoredMenu();
  const updated = currentMenu.map((item) => (item.id === id ? { ...item, ...updates } : item));
  try {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(updated));
    notifyDbChange();
  } catch (err) {
    console.error('Failed updating menu item', err);
  }
}

// Strong Database Backup, Restore, and Reset Utilities
export function exportEntireDatabase(): string {
  const data = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    restaurant: "Sariya's Sip N Bite",
    hotel: 'Lucky Kabana Hotel, Mall Road Murree',
    orders: getStoredOrders(),
    reservations: getStoredReservations(),
    menu: getStoredMenu(),
  };
  return JSON.stringify(data, null, 2);
}

export function importEntireDatabase(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.orders && Array.isArray(parsed.orders)) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(parsed.orders));
    }
    if (parsed.reservations && Array.isArray(parsed.reservations)) {
      localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(parsed.reservations));
    }
    if (parsed.menu && Array.isArray(parsed.menu)) {
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(parsed.menu));
    }
    notifyDbChange();
    return true;
  } catch (err) {
    console.error('Invalid database import payload', err);
    return false;
  }
}

export function resetDatabaseToDefaults(): void {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_SEED_ORDERS));
    localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(INITIAL_SEED_RESERVATIONS));
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(FULL_MENU));
    notifyDbChange();
  } catch (err) {
    console.error('Failed resetting database', err);
  }
}
