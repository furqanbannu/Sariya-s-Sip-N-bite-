import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  ShoppingBag,
  Calendar,
  DollarSign,
  TrendingUp,
  Search,
  CheckCircle,
  Clock,
  Trash2,
  RefreshCw,
  Download,
  Upload,
  ChefHat,
  Filter,
  Phone,
  AlertCircle,
  FileJson,
  Check,
} from 'lucide-react';
import { OrderRecord, OrderStatus, ConfirmedReservation, MenuItem } from '../types/restaurant';
import {
  getStoredOrders,
  updateOrderStatus,
  deleteOrder,
  getStoredReservations,
  deleteReservation,
  getStoredMenu,
  updateMenuItem,
  exportEntireDatabase,
  importEntireDatabase,
  resetDatabaseToDefaults,
  DB_CHANGE_EVENT,
} from '../services/storageService';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'reservations' | 'menu' | 'analytics' | 'database'>('orders');
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [reservations, setReservations] = useState<ConfirmedReservation[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  
  // Filters & Search
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [reservationSearch, setReservationSearch] = useState('');
  const [menuSearch, setMenuSearch] = useState('');
  
  // Database backup/import state
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [copiedBackup, setCopiedBackup] = useState(false);

  // Sync data from database
  const refreshData = () => {
    setOrders(getStoredOrders());
    setReservations(getStoredReservations());
    setMenuItems(getStoredMenu());
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }

    const handleSync = () => {
      refreshData();
    };

    window.addEventListener(DB_CHANGE_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(DB_CHANGE_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Order Calculations
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    const matchesSearch =
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.guestName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.locationNote.toLowerCase().includes(orderSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalRevenue = orders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.total : sum), 0);
  const activeOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'preparing').length;

  // Reservation Calculations
  const filteredReservations = reservations.filter((r) => {
    return (
      r.fullName.toLowerCase().includes(reservationSearch.toLowerCase()) ||
      r.confirmationCode.toLowerCase().includes(reservationSearch.toLowerCase()) ||
      r.phone.toLowerCase().includes(reservationSearch.toLowerCase())
    );
  });

  // Menu Calculations
  const filteredMenu = menuItems.filter((m) => {
    return (
      m.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
      m.category.toLowerCase().includes(menuSearch.toLowerCase())
    );
  });

  // Handlers
  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    refreshData();
  };

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm(`Delete order ${orderId} from database?`)) {
      deleteOrder(orderId);
      refreshData();
    }
  };

  const handleDeleteReservation = (code: string) => {
    if (window.confirm(`Delete reservation ${code}?`)) {
      deleteReservation(code);
      refreshData();
    }
  };

  const handlePriceUpdate = (id: string, newPriceStr: string) => {
    const num = parseInt(newPriceStr, 10);
    if (!isNaN(num) && num > 0) {
      updateMenuItem(id, { price: num });
      refreshData();
    }
  };

  const handleCopyBackup = () => {
    const json = exportEntireDatabase();
    navigator.clipboard.writeText(json);
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2000);
  };

  const handleDownloadBackup = () => {
    const json = exportEntireDatabase();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sariyas_db_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyImport = () => {
    if (!importText.trim()) return;
    const ok = importEntireDatabase(importText);
    if (ok) {
      setImportStatus('Database successfully restored!');
      setImportText('');
      refreshData();
    } else {
      setImportStatus('Error: Invalid JSON format. Restore aborted.');
    }
    setTimeout(() => setImportStatus(null), 3000);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset database to clean default seed data? Current changes will be overwritten.')) {
      resetDatabaseToDefaults();
      refreshData();
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[#07080a]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-6xl w-full bg-[#101216] border border-[#262830] text-[#ede8e1] shadow-2xl my-4 flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Top Bar */}
        <div className="px-6 py-4 bg-[#0a0b0d] border-b border-[#1f2229] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1a1c22] border border-[#323642] flex items-center justify-center text-[#c5a880]">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-xl text-[#f3ede4] font-medium">
                  Sariya's Sip N Bite Management
                </h3>
                <span className="text-[11px] text-[#7fb385] flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7fb385] animate-pulse" />
                  Database Live
                </span>
              </div>
              <p className="text-[11px] text-[#8a857b]">
                Lucky Kabana Hotel · Mall Road Murree · Persistent Storage Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshData}
              className="p-2 text-[#8a857b] hover:text-[#ede8e1] hover:bg-[#1a1c22] transition-colors"
              title="Refresh Database"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#8a857b] hover:text-[#ede8e1] hover:bg-[#1a1c22] transition-colors"
              aria-label="Close Portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation (Buttons, Zero-Pill Discipline) */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-[#1f2229] bg-[#0d0e12] overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-[#c5a880] text-[#c5a880]'
                : 'border-transparent text-[#8a857b] hover:text-[#ede8e1]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Orders ({orders.length})</span>
            {activeOrdersCount > 0 && (
              <span className="text-[10px] font-mono font-bold bg-[#c5a880] text-[#0e0f12] px-1.5 py-0.2">
                {activeOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reservations')}
            className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'reservations'
                ? 'border-[#c5a880] text-[#c5a880]'
                : 'border-transparent text-[#8a857b] hover:text-[#ede8e1]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Table Reservations ({reservations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'menu'
                ? 'border-[#c5a880] text-[#c5a880]'
                : 'border-transparent text-[#8a857b] hover:text-[#ede8e1]'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Menu & Pricing ({menuItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'border-[#c5a880] text-[#c5a880]'
                : 'border-transparent text-[#8a857b] hover:text-[#ede8e1]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Analytics & Metrics</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'database'
                ? 'border-[#c5a880] text-[#c5a880]'
                : 'border-transparent text-[#8a857b] hover:text-[#ede8e1]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Strong Data Base (Backup & SQL)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-[#1f2229]">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-[#8a857b] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by order ID, guest, room #..."
                    className="w-full pl-9 pr-3 py-2 bg-[#14161a] border border-[#262830] text-xs text-[#ede8e1] focus:border-[#c5a880] focus:outline-none"
                  />
                </div>

                {/* Segmented Status Filter */}
                <div className="flex items-center gap-1 overflow-x-auto text-xs">
                  {(['all', 'pending', 'preparing', 'ready', 'delivered', 'cancelled'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-2.5 py-1.5 uppercase font-medium border ${
                        orderStatusFilter === st
                          ? 'border-[#c5a880] bg-[#c5a880] text-[#0e0f12] font-semibold'
                          : 'border-[#22252e] text-[#8a857b] hover:text-[#ede8e1]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <div className="py-16 text-center text-[#8a857b] text-xs">
                  No orders matching the selected filter.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 bg-[#14161a] border border-[#22252e] hover:border-[#383d4c] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* Left: Info */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-[#c5a880]">
                            {order.id}
                          </span>
                          <span className="text-xs uppercase text-[#ede8e1] font-semibold">
                            · {order.guestName}
                          </span>
                          {order.guestPhone && (
                            <span className="text-[11px] text-[#8a857b]">
                              ({order.guestPhone})
                            </span>
                          )}
                        </div>

                        {/* Metadata (Zero-Pill Discipline) */}
                        <div className="flex items-center gap-2 text-[11px] text-[#8a857b]">
                          <span className="uppercase text-[#d4cfc5]">{order.orderType.replace('_', ' ')}</span>
                          <span aria-hidden="true">·</span>
                          <span>{order.locationNote}</span>
                          <span aria-hidden="true">·</span>
                          <span>{order.formattedDate}</span>
                        </div>

                        {/* Items */}
                        <div className="text-xs text-[#a9a499] pt-1">
                          {order.items.map((i, idx) => (
                            <span key={idx} className="mr-3 inline-block">
                              {i.quantity}x {i.item.name}
                              {i.notes && <span className="italic text-[#7a766e]"> ({i.notes})</span>}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right: Total & Status controls */}
                      <div className="flex flex-wrap items-center gap-3 md:justify-end">
                        <div className="text-right">
                          <span className="font-mono text-base font-bold text-[#f3ede4] tabular-nums block">
                            Rs {order.total.toLocaleString()}
                          </span>
                          {(order.tipAmount ?? 0) > 0 && (
                            <span className="text-[10px] text-[#c5a880] block font-mono">
                              +Rs {order.tipAmount?.toLocaleString()} tip
                            </span>
                          )}
                          <span
                            className={`text-[11px] uppercase font-semibold ${
                              order.status === 'delivered'
                                ? 'text-[#7fb385]'
                                : order.status === 'preparing'
                                ? 'text-[#c5a880]'
                                : order.status === 'ready'
                                ? 'text-[#e5c378]'
                                : order.status === 'cancelled'
                                ? 'text-[#c96a6a]'
                                : 'text-[#8a857b]'
                            }`}
                          >
                            ● {order.status}
                          </span>
                        </div>

                        {/* Quick Status Action Buttons */}
                        <div className="flex items-center gap-1 text-[11px]">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'preparing')}
                              className="px-2.5 py-1 bg-[#1f2229] hover:bg-[#c5a880] text-[#ede8e1] hover:text-[#0e0f12] transition-colors"
                            >
                              Kitchen Prep
                            </button>
                          )}
                          {order.status === 'preparing' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'ready')}
                              className="px-2.5 py-1 bg-[#1f2229] hover:bg-[#c5a880] text-[#ede8e1] hover:text-[#0e0f12] transition-colors"
                            >
                              Ready
                            </button>
                          )}
                          {order.status === 'ready' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'delivered')}
                              className="px-2.5 py-1 bg-[#3e5f44] hover:bg-[#4f7856] text-[#ede8e1] transition-colors"
                            >
                              Delivered
                            </button>
                          )}
                          {order.status !== 'cancelled' && order.status !== 'delivered' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'cancelled')}
                              className="px-2 py-1 bg-[#251717] text-[#c96a6a] hover:bg-[#3d1f1f]"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-1.5 text-[#6e6a62] hover:text-[#c96a6a]"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RESERVATIONS */}
          {activeTab === 'reservations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-[#1f2229]">
                <div className="relative w-72">
                  <Search className="w-4 h-4 text-[#8a857b] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={reservationSearch}
                    onChange={(e) => setReservationSearch(e.target.value)}
                    placeholder="Search by name, phone, code..."
                    className="w-full pl-9 pr-3 py-2 bg-[#14161a] border border-[#262830] text-xs text-[#ede8e1] focus:border-[#c5a880] focus:outline-none"
                  />
                </div>
                <div className="text-xs text-[#8a857b]">
                  Total Bookings: <span className="text-[#ede8e1] font-semibold">{reservations.length}</span>
                </div>
              </div>

              {filteredReservations.length === 0 ? (
                <div className="py-16 text-center text-[#8a857b] text-xs">
                  No table reservations found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredReservations.map((res) => (
                    <div
                      key={res.confirmationCode}
                      className="p-4 bg-[#14161a] border border-[#22252e] hover:border-[#3a3f50] transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <span className="font-mono text-xs font-bold text-[#c5a880]">
                              {res.confirmationCode}
                            </span>
                            <h4 className="text-sm font-semibold text-[#f3ede4] mt-0.5">
                              {res.fullName}
                            </h4>
                          </div>
                          <span className="text-xs font-medium text-[#c5a880] bg-[#1a1c22] px-2 py-0.5">
                            {res.tableNumber}
                          </span>
                        </div>

                        {/* Unboxed Metadata */}
                        <div className="text-xs text-[#8a857b] space-y-1 mb-3">
                          <p>
                            <span className="text-[#d4cfc5]">{res.date}</span> at{' '}
                            <span className="text-[#d4cfc5]">{res.time}</span> · {res.guests} Guests
                          </p>
                          <p>Phone: {res.phone} {res.email && `· ${res.email}`}</p>
                          <p>Area: <span className="uppercase text-[#c5a880]">{res.seatingArea}</span></p>
                        </div>

                        {res.specialRequests && (
                          <div className="p-2.5 bg-[#0e0f12] border border-[#1f2229] text-[11px] text-[#9a9488] italic mb-3">
                            "{res.specialRequests}"
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-[#1f2229] flex items-center justify-between text-xs">
                        <a
                          href={`tel:${res.phone}`}
                          className="text-[#c5a880] hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call Guest</span>
                        </a>

                        <button
                          onClick={() => handleDeleteReservation(res.confirmationCode)}
                          className="text-[#8a857b] hover:text-[#c96a6a] text-[11px]"
                        >
                          Cancel / Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MENU & PRICING */}
          {activeTab === 'menu' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-[#1f2229]">
                <div className="relative w-72">
                  <Search className="w-4 h-4 text-[#8a857b] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    placeholder="Search menu items..."
                    className="w-full pl-9 pr-3 py-2 bg-[#14161a] border border-[#262830] text-xs text-[#ede8e1] focus:border-[#c5a880] focus:outline-none"
                  />
                </div>
                <div className="text-xs text-[#8a857b]">
                  Showing {filteredMenu.length} dishes in database
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredMenu.map((dish) => (
                  <div
                    key={dish.id}
                    className="p-3.5 bg-[#14161a] border border-[#22252e] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-xs font-semibold text-[#f3ede4]">
                          {dish.name}
                        </h4>
                        <span className="text-[10px] uppercase font-mono text-[#8a857b]">
                          {dish.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8a857b] line-clamp-2 mb-3">
                        {dish.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#1f2229] flex items-center justify-between gap-2">
                      <span className="text-xs text-[#8a857b]">Price (PKR):</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-[#c5a880]">Rs</span>
                        <input
                          type="number"
                          defaultValue={dish.price}
                          onBlur={(e) => handlePriceUpdate(dish.id, e.target.value)}
                          className="w-20 px-2 py-1 bg-[#0e0f12] border border-[#282b35] text-xs font-mono text-right text-[#ede8e1] focus:border-[#c5a880] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ANALYTICS & METRICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Top Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-[#14161a] border border-[#22252e]">
                  <p className="text-[11px] uppercase tracking-wider text-[#8a857b]">
                    Gross Orders Revenue
                  </p>
                  <p className="text-2xl font-bold font-mono text-[#c5a880] mt-1 tabular-nums">
                    Rs {totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-[#7fb385] mt-1">Excludes cancelled</p>
                </div>

                <div className="p-4 bg-[#14161a] border border-[#22252e]">
                  <p className="text-[11px] uppercase tracking-wider text-[#8a857b]">
                    Total Orders Logged
                  </p>
                  <p className="text-2xl font-bold font-mono text-[#ede8e1] mt-1 tabular-nums">
                    {orders.length}
                  </p>
                  <p className="text-[10px] text-[#8a857b] mt-1">{activeOrdersCount} in kitchen</p>
                </div>

                <div className="p-4 bg-[#14161a] border border-[#22252e]">
                  <p className="text-[11px] uppercase tracking-wider text-[#8a857b]">
                    Avg Order Value (AOV)
                  </p>
                  <p className="text-2xl font-bold font-mono text-[#ede8e1] mt-1 tabular-nums">
                    Rs {orders.length > 0 ? Math.round(totalRevenue / Math.max(1, orders.length)).toLocaleString() : 0}
                  </p>
                  <p className="text-[10px] text-[#8a857b] mt-1">Per transaction</p>
                </div>

                <div className="p-4 bg-[#14161a] border border-[#22252e]">
                  <p className="text-[11px] uppercase tracking-wider text-[#8a857b]">
                    Table Bookings
                  </p>
                  <p className="text-2xl font-bold font-mono text-[#c5a880] mt-1 tabular-nums">
                    {reservations.length}
                  </p>
                  <p className="text-[10px] text-[#8a857b] mt-1">
                    {reservations.reduce((s, r) => s + r.guests, 0)} Expected Guests
                  </p>
                </div>
              </div>

              {/* Service Channel Distribution */}
              <div className="p-6 bg-[#14161a] border border-[#22252e]">
                <h4 className="font-display text-lg text-[#f3ede4] mb-3">
                  Service Channel Volume
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-[#0e0f12] border border-[#1f2229]">
                    <span className="text-[#8a857b] block">Dine-In Restaurant</span>
                    <span className="font-mono text-lg font-bold text-[#ede8e1] mt-0.5 block">
                      {orders.filter((o) => o.orderType === 'dine_in').length} Orders
                    </span>
                  </div>
                  <div className="p-3 bg-[#0e0f12] border border-[#1f2229]">
                    <span className="text-[#8a857b] block">Lucky Kabana Room Service</span>
                    <span className="font-mono text-lg font-bold text-[#ede8e1] mt-0.5 block">
                      {orders.filter((o) => o.orderType === 'room_service').length} Orders
                    </span>
                  </div>
                  <div className="p-3 bg-[#0e0f12] border border-[#1f2229]">
                    <span className="text-[#8a857b] block">Mall Road Takeaway</span>
                    <span className="font-mono text-lg font-bold text-[#ede8e1] mt-0.5 block">
                      {orders.filter((o) => o.orderType === 'takeaway').length} Orders
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: STRONG DATA BASE (BACKUP, RESTORE, HEALTH) */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              {/* Database Overview Card */}
              <div className="p-6 bg-[#14161a] border border-[#22252e] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="w-5 h-5 text-[#c5a880]" />
                    <h4 className="font-display text-xl text-[#f3ede4]">
                      Strong Storage Engine
                    </h4>
                  </div>
                  <p className="text-xs text-[#8a857b] max-w-xl">
                    High-resilience client storage subsystem with structured JSON collections for Orders, Reservations, and Dynamic Menu Overrides. Persists across browser restarts and offline usage.
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[#a9a499] mt-3">
                    <span>{orders.length} Orders</span>
                    <span aria-hidden="true">·</span>
                    <span>{reservations.length} Reservations</span>
                    <span aria-hidden="true">·</span>
                    <span>{menuItems.length} Dishes</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleCopyBackup}
                    className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-[#1f222a] hover:bg-[#c5a880] text-[#ede8e1] hover:text-[#0e0f12] transition-colors border border-[#2b2e38] flex items-center gap-1.5"
                  >
                    {copiedBackup ? <Check className="w-3.5 h-3.5" /> : <FileJson className="w-3.5 h-3.5" />}
                    <span>{copiedBackup ? 'Copied JSON!' : 'Copy JSON'}</span>
                  </button>

                  <button
                    onClick={handleDownloadBackup}
                    className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-[#c5a880] text-[#0e0f12] hover:bg-[#d8ba91] transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Backup</span>
                  </button>
                </div>
              </div>

              {/* Import / Restore Database */}
              <div className="p-6 bg-[#14161a] border border-[#22252e]">
                <h4 className="font-display text-lg text-[#f3ede4] mb-2">
                  Database Restore & Migration
                </h4>
                <p className="text-xs text-[#8a857b] mb-4">
                  Paste a valid database JSON export to immediately restore all order archives, reservations, and pricing records.
                </p>

                {importStatus && (
                  <div className="p-3 mb-3 text-xs font-mono bg-[#0e0f12] border border-[#c5a880] text-[#c5a880]">
                    {importStatus}
                  </div>
                )}

                <textarea
                  rows={4}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Paste database JSON payload here..."
                  className="w-full p-3 bg-[#0e0f12] border border-[#282b35] text-xs font-mono text-[#ede8e1] focus:border-[#c5a880] focus:outline-none mb-3 resize-none"
                />

                <div className="flex items-center justify-between">
                  <button
                    onClick={handleResetDefaults}
                    className="text-xs uppercase tracking-wider text-[#8a857b] hover:text-[#c96a6a] transition-colors"
                  >
                    Reset to Factory Seed Data
                  </button>

                  <button
                    onClick={handleApplyImport}
                    disabled={!importText.trim()}
                    className="px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-[#1f222a] hover:bg-[#c5a880] text-[#ede8e1] hover:text-[#0e0f12] disabled:opacity-40 transition-colors"
                  >
                    Apply Database Import
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
