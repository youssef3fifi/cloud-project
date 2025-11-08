require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data storage
let menuItems = [
  {
    id: 1,
    name: 'Bruschetta',
    category: 'Appetizers',
    price: 8.99,
    description: 'Toasted bread with tomatoes, garlic, and basil',
    available: true
  },
  {
    id: 2,
    name: 'Caesar Salad',
    category: 'Appetizers',
    price: 9.99,
    description: 'Fresh romaine lettuce with Caesar dressing and croutons',
    available: true
  },
  {
    id: 3,
    name: 'Grilled Salmon',
    category: 'Main Course',
    price: 24.99,
    description: 'Fresh Atlantic salmon with lemon butter sauce',
    available: true
  },
  {
    id: 4,
    name: 'Ribeye Steak',
    category: 'Main Course',
    price: 32.99,
    description: '12oz prime ribeye steak with garlic butter',
    available: true
  },
  {
    id: 5,
    name: 'Margherita Pizza',
    category: 'Main Course',
    price: 14.99,
    description: 'Classic pizza with mozzarella, tomatoes, and basil',
    available: true
  },
  {
    id: 6,
    name: 'Tiramisu',
    category: 'Desserts',
    price: 7.99,
    description: 'Classic Italian coffee-flavored dessert',
    available: true
  },
  {
    id: 7,
    name: 'Chocolate Lava Cake',
    category: 'Desserts',
    price: 8.99,
    description: 'Warm chocolate cake with molten center',
    available: true
  },
  {
    id: 8,
    name: 'Fresh Lemonade',
    category: 'Beverages',
    price: 3.99,
    description: 'Freshly squeezed lemonade',
    available: true
  },
  {
    id: 9,
    name: 'Iced Coffee',
    category: 'Beverages',
    price: 4.99,
    description: 'Cold brew coffee with ice',
    available: true
  },
  {
    id: 10,
    name: 'Red Wine',
    category: 'Beverages',
    price: 12.99,
    description: 'House red wine',
    available: true
  }
];

let orders = [
  {
    id: 1,
    tableNumber: 5,
    items: [
      { menuItemId: 1, name: 'Bruschetta', quantity: 2, price: 8.99 },
      { menuItemId: 3, name: 'Grilled Salmon', quantity: 1, price: 24.99 }
    ],
    total: 42.97,
    status: 'pending',
    timestamp: new Date('2025-11-08T14:30:00').toISOString()
  },
  {
    id: 2,
    tableNumber: 3,
    items: [
      { menuItemId: 4, name: 'Ribeye Steak', quantity: 2, price: 32.99 },
      { menuItemId: 10, name: 'Red Wine', quantity: 2, price: 12.99 }
    ],
    total: 91.96,
    status: 'preparing',
    timestamp: new Date('2025-11-08T15:00:00').toISOString()
  },
  {
    id: 3,
    tableNumber: 7,
    items: [
      { menuItemId: 5, name: 'Margherita Pizza', quantity: 1, price: 14.99 },
      { menuItemId: 8, name: 'Fresh Lemonade', quantity: 1, price: 3.99 }
    ],
    total: 18.98,
    status: 'completed',
    timestamp: new Date('2025-11-08T13:15:00').toISOString()
  }
];

let reservations = [
  {
    id: 1,
    customerName: 'John Smith',
    email: 'john@example.com',
    phone: '555-0100',
    date: '2025-11-09',
    time: '19:00',
    guests: 4,
    tableNumber: 5,
    status: 'confirmed'
  },
  {
    id: 2,
    customerName: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '555-0101',
    date: '2025-11-09',
    time: '20:00',
    guests: 2,
    tableNumber: 3,
    status: 'confirmed'
  },
  {
    id: 3,
    customerName: 'Michael Brown',
    email: 'michael@example.com',
    phone: '555-0102',
    date: '2025-11-10',
    time: '18:30',
    guests: 6,
    tableNumber: 8,
    status: 'pending'
  }
];

let tables = [
  { id: 1, number: 1, seats: 2, status: 'available' },
  { id: 2, number: 2, seats: 2, status: 'available' },
  { id: 3, number: 3, seats: 4, status: 'occupied' },
  { id: 4, number: 4, seats: 4, status: 'available' },
  { id: 5, number: 5, seats: 4, status: 'occupied' },
  { id: 6, number: 6, seats: 6, status: 'available' },
  { id: 7, number: 7, seats: 6, status: 'occupied' },
  { id: 8, number: 8, seats: 8, status: 'available' },
  { id: 9, number: 9, seats: 2, status: 'reserved' },
  { id: 10, number: 10, seats: 4, status: 'available' }
];

