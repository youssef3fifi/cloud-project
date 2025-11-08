// Dashboard Page JavaScript

// Load dashboard data on page load
document.addEventListener('DOMContentLoaded', async () => {
  await loadDashboardData();
});

async function loadDashboardData() {
  try {
    // Load statistics
    await loadStatistics();
    
    // Load recent orders
    await loadRecentOrders();
    
    // Load table status
    await loadTableStatus();
  } catch (error) {
    console.error('Error loading dashboard:', error);
    showError('Failed to load dashboard data. Please check if the backend server is running.');
  }
}

async function loadStatistics() {
  try {
    const stats = await API.stats.get();
    
    // Update statistics
    document.getElementById('totalOrders').textContent = stats.totalOrders;
    document.getElementById('pendingOrders').textContent = stats.pendingOrders;
    document.getElementById('totalRevenue').textContent = `$${stats.totalRevenue}`;
    document.getElementById('totalReservations').textContent = stats.totalReservations;
    document.getElementById('availableTables').textContent = stats.availableTables;
    document.getElementById('menuItems').textContent = stats.menuItems;
  } catch (error) {
    console.error('Error loading statistics:', error);
    throw error;
  }
}

async function loadRecentOrders() {
  const container = document.getElementById('recentOrdersContainer');
  
  try {
    const orders = await API.orders.getAll();
    
    if (orders.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-message">No orders yet</div></div>';
      return;
    }
    
    // Sort by timestamp and get recent 5
    const recentOrders = orders
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);
    
    container.innerHTML = recentOrders.map(order => `
      <div class="order-card">
        <div class="order-header">
          <span class="order-id">Order #${order.id} - Table ${order.tableNumber}</span>
          <span class="badge badge-${getStatusBadgeClass(order.status)}">${order.status}</span>
        </div>
        <div class="order-items">
          ${order.items.map(item => `
            <div class="order-item">
              <span>${item.name} x${item.quantity}</span>
              <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
        <div class="order-total">
          <strong>Total:</strong>
          <strong>$${order.total.toFixed(2)}</strong>
        </div>
        <div style="margin-top: 1rem; font-size: 0.875rem; color: var(--light-text);">
          ${formatDateTime(order.timestamp)}
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading recent orders:', error);
    container.innerHTML = '<div class="alert alert-error">Failed to load orders</div>';
  }
}

async function loadTableStatus() {
  const container = document.getElementById('tableStatusContainer');
  
  try {
    const tables = await API.tables.getAll();
    
    // Group tables by status
    const statusCounts = tables.reduce((acc, table) => {
      acc[table.status] = (acc[table.status] || 0) + 1;
      return acc;
    }, {});
    
    container.innerHTML = `
      <div class="grid-3">
        <div class="stat-card">
          <div class="stat-icon" style="color: var(--success-color);">✅</div>
          <div class="stat-value">${statusCounts.available || 0}</div>
          <div class="stat-label">Available</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="color: var(--accent-color);">🔴</div>
          <div class="stat-value">${statusCounts.occupied || 0}</div>
          <div class="stat-label">Occupied</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="color: var(--warning-color);">📅</div>
          <div class="stat-value">${statusCounts.reserved || 0}</div>
          <div class="stat-label">Reserved</div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading table status:', error);
    container.innerHTML = '<div class="alert alert-error">Failed to load table status</div>';
  }
}

// Helper functions
function getStatusBadgeClass(status) {
  const statusMap = {
    'pending': 'warning',
    'preparing': 'info',
    'completed': 'success',
    'cancelled': 'danger'
  };
  return statusMap[status] || 'secondary';
}

function formatDateTime(timestamp) {
  const date = new Date(timestamp);
  const options = {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleDateString('en-US', options);
}

function showError(message) {
  const container = document.querySelector('.container');
  const alert = document.createElement('div');
  alert.className = 'alert alert-error';
  alert.innerHTML = `
    <span>⚠️</span>
    <span>${message}</span>
  `;
  container.insertBefore(alert, container.firstChild);
  
  setTimeout(() => alert.remove(), 5000);
}
