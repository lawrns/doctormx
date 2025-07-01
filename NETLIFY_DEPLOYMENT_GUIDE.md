# 🚀 DoctorMX Netlify Deployment Guide

## 📋 **Quick Deployment Steps**

### **Option A: Automated Script (Recommended)**

```bash
# After completing Netlify login in browser:
./deploy-to-netlify.sh
```

### **Option B: Manual Netlify Dashboard**

1. **Go to Netlify Dashboard**: https://app.netlify.com/
2. **Click "Add new site"** → **"Import an existing project"**
3. **Connect to GitHub** and select: `isaacvzc07/doctormx`
4. **Branch to deploy**: `video-consultation-dev`
5. **Build settings**:
   - **Build command**: `npm ci && npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`

### **Option C: CLI Deployment**

```bash
# After Netlify login:
npm ci && npm run build
netlify deploy --prod --dir=dist
```

### **2. Environment Variables Setup**

In Netlify Dashboard → Site Settings → Environment Variables, add:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://oxlbametpfubwnrmrbsv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bGJhbWV0cGZ1Ynducm1yYnN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MjAxNjQsImV4cCI6MjA1NjE5NjE2NH0.H2_4ueekh5HVvdXBw7OX_EKWEO26kehXBRfd5HJvjgA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bGJhbWV0cGZ1Ynducm1yYnN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDYyMDE2NCwiZXhwIjoyMDU2MTk2MTY0fQ.IZzt64ThZ3fIT3kaeukLa_BcPoulQozfqMGl96bTW-8

# Video Consultation (Agora.io)
VITE_AGORA_APP_ID=fffa925cd399432a895ab9a46688d279
AGORA_APP_CERTIFICATE=6389a8f7e7ce4b8fa66a2600207e7858

# OpenAI Configuration
OPENAI_API_KEY=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

# Application Configuration
NODE_ENV=production
SITE_URL=https://your-netlify-site.netlify.app
VITE_FORCE_REAL_AI=true
VITE_ENHANCED_MOCKS=false
```

### **3. Deploy**

1. **Click "Deploy site"**
2. **Wait for build to complete** (usually 2-3 minutes)
3. **Your site will be available** at: `https://[random-name].netlify.app`

---

## 🎯 **Video Call Testing URLs**

Once deployed, test the video call feature at:

- **Main Video Test**: `https://your-site.netlify.app/video-test-simple`
- **Video Call Component**: `https://your-site.netlify.app/video-test`

---

## ✅ **Testing Checklist**

### **Basic Functionality**
- [ ] Site loads without errors
- [ ] AI Doctor chat works (`/doctor`)
- [ ] Image analysis works (`/image-analysis`)
- [ ] Authentication system works

### **Video Call Testing**
- [ ] Video test page loads (`/video-test-simple`)
- [ ] Camera/microphone permissions granted
- [ ] Token generation works (check Network tab)
- [ ] Users can join video channels
- [ ] **Two users can see each other's video streams**
- [ ] **Audio transmission works bidirectionally**
- [ ] Camera/microphone toggle controls work
- [ ] End call functionality works

---

## 🔧 **Troubleshooting**

### **Build Errors**
```bash
# If build fails, check:
1. All environment variables are set
2. Node version is 20.12.2
3. Dependencies are properly installed
```

### **Video Call Issues**
```bash
# Check browser console for:
1. "Token generated successfully"
2. "Successfully joined channel"
3. "USER-PUBLISHED EVENT FIRED!"
4. No WebRTC connection errors
```

### **Environment Variable Issues**
```bash
# Verify in Netlify:
1. All VITE_ variables are set
2. AGORA_APP_CERTIFICATE is set (for functions)
3. OPENAI_API_KEY is set
4. SUPABASE keys are correct
```

---

## 🌐 **Custom Domain (Optional)**

1. **Go to**: Site Settings → Domain management
2. **Add custom domain**: `doctormx.com` or your domain
3. **Configure DNS** as instructed by Netlify
4. **SSL certificate** will be automatically provisioned

---

## 📱 **Mobile Testing**

Once deployed, test on mobile devices:
- **iPhone Safari**: Video calls should work
- **Android Chrome**: Video calls should work
- **Desktop browsers**: Chrome, Firefox, Safari, Edge

---

## 🎯 **Success Criteria**

✅ **Deployment is successful when:**
1. Site loads without errors
2. Two users can join the same video channel
3. Both users can see each other's video feeds
4. Audio transmission works in both directions
5. All video controls function properly
6. No console errors related to video streaming

**Ready for testing with your friend!** 🚀
