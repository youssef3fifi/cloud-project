// Reservations Management Page JavaScript

let currentDateFilter = null;

// Load reservations on page load
document.addEventListener('DOMContentLoaded', async () => {
  // Set min date to today
  document.getElementById('reservationDate').min = new Date().toISOString().split('T')[0];
  
  await loadReservations();
});

async function loadReservations(date = null) {
  const container = document.getElementById('reservationsContainer');
  
  try {
    const reservations = await API.reservations.getAll(date);
    
    if (reservations.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📅</div>
          <div class="empty-state-message">No reservations found</div>
        </div>
      `;
      return;
    }
    
    // Sort by date and time
    reservations.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA - dateB;
    });
    
    // Group by date
    const grouped = reservations.reduce((acc, reservation) => {
      if (!acc[reservation.date]) {
        acc[reservation.date] = [];
      }
      acc[reservation.date].push(reservation);
      return acc;
    }, {});
    
    let html = '';
    for (const [date, dateReservations] of Object.entries(grouped)) {
      html += `
        <div style="margin-bottom: 2rem;">
          <h2 style="color: var(--primary-color); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--light-bg);">
            ${formatDate(date)}
          </h2>
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Guests</th>
                  <th>Table</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${dateReservations.map(r => createReservationRow(r)).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
    
    container.innerHTML = html;
  } catch (error) {
    console.error('Error loading reservations:', error);
    container.innerHTML = '<div class="alert alert-error">Failed to load reservations. Please check if the backend server is running.</div>';
  }
}

function createReservationRow(reservation) {
  return `
    <tr>
      <td><strong>${formatTime(reservation.time)}</strong></td>
      <td>${reservation.customerName}</td>
      <td>
        ${reservation.email ? `<div>${reservation.email}</div>` : ''}
        <div>${reservation.phone}</div>
      </td>
      <td>${reservation.guests} ${reservation.guests === 1 ? 'guest' : 'guests'}</td>
      <td>${reservation.tableNumber ? `Table ${reservation.tableNumber}` : 'Not assigned'}</td>
      <td><span class="badge badge-${getStatusBadgeClass(reservation.status)}">${reservation.status}</span></td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteReservation(${reservation.id}, '${reservation.customerName}')">
          Cancel
        </button>
      </td>
    </tr>
  `;
}

function filterByDate(date) {
  currentDateFilter = date;
  loadReservations(date);
}

function clearDateFilter() {
  currentDateFilter = null;
  document.getElementById('dateFilter').value = '';
  loadReservations();
}

function openNewReservationModal() {
  document.getElementById('reservationForm').reset();
  document.getElementById('reservationDate').min = new Date().toISOString().split('T')[0];
  document.getElementById('reservationModal').classList.add('active');
}

function closeReservationModal() {
  document.getElementById('reservationModal').classList.remove('active');
}

async function handleReservationSubmit(event) {
  event.preventDefault();
  
  const submitBtn = document.getElementById('submitReservationBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating...';
  
  const data = {
    customerName: document.getElementById('customerName').value,
    email: document.getElementById('customerEmail').value,
    phone: document.getElementById('customerPhone').value,
    date: document.getElementById('reservationDate').value,
    time: document.getElementById('reservationTime').value,
    guests: parseInt(document.getElementById('guestCount').value),
    tableNumber: document.getElementById('tableNumber').value ? 
                 parseInt(document.getElementById('tableNumber').value) : null
  };
  
  try {
    await API.reservations.create(data);
    showNotification('Reservation created successfully', 'success');
    closeReservationModal();
    await loadReservations(currentDateFilter);
  } catch (error) {
    console.error('Error creating reservation:', error);
    showNotification(error.message || 'Failed to create reservation', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Reservation';
  }
}

async function deleteReservation(id, customerName) {
  if (!confirm(`Are you sure you want to cancel the reservation for ${customerName}?`)) {
    return;
  }
  
  try {
    await API.reservations.delete(id);
    showNotification('Reservation cancelled successfully', 'success');
    await loadReservations(currentDateFilter);
  } catch (error) {
    console.error('Error deleting reservation:', error);
    showNotification(error.message || 'Failed to cancel reservation', 'error');
  }
}

function getStatusBadgeClass(status) {
  const statusMap = {
    'pending': 'warning',
    'confirmed': 'success',
    'cancelled': 'danger',
    'completed': 'info'
  };
  return statusMap[status] || 'secondary';
}

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
}

function formatTime(timeStr) {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
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
document.getElementById('reservationModal').addEventListener('click', (e) => {
  if (e.target.id === 'reservationModal') {
    closeReservationModal();
  }
});
