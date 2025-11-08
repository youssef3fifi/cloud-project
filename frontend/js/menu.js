// Menu Management Page JavaScript

let currentCategory = 'all';
let editingItemId = null;

// Load menu items on page load
document.addEventListener('DOMContentLoaded', async () => {
  await loadMenuItems();
});

async function loadMenuItems(category = null) {
  const container = document.getElementById('menuContainer');
  
  try {
    const items = await API.menu.getAll(category);
    
    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🍽️</div>
          <div class="empty-state-message">No menu items found</div>
        </div>
      `;
      return;
    }
    
    // Group items by category
    const groupedItems = items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});
    
    let html = '';
    for (const [category, categoryItems] of Object.entries(groupedItems)) {
      html += `
        <div style="margin-bottom: 2rem;">
          <h2 style="color: var(--primary-color); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--light-bg);">
            ${category}
          </h2>
          <div class="grid-3">
            ${categoryItems.map(item => createMenuItemCard(item)).join('')}
          </div>
        </div>
      `;
    }
    
    container.innerHTML = html;
  } catch (error) {
    console.error('Error loading menu items:', error);
    container.innerHTML = '<div class="alert alert-error">Failed to load menu items. Please check if the backend server is running.</div>';
  }
}

function createMenuItemCard(item) {
  return `
    <div class="menu-item">
      <div class="menu-item-header">
        <div>
          <div class="menu-item-name">${item.name}</div>
          <div class="menu-item-category">${item.category}</div>
        </div>
        <div class="menu-item-price">$${item.price.toFixed(2)}</div>
      </div>
      <div class="menu-item-description">${item.description || 'No description'}</div>
      <div style="margin-bottom: 1rem;">
        <span class="badge ${item.available ? 'badge-success' : 'badge-danger'}">
          ${item.available ? 'Available' : 'Unavailable'}
        </span>
      </div>
      <div class="menu-item-actions">
        <button class="btn btn-sm btn-primary" onclick="openEditModal(${item.id})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteMenuItem(${item.id}, '${item.name}')">Delete</button>
      </div>
    </div>
  `;
}

function filterByCategory(category) {
  currentCategory = category;
  
  // Update active filter button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // Load filtered items
  if (category === 'all') {
    loadMenuItems();
  } else {
    loadMenuItems(category);
  }
}

function openAddModal() {
  editingItemId = null;
  document.getElementById('modalTitle').textContent = 'Add Menu Item';
  document.getElementById('menuForm').reset();
  document.getElementById('itemId').value = '';
  document.getElementById('menuModal').classList.add('active');
}

async function openEditModal(itemId) {
  try {
    const items = await API.menu.getAll();
    const item = items.find(i => i.id === itemId);
    
    if (!item) {
      showNotification('Item not found', 'error');
      return;
    }
    
    editingItemId = itemId;
    document.getElementById('modalTitle').textContent = 'Edit Menu Item';
    document.getElementById('itemId').value = item.id;
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemCategory').value = item.category;
    document.getElementById('itemPrice').value = item.price;
    document.getElementById('itemDescription').value = item.description || '';
    document.getElementById('itemAvailable').checked = item.available;
    
    document.getElementById('menuModal').classList.add('active');
  } catch (error) {
    console.error('Error loading item:', error);
    showNotification('Failed to load item', 'error');
  }
}

function closeModal() {
  document.getElementById('menuModal').classList.remove('active');
  document.getElementById('menuForm').reset();
  editingItemId = null;
}

async function handleSubmit(event) {
  event.preventDefault();
  
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';
  
  const data = {
    name: document.getElementById('itemName').value,
    category: document.getElementById('itemCategory').value,
    price: parseFloat(document.getElementById('itemPrice').value),
    description: document.getElementById('itemDescription').value,
    available: document.getElementById('itemAvailable').checked
  };
  
  try {
    if (editingItemId) {
      await API.menu.update(editingItemId, data);
      showNotification('Menu item updated successfully', 'success');
    } else {
      await API.menu.create(data);
      showNotification('Menu item added successfully', 'success');
    }
    
    closeModal();
    await loadMenuItems(currentCategory === 'all' ? null : currentCategory);
  } catch (error) {
    console.error('Error saving menu item:', error);
    showNotification(error.message || 'Failed to save menu item', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save Item';
  }
}

async function deleteMenuItem(itemId, itemName) {
  if (!confirm(`Are you sure you want to delete "${itemName}"?`)) {
    return;
  }
  
  try {
    await API.menu.delete(itemId);
    showNotification('Menu item deleted successfully', 'success');
    await loadMenuItems(currentCategory === 'all' ? null : currentCategory);
  } catch (error) {
    console.error('Error deleting menu item:', error);
    showNotification(error.message || 'Failed to delete menu item', 'error');
  }
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
document.getElementById('menuModal').addEventListener('click', (e) => {
  if (e.target.id === 'menuModal') {
    closeModal();
  }
});
