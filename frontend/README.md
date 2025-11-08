# Restaurant Management System - Frontend

Modern, responsive web interface for restaurant management.

## Features

- **Dashboard**: Real-time overview of restaurant operations
- **Menu Management**: Complete CRUD operations for menu items
- **Order Management**: Create and track orders with status updates
- **Reservations**: Manage customer reservations
- **Table Management**: Visual table layout with status tracking
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Pages

1. **index.html** - Dashboard with statistics and quick overview
2. **menu.html** - Menu item management with categories
3. **orders.html** - Order tracking and management
4. **reservations.html** - Reservation management
5. **tables.html** - Visual table status and management

## Technology Stack

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with flexbox and grid
- **Vanilla JavaScript**: No framework dependencies
- **REST API**: Communicates with backend via fetch API

## Local Development Setup

### Prerequisites
- A web browser (Chrome, Firefox, Safari, or Edge)
- Backend API running (see backend/README.md)

### Running Locally

1. **Option 1: Using a simple HTTP server**

If you have Python installed:
```bash
cd frontend
python -m http.server 8080
```

Or with Node.js:
```bash
npx http-server frontend -p 8080
```

2. **Option 2: Using VS Code Live Server**
- Install "Live Server" extension in VS Code
- Right-click on `index.html`
- Select "Open with Live Server"

3. **Option 3: Direct file access**
- Simply open `index.html` in your browser
- Note: Some browsers may have CORS restrictions with file:// protocol

The frontend will be available at `http://localhost:8080`

## Configuration

### API URL Configuration

The frontend needs to know where the backend API is running. This is configured in `js/config.js`:

```javascript
const API_CONFIG = {
  LOCAL: 'http://localhost:3000',
  EC2: 'http://YOUR_EC2_IP:3000',  // Update this
  CURRENT: 'LOCAL'  // Change to 'EC2' when deployed
};
```

**For local development:**
- Keep `CURRENT: 'LOCAL'`
- Backend should be running on `http://localhost:3000`

**For AWS EC2 deployment:**
1. Update the `EC2` URL with your EC2 instance's public IP:
   ```javascript
   EC2: 'http://3.145.123.45:3000'  // Replace with your IP
   ```
2. Change `CURRENT` to `'EC2'`:
   ```javascript
   CURRENT: 'EC2'
   ```

## AWS Deployment Options

### Option 1: Deploy to S3 + CloudFront (Recommended)

**Advantages:**
- Cost-effective
- Fast global delivery via CDN
- Highly scalable
- Easy to update

**Steps:**

1. **Create S3 Bucket:**
```bash
aws s3 mb s3://your-restaurant-frontend
```

2. **Configure bucket for static website hosting:**
```bash
aws s3 website s3://your-restaurant-frontend \
  --index-document index.html \
  --error-document index.html
```

3. **Update API configuration in `js/config.js`:**
```javascript
EC2: 'http://YOUR_EC2_PUBLIC_IP:3000',
CURRENT: 'EC2'
```

4. **Upload files to S3:**
```bash
cd frontend
aws s3 sync . s3://your-restaurant-frontend \
  --exclude ".git/*" \
  --exclude "README.md"
```

5. **Make bucket public (or use CloudFront):**
```bash
aws s3api put-bucket-policy \
  --bucket your-restaurant-frontend \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [{
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-restaurant-frontend/*"
    }]
  }'
```

6. **Access your site:**
```
http://your-restaurant-frontend.s3-website-us-east-1.amazonaws.com
```

7. **(Optional) Set up CloudFront:**
- Create CloudFront distribution with S3 bucket as origin
- Configure custom domain name (if desired)
- Enable HTTPS

### Option 2: Deploy to EC2 (Same as Backend)

**Advantages:**
- Everything in one place
- Simpler networking
- Good for development/testing

**Steps:**

