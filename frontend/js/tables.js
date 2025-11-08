// Tables Management Page JavaScript

let tables = [];
let currentFilter = 'all';
let selectedTable = null;

// Load tables on page load
document.addEventListener('DOMContentLoaded', async () => {
  await loadTables();
});

async function loadTables() {
  try {
    tables = await API.tables.getAll();
    updateStatistics();
    displayTables();
  } catch (error) {
    console.error('Error loading tables:', error);
    const container = document.getElementById('tablesContainer');
    container.innerHTML = '<div class="alert alert-error">Failed to load tables. Please check if the backend server is running.</div>';
  }
}

function updateStatistics() {
  const statusCounts = tables.reduce((acc, table) => {
    acc[table.status] = (acc[table.status] || 0) + 1;
    return acc;
  }, {});
  
  document.getElementById('availableCount').textContent = statusCounts.available || 0;
  document.getElementById('occupiedCount').textContent = statusCounts.occupied || 0;
  document.getElementById('reservedCount').textContent = statusCounts.reserved || 0;
  document.getElementById('totalTables').textContent = tables.length;
}

function displayTables() {
  const container = document.getElementById('tablesContainer');
  
  let filteredTables = tables;
  if (currentFilter !== 'all') {
    filteredTables = tables.filter(t => t.status === currentFilter);
  }
  
  if (filteredTables.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🍽️</div>
        <div class="empty-state-message">No tables found</div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = filteredTables.map(table => createTableCard(table)).join('');
}

function createTableCard(table) {
  const statusColors = {
    'available': 'var(--success-color)',
    'occupied': 'var(--accent-color)',
    'reserved': 'var(--warning-color)'
  };
  
  const statusEmojis = {
    'available': '✅',
    'occupied': '🔴',
    'reserved': '📅'
  };
  
  return `
    <div class="table-item ${table.status}" onclick="openTableModal(${table.id})">
      <div style="font-size: 2rem; margin-bottom: 0.5rem;">
        ${statusEmojis[table.status]}
      </div>
      <div class="table-number">Table ${table.number}</div>
      <div class="table-seats">${table.seats} seats</div>
      <div class="table-status" style="color: ${statusColors[table.status]};">
        ${table.status.toUpperCase()}
      </div>
    </div>
  `;
}

function filterTables(status) {
  currentFilter = status;
  
  // Update active filter button
  document.querySelectorAll('.filters .filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  displayTables();
}

function openTableModal(tableId) {
  selectedTable = tables.find(t => t.id === tableId);
  
  if (!selectedTable) return;
  
  document.getElementById('modalTableTitle').textContent = `Table ${selectedTable.number}`;
  
  // Display table details
  const statusColors = {
    'available': 'var(--success-color)',
    'occupied': 'var(--accent-color)',
    'reserved': 'var(--warning-color)'
  };
  
  document.getElementById('tableDetails').innerHTML = `
    <div style="padding: 1rem; background: var(--light-bg); border-radius: 4px;">
      <div style="margin-bottom: 1rem;">
        <strong>Capacity:</strong> ${selectedTable.seats} seats
      </div>
      <div style="margin-bottom: 1rem;">
        <strong>Current Status:</strong>
        <span class="badge badge-${getStatusBadgeClass(selectedTable.status)}" style="margin-left: 0.5rem;">
          ${selectedTable.status.toUpperCase()}
        </span>
      </div>
    </div>
  `;
  
  // Display action buttons based on current status
  let actionsHtml = '<div style="display: flex; flex-direction: column; gap: 0.5rem;">';
  
  if (selectedTable.status === 'available') {
    actionsHtml += `
      <button class="btn btn-danger" onclick="updateTableStatus('occupied')">Mark as Occupied</button>
      <button class="btn btn-warning" onclick="updateTableStatus('reserved')">Mark as Reserved</button>
    `;
  } else if (selectedTable.status === 'occupied') {
    actionsHtml += `
      <button class="btn btn-success" onclick="updateTableStatus('available')">Mark as Available</button>
    `;
  } else if (selectedTable.status === 'reserved') {
    actionsHtml += `
      <button class="btn btn-success" onclick="updateTableStatus('available')">Mark as Available</button>
      <button class="btn btn-danger" onclick="updateTableStatus('occupied')">Mark as Occupied</button>
    `;
  }
  
  actionsHtml += '</div>';
  document.getElementById('tableActions').innerHTML = actionsHtml;
  
  document.getElementById('tableModal').classList.add('active');
}

function closeTableModal() {
  document.getElementById('tableModal').classList.remove('active');
  selectedTable = null;
}

async function updateTableStatus(newStatus) {
  if (!selectedTable) return;
  
  try {
    await API.tables.updateStatus(selectedTable.id, newStatus);
    showNotification(`Table ${selectedTable.number} status updated to ${newStatus}`, 'success');
    closeTableModal();
    await loadTables();
  } catch (error) {
    console.error('Error updating table status:', error);
    showNotification(error.message || 'Failed to update table status', 'error');
  }
}

function getStatusBadgeClass(status) {
  const statusMap = {
    'available': 'success',
    'occupied': 'danger',
    'reserved': 'warning'
  };
  return statusMap[status] || 'secondary';
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
document.getElementById('tableModal').addEventListener('click', (e) => {
  if (e.target.id === 'tableModal') {
    closeTableModal();
  }
});
