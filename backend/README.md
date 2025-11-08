# Restaurant Management System - Backend

Node.js/Express.js REST API for restaurant management system.

## Features

- **Menu Management**: CRUD operations for menu items with categories
- **Order Management**: Create and track orders with status updates
- **Reservation System**: Manage table reservations
- **Table Management**: Track table availability and status
- **Statistics Dashboard**: Real-time statistics for the restaurant
- **CORS Enabled**: Ready for cross-origin requests
- **Health Check**: Monitor API health

## API Endpoints

### Menu
- `GET /api/menu` - Get all menu items (optional query: `?category=CategoryName`)
- `POST /api/menu` - Create new menu item
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item

### Orders
- `GET /api/orders` - Get all orders (optional query: `?status=pending`)
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status

### Reservations
- `GET /api/reservations` - Get all reservations (optional query: `?date=YYYY-MM-DD`)
- `POST /api/reservations` - Create new reservation
- `DELETE /api/reservations/:id` - Delete reservation

### Tables
- `GET /api/tables` - Get all tables
- `PUT /api/tables/:id` - Update table status

### Statistics
- `GET /api/stats` - Get dashboard statistics

### Health Check
- `GET /health` - Check API health

## Local Development Setup

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Edit `.env` file if needed (default PORT is 3000)

5. Start the development server:
```bash
npm run dev
```

Or for production:
```bash
npm start
```

The API will be available at `http://localhost:3000`

## AWS EC2 Deployment

### Step 1: Prepare EC2 Instance

1. Launch an EC2 instance (Amazon Linux 2 or Ubuntu recommended)
2. Configure Security Group to allow:
   - SSH (port 22) from your IP
   - HTTP (port 80) from anywhere (0.0.0.0/0)
   - Custom TCP (port 3000) from anywhere (0.0.0.0/0)

### Step 2: Install Node.js on EC2

Connect to your EC2 instance via SSH:

```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

Install Node.js (Amazon Linux 2):
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

Or for Ubuntu:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 3: Deploy Application

1. Clone or upload your code to EC2:
```bash
# Option 1: Clone from repository
git clone your-repository-url
cd cloud-project/backend

# Option 2: Upload via SCP
scp -i your-key.pem -r backend/ ec2-user@your-ec2-ip:~/
```

2. Install dependencies:
```bash
cd backend
npm install
```

3. Create environment file:
```bash
nano .env
```

Add:
```
PORT=3000
NODE_ENV=production
```

### Step 4: Run with PM2 (Process Manager)

Install PM2:
```bash
sudo npm install -g pm2
```

Start the application:
```bash
pm2 start server.js --name restaurant-api
pm2 save
pm2 startup
```

PM2 Commands:
```bash
pm2 status              # Check status
pm2 logs restaurant-api # View logs
pm2 restart restaurant-api # Restart
pm2 stop restaurant-api    # Stop
```

### Step 5: Configure Nginx (Optional - Recommended for Production)

Install Nginx:
```bash
sudo yum install nginx  # Amazon Linux
# or
sudo apt install nginx  # Ubuntu
```

Configure Nginx as reverse proxy:
```bash
sudo nano /etc/nginx/conf.d/restaurant-api.conf
```

Add:
```nginx
server {
    listen 80;
    server_name your-ec2-ip;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Start Nginx:
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 6: Test Deployment

Test the API:
```bash
curl http://your-ec2-ip:3000/health
# or if using Nginx
curl http://your-ec2-ip/health
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment (development/production) | development |

## Data Structure

### Menu Item
```json
{
  "id": 1,
  "name": "Grilled Salmon",
  "category": "Main Course",
  "price": 24.99,
  "description": "Fresh Atlantic salmon with lemon butter sauce",
  "available": true
}
```

### Order
```json
{
  "id": 1,
  "tableNumber": 5,
  "items": [
    {
      "menuItemId": 3,
      "name": "Grilled Salmon",
      "quantity": 1,
      "price": 24.99
    }
  ],
  "total": 24.99,
  "status": "pending",
  "timestamp": "2025-11-08T14:30:00.000Z"
}
```

### Reservation
```json
{
  "id": 1,
  "customerName": "John Smith",
  "email": "john@example.com",
  "phone": "555-0100",
  "date": "2025-11-09",
  "time": "19:00",
  "guests": 4,
  "tableNumber": 5,
  "status": "confirmed"
}
```

### Table
```json
{
  "id": 1,
  "number": 1,
  "seats": 2,
  "status": "available"
}
```

## Security Considerations

1. **CORS**: Currently allows all origins. In production, restrict to your frontend domain:
```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com'
}));
```

2. **Rate Limiting**: Consider adding rate limiting middleware
3. **Input Validation**: Add validation middleware (e.g., express-validator)
4. **HTTPS**: Use SSL/TLS certificates (Let's Encrypt)
5. **Environment Variables**: Never commit `.env` file
6. **Database**: Migrate from in-memory storage to proper database (MongoDB, PostgreSQL)

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000
# Kill the process
kill -9 PID
```

### EC2 Cannot Connect
- Check Security Group rules
- Verify EC2 instance is running
- Check if application is running: `pm2 status`
- Check logs: `pm2 logs restaurant-api`

### CORS Errors
- Ensure CORS middleware is properly configured
- Check if frontend is using correct API URL
- Verify Security Group allows traffic

## Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Authentication and authorization
- [ ] Real-time updates with WebSockets
- [ ] File upload for menu item images
- [ ] Advanced reporting and analytics
- [ ] Email notifications for reservations
- [ ] Payment processing integration
