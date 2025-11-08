# Restaurant Management System

A professional, full-stack restaurant management system designed for AWS deployment. This system provides a complete solution for managing menu items, orders, reservations, and table status.

## 🎯 Overview

This restaurant management system consists of:
- **Backend**: Node.js/Express.js REST API
- **Frontend**: Responsive web application with 5 interconnected pages
- **Deployment**: AWS-ready with EC2 and S3 configurations

## ✨ Features

### Backend Features
- RESTful API with proper CORS configuration
- Menu management with categories
- Order tracking with status updates
- Reservation system
- Table status management
- Dashboard statistics
- Health check endpoint
- Environment-based configuration

### Frontend Features
- **Dashboard**: Real-time statistics and overview
- **Menu Management**: Full CRUD operations for menu items
- **Order Management**: Create and track orders
- **Reservations**: Manage table bookings
- **Table Management**: Visual table layout with status indicators
- Responsive design (mobile-first)
- Professional UI with modern styling
- Dynamic content loading
- Form validation and error handling

## 📁 Project Structure

```
cloud-project/
├── backend/
│   ├── server.js           # Express server with all API endpoints
│   ├── package.json        # Node.js dependencies
│   ├── .env.example        # Environment variables template
│   ├── .gitignore         # Git ignore file
│   └── README.md          # Backend documentation
├── frontend/
│   ├── index.html         # Dashboard page
│   ├── menu.html          # Menu management
│   ├── orders.html        # Order management
│   ├── reservations.html  # Reservations
│   ├── tables.html        # Table management
│   ├── css/
│   │   └── styles.css     # All styling
│   ├── js/
│   │   ├── config.js      # API URL configuration
│   │   ├── api.js         # API wrapper
│   │   ├── dashboard.js   # Dashboard functionality
│   │   ├── menu.js        # Menu management
│   │   ├── orders.js      # Order management
│   │   ├── reservations.js # Reservation management
│   │   └── tables.js      # Table management
│   └── README.md          # Frontend documentation
└── README.md              # This file
```

## 🚀 Quick Start - Local Development

### Prerequisites
- Node.js (v14 or higher)
- npm
- A modern web browser

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd cloud-project
```

### 2. Set Up Backend
```bash
cd backend
npm install
cp .env.example .env
npm start
```

The backend API will be running at `http://localhost:3000`

### 3. Set Up Frontend
```bash
cd ../frontend
# Option 1: Using Python
python -m http.server 8080

# Option 2: Using Node.js
npx http-server -p 8080

# Option 3: Just open index.html in your browser
```

The frontend will be available at `http://localhost:8080`

### 4. Test the Application
- Open your browser to `http://localhost:8080`
- Navigate through all pages: Dashboard, Menu, Orders, Reservations, Tables
- Test CRUD operations on menu items
- Create sample orders
- Add reservations

## ☁️ AWS Deployment Guide

### Architecture Overview

```
┌─────────────────┐         ┌─────────────────┐
│   S3 Bucket     │         │   EC2 Instance  │
│   (Frontend)    │◄────────┤   (Backend API) │
│   + CloudFront  │  CORS   │   + Node.js     │
└─────────────────┘         └─────────────────┘
        │                           │
        │                           │
        └────────── Users ──────────┘
```

### Part 1: Deploy Backend to EC2

#### Step 1: Launch EC2 Instance

1. **Go to AWS EC2 Console**
2. **Launch Instance:**
   - **AMI**: Amazon Linux 2 or Ubuntu Server 22.04 LTS
   - **Instance Type**: t2.micro (free tier eligible)
   - **Key Pair**: Create or select existing key pair
3. **Configure Security Group:**
   - SSH (22): Your IP address
   - HTTP (80): 0.0.0.0/0
   - Custom TCP (3000): 0.0.0.0/0 (for backend API)

4. **Launch Instance** and wait for it to start

#### Step 2: Connect to EC2 Instance

```bash
# Make sure your key has correct permissions
chmod 400 your-key.pem

# Connect to EC2
ssh -i your-key.pem ec2-user@YOUR_EC2_PUBLIC_IP
```

#### Step 3: Install Node.js on EC2

