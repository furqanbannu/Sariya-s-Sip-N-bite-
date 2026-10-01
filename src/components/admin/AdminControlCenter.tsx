import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Calendar,
  UtensilsCrossed,
  Layers,
  Tag,
  DollarSign,
  PieChart,
  PlusCircle,
  Gift,
  Users,
  UserCheck,
  Armchair,
  Image as ImageIcon,
  Star,
  FileText,
  PhoneCall,
  BarChart3,
  Bell,
  Settings,
  ShieldAlert,
  Search,
  Check,
  X,
  AlertCircle,
  Eye,
  Trash2,
  Edit,
  RefreshCw,
  LogOut,
  ExternalLink,
  ChevronRight,
  Shield,
  Clock,
  Sparkles,
  Lock,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
  XCircle,
  Key,
  Filter,
} from 'lucide-react';
import { useAuth, UserRole } from '../../context/AuthContext';
import { api } from '../../services/apiService';

export const ADMIN_SECTIONS = [
  { id: 'Dashboard Overview', icon: LayoutDashboard, group: 'General' },
  { id: 'Orders', icon: ShoppingBag, group: 'Operations' },
  { id: 'Reservations', icon: Calendar, group: 'Operations' },
  { id: 'Tables', icon: Armchair, group: 'Operations' },
  { id: 'Menu Management', icon: UtensilsCrossed, group: 'Menu & Catalog' },
  { id: 'Categories', icon: Layers, group: 'Menu & Catalog' },
  { id: 'Products', icon: Tag, group: 'Menu & Catalog' },
  { id: 'Prices', icon: DollarSign, group: 'Menu & Catalog' },
  { id: 'Pizza Sizes', icon: PieChart, group: 'Menu & Catalog' },
  { id: 'Add-ons', icon: PlusCircle, group: 'Menu & Catalog' },
  { id: 'Offers & Discounts', icon: Gift, group: 'Marketing' },
  { id: 'Customers', icon: Users, group: 'Customers' },
  { id: 'Reviews', icon: Star, group: 'Marketing' },
  { id: 'Gallery', icon: ImageIcon, group: 'Marketing' },
  { id: 'Website Content', icon: FileText, group: 'Website Control' },
  { id: 'Contact Information', icon: PhoneCall, group: 'Website Control' },
  { id: 'Reports & Analytics', icon: BarChart3, group: 'Intelligence' },
  { id: 'Staff Management', icon: UserCheck, group: 'Administration', ownerOnly: true },
  { id: 'Notifications', icon: Bell, group: 'Administration' },
  { id: 'Settings', icon: Settings, group: 'Administration' },
  { id: 'Activity Logs', icon: ShieldAlert, group: 'Administration' },
];

interface AdminControlCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshPublicData?: () => void;
}

