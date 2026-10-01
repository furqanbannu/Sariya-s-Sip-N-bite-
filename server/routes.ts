import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from './db.js';
import {
  authenticateToken,
  requireRole,
  generateToken,
  logAudit,
  createNotification,
  AuthenticatedRequest,
} from './auth.js';

export const apiRouter = Router();

// ==========================================
// 1. AUTHENTICATION ROUTES
// ==========================================

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase()) as any;

    if (!user) {
      logAudit(null, 'Failed Login Attempt', 'Authentication', `Unknown email: ${email}`, req.ip);
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    if (!user.is_active) {
      logAudit(null, 'Deactivated Account Login', 'Authentication', `User: ${email}`, req.ip);
      res.status(403).json({ error: 'Your account has been deactivated. Please contact the owner.' });
      return;
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      logAudit(null, 'Failed Password Attempt', 'Authentication', `User: ${email}`, req.ip);
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Update last login
    db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

    const authUser = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    };

    const token = generateToken(authUser);
    logAudit(authUser, 'User Login', 'Authentication', `Successful login as ${user.role}`, req.ip);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        phone: user.phone,
        twoFactorEnabled: !!user.two_factor_enabled,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
});

apiRouter.get('/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = db.prepare('SELECT id, email, full_name, role, phone, two_factor_enabled, last_login FROM users WHERE id = ?').get(req.user!.id) as any;
    if (!user) {
      res.status(404).json({ error: 'User record not found' });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      phone: user.phone,
      twoFactorEnabled: !!user.two_factor_enabled,
      lastLogin: user.last_login,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/auth/logout', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  logAudit(req.user || null, 'User Logout', 'Authentication', 'Session ended', req.ip);
  res.json({ success: true, message: 'Logged out successfully' });
});

apiRouter.post('/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase()) as any;
  if (user) {
    logAudit(null, 'Password Reset Requested', 'Authentication', `Password reset token initiated for ${email}`, req.ip);
    createNotification('system', 'Password Reset Request', `Staff member ${email} requested a password reset.`);
  }

  // Return generic confirmation for security
  res.json({
    success: true,
    message: 'If an account exists with this email, password reset instructions have been logged. Please contact the administrator or check system logs.',
  });
});