1. **Connect to your EC2 instance:**
```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

2. **Upload frontend files:**
```bash
# From your local machine
scp -i your-key.pem -r frontend/ ec2-user@your-ec2-ip:~/
```

3. **Install and configure Nginx:**
```bash
sudo yum install nginx  # Amazon Linux
# or
sudo apt install nginx  # Ubuntu

sudo systemctl start nginx
sudo systemctl enable nginx
```

4. **Update API configuration:**
```bash
cd ~/frontend
nano js/config.js
```

Change to:
```javascript
EC2: 'http://YOUR_EC2_PUBLIC_IP:3000',
CURRENT: 'EC2'
```

5. **Configure Nginx to serve frontend:**
```bash
sudo nano /etc/nginx/conf.d/frontend.conf
```

Add:
```nginx
server {
    listen 80;
    server_name your-ec2-ip;
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

6. **Restart Nginx:**
```bash
sudo systemctl restart nginx
```

7. **Access your application:**
```
http://your-ec2-ip
```

### Option 3: Deploy to AWS Amplify

**Advantages:**
- CI/CD integration with Git
- Automatic deployments on push
- Built-in hosting

**Steps:**

1. Push your code to a Git repository (GitHub, GitLab, Bitbucket)
2. Go to AWS Amplify Console
3. Connect your repository
4. Configure build settings (if needed)
5. Deploy

## Updating After Deployment

### For S3:
```bash
# Update config.js first, then sync
aws s3 sync frontend/ s3://your-restaurant-frontend
```

### For EC2:
```bash
# Update config.js first, then upload
scp -i your-key.pem -r frontend/ ec2-user@your-ec2-ip:~/
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## File Structure

```
frontend/
├── index.html              # Dashboard page
├── menu.html               # Menu management page
├── orders.html             # Orders page
├── reservations.html       # Reservations page
├── tables.html             # Tables page
├── css/
│   └── styles.css          # All styles
├── js/
│   ├── config.js           # API configuration
│   ├── api.js              # API wrapper functions
│   ├── dashboard.js        # Dashboard functionality
│   ├── menu.js             # Menu management
│   ├── orders.js           # Order management
│   ├── reservations.js     # Reservation management
│   └── tables.js           # Table management
└── README.md               # This file
```

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:

1. **Check backend CORS configuration** - Ensure the backend has CORS enabled
2. **Verify API URL** - Make sure `config.js` has the correct backend URL
3. **Check Security Group** - Ensure EC2 security group allows traffic from your IP/frontend

### API Connection Fails

1. **Check backend is running:**
```bash
curl http://your-backend-url/health
```

2. **Verify config.js:**
- Make sure the API_URL is correct
- Ensure you're using the right environment (LOCAL vs EC2)

3. **Check browser console** for specific error messages

### Blank Page After Deployment

1. **Check browser console** for JavaScript errors
2. **Verify all files uploaded** correctly
3. **Check API configuration** in config.js
4. **Ensure backend is accessible** from the frontend's location

### Mobile Layout Issues

- Clear browser cache
- Test in different mobile browsers
- Check responsive design in browser dev tools

## Security Considerations

1. **API URL**: Don't expose sensitive endpoints
2. **Input Validation**: Always validate user input
3. **HTTPS**: Use HTTPS in production (CloudFront, Load Balancer, or Let's Encrypt)
4. **Content Security Policy**: Consider adding CSP headers
5. **Authentication**: Add authentication for production use

## Performance Optimization

1. **Minification**: Minify CSS and JavaScript for production
2. **CDN**: Use CloudFront or similar CDN
3. **Caching**: Configure appropriate cache headers
4. **Image Optimization**: Optimize any images used
5. **Lazy Loading**: Consider lazy loading for large datasets

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Real-time updates with WebSockets
- [ ] Offline support with Service Workers
- [ ] Progressive Web App (PWA) features
- [ ] Dark mode toggle
- [ ] Multi-language support
- [ ] Print functionality for orders/receipts
- [ ] Export data to CSV/PDF
- [ ] Advanced filtering and search
- [ ] Data visualization charts

## License

ISC