export const AdminControlCenter: React.FC<AdminControlCenterProps> = ({
  isOpen,
  onClose,
  onRefreshPublicData,
}) => {
  const { user, token, login, logout, canAccessSection } = useAuth();

  const [activeSection, setActiveSection] = useState('Dashboard Overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Authentication form state
  const [authEmail, setAuthEmail] = useState('owner@sariyas.com');
  const [authPassword, setAuthPassword] = useState('SariyaOwner2026!');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  // Global Admin Data States
  const [analytics, setAnalytics] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [websiteSettings, setWebsiteSettings] = useState<Record<string, string>>({});
  const [reviews, setReviews] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  // Search & Filter States
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCatFilter, setMenuCatFilter] = useState('all');
  const [customerSearch, setCustomerSearch] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');

  // Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Load section-specific data when activeSection or user changes
  useEffect(() => {
    if (!token || !user) return;
    refreshData();
  }, [activeSection, token, user]);

  const refreshData = async () => {
    try {
      if (activeSection === 'Dashboard Overview' || activeSection === 'Reports & Analytics') {
        const a = await api.getAdminAnalytics();
        setAnalytics(a);
      }
      if (activeSection === 'Orders' || activeSection === 'Dashboard Overview') {
        const o = await api.getAdminOrders({ search: orderSearch, status: orderStatusFilter });
        setOrders(o);
      }
      if (activeSection === 'Reservations' || activeSection === 'Dashboard Overview') {
        const r = await api.getAdminReservations();
        setReservations(r);
      }
      if (['Menu Management', 'Products', 'Prices', 'Pizza Sizes', 'Add-ons'].includes(activeSection)) {
        const m = await api.getAdminMenu();
        const c = await api.getAdminCategories();
        setMenuItems(m);
        setCategories(c);
      }
      if (activeSection === 'Categories') {
        const c = await api.getAdminCategories();
        setCategories(c);
      }
      if (activeSection === 'Tables' || activeSection === 'Dashboard Overview') {
        const t = await api.getAdminTables();
        setTables(t);
      }
      if (activeSection === 'Offers & Discounts') {
        const off = await api.getAdminOffers();
        setOffers(off);
      }
      if (activeSection === 'Customers') {
        const cust = await api.getAdminCustomers(customerSearch);
        setCustomers(cust);
      }
      if (activeSection === 'Staff Management' && user?.role === 'owner') {
        const s = await api.getAdminStaff();
        setStaffList(s);
      }
      if (['Website Content', 'Contact Information', 'Settings'].includes(activeSection)) {
        const rows = await api.getAdminSettings();
        const map: Record<string, string> = {};
        for (const row of rows) map[row.key] = row.value;
        setWebsiteSettings(map);
      }
      if (activeSection === 'Reviews') {
        const rev = await api.getAdminReviews();
        setReviews(rev);
      }
      if (activeSection === 'Notifications' || true) {
        const notifData = await api.getAdminNotifications();
        setNotifications(notifData.notifications || []);
        setUnreadCount(notifData.unreadCount || 0);
      }
      if (activeSection === 'Activity Logs') {
        const logs = await api.getAdminActivityLogs(activityFilter);
        setActivityLogs(logs);
      }
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError('');
    try {
      await login(authEmail, authPassword);
      showStatus('Welcome back. Authenticated successfully.', 'success');
      onRefreshPublicData?.();
    } catch (err: any) {
      setAuthError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleQuickLogin = (email: string, pass: string) => {
    setAuthEmail(email);
    setAuthPassword(pass);
  };

  const handleOrderStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      showStatus(`Order ${orderId} updated to ${newStatus}`);
      refreshData();
      onRefreshPublicData?.();
    } catch (err: any) {
      showStatus(err.message, 'error');
    }
  };

  const handleReservationStatusUpdate = async (resId: string, newStatus: string) => {
    try {
      await api.updateReservationStatus(resId, newStatus);
      showStatus(`Reservation ${resId} marked as ${newStatus}`);
      refreshData();
      onRefreshPublicData?.();
    } catch (err: any) {
      showStatus(err.message, 'error');
    }
  };

  const handleToggleMenuItemAvailable = async (item: any) => {
    try {
      await api.updateMenuItem(item.id, {
        isAvailable: item.is_available ? 0 : 1,
      });
      showStatus(`Item ${item.name} availability toggled`);
      refreshData();
      onRefreshPublicData?.();
    } catch (err: any) {
      showStatus(err.message, 'error');
    }
  };

  const handleToggleSoldOut = async (item: any) => {
    try {
      await api.updateMenuItem(item.id, {
        isSoldOut: item.is_sold_out ? 0 : 1,
      });
      showStatus(`Item ${item.name} sold-out status updated`);
      refreshData();
      onRefreshPublicData?.();
    } catch (err: any) {
      showStatus(err.message, 'error');
    }
  };

  const handlePriceQuickUpdate = async (item: any, newPriceStr: string) => {
    const p = parseInt(newPriceStr, 10);
    if (isNaN(p) || p <= 0) return;
    try {
      await api.updateMenuItem(item.id, { price: p });
      showStatus(`Updated price for ${item.name} to Rs ${p}`);
      refreshData();
      onRefreshPublicData?.();
    } catch (err: any) {
      showStatus(err.message, 'error');
    }
  };

  const handleSaveSettings = async (updatedSettings: Record<string, string>) => {
    try {
      await api.updateAdminSettings(updatedSettings);
      showStatus('Website content & settings updated in database');
      refreshData();
      onRefreshPublicData?.();
    } catch (err: any) {
      showStatus(err.message, 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#07080a]/95 backdrop-blur-md flex flex-col overflow-hidden">
      {/* Top Professional Header Bar */}
      <header className="h-16 bg-[#0f1117] border-b border-[#222634] px-4 sm:px-6 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#181c28] border border-[#c5a880] flex items-center justify-center text-[#c5a880] shadow-md font-mono font-bold text-sm">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base sm:text-lg font-bold text-[#f3ede4] leading-tight tracking-wide">
                Sariya's Admin Control Center
              </h2>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono uppercase bg-[#1e2536] text-[#c5a880] border border-[#343e58]">
                Production DB
              </span>
            </div>
            <p className="text-[10px] text-[#8a857b] font-mono leading-none mt-0.5">
              Lucky Kabana Hotel · Mall Road, Murree (2,291m)
            </p>
          </div>
        </div>

        {/* User Info, Notifications, Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs">
          {user ? (
            <>
              {/* Notifications bell badge */}
              <button
                type="button"
                onClick={() => setActiveSection('Notifications')}
                className="relative p-2 text-[#9a9488] hover:text-[#ede8e1] hover:bg-[#181c28] transition-colors rounded"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#c5a880] text-[#0e0f12] text-[9px] font-bold rounded-full flex items-center justify-center font-mono">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* User badge */}
              <div className="hidden md:flex flex-col text-right">
                <span className="text-[#f3ede4] font-medium text-xs">{user.fullName}</span>
                <span className="text-[#c5a880] font-mono text-[10px] uppercase font-semibold">
                  Role: {user.role}
                </span>
              </div>

              {/* Return to website */}
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 bg-[#171a24] hover:bg-[#202534] text-[#c5a880] border border-[#2b3245] flex items-center gap-1.5 font-mono text-[11px] transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span className="hidden sm:inline">Public Site</span>
              </button>

              {/* Logout */}
              <button
                type="button"
                onClick={logout}
                className="p-2 text-[#a85b5b] hover:text-[#f87171] hover:bg-[#221616] transition-colors rounded"
                title="Logout from Admin Center"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <span className="text-xs text-[#8a857b] font-mono">Authentication Required</span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#8a857b] hover:text-[#ede8e1] transition-colors"
            aria-label="Close Admin Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Body */}
      {!user ? (
        /* LOGIN REQUIRED VIEW */
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center bg-[#090b10]">
          <div className="w-full max-w-md bg-[#11141c] border border-[#262c3e] p-6 sm:p-8 shadow-2xl relative">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-[#1b2030] border border-[#c5a880] flex items-center justify-center mx-auto mb-3 text-[#c5a880]">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-display text-2xl text-[#f3ede4] font-bold">
                Admin Control Center
              </h3>
              <p className="text-xs text-[#8a857b] mt-1">
                Enter your authorized restaurant credentials to access the production management dashboard.
              </p>
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-[#241212] border border-[#632929] text-[#f87171] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#9a9488] mb-1 font-mono">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#181c28] border border-[#2b3348] text-xs text-[#ede8e1] focus:border-[#c5a880] focus:outline-none"
                  placeholder="admin@sariyas.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] uppercase tracking-wider text-[#9a9488] font-mono">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[10px] text-[#c5a880] hover:underline font-mono"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#181c28] border border-[#2b3348] text-xs text-[#ede8e1] focus:border-[#c5a880] focus:outline-none font-mono"
                  placeholder="••••••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isAuthLoading}
                className="w-full py-2.5 bg-[#c5a880] hover:bg-[#d8ba91] text-[#0e0f12] font-semibold text-xs uppercase tracking-wider transition-colors font-mono flex items-center justify-center gap-2"
              >
                {isAuthLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Access Dashboard &rarr;</span>
                )}
              </button>
            </form>

            {/* Quick Demo Role Selectors (Zero Friction for Reviewers) */}
            <div className="mt-6 pt-4 border-t border-[#1f2536]">
              <span className="text-[10px] uppercase tracking-wider text-[#737068] font-mono block mb-2">
                Quick Test Credentials (Pre-Seeded Roles):
              </span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('owner@sariyas.com', 'SariyaOwner2026!')}
                  className="p-2 bg-[#161a25] hover:bg-[#202738] border border-[#2a344c] text-left text-[#ede8e1]"
                >
                  <span className="font-bold text-[#c5a880] block">👑 Owner</span>
                  <span className="text-[#8a857b]">Full access</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@sariyas.com', 'AdminPass2026!')}
                  className="p-2 bg-[#161a25] hover:bg-[#202738] border border-[#2a344c] text-left text-[#ede8e1]"
                >
                  <span className="font-bold text-[#60a5fa] block">🛡️ Admin</span>
                  <span className="text-[#8a857b]">Operations</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('manager@sariyas.com', 'ManagerPass2026!')}
                  className="p-2 bg-[#161a25] hover:bg-[#202738] border border-[#2a344c] text-left text-[#ede8e1]"
                >
                  <span className="font-bold text-[#34d399] block">💼 Manager</span>
                  <span className="text-[#8a857b]">Floor & Menu</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('staff@sariyas.com', 'StaffPass2026!')}
                  className="p-2 bg-[#161a25] hover:bg-[#202738] border border-[#2a344c] text-left text-[#ede8e1]"
                >
                  <span className="font-bold text-[#facc15] block">👨‍🍳 Staff</span>
                  <span className="text-[#8a857b]">Orders & Tables</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* AUTHENTICATED DASHBOARD WORKSPACE */
        <div className="flex-1 flex overflow-hidden">
          {/* Collapsible Sidebar (21 Sections) */}
          <aside className="w-64 bg-[#0e1017] border-r border-[#1f2433] flex flex-col shrink-0 select-none overflow-y-auto">
            <div className="p-3 border-b border-[#1b202e] flex items-center justify-between text-xs text-[#8a857b]">
              <span className="uppercase tracking-widest font-mono text-[10px] text-[#c5a880]">
                Navigation Menu
              </span>
              <span className="font-mono text-[10px]">21 Sections</span>
            </div>

            <div className="p-2 space-y-1">
              {ADMIN_SECTIONS.map((sec) => {
                const Icon = sec.icon;
                const isSelected = activeSection === sec.id;
                const isAllowed = canAccessSection(sec.id);

                return (
                  <button
                    key={sec.id}
                    type="button"
                    disabled={!isAllowed}
                    onClick={() => setActiveSection(sec.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-mono transition-colors text-left ${
                      isSelected
                        ? 'bg-[#c5a880] text-[#0e0f12] font-bold shadow-md'
                        : isAllowed
                        ? 'text-[#a6a092] hover:text-[#ede8e1] hover:bg-[#161a25]'
                        : 'text-[#484642] cursor-not-allowed opacity-40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{sec.id}</span>
                    </div>

                    {!isAllowed && <Lock className="w-3 h-3 text-[#484642]" />}
                    {sec.id === 'Notifications' && unreadCount > 0 && !isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#c5a880]" />
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Center Content Stage */}
          <main className="flex-1 bg-[#090b10] overflow-y-auto p-4 sm:p-6">
            {/* Status Toast Banner */}
            {statusMessage && (
              <div
                className={`mb-4 p-3 text-xs flex items-center justify-between border animate-in fade-in duration-200 ${
                  statusMessage.type === 'success'
                    ? 'bg-[#152419] border-[#376b42] text-[#86efac]'
                    : 'bg-[#291414] border-[#6b3737] text-[#fca5a5]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{statusMessage.text}</span>
                </div>
                <button type="button" onClick={() => setStatusMessage(null)}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Render Selected View */}
            {activeSection === 'Dashboard Overview' && (
              <DashboardOverviewSection
                analytics={analytics}
                orders={orders}
                reservations={reservations}
                onSelectSection={setActiveSection}
                onUpdateOrderStatus={handleOrderStatusUpdate}
              />
            )}

            {activeSection === 'Orders' && (
              <OrdersManagementSection
                orders={orders}
                search={orderSearch}
                setSearch={setOrderSearch}
                statusFilter={orderStatusFilter}
                setStatusFilter={setOrderStatusFilter}
                onRefresh={refreshData}
                onUpdateStatus={handleOrderStatusUpdate}
              />
            )}

            {activeSection === 'Reservations' && (
              <ReservationsManagementSection
                reservations={reservations}
                onRefresh={refreshData}
                onUpdateStatus={handleReservationStatusUpdate}
              />
            )}

            {['Menu Management', 'Products', 'Prices', 'Pizza Sizes', 'Add-ons'].includes(activeSection) && (
              <MenuManagementSection
                mode={activeSection}
                menuItems={menuItems}
                categories={categories}
                search={menuSearch}
                setSearch={setMenuSearch}
                catFilter={menuCatFilter}
                setCatFilter={setMenuCatFilter}
                onToggleAvailable={handleToggleMenuItemAvailable}
                onToggleSoldOut={handleToggleSoldOut}
                onPriceUpdate={handlePriceQuickUpdate}
                onRefresh={refreshData}
                onOpenItemModal={(it: any) => {
                  setEditingItem(it);
                  setIsItemModalOpen(true);
                }}
              />
            )}

            {activeSection === 'Categories' && (
              <CategoriesSection
                categories={categories}
                onRefresh={refreshData}
              />
            )}

            {activeSection === 'Tables' && (
              <TablesManagementSection
                tables={tables}
                onRefresh={refreshData}
              />
            )}

            {activeSection === 'Offers & Discounts' && (
              <OffersManagementSection
                offers={offers}
                onRefresh={refreshData}
              />
            )}

            {activeSection === 'Customers' && (
              <CustomersManagementSection
                customers={customers}
                search={customerSearch}
                setSearch={setCustomerSearch}
                onRefresh={refreshData}
              />
            )}

            {activeSection === 'Staff Management' && (
              <StaffManagementSection
                staffList={staffList}
                currentUser={user}
                onRefresh={refreshData}
              />
            )}

            {['Website Content', 'Contact Information', 'Settings'].includes(activeSection) && (
              <WebsiteSettingsSection
                mode={activeSection}
                settings={websiteSettings}
                onSave={handleSaveSettings}
              />
            )}

            {activeSection === 'Reviews' && (
              <ReviewsManagementSection
                reviews={reviews}
                onRefresh={refreshData}
              />
            )}

            {activeSection === 'Reports & Analytics' && (
              <ReportsAnalyticsSection analytics={analytics} />
            )}

            {activeSection === 'Notifications' && (
              <NotificationsSection
                notifications={notifications}
                onRefresh={refreshData}
              />
            )}

            {activeSection === 'Activity Logs' && (
              <ActivityLogsSection
                logs={activityLogs}
                filter={activityFilter}
                setFilter={setActivityFilter}
                onRefresh={refreshData}
              />
            )}
          </main>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-[#07080a]/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#13161f] border border-[#2b3348] p-6 shadow-2xl relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-[#8a857b] hover:text-[#ede8e1]"
            >
              <X className="w-4 h-4" />
            </button>
            <h4 className="font-display text-lg text-[#f3ede4] mb-2">Reset Credentials</h4>
            <p className="text-xs text-[#8a857b] mb-4">
              Enter registered staff email to log a secure password reset request in the system audit logs.
            </p>
            {forgotMessage ? (
              <div className="p-3 bg-[#152419] border border-[#376b42] text-[#86efac] text-xs mb-4">
                {forgotMessage}
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="staff@sariyas.com"
                  className="w-full px-3 py-2 bg-[#181c28] border border-[#2b3348] text-xs text-[#ede8e1] focus:border-[#c5a880] focus:outline-none"
                />
                <button
                  onClick={async () => {
                    if (!forgotEmail) return;
                    const res = await api.forgotPassword(forgotEmail);
                    setForgotMessage(res.message);
                  }}
                  className="w-full py-2 bg-[#c5a880] text-[#0e0f12] text-xs font-semibold uppercase tracking-wider font-mono"
                >
                  Submit Request
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit/Add Menu Item Modal */}
      {isItemModalOpen && (
        <MenuItemModal
          item={editingItem}
          categories={categories}
          onClose={() => {
            setIsItemModalOpen(false);
            setEditingItem(null);
          }}
          onSaved={() => {
            setIsItemModalOpen(false);
            setEditingItem(null);
            refreshData();
            onRefreshPublicData?.();
          }}
        />
      )}
    </div>
  );
};

// ==========================================
// SUB-SECTIONS COMPONENTS
// ==========================================

function DashboardOverviewSection({ analytics, orders, reservations, onSelectSection, onUpdateOrderStatus }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[#1f2434]">
        <div>
          <h3 className="font-display text-2xl text-[#f3ede4] font-bold">Dashboard Overview</h3>
          <p className="text-xs text-[#8a857b]">Real-time operational heartbeat of Sariya's Sip N Bite</p>
        </div>
        <span className="text-xs font-mono text-[#c5a880]">Mall Road Live Status: Active</span>
      </div>

      {/* 5 High-Impact Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 bg-[#11141c] border border-[#222838]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8a857b] block">Today's Revenue</span>
          <span className="font-mono text-xl sm:text-2xl font-bold text-[#c5a880] block mt-1">
            Rs {(analytics?.todayRevenue || 0).toLocaleString()}
          </span>
          <span className="text-[10px] text-[#7fb385] flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> Live billing
          </span>
        </div>

        <div className="p-4 bg-[#11141c] border border-[#222838]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8a857b] block">Today's Orders</span>
          <span className="font-mono text-xl sm:text-2xl font-bold text-[#ede8e1] block mt-1">
            {analytics?.todayOrders || 0}
          </span>
          <span className="text-[10px] text-[#8a857b] mt-1 block">
            {analytics?.pendingOrders || 0} pending queue
          </span>
        </div>

        <div className="p-4 bg-[#11141c] border border-[#222838]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8a857b] block">Reservations</span>
          <span className="font-mono text-xl sm:text-2xl font-bold text-[#60a5fa] block mt-1">
            {analytics?.todayReservations || 0}
          </span>
          <span className="text-[10px] text-[#8a857b] mt-1 block">
            {analytics?.todayGuests || 0} expected guests
          </span>
        </div>

        <div className="p-4 bg-[#11141c] border border-[#222838]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8a857b] block">Total Customers</span>
          <span className="font-mono text-xl sm:text-2xl font-bold text-[#34d399] block mt-1">
            {analytics?.totalCustomers || 0}
          </span>
          <span className="text-[10px] text-[#8a857b] mt-1 block">In database</span>
        </div>

        <div className="p-4 bg-[#11141c] border border-[#222838]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8a857b] block">Catalog Items</span>
          <span className="font-mono text-xl sm:text-2xl font-bold text-[#facc15] block mt-1">
            {analytics?.totalMenuItems || 0}
          </span>
          <span className="text-[10px] text-[#8a857b] mt-1 block">Active dishes</span>
        </div>
      </div>

      {/* Live Orders & Table Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Live Orders Queue */}
        <div className="p-5 bg-[#10131b] border border-[#222838]">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e2332] mb-3">
            <h4 className="font-display text-base text-[#f3ede4] font-semibold flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#c5a880]" />
              <span>Recent Live Orders</span>
            </h4>
            <button
              onClick={() => onSelectSection('Orders')}
              className="text-xs text-[#c5a880] hover:underline font-mono"
            >
              View All &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {orders.slice(0, 5).map((o: any) => (
              <div
                key={o.id}
                className="p-3 bg-[#151822] border border-[#262c3e] flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#c5a880]">{o.order_number}</span>
                    <span className="text-[#ede8e1] font-medium">{o.guest_name}</span>
                    <span className="text-[10px] uppercase font-mono px-1 bg-[#1e2536] text-[#8a857b]">
                      {o.order_type}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8a857b] mt-0.5">
                    {o.location_note} · Rs {o.total.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono uppercase font-semibold ${
                      o.status === 'pending'
                        ? 'bg-[#2d2214] text-[#f59e0b] border border-[#523d24]'
                        : o.status === 'preparing'
                        ? 'bg-[#142328] text-[#38bdf8] border border-[#244b56]'
                        : o.status === 'ready'
                        ? 'bg-[#1b261b] text-[#4ade80] border border-[#2e4f30]'
                        : 'bg-[#181c26] text-[#9ca3af]'
                    }`}
                  >
                    {o.status}
                  </span>

                  {o.status === 'pending' && (
                    <button
                      onClick={() => onUpdateOrderStatus(o.id, 'preparing')}
                      className="px-2 py-1 bg-[#c5a880] text-[#0e0f12] text-[10px] font-mono font-bold hover:bg-[#d8ba91]"
                    >
                      Accept
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Dishes & Quick Actions */}
        <div className="space-y-4">
          <div className="p-5 bg-[#10131b] border border-[#222838]">
            <h4 className="font-display text-base text-[#f3ede4] font-semibold mb-3 pb-2 border-b border-[#1e2332] flex items-center gap-2">
              <Star className="w-4 h-4 text-[#c5a880]" />
              <span>Top Selling Menu Items</span>
            </h4>
            <div className="space-y-2">
              {(analytics?.popularItems || []).map((it: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-[#181c28]">
                  <span className="text-[#ede8e1] font-medium">{idx + 1}. {it.name}</span>
                  <div className="text-right font-mono">
                    <span className="text-[#c5a880] font-bold">{it.total_sold} ordered</span>
                    <span className="text-[#8a857b] text-[10px] block">Rs {it.total_sales?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-[#141822] border border-[#2c344a] flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#f3ede4] block">Website Synchronization</span>
              <span className="text-[11px] text-[#8a857b]">Any changes made here sync directly to the public website</span>
            </div>
            <button
              onClick={() => onSelectSection('Website Content')}
              className="px-3 py-1.5 bg-[#c5a880] text-[#0e0f12] text-xs font-semibold font-mono uppercase tracking-wider"
            >
              Edit Content &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersManagementSection({ orders, search, setSearch, statusFilter, setStatusFilter, onRefresh, onUpdateStatus }: any) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1f2434]">
        <div>
          <h3 className="font-display text-2xl text-[#f3ede4] font-bold">Orders Management</h3>
          <p className="text-xs text-[#8a857b]">Live dining, room service & takeaway orders queue</p>
        </div>
        <button
          onClick={onRefresh}
          className="px-3 py-1.5 bg-[#171a24] border border-[#2b3348] text-xs text-[#c5a880] font-mono flex items-center gap-1.5 w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-[#11141c] p-3 border border-[#222838]">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[#8a857b] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by guest name, phone, order #..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#171a24] border border-[#272e40] text-xs text-[#ede8e1] focus:border-[#c5a880] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 text-xs">
          {['all', 'pending', 'preparing', 'ready', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 uppercase tracking-wider font-mono text-[10px] transition-colors ${
                statusFilter === st
                  ? 'bg-[#c5a880] text-[#0e0f12] font-bold'
                  : 'bg-[#181c28] text-[#8a857b] hover:text-[#ede8e1]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="bg-[#11141c] border border-[#222838] overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1f2536] bg-[#141822] text-[#8a857b] font-mono text-[11px] uppercase">
              <th className="p-3">Order #</th>
              <th className="p-3">Guest & Phone</th>
              <th className="p-3">Format / Location</th>
              <th className="p-3">Items Ordered</th>
              <th className="p-3">Total Payable</th>
              <th className="p-3">Current Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1c212e]">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#8a857b]">
                  No orders match current criteria.
                </td>
              </tr>
            ) : (
              orders.map((o: any) => (
                <tr key={o.id} className="hover:bg-[#151924] transition-colors">
                  <td className="p-3 font-mono font-bold text-[#c5a880]">{o.order_number}</td>
                  <td className="p-3">
                    <span className="font-semibold text-[#ede8e1] block">{o.guest_name}</span>
                    <span className="text-[11px] text-[#8a857b] font-mono">{o.guest_phone}</span>
                  </td>
                  <td className="p-3">
                    <span className="uppercase text-[10px] font-mono bg-[#1c2232] px-1.5 py-0.5 text-[#60a5fa] block w-fit mb-0.5">
                      {o.order_type}
                    </span>
                    <span className="text-[11px] text-[#a19c90]">{o.location_note}</span>
                  </td>
                  <td className="p-3 max-w-xs">
                    <div className="space-y-0.5 text-[11px]">
                      {(o.items || []).map((it: any, idx: number) => (
                        <div key={idx} className="text-[#d4cfc5]">
                          {it.quantity}x {it.name} {it.size_name && `(${it.size_name})`}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 font-mono font-bold text-[#c5a880] text-sm">
                    Rs {o.total.toLocaleString()}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-[10px] font-mono uppercase font-bold inline-block ${
                        o.status === 'pending'
                          ? 'bg-[#2e2012] text-[#f59e0b] border border-[#523820]'
                          : o.status === 'preparing'
                          ? 'bg-[#132733] text-[#38bdf8] border border-[#204456]'
                          : o.status === 'ready'
                          ? 'bg-[#1b2b1d] text-[#4ade80] border border-[#2c4e30]'
                          : o.status === 'completed'
                          ? 'bg-[#181e28] text-[#9ca3af]'
                          : 'bg-[#291414] text-[#f87171]'
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      {o.status === 'pending' && (
                        <button
                          onClick={() => onUpdateStatus(o.id, 'preparing')}
                          className="px-2 py-1 bg-[#38bdf8] text-[#0e0f12] font-mono font-bold text-[10px]"
                        >
                          Prepare
                        </button>
                      )}
                      {o.status === 'preparing' && (
                        <button
                          onClick={() => onUpdateStatus(o.id, 'ready')}
                          className="px-2 py-1 bg-[#f59e0b] text-[#0e0f12] font-mono font-bold text-[10px]"
                        >
                          Set Ready
                        </button>
                      )}
                      {o.status === 'ready' && (
                        <button
                          onClick={() => onUpdateStatus(o.id, 'completed')}
                          className="px-2 py-1 bg-[#4ade80] text-[#0e0f12] font-mono font-bold text-[10px]"
                        >
                          Complete
                        </button>
                      )}
                      {o.status !== 'cancelled' && o.status !== 'completed' && (
                        <button
                          onClick={() => onUpdateStatus(o.id, 'cancelled')}
                          className="px-2 py-1 bg-[#261616] text-[#f87171] hover:bg-[#381a1a] font-mono text-[10px]"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReservationsManagementSection({ reservations, onRefresh, onUpdateStatus }: any) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1f2434]">
        <div>
          <h3 className="font-display text-2xl text-[#f3ede4] font-bold">Reservations Management</h3>
          <p className="text-xs text-[#8a857b]">Guest bookings across Mountain Terrace, Fireplace Hearth & Grand Hall</p>
        </div>
        <button
          onClick={onRefresh}
          className="px-3 py-1.5 bg-[#171a24] border border-[#2b3348] text-xs text-[#c5a880] font-mono flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Bookings</span>
        </button>
      </div>

      <div className="bg-[#11141c] border border-[#222838] overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1f2536] bg-[#141822] text-[#8a857b] font-mono text-[11px] uppercase">
              <th className="p-3">Code</th>
              <th className="p-3">Guest & Contact</th>
              <th className="p-3">Date & Time</th>
              <th className="p-3">Party Size</th>
              <th className="p-3">Seating Area / Table</th>
              <th className="p-3">Special Request</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1c212e]">
            {reservations.map((r: any) => (
              <tr key={r.id} className="hover:bg-[#151924] transition-colors">
                <td className="p-3 font-mono font-bold text-[#c5a880]">{r.confirmation_code}</td>
                <td className="p-3">
                  <span className="font-semibold text-[#ede8e1] block">{r.full_name}</span>
                  <span className="text-[11px] text-[#8a857b] font-mono">{r.phone}</span>
                </td>
                <td className="p-3 font-mono">
                  <span className="text-[#ede8e1] block">{r.reservation_date}</span>
                  <span className="text-[#c5a880] text-[11px]">{r.reservation_time}</span>
                </td>
                <td className="p-3 font-semibold text-[#ede8e1]">{r.guests} Guests</td>
                <td className="p-3">
                  <span className="text-[#ede8e1] font-medium block">{r.table_name || r.seating_area}</span>
                  <span className="text-[10px] uppercase font-mono text-[#8a857b]">{r.seating_area}</span>
                </td>
                <td className="p-3 max-w-xs text-[11px] text-[#9ca3af] italic">
                  {r.special_requests ? `"${r.special_requests}"` : '—'}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold ${
                      r.status === 'approved'
                        ? 'bg-[#15271a] text-[#4ade80] border border-[#2b5633]'
                        : r.status === 'seated'
                        ? 'bg-[#132330] text-[#38bdf8] border border-[#21435c]'
                        : 'bg-[#291414] text-[#f87171]'
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {r.status === 'approved' && (
                      <button
                        onClick={() => onUpdateStatus(r.id, 'seated')}
                        className="px-2 py-1 bg-[#38bdf8] text-[#0e0f12] font-mono font-bold text-[10px]"
                      >
                        Mark Seated
                      </button>
                    )}
                    {r.status === 'seated' && (
                      <button
                        onClick={() => onUpdateStatus(r.id, 'completed')}
                        className="px-2 py-1 bg-[#4ade80] text-[#0e0f12] font-mono font-bold text-[10px]"
                      >
                        Complete
                      </button>
                    )}
                    {r.status !== 'cancelled' && (
                      <button
                        onClick={() => onUpdateStatus(r.id, 'cancelled')}
                        className="px-2 py-1 bg-[#261616] text-[#f87171] hover:bg-[#381a1a] font-mono text-[10px]"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MenuManagementSection({
  mode,
  menuItems,
  categories,
  search,
  setSearch,
  catFilter,
  setCatFilter,
  onToggleAvailable,
  onToggleSoldOut,
  onPriceUpdate,
  onOpenItemModal,
  onRefresh,
}: any) {
  const filtered = menuItems.filter((m: any) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'all' || m.category_id === catFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1f2434]">
        <div>
          <h3 className="font-display text-2xl text-[#f3ede4] font-bold">
            {mode === 'Prices' ? 'Price Management' : mode === 'Pizza Sizes' ? 'Pizza Sizes & Crust Matrix' : 'Menu Management'}
          </h3>
          <p className="text-xs text-[#8a857b]">
            Direct database catalog control. Changes reflect immediately on public site.
          </p>
        </div>
        <button
          onClick={() => onOpenItemModal(null)}
          className="px-3.5 py-2 bg-[#c5a880] text-[#0e0f12] text-xs font-semibold uppercase tracking-wider font-mono flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Menu Item</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-wrap items-center gap-3 bg-[#11141c] p-3 border border-[#222838]">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[#8a857b] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu items..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#171a24] border border-[#272e40] text-xs text-[#ede8e1] focus:border-[#c5a880] focus:outline-none"
          />
        </div>

        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="px-3 py-1.5 bg-[#171a24] border border-[#272e40] text-xs text-[#ede8e1] font-mono focus:border-[#c5a880] focus:outline-none"
        >
          <option value="all">All Categories</option>
          {categories.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Items Table */}
      <div className="bg-[#11141c] border border-[#222838] overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1f2536] bg-[#141822] text-[#8a857b] font-mono text-[11px] uppercase">
              <th className="p-3">Dish / Item</th>
              <th className="p-3">Category</th>
              <th className="p-3">Current Price</th>
              <th className="p-3">Sizes / Options</th>
              <th className="p-3">Availability</th>
              <th className="p-3">Sold Out?</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1c212e]">
            {filtered.map((item: any) => (
              <tr key={item.id} className="hover:bg-[#151924] transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded shrink-0 border border-[#262c3e]"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[#ede8e1]">{item.name}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.2 text-[9px] font-mono bg-[#282114] text-[#c5a880] border border-[#4d3d20]">
                            {item.badge}
                          </span>
                        )}
                        {item.is_featured === 1 && (
                          <Star className="w-3 h-3 text-[#facc15] fill-[#facc15]" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#8a857b] line-clamp-1 max-w-xs">{item.description}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 font-mono text-[11px] text-[#a6a092]">{item.category_name}</td>
                <td className="p-3">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="font-bold text-[#c5a880] text-sm">Rs</span>
                    <input
                      type="number"
                      defaultValue={item.price}
                      onBlur={(e) => onPriceUpdate(item, e.target.value)}
                      className="w-20 px-2 py-1 bg-[#171a24] border border-[#2c344a] text-xs text-[#ede8e1] font-mono font-bold focus:border-[#c5a880] focus:outline-none"
                    />
                  </div>
                </td>
                <td className="p-3">
                  {item.sizes && item.sizes.length > 0 ? (
                    <div className="space-y-0.5 font-mono text-[10px]">
                      {item.sizes.map((s: any, idx: number) => (
                        <div key={idx} className="text-[#a19c90]">
                          {s.size_name}: <strong className="text-[#c5a880]">Rs {s.price}</strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[#63615a] font-mono text-[10px]">Single Size</span>
                  )}
                </td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => onToggleAvailable(item)}
                    className={`px-2 py-0.5 text-[10px] font-mono font-semibold uppercase ${
                      item.is_available === 1
                        ? 'bg-[#15291b] text-[#4ade80] border border-[#2b5936]'
                        : 'bg-[#291414] text-[#f87171] border border-[#592b2b]'
                    }`}
                  >
                    {item.is_available === 1 ? 'Live' : 'Hidden'}
                  </button>
                </td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => onToggleSoldOut(item)}
                    className={`px-2 py-0.5 text-[10px] font-mono font-semibold uppercase ${
                      item.is_sold_out === 1
                        ? 'bg-[#3b1a1a] text-[#fca5a5] border border-[#782929]'
                        : 'bg-[#161a25] text-[#8a857b]'
                    }`}
                  >
                    {item.is_sold_out === 1 ? 'Sold Out' : 'In Stock'}
                  </button>
                </td>
                <td className="p-3 text-right">
                  <button
                    type="button"
                    onClick={() => onOpenItemModal(item)}
                    className="p-1.5 text-[#8a857b] hover:text-[#c5a880] hover:bg-[#181c28] rounded transition-colors"
                    title="Edit Item Details"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CategoriesSection({ categories, onRefresh }: any) {
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    await api.createCategory({
      name: newCatName,
      slug: newCatName.toLowerCase().replace(/\s+/g, '-'),
      description: newCatDesc,
      sortOrder: categories.length + 1,
    });
    setNewCatName('');
    setNewCatDesc('');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-[#1f2434]">
        <h3 className="font-display text-2xl text-[#f3ede4] font-bold">Categories Management</h3>
        <p className="text-xs text-[#8a857b]">Organize dining courses and menu categories</p>
      </div>

      <form onSubmit={handleCreate} className="p-4 bg-[#11141c] border border-[#222838] flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] uppercase font-mono text-[#8a857b] mb-1">New Category Name</label>
          <input
            type="text"
            required
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="e.g. Sizzling Platters"
            className="w-full px-3 py-1.5 bg-[#171a24] border border-[#2c344a] text-xs text-[#ede8e1] focus:border-[#c5a880] focus:outline-none"
          />
        </div>
        <div className="flex-1 min-w-[250px]">
          <label className="block text-[10px] uppercase font-mono text-[#8a857b] mb-1">Description</label>
          <input
            type="text"
            value={newCatDesc}
            onChange={(e) => setNewCatDesc(e.target.value)}
            placeholder="Category subtitle..."
            className="w-full px-3 py-1.5 bg-[#171a24] border border-[#2c344a] text-xs text-[#ede8e1] focus:border-[#c5a880] focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-[#c5a880] text-[#0e0f12] text-xs font-semibold uppercase tracking-wider font-mono"
        >
          Add Category
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((c: any) => (
          <div key={c.id} className="p-4 bg-[#11141c] border border-[#222838] flex justify-between items-start">
            <div>
              <span className="font-semibold text-sm text-[#ede8e1] block">{c.name}</span>
              <span className="font-mono text-[10px] text-[#c5a880]">Slug: {c.slug}</span>
              <p className="text-xs text-[#8a857b] mt-1">{c.description || 'No description'}</p>
            </div>
            <span className="px-2 py-0.5 text-[9px] font-mono bg-[#181c28] text-[#8a857b]">
              Order #{c.sort_order}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TablesManagementSection({ tables, onRefresh }: any) {
  const handleStatusChange = async (tableId: string, status: string) => {
    await api.updateTable(tableId, { status });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="pb-3 border-b border-[#1f2434] flex items-center justify-between">
        <div>
          <h3 className="font-display text-2xl text-[#f3ede4] font-bold">Restaurant Tables Management</h3>
          <p className="text-xs text-[#8a857b]">Live floor status: Available, Reserved, Occupied, Cleaning</p>
        </div>
        <button onClick={onRefresh} className="px-3 py-1 bg-[#171a24] border border-[#2b3348] text-xs text-[#c5a880] font-mono">
          Refresh Tables
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {tables.map((t: any) => (
          <div
            key={t.id}
            className={`p-4 border transition-colors ${
              t.status === 'occupied'
                ? 'bg-[#1c1414] border-[#5e2828]'
                : t.status === 'reserved'
                ? 'bg-[#1d1b13] border-[#5c4a22]'
                : t.status === 'cleaning'
                ? 'bg-[#131b24] border-[#29455c]'
                : 'bg-[#11141c] border-[#222838]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono font-bold text-sm text-[#c5a880]">{t.table_number}</span>
              <span className="text-[10px] font-mono uppercase bg-[#181c26] px-1.5 py-0.5 text-[#9ca3af]">
                {t.capacity} Guests
              </span>
            </div>

            <h5 className="font-semibold text-xs text-[#ede8e1] truncate">{t.name}</h5>
            <span className="text-[10px] font-mono text-[#8a857b] block mb-2">{t.zone_title}</span>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#8a857b]">Status:</span>
              <select
                value={t.status}
                onChange={(e) => handleStatusChange(t.id, e.target.value)}
                className="px-2 py-0.5 bg-[#0e1017] border border-[#2b3348] text-[10px] font-mono text-[#ede8e1] focus:border-[#c5a880]"
              >
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="occupied">Occupied</option>
                <option value="cleaning">Cleaning</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OffersManagementSection({ offers, onRefresh }: any) {
  const [promoCode, setPromoCode] = useState('');
  const [title, setTitle] = useState('');
  const [discountVal, setDiscountVal] = useState('10');
  const [minSpend, setMinSpend] = useState('1500');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode || !title) return;
    await api.createOffer({
      promoCode,
      title,
      discountType: 'percentage',
      discountValue: Number(discountVal),
      minSpend: Number(minSpend),
    });
    setPromoCode('');
    setTitle('');
    onRefresh();
  };

  const handleToggle = async (off: any) => {
    await api.updateOffer(off.id, { isActive: off.is_active ? 0 : 1 });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-[#1f2434]">
        <h3 className="font-display text-2xl text-[#f3ede4] font-bold">Offers & Discounts</h3>
        <p className="text-xs text-[#8a857b]">Manage promo codes, seasonal vouchers, and customer perks</p>
      </div>

      <form onSubmit={handleCreate} className="p-4 bg-[#11141c] border border-[#222838] grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
        <div>
          <label className="block text-[10px] uppercase font-mono text-[#8a857b] mb-1">Promo Code</label>
          <input
            type="text"
            required
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="e.g. SNOWFALL20"
            className="w-full px-3 py-1.5 bg-[#171a24] border border-[#2c344a] text-xs text-[#ede8e1] font-mono uppercase"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[10px] uppercase font-mono text-[#8a857b] mb-1">Offer Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Winter Flurry 20% Off"
            className="w-full px-3 py-1.5 bg-[#171a24] border border-[#2c344a] text-xs text-[#ede8e1]"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase font-mono text-[#8a857b] mb-1">Discount %</label>
          <input
            type="number"
            required
            value={discountVal}
            onChange={(e) => setDiscountVal(e.target.value)}
            className="w-full px-3 py-1.5 bg-[#171a24] border border-[#2c344a] text-xs text-[#ede8e1] font-mono"
          />
        </div>
        <button type="submit" className="py-2 bg-[#c5a880] text-[#0e0f12] text-xs font-semibold uppercase tracking-wider font-mono">
          Create Offer
        </button>
      </form>

      <div className="space-y-3">
        {offers.map((off: any) => (
          <div key={off.id} className="p-4 bg-[#11141c] border border-[#222838] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-[#c5a880] bg-[#1a1710] px-2 py-0.5 border border-[#4a3b1d]">
                  {off.promo_code}
                </span>
                <span className="font-semibold text-xs text-[#ede8e1]">{off.title}</span>
              </div>
              <p className="text-xs text-[#8a857b] mt-1">
                Discount: {off.discount_value}% {off.min_spend > 0 && `(Min spend: Rs ${off.min_spend})`} · Used: {off.usage_count || 0} times
              </p>
            </div>

            <button
              onClick={() => handleToggle(off)}
              className={`px-3 py-1 text-xs font-mono font-semibold uppercase ${
                off.is_active === 1
                  ? 'bg-[#15271a] text-[#4ade80] border border-[#2a5632]'
                  : 'bg-[#291414] text-[#f87171] border border-[#592b2b]'
              }`}
            >
              {off.is_active === 1 ? 'Active' : 'Disabled'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomersManagementSection({ customers, search, setSearch, onRefresh }: any) {
  return (
    <div className="space-y-4">
      <div className="pb-3 border-b border-[#1f2434] flex items-center justify-between">
        <div>
          <h3 className="font-display text-2xl text-[#f3ede4] font-bold">Customer Profiles</h3>
          <p className="text-xs text-[#8a857b]">Search guest history, lifetime spend, and loyalty accounts</p>
        </div>
        <span className="text-xs font-mono text-[#c5a880]">{customers.length} Guests Recorded</span>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-[#8a857b] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone or email..."
          className="w-full pl-9 pr-3 py-2 bg-[#11141c] border border-[#222838] text-xs text-[#ede8e1] focus:border-[#c5a880] focus:outline-none"
        />
      </div>

      <div className="bg-[#11141c] border border-[#222838] overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1f2536] bg-[#141822] text-[#8a857b] font-mono text-[11px] uppercase">
              <th className="p-3">Customer</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Orders</th>
              <th className="p-3">Lifetime Spend</th>
              <th className="p-3">Loyalty Points</th>
              <th className="p-3">First Seen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1c212e]">
            {customers.map((c: any) => (
              <tr key={c.id} className="hover:bg-[#151924]">
                <td className="p-3 font-semibold text-[#ede8e1]">{c.full_name}</td>
                <td className="p-3 font-mono text-[#c5a880]">{c.phone}</td>
                <td className="p-3 font-mono">{c.total_orders}</td>
                <td className="p-3 font-mono font-bold text-[#4ade80]">Rs {c.total_spent?.toLocaleString()}</td>
                <td className="p-3 font-mono text-[#facc15]">{c.loyalty_points || 0} pts</td>
                <td className="p-3 font-mono text-[#8a857b] text-[10px]">{c.created_at?.split('T')[0]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StaffManagementSection({ staffList, currentUser, onRefresh }: any) {
  const [newEmail, setNewEmail] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('staff');

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPass || !newName) return;
    await api.createStaff({
      email: newEmail,
      password: newPass,
      fullName: newName,
      role: newRole,
    });
    setNewEmail('');
    setNewPass('');
    setNewName('');
    onRefresh();
  };

  const handleToggleActive = async (s: any) => {
    await api.updateStaff(s.id, { isActive: s.is_active ? 0 : 1 });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-[#1f2434] flex items-center justify-between">
        <div>
          <h3 className="font-display text-2xl text-[#f3ede4] font-bold">Staff Management (Owner Only)</h3>
          <p className="text-xs text-[#8a857b]">Create, assign roles, activate/deactivate authorized personnel</p>
        </div>
        <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-[#281a14] text-[#f59e0b] border border-[#52331f]">
          Proprietor Privileges
        </span>
      </div>

      <form onSubmit={handleAddStaff} className="p-4 bg-[#11141c] border border-[#222838] grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
        <div>
          <label className="block text-[10px] uppercase font-mono text-[#8a857b] mb-1">Full Name</label>
          <input
            type="text"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Asim Raza"
            className="w-full px-3 py-1.5 bg-[#171a24] border border-[#2c344a] text-xs text-[#ede8e1]"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase font-mono text-[#8a857b] mb-1">Email</label>
          <input
            type="email"
            required
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="staff@sariyas.com"
            className="w-full px-3 py-1.5 bg-[#171a24] border border-[#2c344a] text-xs text-[#ede8e1]"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase font-mono text-[#8a857b] mb-1">Password</label>
          <input
            type="password"
            required
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-1.5 bg-[#171a24] border border-[#2c344a] text-xs text-[#ede8e1] font-mono"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase font-mono text-[#8a857b] mb-1">Assigned Role</label>
          <div className="flex gap-2">
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as any)}
              className="flex-1 px-2 py-1.5 bg-[#171a24] border border-[#2c344a] text-xs text-[#ede8e1] font-mono"
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
            </select>
            <button type="submit" className="px-3 py-1.5 bg-[#c5a880] text-[#0e0f12] text-xs font-semibold uppercase font-mono">
              Add
            </button>
          </div>
        </div>
      </form>

      <div className="bg-[#11141c] border border-[#222838] overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1f2536] bg-[#141822] text-[#8a857b] font-mono text-[11px] uppercase">
              <th className="p-3">Staff Member</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Last Login</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1c212e]">
            {staffList.map((s: any) => (
              <tr key={s.id} className="hover:bg-[#151924]">
                <td className="p-3 font-semibold text-[#ede8e1]">{s.full_name}</td>
                <td className="p-3 font-mono text-[#a19c90]">{s.email}</td>
                <td className="p-3">
                  <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 bg-[#1c2232] text-[#c5a880] font-bold">
                    {s.role}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono uppercase font-semibold ${
                      s.is_active === 1
                        ? 'bg-[#15271a] text-[#4ade80]'
                        : 'bg-[#291414] text-[#f87171]'
                    }`}
                  >
                    {s.is_active === 1 ? 'Active' : 'Deactivated'}
                  </span>
                </td>
                <td className="p-3 font-mono text-[10px] text-[#8a857b]">
                  {s.last_login ? s.last_login : 'Never'}
                </td>
                <td className="p-3 text-right">
                  {s.id !== currentUser?.id && (
                    <button
                      onClick={() => handleToggleActive(s)}
                      className={`px-2 py-1 text-[10px] font-mono ${
                        s.is_active === 1 ? 'bg-[#261616] text-[#f87171]' : 'bg-[#162618] text-[#4ade80]'
                      }`}
                    >
                      {s.is_active === 1 ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WebsiteSettingsSection({ mode, settings, onSave }: any) {
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (key: string, val: string) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-[#1f2434]">
        <h3 className="font-display text-2xl text-[#f3ede4] font-bold">
          {mode === 'Contact Information' ? 'Contact Information & Hours' : mode === 'Settings' ? 'System Settings' : 'Website Content Control'}
        </h3>
        <p className="text-xs text-[#8a857b]">
          Changes made here automatically update on the live public restaurant website from the database.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 bg-[#11141c] border border-[#222838] space-y-4">
        {mode === 'Website Content' && (
          <>
            <div>
              <label className="block text-xs uppercase font-mono text-[#c5a880] mb-1">Hero Heading</label>
              <input
                type="text"
                value={formData.hero_heading || ''}
                onChange={(e) => handleChange('hero_heading', e.target.value)}
                className="w-full px-3 py-2 bg-[#171a24] border border-[#2c344a] text-xs text-[#ede8e1]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono text-[#c5a880] mb-1">Hero Subtitle</label>
              <textarea
                rows={3}
                value={formData.hero_subheading || ''}
                onChange={(e) => handleChange('hero_subheading', e.target.value)}
                className="w-full px-3 py-2 bg-[#171a24] border border-[#2c344a] text-xs text-[#ede8e1]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono text-[#c5a880] mb-1">Announcement Banner</label>
              <input
                type="text"
                value={formData.announcement_banner || ''}
                onChange={(e) => handleChange('announcement_banner', e.target.value)}
                className="w-full px-3 py-2 bg-[#171a24] border border-[#2c344a] text-xs text-[#ede8e1]"
              />
            </div>
          </>
        )}

        {mode === 'Contact Information' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase font-mono text-[#c5a880] mb-1">Customer Phone</label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-3 py-2 bg-[#171a24] border border-[#2c344a] text-xs text-[#ede8e1]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono text-[#c5a880] mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2 bg-[#171a24] border border-[#2c344a] text-xs text-[#ede8e1]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-mono text-[#c5a880] mb-1">Physical Address</label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 bg-[#171a24] border border-[#2c344a] text-xs text-[#ede8e1]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase font-mono text-[#c5a880] mb-1">Weekday Hours</label>
                <input
                  type="text"
                  value={formData.weekday_hours || ''}
                  onChange={(e) => handleChange('weekday_hours', e.target.value)}
                  className="w-full px-3 py-2 bg-[#171a24] border border-[#2c344a] text-xs text-[#ede8e1]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono text-[#c5a880] mb-1">Weekend Hours</label>
                <input
                  type="text"
                  value={formData.weekend_hours || ''}
                  onChange={(e) => handleChange('weekend_hours', e.target.value)}
                  className="w-full px-3 py-2 bg-[#171a24] border border-[#2c344a] text-xs text-[#ede8e1]"
                />
              </div>
            </div>
          </>
        )}

        {mode === 'Settings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[#171a24] border border-[#2c344a]">
              <div>
                <span className="text-xs font-semibold text-[#ede8e1] block">Two-Factor Authentication (2FA)</span>
                <span className="text-[11px] text-[#8a857b]">Require 2FA verification for administrator logins</span>
              </div>
              <input
                type="checkbox"
                checked={formData.two_factor_auth_required === '1'}
                onChange={(e) => handleChange('two_factor_auth_required', e.target.checked ? '1' : '0')}
                className="w-4 h-4 accent-[#c5a880]"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-[#171a24] border border-[#2c344a]">
              <div>
                <span className="text-xs font-semibold text-[#ede8e1] block">Top Announcement Banner Active</span>
                <span className="text-[11px] text-[#8a857b]">Display alert banner on top of public website</span>
              </div>
              <input
                type="checkbox"
                checked={formData.announcement_active === '1'}
                onChange={(e) => handleChange('announcement_active', e.target.checked ? '1' : '0')}
                className="w-4 h-4 accent-[#c5a880]"
              />
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-[#1f2536] flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#c5a880] text-[#0e0f12] text-xs font-semibold uppercase tracking-wider font-mono hover:bg-[#d8ba91]"
          >
            Save Changes to Database
          </button>
        </div>
      </form>
    </div>
  );
}

function ReviewsManagementSection({ reviews, onRefresh }: any) {
  const handleStatusChange = async (id: string, status: string) => {
    await api.updateReviewStatus(id, status);
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="pb-3 border-b border-[#1f2434] flex items-center justify-between">
        <div>
          <h3 className="font-display text-2xl text-[#f3ede4] font-bold">Reviews Management</h3>
          <p className="text-xs text-[#8a857b]">Moderate dining testimonials and verified feedback</p>
        </div>
      </div>

      <div className="space-y-3">
        {reviews.map((r: any) => (
          <div key={r.id} className="p-4 bg-[#11141c] border border-[#222838] flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-[#ede8e1]">{r.author}</span>
                <span className="text-[#facc15] font-mono text-xs">{'★'.repeat(r.rating)}</span>
                <span className="text-[10px] text-[#8a857b]">({r.location})</span>
              </div>
              <p className="text-xs text-[#a19c90] mt-1 italic">"{r.comment}"</p>
              {r.dish_tag && (
                <span className="text-[10px] font-mono text-[#c5a880] mt-1 block">Dish: {r.dish_tag}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 text-[10px] font-mono uppercase ${
                  r.status === 'published' ? 'bg-[#16271a] text-[#4ade80]' : 'bg-[#291414] text-[#f87171]'
                }`}
              >
                {r.status}
              </span>
              <button
                onClick={() => handleStatusChange(r.id, r.status === 'published' ? 'hidden' : 'published')}
                className="px-2 py-1 bg-[#171a24] text-xs font-mono text-[#ede8e1] border border-[#2c344a]"
              >
                {r.status === 'published' ? 'Hide' : 'Publish'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportsAnalyticsSection({ analytics }: any) {
  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-[#1f2434]">
        <h3 className="font-display text-2xl text-[#f3ede4] font-bold">Reports & Analytics</h3>
        <p className="text-xs text-[#8a857b]">Financial and volume metrics from the persistent database</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-[#11141c] border border-[#222838]">
          <span className="text-xs text-[#8a857b] uppercase font-mono block">Today's Revenue</span>
          <span className="font-mono text-2xl font-bold text-[#c5a880] mt-1 block">
            Rs {(analytics?.todayRevenue || 0).toLocaleString()}
          </span>
        </div>
        <div className="p-5 bg-[#11141c] border border-[#222838]">
          <span className="text-xs text-[#8a857b] uppercase font-mono block">Total Orders</span>
          <span className="font-mono text-2xl font-bold text-[#ede8e1] mt-1 block">
            {analytics?.todayOrders || 0}
          </span>
        </div>
        <div className="p-5 bg-[#11141c] border border-[#222838]">
          <span className="text-xs text-[#8a857b] uppercase font-mono block">Average Order Value</span>
          <span className="font-mono text-2xl font-bold text-[#4ade80] mt-1 block">
            Rs {analytics?.todayOrders ? Math.round(analytics.todayRevenue / analytics.todayOrders).toLocaleString() : '0'}
          </span>
        </div>
      </div>

      <div className="p-5 bg-[#11141c] border border-[#222838]">
        <h4 className="font-display text-base text-[#f3ede4] mb-3">7-Day Sales Trend</h4>
        <div className="space-y-2 font-mono text-xs">
          {(analytics?.salesByDay || []).map((d: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between py-1 border-b border-[#1c212e]">
              <span className="text-[#a19c90]">{d.day}</span>
              <div className="flex items-center gap-3">
                <span className="text-[#8a857b]">{d.orders_count} orders</span>
                <span className="text-[#c5a880] font-bold">Rs {d.revenue?.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotificationsSection({ notifications, onRefresh }: any) {
  const handleMarkAll = async () => {
    await api.markAllNotificationsRead();
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="pb-3 border-b border-[#1f2434] flex items-center justify-between">
        <div>
          <h3 className="font-display text-2xl text-[#f3ede4] font-bold">Notifications Center</h3>
          <p className="text-xs text-[#8a857b]">Live in-app alerts for incoming orders and reservations</p>
        </div>
        <button
          onClick={handleMarkAll}
          className="px-3 py-1 bg-[#171a24] text-[#c5a880] text-xs font-mono border border-[#2b3348]"
        >
          Mark All as Read
        </button>
      </div>

      <div className="space-y-2">
        {notifications.map((n: any) => (
          <div
            key={n.id}
            className={`p-3 border flex items-center justify-between text-xs ${
              n.is_read === 0 ? 'bg-[#171a24] border-[#c5a880]/50' : 'bg-[#11141c] border-[#222838]'
            }`}
          >
            <div>
              <span className="font-semibold text-[#ede8e1] block">{n.title}</span>
              <p className="text-[#8a857b] text-[11px]">{n.message}</p>
            </div>
            <span className="text-[10px] font-mono text-[#6e6a62]">{n.created_at?.split('T')[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityLogsSection({ logs, filter, setFilter, onRefresh }: any) {
  return (
    <div className="space-y-4">
      <div className="pb-3 border-b border-[#1f2434] flex items-center justify-between">
        <div>
          <h3 className="font-display text-2xl text-[#f3ede4] font-bold">Activity Logs & Audit Trail</h3>
          <p className="text-xs text-[#8a857b]">Immutable security and administrative action ledger</p>
        </div>
        <button onClick={onRefresh} className="px-3 py-1 bg-[#171a24] text-xs text-[#c5a880] font-mono border border-[#2b3348]">
          Refresh
        </button>
      </div>

      <div className="bg-[#11141c] border border-[#222838] overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1f2536] bg-[#141822] text-[#8a857b] font-mono text-[11px] uppercase">
              <th className="p-3">Timestamp</th>
              <th className="p-3">User</th>
              <th className="p-3">Section</th>
              <th className="p-3">Action</th>
              <th className="p-3">Details</th>
              <th className="p-3">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1c212e] font-mono text-[11px]">
            {logs.map((l: any) => (
              <tr key={l.id} className="hover:bg-[#151924]">
                <td className="p-3 text-[#8a857b] whitespace-nowrap">{l.created_at}</td>
                <td className="p-3 text-[#c5a880]">{l.user_email}</td>
                <td className="p-3 text-[#60a5fa]">{l.section}</td>
                <td className="p-3 text-[#ede8e1] font-semibold">{l.action}</td>
                <td className="p-3 text-[#a19c90] max-w-sm truncate">{l.details}</td>
                <td className="p-3 text-[#6e6a62]">{l.ip_address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Add/Edit Menu Item Modal
function MenuItemModal({ item, categories, onClose, onSaved }: any) {
  const [name, setName] = useState(item?.name || '');
  const [categoryId, setCategoryId] = useState(item?.category_id || categories[0]?.id || '');
  const [price, setPrice] = useState(item?.price || '');
  const [originalPrice, setOriginalPrice] = useState(item?.original_price || '');
  const [description, setDescription] = useState(item?.description || '');
  const [image, setImage] = useState(item?.image || '');
  const [badge, setBadge] = useState(item?.badge || '');
  const [isFeatured, setIsFeatured] = useState(item?.is_featured === 1);
  const [isSeasonal, setIsSeasonal] = useState(item?.is_seasonal === 1);
  const [prepTime, setPrepTime] = useState(item?.preparation_time || '15-20 mins');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      categoryId,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      description,
      image,
      badge: badge || null,
      isFeatured,
      isSeasonal,
      preparationTime: prepTime,
    };

    if (item) {
      await api.updateMenuItem(item.id, payload);
    } else {
      await api.createMenuItem(payload);
    }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07080a]/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#11141c] border border-[#2b3348] p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#8a857b] hover:text-[#ede8e1]">
          <X className="w-4 h-4" />
        </button>

        <h4 className="font-display text-xl text-[#f3ede4] font-bold mb-4">
          {item ? `Edit: ${item.name}` : 'Add New Menu Item'}
        </h4>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[10px] uppercase font-mono text-[#8a857b] mb-1">Item Title *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-[#171a24] border border-[#2c344a] text-xs text-[#ede8e1]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-mono text-[#8a857b] mb-1">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-[#171a24] border border-[#2c344a] text-xs text-[#ede8e1]"
              >
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono text-[#8a857b] mb-1">Price (PKR) *</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 bg-[#171a24] border border-[#2c344a] text-xs text-[#ede8e1] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono text-[#8a857b] mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-[#171a24] border border-[#2c344a] text-xs text-[#ede8e1]"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono text-[#8a857b] mb-1">Image URL</label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 bg-[#171a24] border border-[#2c344a] text-xs text-[#ede8e1]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-mono text-[#8a857b] mb-1">Badge Tag</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Bestseller, Chef Pick"
                className="w-full px-3 py-2 bg-[#171a24] border border-[#2c344a] text-xs text-[#ede8e1]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono text-[#8a857b] mb-1">Preparation Time</label>
              <input
                type="text"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                className="w-full px-3 py-2 bg-[#171a24] border border-[#2c344a] text-xs text-[#ede8e1]"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="accent-[#c5a880]"
              />
              <span className="text-xs text-[#ede8e1]">Featured Dish</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isSeasonal}
                onChange={(e) => setIsSeasonal(e.target.checked)}
                className="accent-[#c5a880]"
              />
              <span className="text-xs text-[#ede8e1]">Winter/Seasonal</span>
            </label>
          </div>

          <div className="pt-4 border-t border-[#1f2536] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#171a24] text-[#8a857b] hover:text-[#ede8e1]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#c5a880] text-[#0e0f12] font-semibold uppercase tracking-wider font-mono"
            >
              Save to Database
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
