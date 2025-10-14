# 🚀 Doctor.mx Deployment Guide

## Server Configuration Required

### MIME Types Configuration

The application requires proper MIME type configuration on your web server. Add these MIME types to your server configuration:

#### Nginx Configuration
```nginx
location / {
    # Enable gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json;

    # MIME types for JavaScript modules
    location ~* \.(js)$ {
        add_header Content-Type application/javascript;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # MIME types for CSS
    location ~* \.(css)$ {
        add_header Content-Type text/css;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # MIME types for other assets
    location ~* \.(png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    try_files $uri $uri/ /index.html;
}
```

#### Apache Configuration (.htaccess)
```apache
<IfModule mod_mime.c>
    # JavaScript modules
    AddType application/javascript .js

    # CSS files
    AddType text/css .css

    # Enable compression
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/plain
        AddOutputFilterByType DEFLATE text/html
        AddOutputFilterByType DEFLATE text/xml
        AddOutputFilterByType DEFLATE text/css
        AddOutputFilterByType DEFLATE application/xml
        AddOutputFilterByType DEFLATE application/xhtml+xml
        AddOutputFilterByType DEFLATE application/rss+xml
        AddOutputFilterByType DEFLATE application/javascript
        AddOutputFilterByType DEFLATE application/x-javascript
    </IfModule>
</IfModule>

<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/ico "access plus 1 year"
</IfModule>
```

### Environment Variables

Create a `.env` file in your deployment with:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://oxlbametpfubwnrmrbsv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bGJhbWV0cGZ1Ynducm1yYnN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MjAxNjQsImV4cCI6MjA1NjE5NjE2NH0.H2_4ueekh5HVvdXBw7OX_EKWEO26kehXBRfd5HJvjgA

# OpenAI (for AI features)
OPENAI_API_KEY=your_openai_api_key_here

# WhatsApp (for messaging features)
WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
```

### Deployment Steps

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Upload the `dist/` folder contents** to your web server root directory

3. **Configure MIME types** as shown above

4. **Test the deployment** by visiting your domain

### Troubleshooting

#### MIME Type Errors
If you see "Expected a JavaScript module script but got application/octet-stream":
- Check that your server is configured with the MIME types above
- Ensure the JavaScript files are being served with `application/javascript` content type

#### 404 Errors for Assets
- Make sure all files from `dist/` are uploaded
- Check that the server root is pointing to the directory containing `index.html`

#### API Connection Issues
- Ensure the backend API is running and accessible
- Check CORS configuration on your API server

### Performance Optimization

The build is configured with code splitting for better performance:
- `vendor.js` - React and core dependencies
- `router.js` - React Router
- `ui.js` - UI libraries (Framer Motion, Toastify)
- `index.js` - Main application code

Enable gzip compression on your server for optimal loading speeds.
