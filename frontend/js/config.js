// API Configuration
// Update this URL when deploying to AWS EC2
const API_CONFIG = {
  // For local development
  LOCAL: 'http://localhost:3000',
  
  // For AWS EC2 deployment - Replace with your EC2 public IP
  // Example: 'http://3.145.123.45:3000'
  EC2: 'http://localhost:3000',
  
  // Current environment
  // Change to 'EC2' when deploying to AWS
  CURRENT: 'LOCAL'
};

// Get the appropriate API URL based on environment
const API_URL = API_CONFIG[API_CONFIG.CURRENT];

// Export for use in other modules
window.API_URL = API_URL;
