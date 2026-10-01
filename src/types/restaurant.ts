export type MenuCategory =
  | 'Starters'
  | 'Pizza'
  | 'Pasta'
  | 'Steaks'
  | 'Burgers'
  | 'Shawarma'
  | 'Desserts'
  | 'Cakes'
  | 'Beverages';

export type DietaryPreference = 'Vegetarian' | 'Gluten-Free' | 'Spicy';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  description: string;
  price: number; // in PKR
  isSignature?: boolean;
  image?: string;
  spiceLevel?: 0 | 1 | 2 | 3;
  prepTime?: string;
  portion?: string;
  pairing?: string;
  tag?: string;
  dietary?: DietaryPreference[];
}

export interface Review {
  id: string;
  author: string;
  city?: string;
  rating: number;
  date: string;
  comment: string;
  occasion?: string;
  source: string;
  verified: boolean;
}

export interface ReservationRequest {
  fullName: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  seatingArea: 'terrace' | 'fireplace' | 'main_hall' | 'private_booth';
  specialRequests?: string;
  selectedTableId?: string;
  selectedTableName?: string;
}

export interface ConfirmedReservation extends ReservationRequest {
  confirmationCode: string;
  createdAt: string;
  tableNumber: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'interior' | 'dishes' | 'terrace' | 'desserts' | 'atmosphere';
  image: string;
  caption: string;
}

export interface OrderItem {
  item: MenuItem;
  quantity: number;
  notes?: string;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface OrderRecord {
  id: string;
  items: OrderItem[];
  total: number;
  subtotal?: number;
  tipAmount?: number;
  tipPercentage?: number | 'custom';
  orderType: 'dine_in' | 'room_service' | 'takeaway';
  guestName: string;
  guestPhone?: string;
  locationNote: string;
  status: OrderStatus;
  createdAt: string;
  formattedDate: string;
  estimatedTime: string;
  updatedAt?: string;
  statusHistory?: OrderStatusHistoryItem[];
  notes?: string;
  rating?: number;
  reviewComment?: string;
  reviewedAt?: string;
}


