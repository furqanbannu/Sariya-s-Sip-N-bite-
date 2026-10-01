import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists for persistent sqlite file
const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'restaurant.sqlite');
console.log(`[Database] Connecting to persistent SQLite database at: ${dbPath}`);

export const db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys for high performance and integrity
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
`);

/**
 * Initialize all 18 production tables
 */
export function initDatabase() {
  db.exec(`
    -- 1. Roles table
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Permissions table
    CREATE TABLE IF NOT EXISTS permissions (
      id TEXT PRIMARY KEY,
      role_id TEXT NOT NULL,
      section TEXT NOT NULL,
      can_read INTEGER DEFAULT 1,
      can_write INTEGER DEFAULT 0,
      can_delete INTEGER DEFAULT 0,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
    );

    -- 3. Users / Staff table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'staff',
      is_active INTEGER DEFAULT 1,
      two_factor_enabled INTEGER DEFAULT 0,
      two_factor_secret TEXT,
      last_login DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (role) REFERENCES roles(id)
    );

    -- 4. Menu Categories
    CREATE TABLE IF NOT EXISTS menu_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 5. Menu Items
    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      original_price INTEGER,
      image TEXT,
      badge TEXT,
      is_available INTEGER DEFAULT 1,
      is_sold_out INTEGER DEFAULT 0,
      is_featured INTEGER DEFAULT 0,
      is_seasonal INTEGER DEFAULT 0,
      spicy_level INTEGER DEFAULT 0,
      preparation_time TEXT DEFAULT '15-20 mins',
      calories INTEGER,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE
    );

    -- 6. Menu Item Sizes (especially for Pizzas)
    CREATE TABLE IF NOT EXISTS menu_item_sizes (
      id TEXT PRIMARY KEY,
      item_id TEXT NOT NULL,
      size_name TEXT NOT NULL, -- 'Small', 'Medium', 'Large', 'Extra Large'
      price INTEGER NOT NULL,
      description TEXT,
      is_available INTEGER DEFAULT 1,
      FOREIGN KEY (item_id) REFERENCES menu_items(id) ON DELETE CASCADE
    );

    -- 7. Menu Item Add-ons
    CREATE TABLE IF NOT EXISTS menu_item_addons (
      id TEXT PRIMARY KEY,
      item_id TEXT, -- NULL means applicable to entire category
      category_id TEXT,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      is_available INTEGER DEFAULT 1,
      FOREIGN KEY (item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE
    );

    -- 8. Customers
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      phone TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      email TEXT,
      total_orders INTEGER DEFAULT 0,
      total_spent INTEGER DEFAULT 0,
      loyalty_points INTEGER DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 9. Restaurant Tables
    CREATE TABLE IF NOT EXISTS restaurant_tables (
      id TEXT PRIMARY KEY,
      table_number TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      zone TEXT NOT NULL, -- 'terrace', 'fireplace', 'main_hall', 'private_booth'
      zone_title TEXT NOT NULL,
      capacity INTEGER NOT NULL DEFAULT 4,
      status TEXT NOT NULL DEFAULT 'available', -- 'available', 'reserved', 'occupied', 'cleaning'
      perk TEXT,
      pos_x INTEGER,
      pos_y INTEGER,
      shape TEXT DEFAULT 'rect',
      is_active INTEGER DEFAULT 1,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 10. Orders
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT NOT NULL UNIQUE,
      customer_id TEXT,
      guest_name TEXT NOT NULL,
      guest_phone TEXT NOT NULL,
      order_type TEXT NOT NULL, -- 'dine_in', 'room_service', 'takeaway'
      location_note TEXT,
      status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'preparing', 'ready', 'completed', 'cancelled'
      subtotal INTEGER NOT NULL,
      discount_amount INTEGER DEFAULT 0,
      tip_amount INTEGER DEFAULT 0,
      tip_percentage TEXT,
      total INTEGER NOT NULL,
      promo_code TEXT,
      estimated_time TEXT DEFAULT '20-25 mins',
      notes TEXT,
      reviewed INTEGER DEFAULT 0,
      rating INTEGER,
      review_comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    -- 11. Order Items
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      size_name TEXT,
      special_instructions TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    -- 12. Reservations
    CREATE TABLE IF NOT EXISTS reservations (
      id TEXT PRIMARY KEY,
      confirmation_code TEXT NOT NULL UNIQUE,
      customer_id TEXT,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      reservation_date TEXT NOT NULL,
      reservation_time TEXT NOT NULL,
      guests INTEGER NOT NULL,
      seating_area TEXT NOT NULL,
      table_id TEXT,
      table_name TEXT,
      status TEXT NOT NULL DEFAULT 'approved', -- 'approved', 'seated', 'completed', 'cancelled', 'rejected'
      special_requests TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (table_id) REFERENCES restaurant_tables(id)
    );

    -- 13. Offers & Discounts
    CREATE TABLE IF NOT EXISTS offers (
      id TEXT PRIMARY KEY,
      promo_code TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage', 'fixed'
      discount_value INTEGER NOT NULL,
      min_spend INTEGER DEFAULT 0,
      max_discount INTEGER,
      start_date TEXT,
      end_date TEXT,
      is_active INTEGER DEFAULT 1,
      usage_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 14. Gallery
    CREATE TABLE IF NOT EXISTS gallery (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL, -- 'dining', 'terrace', 'fireplace', 'cuisine'
      image_url TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 15. Reviews
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      order_id TEXT,
      author TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      location TEXT DEFAULT 'Mall Road, Murree',
      dish_tag TEXT,
      is_verified INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      status TEXT DEFAULT 'published', -- 'published', 'hidden'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 16. Notifications (Admin in-app alerts)
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL, -- 'order', 'reservation', 'low_stock', 'customer', 'system'
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      reference_id TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 17. Website Content Settings (Key-Value & Structured Content)
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 18. Activity Logs (Audit Trail)
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_email TEXT NOT NULL,
      action TEXT NOT NULL,
      section TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for performance
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
    CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);
    CREATE INDEX IF NOT EXISTS idx_menu_category ON menu_items(category_id);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);
  `);

  console.log('[Database] Schema verified successfully.');

  // Seed default data if empty
  seedInitialData();
}

/**
 * Seed initial administrative users, menu, tables, content, and settings
 */
function seedInitialData() {
  // Check if roles exist
  const rolesCount = db.prepare('SELECT COUNT(*) as count FROM roles').get() as { count: number };
  if (rolesCount.count === 0) {
    console.log('[Database] Seeding roles and permissions...');
    const roles = [
      { id: 'owner', name: 'Owner', description: 'Full access to all operations, staff, finances, and system settings' },
      { id: 'admin', name: 'Admin', description: 'Manage restaurant operations, menu, orders, tables, content, and reports' },
      { id: 'manager', name: 'Manager', description: 'Manage orders, reservations, menu items, customers, and reports' },
      { id: 'staff', name: 'Staff', description: 'Front-of-house staff: manage live orders, reservations, and view menu' },
    ];

    const insertRole = db.prepare('INSERT INTO roles (id, name, description) VALUES (?, ?, ?)');
    for (const r of roles) {
      insertRole.run(r.id, r.name, r.description);
    }
  }

  // Check if users exist
  const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (usersCount.count === 0) {
    console.log('[Database] Seeding initial admin users...');
    const salt = bcrypt.genSaltSync(10);
    const ownerHash = bcrypt.hashSync('SariyaOwner2026!', salt);
    const adminHash = bcrypt.hashSync('AdminPass2026!', salt);
    const managerHash = bcrypt.hashSync('ManagerPass2026!', salt);
    const staffHash = bcrypt.hashSync('StaffPass2026!', salt);

    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, phone, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);

    insertUser.run('usr-owner', 'owner@sariyas.com', ownerHash, 'Sariya Malik (Proprietor)', '+92 300 8555123', 'owner');
    insertUser.run('usr-admin', 'admin@sariyas.com', adminHash, 'Hamza Tariq (General Manager)', '+92 321 5556789', 'admin');
    insertUser.run('usr-manager', 'manager@sariyas.com', managerHash, 'Rashid Khan (Floor Manager)', '+92 333 4445566', 'manager');
    insertUser.run('usr-staff', 'staff@sariyas.com', staffHash, 'Bilal Ahmed (Service Staff)', '+92 311 2223344', 'staff');
  }

  // Check if categories exist
  const catCount = db.prepare('SELECT COUNT(*) as count FROM menu_categories').get() as { count: number };
  if (catCount.count === 0) {
    console.log('[Database] Seeding menu categories and items...');
    const categories = [
      { id: 'cat-steaks', name: 'Steaks & Platters', slug: 'steaks', description: 'Sizzling cast-iron fillets and mountain specialties', sort: 1 },
      { id: 'cat-pizzas', name: 'Artisan Pizzas', slug: 'pizzas', description: 'Hand-tossed crust stone-baked over pine embers', sort: 2 },
      { id: 'cat-pastas', name: 'Signature Pastas', slug: 'pastas', description: 'Velvety cream reductions and fresh herb fettuccine', sort: 3 },
      { id: 'cat-burgers', name: 'Burgers & Shawarmas', slug: 'burgers', description: 'Charcoal grilled patties and authentic spit-roasted wraps', sort: 4 },
      { id: 'cat-starters', name: 'Hot Appetizers', slug: 'starters', description: 'Crisp finger foods and mountain comfort bites', sort: 5 },
      { id: 'cat-beverages', name: 'Alpine Beverages & Chai', slug: 'beverages', description: 'Authentic Kashmiri Noon Chai, Karak tea, and coolers', sort: 6 },
      { id: 'cat-desserts', name: 'Cakes & Desserts', slug: 'desserts', description: 'Molten chocolate souffles and daily fresh patisserie', sort: 7 },
    ];

    const insertCat = db.prepare('INSERT INTO menu_categories (id, name, slug, description, sort_order) VALUES (?, ?, ?, ?, ?)');
    for (const c of categories) {
      insertCat.run(c.id, c.name, c.slug, c.description, c.sort);
    }

    // Seed Menu Items
    const items = [
      // Steaks
      {
        id: 'item-steak-italian',
        cat: 'cat-steaks',
        name: 'Italian Chicken Steak',
        desc: 'Charcoal grilled chicken breast fillet smothered in creamy wild mushroom & herb tarragon reduction, accompanied by herb-roasted baby potatoes and charred seasonal alpine vegetables.',
        price: 950,
        img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
        badge: 'Chef Signature',
        featured: 1,
        seasonal: 0,
        prep: '20 mins',
      },
      {
        id: 'item-steak-peppercorn',
        cat: 'cat-steaks',
        name: 'Black Peppercorn Sirloin Steak',
        desc: 'Tender marinated cut with cracked green peppercorn jus, garlic butter glaze, and roasted garlic mash.',
        price: 990,
        img: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
        badge: 'Bestseller',
        featured: 1,
        seasonal: 1,
        prep: '22 mins',
      },
      {
        id: 'item-steak-jalapeno',
        cat: 'cat-steaks',
        name: 'Fiery Jalapeno Cheese Steak',
        desc: 'Sizzling chicken cutlet topped with spicy queso blanco sauce, pickled jalapeno slivers, and loaded crinkle fries.',
        price: 920,
        img: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=800&q=80',
        badge: 'Spicy',
        featured: 0,
        seasonal: 0,
        prep: '18 mins',
      },

      // Pizzas
      {
        id: 'item-pizza-malai',
        cat: 'cat-pizzas',
        name: 'Signature Malai Boti Pizza',
        desc: 'Our celebrated Mall Road creation. Tender charcoal-smoked chicken malai boti nuggets, roasted red onions, sweet capsicum, golden mozzarella, and secret spiced garlic aioli swirl.',
        price: 890,
        img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
        badge: 'Murree Famous',
        featured: 1,
        seasonal: 0,
        prep: '20 mins',
      },
      {
        id: 'item-pizza-tikka',
        cat: 'cat-pizzas',
        name: 'Spicy Chicken Tikka Pizza',
        desc: 'Traditional spicy tandoori chicken chunks, diced sweet peppers, fresh coriander, and melted mozzarella blend.',
        price: 850,
        img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
        badge: 'Popular',
        featured: 0,
        seasonal: 0,
        prep: '18 mins',
      },
      {
        id: 'item-pizza-fajita',
        cat: 'cat-pizzas',
        name: 'Fajita Feast Supreme',
        desc: 'Mexican-marinated fajita chicken, charred Spanish onions, black olives, jalapenos, and mozzarella crust.',
        price: 870,
        img: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80',
        badge: null,
        featured: 0,
        seasonal: 0,
        prep: '18 mins',
      },

      // Pastas
      {
        id: 'item-pasta-special',
        cat: 'cat-pastas',
        name: 'Special Pasta Alfredo',
        desc: 'Velvety fettuccine tossed in a 24-hour garlic parmesan cream reduction, seared chicken strips, and freshly grated Grana Padano cheese.',
        price: 780,
        img: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281788?auto=format&fit=crop&w=800&q=80',
        badge: 'Customer Choice',
        featured: 1,
        seasonal: 0,
        prep: '16 mins',
      },
      {
        id: 'item-pasta-crispy',
        cat: 'cat-pastas',
        name: 'Crispy Pasta Supreme',
        desc: 'Penne tossed in spicy arrabbiata rose sauce, crowned with golden parmesan chicken schnitzel bites and basil chiffonade.',
        price: 790,
        img: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=800&q=80',
        badge: 'Crispy Delight',
        featured: 0,
        seasonal: 0,
        prep: '16 mins',
      },

      // Burgers & Shawarma
      {
        id: 'item-shawarma-lebanese',
        cat: 'cat-burgers',
        name: 'Special Lebanese Shawarma',
        desc: 'Slow-spit roasted chicken rolled in freshly toasted saj bread with authentic garlic toum, pickled turnip, and hand-cut fries.',
        price: 450,
        img: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=800&q=80',
        badge: 'Authentic',
        featured: 1,
        seasonal: 0,
        prep: '10 mins',
      },
      {
        id: 'item-burger-smash',
        cat: 'cat-burgers',
        name: 'Highland Double Cheese Smash Burger',
        desc: 'Double charcoal-seared beef patties, melted cheddar slices, caramelized mountain onions, and house truffle sauce on brioche.',
        price: 680,
        img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
        badge: 'Juicy',
        featured: 0,
        seasonal: 0,
        prep: '15 mins',
      },

      // Starters
      {
        id: 'item-wings-honey',
        cat: 'cat-starters',
        name: 'Honey Glazed Sesame Wings',
        desc: '8 jumbo crispy wings tossed in sticky mountain honey and toasted sesame chili glaze.',
        price: 490,
        img: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80',
        badge: 'Shareable',
        featured: 0,
        seasonal: 0,
        prep: '12 mins',
      },
      {
        id: 'item-finger-fish',
        cat: 'cat-starters',
        name: 'Crispy Golden Finger Fish',
        desc: 'Flaky fresh fish fingers coated in light spiced batter, served with tangy mountain tartar dip.',
        price: 620,
        img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
        badge: 'Winter Special',
        featured: 0,
        seasonal: 1,
        prep: '14 mins',
      },

      // Beverages
      {
        id: 'item-noon-chai',
        cat: 'cat-beverages',
        name: 'Kashmiri Pink Noon Chai',
        desc: 'Traditional high-altitude salted green tea slow-simmered with clotted cream, crushed pistachios, and slivered almonds.',
        price: 240,
        img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
        badge: 'Traditional',
        featured: 1,
        seasonal: 1,
        prep: '8 mins',
      },
      {
        id: 'item-karak-chai',
        cat: 'cat-beverages',
        name: 'Murree Mountain Karak Chai',
        desc: 'Strong brewed black tea infused with cracked green cardamom, whole milk, and cinnamon bark.',
        price: 180,
        img: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
        badge: 'Highland Essential',
        featured: 0,
        seasonal: 0,
        prep: '6 mins',
      },
      {
        id: 'item-hot-chocolate',
        cat: 'cat-beverages',
        name: 'Alpine Hot Chocolate with Marshmallows',
        desc: 'Thick melted Swiss dark chocolate drink topped with toasted mini marshmallows and cocoa dusting.',
        price: 390,
        img: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=800&q=80',
        badge: 'Fireplace Favorite',
        featured: 0,
        seasonal: 1,
        prep: '8 mins',
      },

      // Desserts
      {
        id: 'item-cake-day',
        cat: 'cat-desserts',
        name: 'Cake of the Day (Slice)',
        desc: 'Artisanal daily patisserie slice: Lotus Biscoff Dream, Belgian Triple Chocolate, or Pistachio Rose Chiffon.',
        price: 420,
        img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
        badge: 'Fresh Daily',
        featured: 1,
        seasonal: 0,
        prep: '5 mins',
      },
      {
        id: 'item-sizzling-brownie',
        cat: 'cat-desserts',
        name: 'Sizzling Hot Cast-Iron Brownie',
        desc: 'Warm fudge brownie served sizzling on cast iron with a scoop of French vanilla gelato and hot dark chocolate pour.',
        price: 490,
        img: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
        badge: 'Irresistible',
        featured: 0,
        seasonal: 0,
        prep: '10 mins',
      },
    ];

    const insertItem = db.prepare(`
      INSERT INTO menu_items (id, category_id, name, description, price, image, badge, is_featured, is_seasonal, preparation_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const it of items) {
      insertItem.run(it.id, it.cat, it.name, it.desc, it.price, it.img, it.badge, it.featured, it.seasonal, it.prep);
    }

    // Seed Pizza Sizes for pizzas
    const insertSize = db.prepare('INSERT INTO menu_item_sizes (id, item_id, size_name, price, description) VALUES (?, ?, ?, ?, ?)');
    const pizzaIds = ['item-pizza-malai', 'item-pizza-tikka', 'item-pizza-fajita'];
    for (const pid of pizzaIds) {
      const basePrice = pid === 'item-pizza-malai' ? 890 : pid === 'item-pizza-fajita' ? 870 : 850;
      insertSize.run(`size-${pid}-s`, pid, 'Small', Math.round(basePrice * 0.7), 'Personal 7" pan pizza (4 slices)');
      insertSize.run(`size-${pid}-m`, pid, 'Medium', basePrice, 'Classic 10" regular pizza (6 slices)');
      insertSize.run(`size-${pid}-l`, pid, 'Large', Math.round(basePrice * 1.55), 'Generous 13" family pizza (8 slices)');
      insertSize.run(`size-${pid}-xl`, pid, 'Extra Large', Math.round(basePrice * 2.1), 'Jumbo 16" party pizza (12 slices)');
    }
  }

  // Seed Tables
  const tableCount = db.prepare('SELECT COUNT(*) as count FROM restaurant_tables').get() as { count: number };
  if (tableCount.count === 0) {
    console.log('[Database] Seeding restaurant tables...');
    const tables = [
      { id: 'T-1', num: 'T-1', name: 'T-1 · Cliffside Panorama', zone: 'terrace', zt: 'Terrace View', cap: 2, perk: 'Unobstructed panorama of Kashmir Point pine valleys', status: 'available' },
      { id: 'T-2', num: 'T-2', name: 'T-2 · Alpine Mist Perch', zone: 'terrace', zt: 'Terrace View', cap: 4, perk: 'Direct glass-railing perch with cool mountain breezes', status: 'available' },
      { id: 'T-3', num: 'T-3', name: 'T-3 · Pine Canopy Corner', zone: 'terrace', zt: 'Terrace View', cap: 4, perk: 'Surrounded by fragrant Himalayan cedar pine branches', status: 'available' },
      { id: 'T-4', num: 'T-4', name: 'T-4 · Sunset Ridge Table', zone: 'terrace', zt: 'Terrace View', cap: 6, perk: 'Premier corner with amber sunset views over Mall Road', status: 'available' },

      { id: 'F-1', num: 'F-1', name: 'F-1 · Fireside Armchairs', zone: 'fireplace', zt: 'Fireplace Corner', cap: 2, perk: 'Placed right beside the roaring stone fireplace', status: 'available' },
      { id: 'F-2', num: 'F-2', name: 'F-2 · Cedar Hearthside 4-Top', zone: 'fireplace', zt: 'Fireplace Corner', cap: 4, perk: 'Cozy warmth and crackling wood embers', status: 'occupied' },
      { id: 'F-3', num: 'F-3', name: 'F-3 · Hearth Family Round', zone: 'fireplace', zt: 'Fireplace Corner', cap: 6, perk: 'Spacious table benefiting from constant radiant hearth warmth', status: 'available' },

      { id: 'M-1', num: 'M-1', name: 'M-1 · Chandelier Aisle', zone: 'main_hall', zt: 'Central Grand Hall', cap: 4, perk: 'Directly beneath our bespoke Murree iron chandeliers', status: 'available' },
      { id: 'M-2', num: 'M-2', name: 'M-2 · Grand Center 6-Top', zone: 'main_hall', zt: 'Central Grand Hall', cap: 6, perk: 'Prime central position for dining atmosphere and live service', status: 'reserved' },
      { id: 'M-3', num: 'M-3', name: 'M-3 · Courtyard Aisle', zone: 'main_hall', zt: 'Central Grand Hall', cap: 4, perk: 'Quiet central hall setting near hotel garden courtyard', status: 'available' },
      { id: 'M-4', num: 'M-4', name: 'M-4 · Timber Beam 4-Top', zone: 'main_hall', zt: 'Central Grand Hall', cap: 4, perk: 'Flanked by historic deodar timber architectural columns', status: 'cleaning' },
      { id: 'M-5', num: 'M-5', name: 'M-5 · Imperial Banquet Table', zone: 'main_hall', zt: 'Central Grand Hall', cap: 8, perk: 'Long banquet layout designed for large family gatherings', status: 'available' },

      { id: 'P-1', num: 'P-1', name: 'P-1 · Curtained Pine Alcove', zone: 'private_booth', zt: 'Private Family Booth', cap: 4, perk: 'Velvet curtained partition offering intimate family privacy', status: 'available' },
      { id: 'P-2', num: 'P-2', name: 'P-2 · Highland Family Suite', zone: 'private_booth', zt: 'Private Family Booth', cap: 6, perk: 'Upholstered high-back booth seating with dedicated service bell', status: 'available' },
      { id: 'P-3', num: 'P-3', name: 'P-3 · Murree Honeymoon Nook', zone: 'private_booth', zt: 'Private Family Booth', cap: 4, perk: 'Secluded corner alcove with dim candlelight and warm timber panels', status: 'available' },
    ];

    const insertTable = db.prepare(`
      INSERT INTO restaurant_tables (id, table_number, name, zone, zone_title, capacity, status, perk)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const t of tables) {
      insertTable.run(t.id, t.num, t.name, t.zone, t.zt, t.cap, t.status, t.perk);
    }
  }

  // Seed Offers
  const offerCount = db.prepare('SELECT COUNT(*) as count FROM offers').get() as { count: number };
  if (offerCount.count === 0) {
    console.log('[Database] Seeding promotional offers...');
    const offers = [
      { id: 'off-welcome', code: 'MALLROAD10', title: 'Highland Welcome 10% Off', desc: 'Enjoy 10% discount on all dining orders above Rs 1,500', type: 'percentage', val: 10, min: 1500, active: 1 },
      { id: 'off-family', code: 'FAMILYFEAST', title: 'Family Feast Rs 300 Off', desc: 'Flat Rs 300 off on any 2 Large or Extra Large Pizzas', type: 'fixed', val: 300, min: 2500, active: 1 },
      { id: 'off-winter', code: 'MISTY50', title: 'Pine Mist Flat Rs 150 Off', desc: 'Flat Rs 150 off on our Italian Chicken Steak & Dessert combo', type: 'fixed', val: 150, min: 1200, active: 1 },
    ];

    const insertOffer = db.prepare('INSERT INTO offers (id, promo_code, title, description, discount_type, discount_value, min_spend, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const o of offers) {
      insertOffer.run(o.id, o.code, o.title, o.desc, o.type, o.val, o.min, o.active);
    }
  }

  // Seed Website Settings
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
  if (settingsCount.count === 0) {
    console.log('[Database] Seeding website settings...');
    const settings = [
      { key: 'restaurant_name', val: "Sariya's Sip N Bite", desc: 'Brand restaurant title' },
      { key: 'hotel_name', val: 'Lucky Kabana Hotel', desc: 'Host hotel name' },
      { key: 'hero_heading', val: "A Culinary Sanctuary in the Clouds of Murree", desc: 'Homepage hero main heading' },
      { key: 'hero_subheading', val: "Perched along historic Mall Road at 2,291 meters elevation. Savor artisanal Italian steaks, wood-fired Malai Boti pizzas, and highland hospitality overlooking pine-forested valleys.", desc: 'Homepage hero subtitle' },
      { key: 'phone', val: '+92 300 8555123', desc: 'Primary customer phone' },
      { key: 'email', val: 'concierge@sariyasipnbite.com', desc: 'Official customer email' },
      { key: 'address', val: 'Lucky Kabana Hotel, Main Mall Road, Murree, Punjab 47150, Pakistan', desc: 'Physical street address' },
      { key: 'elevation', val: '2,291 meters (7,516 ft)', desc: 'Altitude descriptor' },
      { key: 'weekday_hours', val: '11:00 AM – 01:00 AM (Monday to Thursday)', desc: 'Weekday operating hours' },
      { key: 'weekend_hours', val: '11:00 AM – 02:00 AM (Friday to Sunday)', desc: 'Weekend operating hours' },
      { key: 'room_service_hours', val: '24 Hours / 7 Days for Lucky Kabana Hotel Guests', desc: 'Hotel room service availability' },
      { key: 'announcement_banner', val: '🌲 Welcome to Murree! Enjoy live cedar fireplace dining and terrace views on Mall Road.', desc: 'Header banner alert text' },
      { key: 'announcement_active', val: '1', desc: 'Toggle top announcement banner' },
      { key: 'tax_rate_percent', val: '0', desc: 'Sales tax percentage (0 if inclusive)' },
      { key: 'two_factor_auth_required', val: '0', desc: 'Whether 2FA is strictly enforced' },
    ];

    const insertSetting = db.prepare('INSERT INTO settings (key, value, description) VALUES (?, ?, ?)');
    for (const s of settings) {
      insertSetting.run(s.key, s.val, s.desc);
    }
  }

  // Seed sample initial orders, customers, and notifications if empty
  const ordersCount = db.prepare('SELECT COUNT(*) as count FROM orders').get() as { count: number };
  if (ordersCount.count === 0) {
    console.log('[Database] Seeding sample verified orders and audit log...');
    // Customer
    db.prepare('INSERT INTO customers (id, phone, full_name, email, total_orders, total_spent, loyalty_points) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run('cust-1', '+92 301 5551234', 'Dr. Farhan Qureshi', 'farhan.q@gmail.com', 2, 3400, 170);

    // Orders
    const insertOrder = db.prepare(`
      INSERT INTO orders (id, order_number, customer_id, guest_name, guest_phone, order_type, location_note, status, subtotal, discount_amount, tip_amount, total, estimated_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertOrder.run('ord-101', 'ORD-2026-101', 'cust-1', 'Dr. Farhan Qureshi', '+92 301 5551234', 'dine_in', 'Terrace Table T-2', 'completed', 1840, 0, 100, 1940, 'Ready');
    insertOrder.run('ord-102', 'ORD-2026-102', 'cust-1', 'Zainab Abbasi', '+92 333 9998877', 'room_service', 'Lucky Kabana Suite 304', 'preparing', 2350, 200, 150, 2300, '15-20 mins');

    // Order items
    const insertOi = db.prepare('INSERT INTO order_items (id, order_id, item_id, name, price, quantity) VALUES (?, ?, ?, ?, ?, ?)');
    insertOi.run('oi-1', 'ord-101', 'item-steak-italian', 'Italian Chicken Steak', 950, 1);
    insertOi.run('oi-2', 'ord-101', 'item-pizza-malai', 'Signature Malai Boti Pizza', 890, 1);
    insertOi.run('oi-3', 'ord-102', 'item-steak-peppercorn', 'Black Peppercorn Sirloin Steak', 990, 1);
    insertOi.run('oi-4', 'ord-102', 'item-pasta-special', 'Special Pasta Alfredo', 780, 1);
    insertOi.run('oi-5', 'ord-102', 'item-noon-chai', 'Kashmiri Pink Noon Chai', 240, 2);

    // Initial Reservations
    const insertRes = db.prepare(`
      INSERT INTO reservations (id, confirmation_code, full_name, phone, email, reservation_date, reservation_time, guests, seating_area, table_id, table_name, status, special_requests)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    insertRes.run('res-1', 'SB-8821', 'Asad Malik', '+92 300 1234567', 'asad.malik@outlook.com', tomorrow, '08:30 PM', 4, 'terrace', 'T-2', 'T-2 · Alpine Mist Perch (Terrace View)', 'approved', 'Terrace glass view requested for anniversary dinner');
    insertRes.run('res-2', 'SB-5532', 'Col. Tariq Mahmood', '+92 321 7776655', 'tariq.m@army.mil', tomorrow, '07:30 PM', 6, 'fireplace', 'F-3', 'F-3 · Hearth Family Round (Fireplace Corner)', 'approved', 'Warm fireplace seating for visiting family');

    // Initial Notifications
    const insertNotif = db.prepare('INSERT INTO notifications (id, type, title, message, reference_id) VALUES (?, ?, ?, ?, ?)');
    insertNotif.run('notif-1', 'order', 'New Order Received', 'Order ORD-2026-102 placed for Suite 304 (Rs 2,300)', 'ord-102');
    insertNotif.run('notif-2', 'reservation', 'New Table Booking', 'Asad Malik booked Table T-2 for tomorrow 08:30 PM', 'res-1');

    // Initial Reviews
    const insertRev = db.prepare('INSERT INTO reviews (id, author, rating, comment, location, dish_tag, is_verified, is_featured, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    insertRev.run('rev-1', 'Ayesha & Bilal', 5, 'The Italian Chicken Steak with wild mushroom cream is hands down the best meal on Mall Road. Sitting on the heated terrace with Kashmir Point pine mist rolling in made it unforgettable.', 'Islamabad', 'Italian Chicken Steak', 1, 1, 'published');
    insertRev.run('rev-2', 'Kamran Sheikh', 5, 'Malai Boti Pizza was piping hot, soft crust, generous toppings. Excellent room service delivery to Lucky Kabana Hotel in under 25 minutes.', 'Lahore', 'Malai Boti Pizza', 1, 1, 'published');
    insertRev.run('rev-3', 'Dr. Samina Rizvi', 5, 'Authentic Kashmiri Pink Noon Chai by the roaring cedar fireplace. The aroma of burning cedar wood and fresh cardamom tea is quintessential Murree.', 'Rawalpindi', 'Kashmiri Pink Noon Chai', 1, 1, 'published');

    // Initial Activity Log
    db.prepare('INSERT INTO activity_logs (id, user_id, user_email, action, section, details, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run('log-init', 'usr-owner', 'owner@sariyas.com', 'System Boot & Schema Initialization', 'System', 'Initialized production database schema, admin roles, and menu items', '127.0.0.1');
  }

  console.log('[Database] Database initialization complete.');
}
