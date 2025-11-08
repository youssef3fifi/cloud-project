// Orders Management Page JavaScript

let currentStatus = 'all';
let menuItems = [];
let orderItems = [];

// Load orders on page load
document.addEventListener('DOMContentLoaded', async () => {
  await loadOrders();
  await loadMenuItems();
});

async function loadOrders(status = null) {
  const container = document.getElementById('ordersContainer');
  
  try {
    const orders = await API.orders.getAll(status);
    
    if (orders.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <div class="empty-state-message">No orders found</div>
        </div>
      `;
      return;
    }
    
    // Sort by timestamp (newest first)
    orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    container.innerHTML = orders.map(order => createOrderCard(order)).join('');
  } catch (error) {
    console.error('Error loading orders:', error);
    container.innerHTML = '<div class="alert alert-error">Failed to load orders. Please check if the backend server is running.</div>';
  }
}

function createOrderCard(order) {
  return `
    <div class="order-card">
      <div class="order-header">
        <div>
          <span class="order-id">Order #${order.id}</span>
          <span style="color: var(--light-text); margin-left: 1rem;">Table ${order.tableNumber}</span>
        </div>
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
      <div style="margin-top: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
        <div style="font-size: 0.875rem; color: var(--light-text);">
          ${formatDateTime(order.timestamp)}
        </div>
        <div style="display: flex; gap: 0.5rem;">
          ${order.status === 'pending' ? `
            <button class="btn btn-sm btn-warning" onclick="updateOrderStatus(${order.id}, 'preparing')">Start Preparing</button>
          ` : ''}
          ${order.status === 'preparing' ? `
            <button class="btn btn-sm btn-success" onclick="updateOrderStatus(${order.id}, 'completed')">Mark Complete</button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

function filterByStatus(status) {
  currentStatus = status;
  
  // Update active filter button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // Load filtered orders
  if (status === 'all') {
    loadOrders();
  } else {
    loadOrders(status);
  }
}

async function updateOrderStatus(orderId, newStatus) {
  try {
    await API.orders.updateStatus(orderId, newStatus);
    showNotification('Order status updated successfully', 'success');
    await loadOrders(currentStatus === 'all' ? null : currentStatus);
  } catch (error) {
    console.error('Error updating order status:', error);
    showNotification(error.message || 'Failed to update order status', 'error');
  }
}

async function loadMenuItems() {
  try {
    menuItems = await API.menu.getAll();
  } catch (error) {
    console.error('Error loading menu items:', error);
  }
}

function openNewOrderModal() {
  orderItems = [];
  document.getElementById('orderForm').reset();
  document.getElementById('orderItemsContainer').innerHTML = '';
  addOrderItem();
  document.getElementById('orderModal').classList.add('active');
}

function closeOrderModal() {
  document.getElementById('orderModal').classList.remove('active');
  orderItems = [];
}

function addOrderItem() {
  const container = document.getElementById('orderItemsContainer');
  const itemIndex = orderItems.length;
  
  const itemHtml = `
    <div class="order-item-row" id="orderItem${itemIndex}" style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem; align-items: flex-start;">
      <select class="form-select" style="flex: 2;" onchange="updateOrderItem(${itemIndex}, 'menuItemId', this.value)" required>
        <option value="">Select Item</option>
        ${menuItems.map(item => `
          <option value="${item.id}" data-price="${item.price}" data-name="${item.name}">
            ${item.name} - $${item.price.toFixed(2)}
          </option>
        `).join('')}
      </select>
      <input type="number" class="form-input" placeholder="Qty" min="1" value="1" 
             style="flex: 1;" onchange="updateOrderItem(${itemIndex}, 'quantity', this.value)" required>
      <button type="button" class="btn btn-sm btn-danger" onclick="removeOrderItem(${itemIndex})">×</button>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', itemHtml);
  orderItems.push({ menuItemId: null, name: '', quantity: 1, price: 0 });
}

function updateOrderItem(index, field, value) {
  if (field === 'menuItemId') {
    const select = event.target;
    const option = select.options[select.selectedIndex];
    orderItems[index].menuItemId = parseInt(value);
    orderItems[index].name = option.getAttribute('data-name');
    orderItems[index].price = parseFloat(option.getAttribute('data-price'));
  } else if (field === 'quantity') {
    orderItems[index].quantity = parseInt(value);
  }
  
  updateOrderTotal();
}

function removeOrderItem(index) {
  document.getElementById(`orderItem${index}`).remove();
  orderItems.splice(index, 1);
  updateOrderTotal();
}

function updateOrderTotal() {
  const total = orderItems.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  document.getElementById('orderTotal').textContent = `$${total.toFixed(2)}`;
}

async function handleOrderSubmit(event) {
  event.preventDefault();
  
  const tableNumber = parseInt(document.getElementById('tableNumber').value);
  const validItems = orderItems.filter(item => item.menuItemId && item.quantity > 0);
  
  if (validItems.length === 0) {
    showNotification('Please add at least one item to the order', 'error');
    return;
  }
  
  const submitBtn = document.getElementById('submitOrderBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating...';
  
  try {
    await API.orders.create({
      tableNumber,
      items: validItems
    });
    
    showNotification('Order created successfully', 'success');
    closeOrderModal();
    await loadOrders(currentStatus === 'all' ? null : currentStatus);
  } catch (error) {
    console.error('Error creating order:', error);
    showNotification(error.message || 'Failed to create order', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Order';
  }
}

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
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleDateString('en-US', options);
}

function showNotification(message, type) {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `<span>${message}</span>`;
  
  const container = document.querySelector('.container');
  container.insertBefore(alert, container.firstChild);
  
  setTimeout(() => alert.remove(), 3000);
}

// Close modal when clicking outside
document.getElementById('orderModal').addEventListener('click', (e) => {
  if (e.target.id === 'orderModal') {
    closeOrderModal();
  }
});