**For Amazon Linux 2:**
```bash
# Install NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install Node.js
nvm install 18
nvm use 18
node --version
```

**For Ubuntu:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
```

#### Step 4: Deploy Backend Code

**Option A: Clone from Git**
```bash
git clone <your-repository-url>
cd cloud-project/backend
```

**Option B: Upload via SCP**
```bash
# From your local machine
scp -i your-key.pem -r backend/ ec2-user@YOUR_EC2_IP:~/
```

#### Step 5: Configure and Start Backend

```bash
cd ~/backend  # or ~/cloud-project/backend

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
PORT=3000
NODE_ENV=production
EOF

# Install PM2 for process management
sudo npm install -g pm2

# Start the application
pm2 start server.js --name restaurant-api

# Configure PM2 to start on boot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs restaurant-api
```

#### Step 6: Test Backend

```bash
# Test from EC2 instance
curl http://localhost:3000/health

# Test from your local machine
curl http://YOUR_EC2_PUBLIC_IP:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-08T16:23:18.969Z"
}
```

### Part 2: Deploy Frontend

#### Option A: Deploy to S3 + CloudFront (Recommended)

**Step 1: Update API Configuration**
```bash
cd frontend
nano js/config.js
```

Update:
```javascript
const API_CONFIG = {
  LOCAL: 'http://localhost:3000',
  EC2: 'http://YOUR_EC2_PUBLIC_IP:3000',  // ← Add your EC2 IP
  CURRENT: 'EC2'  // ← Change from 'LOCAL' to 'EC2'
};
```

**Step 2: Create S3 Bucket**
```bash
# Create bucket (must be globally unique name)
aws s3 mb s3://restaurant-app-frontend-YOUR_NAME

# Enable static website hosting
aws s3 website s3://restaurant-app-frontend-YOUR_NAME \
  --index-document index.html \
  --error-document index.html
```

**Step 3: Upload Files**
```bash
cd frontend
aws s3 sync . s3://restaurant-app-frontend-YOUR_NAME \
  --exclude ".git/*" \
  --exclude "README.md" \
  --exclude ".DS_Store"
