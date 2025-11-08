// Centralized API calls
const API = {
  // Helper function to handle fetch requests
  async request(endpoint, options = {}) {
    const url = `${window.API_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Menu APIs
  menu: {
    getAll: (category = null) => {
      const query = category ? `?category=${category}` : '';
      return API.request(`/api/menu${query}`);
    },
    create: (data) => API.request('/api/menu', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => API.request(`/api/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => API.request(`/api/menu/${id}`, {
      method: 'DELETE'
    })
  },

  // Orders APIs
  orders: {
    getAll: (status = null) => {
      const query = status ? `?status=${status}` : '';
      return API.request(`/api/orders${query}`);
    },
    create: (data) => API.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    updateStatus: (id, status) => API.request(`/api/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
  },

  // Reservations APIs
  reservations: {
    getAll: (date = null) => {
      const query = date ? `?date=${date}` : '';
      return API.request(`/api/reservations${query}`);
    },
    create: (data) => API.request('/api/reservations', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    delete: (id) => API.request(`/api/reservations/${id}`, {
      method: 'DELETE'
    })
  },

  // Tables APIs
  tables: {
    getAll: () => API.request('/api/tables'),
    updateStatus: (id, status) => API.request(`/api/tables/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
  },

  // Statistics API
  stats: {
    get: () => API.request('/api/stats')
  }
};

// Make API available globally
window.API = API;
