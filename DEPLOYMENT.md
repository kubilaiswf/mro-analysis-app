# EC2 Deployment Rehberi

## 1. Dosyaları EC2'ye Yükle

```bash
# Git ile clone et
git clone https://github.com/kullanici/mro-analysis-app.git
cd mro-analysis-app
```

## 2. Dependencies'leri Yükle

```bash
npm install
```

## 3. Environment Variables'ı Ayarla

### Backend için (.env.backend):
```bash
# Backend Environment Variables
VITE_GEMINI_API_KEY=your_actual_api_key_here
PORT=3000
```

### Frontend için (.env.production):
```bash
# Production Environment Variables
VITE_API_URL=https://yourdomain.com
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

## 4. Production Build Oluştur

```bash
npm run build:prod
```

## 5. PM2 ile Backend'i Başlat

```bash
# PM2 yükle (global)
npm install -g pm2

# Backend'i PM2 ile başlat
pm2 start server.js --name "mro-backend"

# PM2'yi sistem başlangıcında otomatik başlat
pm2 startup
pm2 save
```

## 6. Nginx Konfigürasyonu

### Nginx config dosyası (/etc/nginx/sites-available/mro-app):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (dist klasörü)
    location / {
        root /path/to/mro-analysis-app/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API'leri
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        root /path/to/mro-analysis-app/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Nginx'i etkinleştir:

```bash
# Konfigürasyonu etkinleştir
sudo ln -s /etc/nginx/sites-available/mro-app /etc/nginx/sites-enabled/

# Nginx'i test et
sudo nginx -t

# Nginx'i restart et
sudo systemctl restart nginx
```

## 7. SSL (İsteğe Bağlı - Certbot ile)

```bash
# Certbot yükle
sudo apt install certbot python3-certbot-nginx

# SSL sertifikası al
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 8. Kontroller

```bash
# PM2 durumunu kontrol et
pm2 status

# PM2 loglarını kontrol et
pm2 logs mro-backend

# Nginx durumunu kontrol et
sudo systemctl status nginx

# Port 3000'in açık olup olmadığını kontrol et
netstat -tlnp | grep :3000
```

## 9. Güncelleme Süreci

```bash
# Kodu güncelle
git pull origin main

# Dependencies'leri güncelle
npm install

# Yeni build oluştur
npm run build:prod

# Backend'i restart et
pm2 restart mro-backend

# Nginx reload (gerekirse)
sudo systemctl reload nginx
```

## Troubleshooting

### API Bağlantı Hatası:
1. `.env.production` dosyasında `VITE_API_URL` doğru mu?
2. PM2'de backend çalışıyor mu? `pm2 status`
3. Port 3000 açık mı? `netstat -tlnp | grep :3000`
4. Nginx proxy_pass doğru mu?

### Build Hatası:
1. Node.js versiyonu uyumlu mu? (14+ gerekli)
2. Dependencies eksik mi? `npm install`
3. Environment variables doğru mu?

### SSL Hatası:
1. Domain DNS'i EC2 IP'sine yönlendiriliyor mu?
2. Certbot SSL sertifikası başarılı mı?
3. Nginx SSL konfigürasyonu doğru mu?