// Auto-increment IDs
let nextMenuId = 11;
let nextOrderId = 4;
let nextReservationId = 4;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Menu endpoints
app.get('/api/menu', (req, res) => {
  const category = req.query.category;
  if (category) {
    const filtered = menuItems.filter(item => item.category === category);
    res.json(filtered);
  } else {
    res.json(menuItems);
  }
});

app.post('/api/menu', (req, res) => {
  const { name, category, price, description, available } = req.body;
  
  if (!name || !category || !price) {
    return res.status(400).json({ error: 'Name, category, and price are required' });
  }

  const newItem = {
    id: nextMenuId++,
    name,
    category,
    price: parseFloat(price),
    description: description || '',
    available: available !== undefined ? available : true
  };

  menuItems.push(newItem);
  res.status(201).json(newItem);
});

app.put('/api/menu/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = menuItems.findIndex(item => item.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Menu item not found' });
  }

  const { name, category, price, description, available } = req.body;
  
  if (name !== undefined) menuItems[index].name = name;
  if (category !== undefined) menuItems[index].category = category;
  if (price !== undefined) menuItems[index].price = parseFloat(price);
  if (description !== undefined) menuItems[index].description = description;
  if (available !== undefined) menuItems[index].available = available;

  res.json(menuItems[index]);
});

app.delete('/api/menu/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = menuItems.findIndex(item => item.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Menu item not found' });
  }

  menuItems.splice(index, 1);
  res.json({ message: 'Menu item deleted successfully' });
});

// Orders endpoints
app.get('/api/orders', (req, res) => {
  const status = req.query.status;
  if (status) {
    const filtered = orders.filter(order => order.status === status);
    res.json(filtered);
  } else {
    res.json(orders);
  }
});

app.post('/api/orders', (req, res) => {
  const { tableNumber, items } = req.body;

  if (!tableNumber || !items || items.length === 0) {
    return res.status(400).json({ error: 'Table number and items are required' });
  }

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const newOrder = {
    id: nextOrderId++,
    tableNumber,
    items,
    total: parseFloat(total.toFixed(2)),
    status: 'pending',
    timestamp: new Date().toISOString()
  };

  orders.push(newOrder);
  res.status(201).json(newOrder);
});

app.put('/api/orders/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = orders.findIndex(order => order.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const { status } = req.body;
  
  if (status) {
    orders[index].status = status;
  }

  res.json(orders[index]);
});

// Reservations endpoints
app.get('/api/reservations', (req, res) => {
  const date = req.query.date;
  if (date) {
    const filtered = reservations.filter(r => r.date === date);
    res.json(filtered);
  } else {
    res.json(reservations);
  }
});

app.post('/api/reservations', (req, res) => {
  const { customerName, email, phone, date, time, guests, tableNumber } = req.body;

  if (!customerName || !phone || !date || !time || !guests) {
    return res.status(400).json({ error: 'Customer name, phone, date, time, and guests are required' });
  }

  const newReservation = {
    id: nextReservationId++,
    customerName,
    email: email || '',
    phone,
    date,
    time,
    guests: parseInt(guests),
    tableNumber: tableNumber || null,
    status: 'pending'
  };

  reservations.push(newReservation);
  res.status(201).json(newReservation);
});

app.delete('/api/reservations/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = reservations.findIndex(r => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Reservation not found' });
  }

  reservations.splice(index, 1);
  res.json({ message: 'Reservation deleted successfully' });
});

// Tables endpoints
app.get('/api/tables', (req, res) => {
  res.json(tables);
});

app.put('/api/tables/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = tables.findIndex(table => table.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Table not found' });
  }

  const { status } = req.body;
  
  if (status) {
    tables[index].status = status;
  }

  res.json(tables[index]);
});

// Statistics endpoint
app.get('/api/stats', (req, res) => {
  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    preparingOrders: orders.filter(o => o.status === 'preparing').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    totalRevenue: orders
      .filter(o => o.status === 'completed')
      .reduce((sum, order) => sum + order.total, 0)
      .toFixed(2),
    totalReservations: reservations.length,
    todayReservations: reservations.filter(r => r.date === new Date().toISOString().split('T')[0]).length,
    availableTables: tables.filter(t => t.status === 'available').length,
    occupiedTables: tables.filter(t => t.status === 'occupied').length,
    reservedTables: tables.filter(t => t.status === 'reserved').length,
    menuItems: menuItems.length,
    categories: ['Appetizers', 'Main Course', 'Desserts', 'Beverages']
  };

  res.json(stats);
});

// Start server
app.listen(PORT, () => {
  console.log(`Restaurant Management API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