```

**Step 4: Configure Bucket Policy**
```bash
aws s3api put-bucket-policy \
  --bucket restaurant-app-frontend-YOUR_NAME \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [{
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::restaurant-app-frontend-YOUR_NAME/*"
    }]
  }'
```

**Step 5: Access Your Application**
```
http://restaurant-app-frontend-YOUR_NAME.s3-website-REGION.amazonaws.com
```

**Step 6 (Optional): Set Up CloudFront**
1. Go to CloudFront in AWS Console
2. Create Distribution
3. Set Origin Domain to your S3 website endpoint
4. Configure settings (HTTPS, custom domain, etc.)
5. Deploy and wait for distribution to be ready

#### Option B: Deploy to EC2 (Same Server as Backend)

**Step 1: Install Nginx on EC2**
```bash
# Amazon Linux
sudo yum install nginx -y

# Ubuntu
sudo apt install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

**Step 2: Update API Configuration**
```bash
cd ~/frontend  # or ~/cloud-project/frontend
nano js/config.js
```

Update:
```javascript
const API_CONFIG = {
  LOCAL: 'http://localhost:3000',
  EC2: 'http://YOUR_EC2_PUBLIC_IP:3000',
  CURRENT: 'EC2'
};
```

**Step 3: Configure Nginx**
```bash
sudo nano /etc/nginx/conf.d/restaurant-app.conf
```

Add:
```nginx
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP;
    
    # Serve frontend
    root /home/ec2-user/frontend;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /health {
        proxy_pass http://localhost:3000;
    }
}
```

**Step 4: Set Permissions and Restart Nginx**
```bash
# Make frontend directory readable by Nginx
chmod -R 755 /home/ec2-user/frontend

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

**Step 5: Access Your Application**
```
http://YOUR_EC2_PUBLIC_IP
```

## 🔒 Security Considerations

### For Production Use:

1. **Enable HTTPS**
   - Use AWS Certificate Manager (ACM) with CloudFront or Application Load Balancer
   - Or install Let's Encrypt certificate on EC2

2. **Restrict CORS**
   ```javascript
   // In backend/server.js
   app.use(cors({
     origin: 'https://your-frontend-domain.com'
   }));
   ```

3. **Add Authentication**
   - Implement JWT-based authentication
   - Add user roles and permissions

4. **Use Secrets Manager**
   - Store sensitive data in AWS Secrets Manager
   - Don't commit .env files

5. **Update Security Groups**
   - Restrict SSH to your IP only
   - Use VPC for backend isolation

6. **Input Validation**
   - Add validation middleware (express-validator)
   - Sanitize user inputs

## 🧪 Testing

### Backend API Testing

```bash
# Health check
curl http://YOUR_EC2_IP:3000/health

# Get menu items
curl http://YOUR_EC2_IP:3000/api/menu

# Get statistics
curl http://YOUR_EC2_IP:3000/api/stats

# Create menu item
curl -X POST http://YOUR_EC2_IP:3000/api/menu \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Item",
    "category": "Appetizers",
    "price": 9.99,
    "description": "Test description"
  }'
```

### Frontend Testing

1. **Dashboard**: Check if statistics load
2. **Menu**: Try adding, editing, and deleting items
3. **Orders**: Create a new order with multiple items
4. **Reservations**: Add a reservation for tomorrow
5. **Tables**: Change table status

## 🐛 Troubleshooting

### Backend Issues

**Port 3000 already in use:**
```bash
lsof -i :3000
kill -9 <PID>
pm2 restart restaurant-api
```

**Backend not starting:**
```bash
pm2 logs restaurant-api
# Check for errors in logs
```

### Frontend Issues

**CORS errors:**
- Check backend CORS configuration
- Verify API URL in config.js
- Check browser console for specific errors

**Blank page:**
- Check browser console for errors
- Verify all files uploaded correctly
- Check API configuration

**API not connecting:**
```bash
# Test backend directly
curl http://YOUR_EC2_IP:3000/health
```

## 📊 Monitoring

### Using PM2
```bash
# View logs
pm2 logs restaurant-api

# Monitor resources
pm2 monit

# View status
pm2 status
```

### Using CloudWatch (AWS)
- Enable CloudWatch logs for EC2
- Set up alarms for CPU, memory, disk usage
- Monitor API requests and errors

## 🔄 Updating the Application

### Backend Updates
```bash
# Connect to EC2
ssh -i your-key.pem ec2-user@YOUR_EC2_IP

# Pull latest changes
cd ~/cloud-project
git pull

# Restart application
cd backend
npm install
pm2 restart restaurant-api
```

### Frontend Updates (S3)
```bash
# Update config.js if needed
cd frontend

# Sync to S3
aws s3 sync . s3://restaurant-app-frontend-YOUR_NAME
```

### Frontend Updates (EC2)
```bash
# Upload new files
scp -i your-key.pem -r frontend/ ec2-user@YOUR_EC2_IP:~/

# No restart needed for static files
```

## 📈 Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] User authentication and authorization
- [ ] Real-time updates with WebSockets
- [ ] Email notifications
- [ ] Payment processing
- [ ] Mobile app (React Native)
- [ ] Advanced analytics and reporting
- [ ] Multi-restaurant support
- [ ] Inventory management
- [ ] Staff management

## 📝 API Documentation

See [backend/README.md](backend/README.md) for detailed API documentation.

## 💻 Technology Stack

**Backend:**
- Node.js
- Express.js
- CORS middleware
- dotenv

**Frontend:**
- HTML5
- CSS3 (Flexbox, Grid)
- Vanilla JavaScript
- Fetch API

**AWS Services:**
- EC2 (Backend hosting)
- S3 (Frontend hosting)
- CloudFront (CDN - optional)
- Route 53 (DNS - optional)

## 📄 License

ISC

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📧 Support

For issues and questions:
- Check the troubleshooting sections in READMEs
- Review AWS documentation
- Check browser console for frontend errors
- Check PM2 logs for backend errors

---

**Note**: This is a demonstration project suitable for learning and development. For production use, implement additional security measures, authentication, and use a proper database instead of in-memory storage.