apiRouter.post('/auth/reset-password', (req: Request, res: Response) => {
  const { email, newPassword, adminSecret } = req.body;
  if (!email || !newPassword) {
    res.status(400).json({ error: 'Email and new password are required' });
    return;
  }

  // Allow reset with master admin secret or owner verification
  if (adminSecret !== 'SariyaOwnerMaster2026' && adminSecret !== 'Murree2026!') {
    res.status(403).json({ error: 'Invalid administrator authorization key for password reset.' });
    return;
  }

  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPassword, salt);
    const result = db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?').run(hash, email.trim().toLowerCase());

    if (result.changes === 0) {
      res.status(404).json({ error: 'User with provided email not found.' });
      return;
    }

    logAudit(null, 'Password Reset Executed', 'Authentication', `Password updated for ${email}`, req.ip);
    res.json({ success: true, message: 'Password has been reset successfully. You may now log in.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. PUBLIC RESTAURANT API (Website consumption)
// ==========================================

apiRouter.get('/public/content', (_req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT key, value FROM settings').all() as Array<{ key: string; value: string }>;
    const settingsMap: Record<string, string> = {};
    for (const r of rows) {
      settingsMap[r.key] = r.value;
    }
    res.json(settingsMap);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/public/menu', (_req: Request, res: Response) => {
  try {
    const categories = db.prepare(`
      SELECT * FROM menu_categories
      WHERE is_active = 1
      ORDER BY sort_order ASC
    `).all() as any[];

    const items = db.prepare(`
      SELECT m.*, c.name as category_name, c.slug as category_slug
      FROM menu_items m
      JOIN menu_categories c ON m.category_id = c.id
      WHERE m.is_available = 1
      ORDER BY m.sort_order ASC, m.name ASC
    `).all() as any[];

    const sizes = db.prepare(`
      SELECT * FROM menu_item_sizes WHERE is_available = 1
    `).all() as any[];

    // Group sizes by item_id
    const sizesByItem: Record<string, any[]> = {};
    for (const s of sizes) {
      if (!sizesByItem[s.item_id]) sizesByItem[s.item_id] = [];
      sizesByItem[s.item_id].push(s);
    }

    // Attach sizes to items
    const enrichedItems = items.map((it) => ({
      ...it,
      sizes: sizesByItem[it.id] || [],
    }));

    res.json({
      categories,
      items: enrichedItems,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/public/offers', (_req: Request, res: Response) => {
  try {
    const offers = db.prepare(`
      SELECT * FROM offers WHERE is_active = 1 ORDER BY discount_value DESC
    `).all();
    res.json(offers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/public/tables', (_req: Request, res: Response) => {
  try {
    const tables = db.prepare(`
      SELECT id, table_number, name, zone, zone_title, capacity, status, perk
      FROM restaurant_tables
      WHERE is_active = 1
      ORDER BY table_number ASC
    `).all();
    res.json(tables);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/public/reviews', (_req: Request, res: Response) => {
  try {
    const reviews = db.prepare(`
      SELECT * FROM reviews WHERE status = 'published' ORDER BY created_at DESC LIMIT 20
    `).all();
    res.json(reviews);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/public/orders', (req: Request, res: Response) => {
  try {
    const { items, guestName, guestPhone, orderType, locationNote, tipAmount, tipPercentage, promoCode, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Order must contain at least one item' });
      return;
    }
    if (!guestName || !guestPhone) {
      res.status(400).json({ error: 'Guest name and phone number are required' });
      return;
    }

    // Calculate subtotal from database prices
    let subtotal = 0;
    const resolvedItems: Array<{ id: string; name: string; price: number; quantity: number; sizeName?: string }> = [];

    for (const line of items) {
      const itemRow = db.prepare('SELECT id, name, price FROM menu_items WHERE id = ?').get(line.itemId) as any;
      if (itemRow) {
        const linePrice = line.sizePrice ? Number(line.sizePrice) : itemRow.price;
        const qty = Number(line.quantity) || 1;
        subtotal += linePrice * qty;
        resolvedItems.push({
          id: itemRow.id,
          name: itemRow.name,
          price: linePrice,
          quantity: qty,
          sizeName: line.sizeName,
        });
      }
    }

    let discount = 0;
    if (promoCode) {
      const offer = db.prepare('SELECT * FROM offers WHERE promo_code = ? AND is_active = 1').get(promoCode.trim().toUpperCase()) as any;
      if (offer && subtotal >= (offer.min_spend || 0)) {
        if (offer.discount_type === 'percentage') {
          discount = Math.round((subtotal * offer.discount_value) / 100);
          if (offer.max_discount && discount > offer.max_discount) {
            discount = offer.max_discount;
          }
        } else {
          discount = offer.discount_value;
        }
        db.prepare('UPDATE offers SET usage_count = usage_count + 1 WHERE id = ?').run(offer.id);
      }
    }

    const tip = Number(tipAmount) || 0;
    const total = Math.max(0, subtotal - discount + tip);

    const orderId = `ord-${Date.now()}`;
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

    // Upsert customer record
    let customer = db.prepare('SELECT id, total_orders, total_spent, loyalty_points FROM customers WHERE phone = ?').get(guestPhone) as any;
    const earnedPoints = Math.floor(total / 20);

    if (!customer) {
      const custId = `cust-${Date.now()}`;
      db.prepare(`
        INSERT INTO customers (id, phone, full_name, total_orders, total_spent, loyalty_points)
        VALUES (?, ?, ?, 1, ?, ?)
      `).run(custId, guestPhone, guestName, total, earnedPoints);
      customer = { id: custId };
    } else {
      db.prepare(`
        UPDATE customers
        SET total_orders = total_orders + 1,
            total_spent = total_spent + ?,
            loyalty_points = loyalty_points + ?,
            full_name = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(total, earnedPoints, guestName, customer.id);
    }

    // Insert order
    db.prepare(`
      INSERT INTO orders (id, order_number, customer_id, guest_name, guest_phone, order_type, location_note, status, subtotal, discount_amount, tip_amount, tip_percentage, total, promo_code, notes)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderId,
      orderNumber,
      customer.id,
      guestName,
      guestPhone,
      orderType || 'dine_in',
      locationNote || (orderType === 'dine_in' ? 'Main Dining Hall' : 'Lucky Kabana Hotel'),
      subtotal,
      discount,
      tip,
      tipPercentage ? String(tipPercentage) : null,
      total,
      promoCode || null,
      notes || null
    );

    // Insert order items
    const insertOi = db.prepare(`
      INSERT INTO order_items (id, order_id, item_id, name, price, quantity, size_name)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const oi of resolvedItems) {
      insertOi.run(`oi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, orderId, oi.id, oi.name, oi.price, oi.quantity, oi.sizeName || null);
    }

    createNotification(
      'order',
      `New Order: ${orderNumber}`,
      `${guestName} placed order for ${orderType?.replace('_', ' ')} (${resolvedItems.length} items, Rs ${total.toLocaleString()})`,
      orderId
    );

    logAudit(null, 'Public Order Placed', 'Orders', `Order ${orderNumber} created for Rs ${total}`, req.ip);

    res.status(201).json({
      success: true,
      order: {
        id: orderId,
        orderNumber,
        guestName,
        guestPhone,
        orderType,
        locationNote,
        status: 'pending',
        subtotal,
        discount,
        tip,
        total,
        earnedPoints,
        items: resolvedItems,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('Create order error:', err);
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/public/reservations', (req: Request, res: Response) => {
  try {
    const { fullName, phone, email, date, time, guests, seatingArea, selectedTableId, selectedTableName, specialRequests } = req.body;

    if (!fullName || !phone || !date || !time) {
      res.status(400).json({ error: 'Name, phone, reservation date, and time are required' });
      return;
    }

    const resId = `res-${Date.now()}`;
    const confCode = `SB-${Math.floor(1000 + Math.random() * 9000)}`;

    // Upsert customer
    let customer = db.prepare('SELECT id FROM customers WHERE phone = ?').get(phone) as any;
    if (!customer) {
      const custId = `cust-${Date.now()}`;
      db.prepare(`
        INSERT INTO customers (id, phone, full_name, email, notes)
        VALUES (?, ?, ?, ?, 'Reserved table online')
      `).run(custId, phone, fullName, email || null);
      customer = { id: custId };
    }

    // Determine table details
    let assignedTableId = selectedTableId || null;
    let assignedTableName = selectedTableName || (seatingArea === 'terrace' ? 'T-2 (Terrace View)' : 'M-1 (Grand Hall)');

    // If table selected, update table status to 'reserved'
    if (assignedTableId) {
      db.prepare("UPDATE restaurant_tables SET status = 'reserved' WHERE id = ?").run(assignedTableId);
    }

    db.prepare(`
      INSERT INTO reservations (id, confirmation_code, customer_id, full_name, phone, email, reservation_date, reservation_time, guests, seating_area, table_id, table_name, status, special_requests)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?)
    `).run(
      resId,
      confCode,
      customer.id,
      fullName,
      phone,
      email || null,
      date,
      time,
      Number(guests) || 2,
      seatingArea || 'terrace',
      assignedTableId,
      assignedTableName,
      specialRequests || null
    );

    createNotification(
      'reservation',
      `New Reservation: ${confCode}`,
      `${fullName} booked for ${guests} guests on ${date} at ${time} (${assignedTableName})`,
      resId
    );

    logAudit(null, 'Table Reservation Booked', 'Reservations', `Booking ${confCode} for ${fullName} (${guests}p)`, req.ip);

    res.status(201).json({
      success: true,
      reservation: {
        id: resId,
        confirmationCode: confCode,
        fullName,
        phone,
        email,
        date,
        time,
        guests: Number(guests) || 2,
        seatingArea,
        tableNumber: assignedTableName,
        status: 'approved',
      },
    });
  } catch (err: any) {
    console.error('Reservation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. ADMIN MANAGEMENT API (Role Protected)
// ==========================================

// Dashboard Analytics Overview
apiRouter.get('/admin/analytics', authenticateToken, requireRole(['owner', 'admin', 'manager']), (_req: AuthenticatedRequest, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Today's orders & revenue
    const todayStats = db.prepare(`
      SELECT
        COUNT(*) as total_orders,
        COALESCE(SUM(total), 0) as total_revenue,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN status = 'preparing' THEN 1 ELSE 0 END) as preparing_orders,
        SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) as ready_orders,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders
      FROM orders
      WHERE date(created_at) = date('now')
    `).get() as any;

    // Today's reservations
    const reservationStats = db.prepare(`
      SELECT
        COUNT(*) as today_reservations,
        SUM(guests) as total_guests
      FROM reservations
      WHERE reservation_date = date('now')
    `).get() as any;

    // Total counts
    const totalCustomers = (db.prepare('SELECT COUNT(*) as c FROM customers').get() as any).c;
    const totalMenuItems = (db.prepare('SELECT COUNT(*) as c FROM menu_items WHERE is_available = 1').get() as any).c;

    // Popular menu items
    const popularItems = db.prepare(`
      SELECT oi.name, SUM(oi.quantity) as total_sold, SUM(oi.price * oi.quantity) as total_sales
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY oi.name
      ORDER BY total_sold DESC
      LIMIT 5
    `).all();

    // Recent 7 days sales
    const salesByDay = db.prepare(`
      SELECT date(created_at) as day, SUM(total) as revenue, COUNT(*) as orders_count
      FROM orders
      WHERE created_at >= date('now', '-7 days') AND status != 'cancelled'
      GROUP BY date(created_at)
      ORDER BY day ASC
    `).all();

    // Table occupancy overview
    const tableStatusCounts = db.prepare(`
      SELECT status, COUNT(*) as count FROM restaurant_tables GROUP BY status
    `).all();

    res.json({
      todayOrders: todayStats.total_orders || 0,
      todayRevenue: todayStats.total_revenue || 0,
      pendingOrders: todayStats.pending_orders || 0,
      preparingOrders: todayStats.preparing_orders || 0,
      readyOrders: todayStats.ready_orders || 0,
      completedOrders: todayStats.completed_orders || 0,
      todayReservations: reservationStats.today_reservations || 0,
      todayGuests: reservationStats.total_guests || 0,
      totalCustomers,
      totalMenuItems,
      popularItems,
      salesByDay,
      tableStatusCounts,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Orders Management
apiRouter.get('/admin/orders', authenticateToken, requireRole(['owner', 'admin', 'manager', 'staff']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, search, limit = 50 } = req.query;

    let sql = 'SELECT * FROM orders WHERE 1=1';
    const params: any[] = [];

    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (guest_name LIKE ? OR order_number LIKE ? OR guest_phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(Number(limit));

    const orders = db.prepare(sql).all(...params) as any[];

    // Fetch items for these orders
    const getItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
    const enrichedOrders = orders.map((o) => ({
      ...o,
      items: getItems.all(o.id),
    }));

    res.json(enrichedOrders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.patch('/admin/orders/:id/status', authenticateToken, requireRole(['owner', 'admin', 'manager', 'staff']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'preparing', 'ready', 'completed', 'cancelled'].includes(status)) {
      res.status(400).json({ error: 'Invalid order status' });
      return;
    }

    const result = db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    logAudit(req.user!, 'Update Order Status', 'Orders', `Order ${id} changed to ${status}`, req.ip);
    createNotification('order', `Order Status: ${status.toUpperCase()}`, `Order ${id} status updated to ${status}`);

    res.json({ success: true, orderId: id, status });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/admin/orders/:id', authenticateToken, requireRole(['owner', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM orders WHERE id = ?').run(id);
    logAudit(req.user!, 'Delete Order', 'Orders', `Deleted order record ${id}`, req.ip);
    res.json({ success: true, message: `Order ${id} deleted` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reservations Management
apiRouter.get('/admin/reservations', authenticateToken, requireRole(['owner', 'admin', 'manager', 'staff']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { date, status, search } = req.query;
    let sql = 'SELECT * FROM reservations WHERE 1=1';
    const params: any[] = [];

    if (date) {
      sql += ' AND reservation_date = ?';
      params.push(date);
    }
    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND (full_name LIKE ? OR confirmation_code LIKE ? OR phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY reservation_date DESC, reservation_time ASC';
    const reservations = db.prepare(sql).all(...params);
    res.json(reservations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/admin/reservations', authenticateToken, requireRole(['owner', 'admin', 'manager', 'staff']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fullName, phone, email, date, time, guests, seatingArea, tableId, tableName, specialRequests } = req.body;
    const resId = `res-${Date.now()}`;
    const confCode = `SB-${Math.floor(1000 + Math.random() * 9000)}`;

    db.prepare(`
      INSERT INTO reservations (id, confirmation_code, full_name, phone, email, reservation_date, reservation_time, guests, seating_area, table_id, table_name, status, special_requests)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?)
    `).run(resId, confCode, fullName, phone, email || null, date, time, Number(guests) || 2, seatingArea || 'main_hall', tableId || null, tableName || null, specialRequests || null);

    logAudit(req.user!, 'Create Reservation', 'Reservations', `Manual booking ${confCode} for ${fullName}`, req.ip);
    res.status(201).json({ success: true, id: resId, confirmationCode: confCode });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.patch('/admin/reservations/:id/status', authenticateToken, requireRole(['owner', 'admin', 'manager', 'staff']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, tableId, tableName } = req.body;

    if (tableId && tableName) {
      db.prepare('UPDATE reservations SET status = ?, table_id = ?, table_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, tableId, tableName, id);
    } else {
      db.prepare('UPDATE reservations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
    }

    logAudit(req.user!, 'Update Reservation Status', 'Reservations', `Reservation ${id} updated to ${status}`, req.ip);
    res.json({ success: true, id, status });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/admin/reservations/:id', authenticateToken, requireRole(['owner', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM reservations WHERE id = ?').run(id);
    logAudit(req.user!, 'Delete Reservation', 'Reservations', `Deleted reservation ${id}`, req.ip);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Menu Items & Categories Management
apiRouter.get('/admin/menu', authenticateToken, requireRole(['owner', 'admin', 'manager', 'staff']), (_req: AuthenticatedRequest, res: Response) => {
  try {
    const items = db.prepare(`
      SELECT m.*, c.name as category_name
      FROM menu_items m
      JOIN menu_categories c ON m.category_id = c.id
      ORDER BY c.sort_order ASC, m.sort_order ASC, m.name ASC
    `).all() as any[];

    const sizes = db.prepare('SELECT * FROM menu_item_sizes').all() as any[];
    const sizesByItem: Record<string, any[]> = {};
    for (const s of sizes) {
      if (!sizesByItem[s.item_id]) sizesByItem[s.item_id] = [];
      sizesByItem[s.item_id].push(s);
    }

    const enriched = items.map((it) => ({
      ...it,
      sizes: sizesByItem[it.id] || [],
    }));

    res.json(enriched);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/admin/menu', authenticateToken, requireRole(['owner', 'admin', 'manager']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { categoryId, name, description, price, originalPrice, image, badge, isFeatured, isSeasonal, spicyLevel, preparationTime, sizes } = req.body;

    if (!categoryId || !name || price === undefined) {
      res.status(400).json({ error: 'Category, name, and price are required' });
      return;
    }

    const id = `item-${Date.now()}`;
    db.prepare(`
      INSERT INTO menu_items (id, category_id, name, description, price, original_price, image, badge, is_featured, is_seasonal, spicy_level, preparation_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, categoryId, name, description || '', Number(price), originalPrice ? Number(originalPrice) : null, image || null, badge || null, isFeatured ? 1 : 0, isSeasonal ? 1 : 0, Number(spicyLevel) || 0, preparationTime || '15-20 mins');

    if (Array.isArray(sizes)) {
      const insSize = db.prepare('INSERT INTO menu_item_sizes (id, item_id, size_name, price, description) VALUES (?, ?, ?, ?, ?)');
      for (const s of sizes) {
        if (s.sizeName && s.price) {
          insSize.run(`size-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, id, s.sizeName, Number(s.price), s.description || null);
        }
      }
    }

    logAudit(req.user!, 'Create Menu Item', 'Menu Management', `Added ${name} (Rs ${price})`, req.ip);
    res.status(201).json({ success: true, id, name });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/admin/menu/:id', authenticateToken, requireRole(['owner', 'admin', 'manager']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { categoryId, name, description, price, originalPrice, image, badge, isAvailable, isSoldOut, isFeatured, isSeasonal, spicyLevel, preparationTime, sizes } = req.body;

    const result = db.prepare(`
      UPDATE menu_items
      SET category_id = COALESCE(?, category_id),
          name = COALESCE(?, name),
          description = COALESCE(?, description),
          price = COALESCE(?, price),
          original_price = ?,
          image = COALESCE(?, image),
          badge = ?,
          is_available = COALESCE(?, is_available),
          is_sold_out = COALESCE(?, is_sold_out),
          is_featured = COALESCE(?, is_featured),
          is_seasonal = COALESCE(?, is_seasonal),
          spicy_level = COALESCE(?, spicy_level),
          preparation_time = COALESCE(?, preparation_time),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      categoryId,
      name,
      description,
      price !== undefined ? Number(price) : null,
      originalPrice ? Number(originalPrice) : null,
      image,
      badge !== undefined ? badge : null,
      isAvailable !== undefined ? (isAvailable ? 1 : 0) : null,
      isSoldOut !== undefined ? (isSoldOut ? 1 : 0) : null,
      isFeatured !== undefined ? (isFeatured ? 1 : 0) : null,
      isSeasonal !== undefined ? (isSeasonal ? 1 : 0) : null,
      spicyLevel !== undefined ? Number(spicyLevel) : null,
      preparationTime,
      id
    );

    if (result.changes === 0) {
      res.status(404).json({ error: 'Menu item not found' });
      return;
    }

    if (Array.isArray(sizes)) {
      db.prepare('DELETE FROM menu_item_sizes WHERE item_id = ?').run(id);
      const insSize = db.prepare('INSERT INTO menu_item_sizes (id, item_id, size_name, price, description) VALUES (?, ?, ?, ?, ?)');
      for (const s of sizes) {
        if (s.sizeName && s.price) {
          insSize.run(`size-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, id, s.sizeName, Number(s.price), s.description || null);
        }
      }
    }

    logAudit(req.user!, 'Update Menu Item', 'Menu Management', `Updated ${name || id} (Price: Rs ${price})`, req.ip);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/admin/menu/:id', authenticateToken, requireRole(['owner', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM menu_items WHERE id = ?').run(id);
    logAudit(req.user!, 'Delete Menu Item', 'Menu Management', `Deleted item ${id}`, req.ip);
    res.json({ success: true, message: `Menu item ${id} deleted` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Categories
apiRouter.get('/admin/categories', authenticateToken, requireRole(['owner', 'admin', 'manager', 'staff']), (_req: AuthenticatedRequest, res: Response) => {
  try {
    const cats = db.prepare('SELECT * FROM menu_categories ORDER BY sort_order ASC').all();
    res.json(cats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/admin/categories', authenticateToken, requireRole(['owner', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, slug, description, sortOrder } = req.body;
    const id = `cat-${Date.now()}`;
    db.prepare('INSERT INTO menu_categories (id, name, slug, description, sort_order) VALUES (?, ?, ?, ?, ?)').run(id, name, slug || name.toLowerCase().replace(/\s+/g, '-'), description || '', Number(sortOrder) || 0);

    logAudit(req.user!, 'Create Category', 'Categories', `Created category ${name}`, req.ip);
    res.status(201).json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/admin/categories/:id', authenticateToken, requireRole(['owner', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, description, sortOrder, isActive } = req.body;

    db.prepare(`
      UPDATE menu_categories
      SET name = COALESCE(?, name),
          slug = COALESCE(?, slug),
          description = COALESCE(?, description),
          sort_order = COALESCE(?, sort_order),
          is_active = COALESCE(?, is_active)
      WHERE id = ?
    `).run(name, slug, description, sortOrder !== undefined ? Number(sortOrder) : null, isActive !== undefined ? (isActive ? 1 : 0) : null, id);

    logAudit(req.user!, 'Update Category', 'Categories', `Updated category ${id}`, req.ip);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/admin/categories/:id', authenticateToken, requireRole(['owner', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM menu_categories WHERE id = ?').run(id);
    logAudit(req.user!, 'Delete Category', 'Categories', `Deleted category ${id}`, req.ip);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Tables Management
apiRouter.get('/admin/tables', authenticateToken, requireRole(['owner', 'admin', 'manager', 'staff']), (_req: AuthenticatedRequest, res: Response) => {
  try {
    const tables = db.prepare('SELECT * FROM restaurant_tables ORDER BY table_number ASC').all();
    res.json(tables);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/admin/tables', authenticateToken, requireRole(['owner', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { tableNumber, name, zone, zoneTitle, capacity, status, perk } = req.body;
    const id = tableNumber || `tab-${Date.now()}`;

    db.prepare(`
      INSERT INTO restaurant_tables (id, table_number, name, zone, zone_title, capacity, status, perk)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, tableNumber, name, zone, zoneTitle || zone, Number(capacity) || 4, status || 'available', perk || null);

    logAudit(req.user!, 'Create Table', 'Tables', `Added table ${tableNumber} in ${zone}`, req.ip);
    res.status(201).json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/admin/tables/:id', authenticateToken, requireRole(['owner', 'admin', 'manager', 'staff']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { tableNumber, name, zone, zoneTitle, capacity, status, perk } = req.body;

    db.prepare(`
      UPDATE restaurant_tables
      SET table_number = COALESCE(?, table_number),
          name = COALESCE(?, name),
          zone = COALESCE(?, zone),
          zone_title = COALESCE(?, zone_title),
          capacity = COALESCE(?, capacity),
          status = COALESCE(?, status),
          perk = COALESCE(?, perk),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(tableNumber, name, zone, zoneTitle, capacity !== undefined ? Number(capacity) : null, status, perk, id);

    logAudit(req.user!, 'Update Table Status', 'Tables', `Table ${id} status set to ${status}`, req.ip);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/admin/tables/:id', authenticateToken, requireRole(['owner', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM restaurant_tables WHERE id = ?').run(id);
    logAudit(req.user!, 'Delete Table', 'Tables', `Removed table ${id}`, req.ip);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Offers & Discounts
apiRouter.get('/admin/offers', authenticateToken, requireRole(['owner', 'admin', 'manager']), (_req: AuthenticatedRequest, res: Response) => {
  try {
    const offers = db.prepare('SELECT * FROM offers ORDER BY created_at DESC').all();
    res.json(offers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/admin/offers', authenticateToken, requireRole(['owner', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { promoCode, title, description, discountType, discountValue, minSpend, maxDiscount, startDate, endDate, isActive } = req.body;

    const id = `off-${Date.now()}`;
    db.prepare(`
      INSERT INTO offers (id, promo_code, title, description, discount_type, discount_value, min_spend, max_discount, start_date, end_date, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      promoCode.trim().toUpperCase(),
      title,
      description || '',
      discountType || 'percentage',
      Number(discountValue),
      Number(minSpend) || 0,
      maxDiscount ? Number(maxDiscount) : null,
      startDate || null,
      endDate || null,
      isActive !== undefined ? (isActive ? 1 : 0) : 1
    );

    logAudit(req.user!, 'Create Offer', 'Offers & Discounts', `Created promo code ${promoCode}`, req.ip);
    res.status(201).json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/admin/offers/:id', authenticateToken, requireRole(['owner', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { promoCode, title, description, discountType, discountValue, minSpend, maxDiscount, startDate, endDate, isActive } = req.body;

    db.prepare(`
      UPDATE offers
      SET promo_code = COALESCE(?, promo_code),
          title = COALESCE(?, title),
          description = COALESCE(?, description),
          discount_type = COALESCE(?, discount_type),
          discount_value = COALESCE(?, discount_value),
          min_spend = COALESCE(?, min_spend),
          max_discount = ?,
          start_date = ?,
          end_date = ?,
          is_active = COALESCE(?, is_active)
      WHERE id = ?
    `).run(
      promoCode ? promoCode.trim().toUpperCase() : null,
      title,
      description,
      discountType,
      discountValue !== undefined ? Number(discountValue) : null,
      minSpend !== undefined ? Number(minSpend) : null,
      maxDiscount ? Number(maxDiscount) : null,
      startDate || null,
      endDate || null,
      isActive !== undefined ? (isActive ? 1 : 0) : null,
      id
    );

    logAudit(req.user!, 'Update Offer', 'Offers & Discounts', `Updated offer ${id}`, req.ip);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/admin/offers/:id', authenticateToken, requireRole(['owner', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM offers WHERE id = ?').run(id);
    logAudit(req.user!, 'Delete Offer', 'Offers & Discounts', `Removed offer ${id}`, req.ip);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Customers
apiRouter.get('/admin/customers', authenticateToken, requireRole(['owner', 'admin', 'manager']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search } = req.query;
    let sql = 'SELECT * FROM customers WHERE 1=1';
    const params: any[] = [];

    if (search) {
      sql += ' AND (full_name LIKE ? OR phone LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY total_spent DESC, total_orders DESC LIMIT 100';
    const customers = db.prepare(sql).all(...params);
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Staff Management (OWNER ONLY)
apiRouter.get('/admin/staff', authenticateToken, requireRole(['owner']), (_req: AuthenticatedRequest, res: Response) => {
  try {
    const staff = db.prepare(`
      SELECT id, email, full_name, phone, role, is_active, two_factor_enabled, last_login, created_at
      FROM users
      ORDER BY role ASC, full_name ASC
    `).all();
    res.json(staff);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/admin/staff', authenticateToken, requireRole(['owner']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password, fullName, phone, role } = req.body;

    if (!email || !password || !fullName || !role) {
      res.status(400).json({ error: 'Email, password, full name, and role are required' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const id = `usr-${Date.now()}`;

    db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, phone, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run(id, email.trim().toLowerCase(), hash, fullName, phone || null, role);

    logAudit(req.user!, 'Add Staff Member', 'Staff Management', `Created ${role} account for ${email} (${fullName})`, req.ip);
    res.status(201).json({ success: true, id, email });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/admin/staff/:id', authenticateToken, requireRole(['owner']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, phone, role, isActive } = req.body;

    db.prepare(`
      UPDATE users
      SET full_name = COALESCE(?, full_name),
          phone = COALESCE(?, phone),
          role = COALESCE(?, role),
          is_active = COALESCE(?, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(fullName, phone, role, isActive !== undefined ? (isActive ? 1 : 0) : null, id);

    logAudit(req.user!, 'Update Staff Member', 'Staff Management', `Updated staff ${id}`, req.ip);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/admin/staff/:id/reset-password', authenticateToken, requireRole(['owner']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPassword, salt);

    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(hash, id);
    logAudit(req.user!, 'Owner Password Reset', 'Staff Management', `Reset password for user ${id}`, req.ip);
    res.json({ success: true, message: 'Staff password has been reset' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/admin/staff/:id', authenticateToken, requireRole(['owner']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (id === req.user!.id) {
      res.status(400).json({ error: 'Cannot delete your own active owner account' });
      return;
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    logAudit(req.user!, 'Delete Staff Member', 'Staff Management', `Removed staff member ${id}`, req.ip);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Website Content & Settings Control
apiRouter.get('/admin/settings', authenticateToken, requireRole(['owner', 'admin']), (_req: AuthenticatedRequest, res: Response) => {
  try {
    const settings = db.prepare('SELECT * FROM settings').all();
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/admin/settings', authenticateToken, requireRole(['owner', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
      res.status(400).json({ error: 'Settings key-value map required' });
      return;
    }

    const upsert = db.prepare(`
      INSERT INTO settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `);

    for (const [k, v] of Object.entries(settings)) {
      upsert.run(k, String(v));
    }

    logAudit(req.user!, 'Update Website Settings', 'Website Content', `Updated ${Object.keys(settings).length} settings keys`, req.ip);
    res.json({ success: true, updatedKeys: Object.keys(settings) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reviews Management
apiRouter.get('/admin/reviews', authenticateToken, requireRole(['owner', 'admin', 'manager']), (_req: AuthenticatedRequest, res: Response) => {
  try {
    const reviews = db.prepare('SELECT * FROM reviews ORDER BY created_at DESC').all();
    res.json(reviews);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.patch('/admin/reviews/:id/status', authenticateToken, requireRole(['owner', 'admin', 'manager']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, isFeatured } = req.body;

    db.prepare(`
      UPDATE reviews
      SET status = COALESCE(?, status),
          is_featured = COALESCE(?, is_featured)
      WHERE id = ?
    `).run(status, isFeatured !== undefined ? (isFeatured ? 1 : 0) : null, id);

    logAudit(req.user!, 'Moderate Review', 'Reviews', `Review ${id} status set to ${status}`, req.ip);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/admin/reviews/:id', authenticateToken, requireRole(['owner', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM reviews WHERE id = ?').run(id);
    logAudit(req.user!, 'Delete Review', 'Reviews', `Deleted review ${id}`, req.ip);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Notifications
apiRouter.get('/admin/notifications', authenticateToken, requireRole(['owner', 'admin', 'manager', 'staff']), (_req: AuthenticatedRequest, res: Response) => {
  try {
    const notifications = db.prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50').all();
    const unreadCount = (db.prepare('SELECT COUNT(*) as c FROM notifications WHERE is_read = 0').get() as any).c;
    res.json({ notifications, unreadCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.patch('/admin/notifications/:id/read', authenticateToken, requireRole(['owner', 'admin', 'manager', 'staff']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/admin/notifications/read-all', authenticateToken, requireRole(['owner', 'admin', 'manager', 'staff']), (_req: AuthenticatedRequest, res: Response) => {
  try {
    db.prepare('UPDATE notifications SET is_read = 1').run();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Activity Logs (Audit Trail)
apiRouter.get('/admin/activity-logs', authenticateToken, requireRole(['owner', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { limit = 100, section } = req.query;
    let sql = 'SELECT * FROM activity_logs WHERE 1=1';
    const params: any[] = [];

    if (section && section !== 'all') {
      sql += ' AND section = ?';
      params.push(section);
    }

    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(Number(limit));

    const logs = db.prepare(sql).all(...params);
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
