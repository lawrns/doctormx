# AI Browser Verification Guide for Doctor.mx

## Overview

This guide provides comprehensive instructions for an AI system connected to a browser to verify the Doctor.mx application's functionality, layout consistency, and overall quality.

---

## Part 1: Initial Setup & Navigation

### Step 1: Start the Application
```bash
npm run dev
```
- Expected: Server starts on `http://localhost:5174`
- Verify: "VITE ready in XXX ms" message appears

### Step 2: Open Browser
Navigate to: `http://localhost:5174`

### Step 3: Verify Home Page Loads
**Expected Elements:**
- ✅ Header with logo and navigation
- ✅ Hero section with "Salud gratuita para México"
- ✅ Animated chat component
- ✅ Stats dashboard
- ✅ Features bento grid
- ✅ Pricing section
- ✅ Footer with links
- ✅ Scroll progress indicator at top

**Console Check:**
- Open DevTools (F12)
- Check Console tab
- Expected: No red errors, only info/warnings acceptable

---

## Part 2: Navigation Testing

### Header Navigation (Desktop)
1. **Logo Click**
   - Click logo in header
   - Expected: Navigate to home page
   - Verify: URL changes to `/`

2. **Navigation Links**
   - Click "Doctores" link
   - Expected: Navigate to `/doctors`
   - Verify: Doctor directory page loads

3. **Auth Links (Not Logged In)**
   - Click "Iniciar Sesión"
   - Expected: Navigate to `/login`
   - Verify: Login form displays

4. **Auth Links (Not Logged In)**
   - Click "Registrarse"
   - Expected: Navigate to `/register`
   - Verify: Registration form displays

### Mobile Navigation
1. **Resize Browser**
   - Resize to < 768px width
   - Expected: Desktop nav hides, hamburger appears

2. **Hamburger Menu**
   - Click hamburger icon (3 lines)
   - Expected: Menu slides in from right
   - Verify: All nav items visible

3. **Menu Items**
   - Click "Doctores" in menu
   - Expected: Navigate to `/doctors`
   - Verify: Menu closes, page loads

4. **Close Menu**
   - Click X button or outside menu
   - Expected: Menu slides out
   - Verify: Menu closed

---

## Part 3: Layout Consistency Testing

### Test Each Critical Page

#### 1. Login Page (/login)
```
URL: http://localhost:5174/login
```

**Header Check:**
- [ ] Logo visible and clickable
- [ ] Navigation bar present
- [ ] Mobile hamburger visible on small screens

**Content Check:**
- [ ] Login form displays
- [ ] Email field present
- [ ] Password field present
- [ ] Submit button present
- [ ] "Registrarse" link works

**Footer Check:**
- [ ] Footer visible at bottom
- [ ] Company info visible
- [ ] Links clickable
- [ ] Copyright info present

**Mobile Check (< 768px):**
- [ ] Content readable
- [ ] Form fields full width
- [ ] Hamburger menu works
- [ ] No horizontal scroll

#### 2. Register Page (/register)
```
URL: http://localhost:5174/register
```

**Header Check:**
- [ ] Logo visible and clickable
- [ ] Navigation bar present
- [ ] Mobile hamburger visible on small screens

**Content Check:**
- [ ] Registration form displays
- [ ] All form fields present
- [ ] Submit button present
- [ ] "Iniciar Sesión" link works

**Footer Check:**
- [ ] Footer visible at bottom
- [ ] All footer sections present

**Mobile Check (< 768px):**
- [ ] Form readable
- [ ] All fields accessible
- [ ] No layout shifts

#### 3. Doctor Dashboard (/connect/dashboard)
```
URL: http://localhost:5174/connect/dashboard
Note: Requires authentication
```

**Header Check:**
- [ ] Logo visible and clickable
- [ ] Navigation bar present
- [ ] User profile section visible
- [ ] Logout button present

**Content Check:**
- [ ] Dashboard content loads
- [ ] All dashboard sections present
- [ ] Data displays correctly

**Footer Check:**
- [ ] Footer visible at bottom
- [ ] All footer sections present

**Mobile Check (< 768px):**
- [ ] Dashboard responsive
- [ ] Content readable
- [ ] Navigation works

#### 4. Payment Checkout (/pay/checkout)
```
URL: http://localhost:5174/pay/checkout
Note: Requires authentication
```

**Header Check:**
- [ ] Logo visible and clickable
- [ ] Navigation bar present

**Content Check:**
- [ ] Payment form displays
- [ ] Order summary visible
- [ ] All form fields present

**Footer Check:**
- [ ] Footer visible at bottom

**Mobile Check (< 768px):**
- [ ] Form readable
- [ ] All fields accessible

#### 5. Doctor Directory (/doctors)
```
URL: http://localhost:5174/doctors
```

**Header Check:**
- [ ] Logo visible and clickable
- [ ] Navigation bar present

**Content Check:**
- [ ] Doctor list displays
- [ ] Search/filter works
- [ ] Doctor cards render

**Footer Check:**
- [ ] Footer visible at bottom

---

## Part 4: Responsive Design Testing

### Mobile Testing (< 768px)
1. **Resize Browser**
   - Set width to 375px (iPhone SE)
   - Height: 667px

2. **Check Each Page**
   - [ ] Header responsive
   - [ ] Content readable
   - [ ] No horizontal scroll
   - [ ] Touch targets adequate (44px+)
   - [ ] Footer accessible

3. **Navigation**
   - [ ] Hamburger menu works
   - [ ] Menu items clickable
   - [ ] Links navigate correctly

### Tablet Testing (768px - 1024px)
1. **Resize Browser**
   - Set width to 768px
   - Height: 1024px

2. **Check Layout**
   - [ ] Navigation adapts
   - [ ] Content readable
   - [ ] Layout optimal

### Desktop Testing (> 1024px)
1. **Full Width**
   - Set width to 1920px
   - Height: 1080px

2. **Check Layout**
   - [ ] Full navigation visible
   - [ ] Desktop menu shows
   - [ ] Layout optimal

---

## Part 5: Functionality Testing

### Authentication Flow
1. **Register**
   - Navigate to `/register`
   - Fill form with test data
   - Submit form
   - Expected: Success message or redirect

2. **Login**
   - Navigate to `/login`
   - Enter credentials
   - Submit form
   - Expected: Redirect to dashboard

3. **Logout**
   - Click logout button
   - Expected: Redirect to home
   - Verify: Auth buttons visible

### Navigation Flow
1. **Link Testing**
   - Click each navigation link
   - Expected: Navigate to correct page
   - Verify: URL changes

2. **Back Button**
   - Navigate to page
   - Click browser back button
   - Expected: Return to previous page

3. **Deep Linking**
   - Manually enter URL
   - Expected: Page loads correctly

### Form Testing
1. **Login Form**
   - Leave fields empty
   - Click submit
   - Expected: Validation error

2. **Register Form**
   - Fill with invalid data
   - Click submit
   - Expected: Validation error

3. **Payment Form**
   - Fill with test data
   - Click submit
   - Expected: Form processes

---

## Part 6: Accessibility Testing

### Keyboard Navigation
1. **Tab Through Page**
   - Press Tab key repeatedly
   - Expected: Focus moves through interactive elements
   - Verify: Focus indicator visible

2. **Skip Links**
   - Press Tab immediately after page load
   - Expected: "Skip to main content" link appears
   - Click it
   - Expected: Focus moves to main content

3. **Enter Key**
   - Tab to button
   - Press Enter
   - Expected: Button activates

### Screen Reader Testing
1. **Enable Screen Reader**
   - On Mac: VoiceOver (Cmd + F5)
   - On Windows: Narrator (Win + Ctrl + Enter)

2. **Navigate Page**
   - Expected: All elements announced
   - Verify: Proper ARIA labels

3. **Form Fields**
   - Expected: Labels announced
   - Verify: Input types announced

### Color Contrast
1. **Check Text**
   - Text should be readable
   - Expected: Sufficient contrast ratio (4.5:1 for normal text)

2. **Focus States**
   - Tab to interactive elements
   - Expected: Clear focus indicator
   - Verify: Visible on all backgrounds

---

## Part 7: Performance Testing

### Page Load Time
1. **Open DevTools**
   - Press F12
   - Go to Network tab

2. **Reload Page**
   - Press Ctrl+Shift+R (hard refresh)
   - Expected: Page loads in < 3 seconds
   - Verify: All resources load

3. **Check Metrics**
   - DOMContentLoaded: < 1.5s
   - Load: < 3s

### Lighthouse Audit
1. **Open DevTools**
   - Press F12
   - Go to Lighthouse tab

2. **Run Audit**
   - Click "Analyze page load"
   - Expected: Score > 80

3. **Check Categories**
   - Performance: > 80
   - Accessibility: > 90
   - Best Practices: > 80
   - SEO: > 80

### Console Check
1. **Open Console**
   - Press F12
   - Go to Console tab

2. **Check for Errors**
   - Expected: No red errors
   - Warnings acceptable

3. **Check Network**
   - Go to Network tab
   - Expected: No failed requests
   - Verify: All resources load

---

## Part 8: Drift Detection

### Layout Drift
1. **Header Height**
   - Measure header height on each page
   - Expected: Consistent (64px)

2. **Footer Height**
   - Measure footer height on each page
   - Expected: Consistent

3. **Content Padding**
   - Check left/right padding
   - Expected: Consistent across pages

### Color Drift
1. **Primary Color**
   - Check primary color on each page
   - Expected: Consistent (primary-500)

2. **Text Color**
   - Check text colors
   - Expected: Consistent

### Typography Drift
1. **Heading Sizes**
   - Check h1, h2, h3 sizes
   - Expected: Consistent

2. **Font Families**
   - Check fonts used
   - Expected: Consistent

### Component Drift
1. **Buttons**
   - Check button styles
   - Expected: Consistent styling

2. **Forms**
   - Check form field styles
   - Expected: Consistent styling

3. **Cards**
   - Check card styles
   - Expected: Consistent styling

---

## Part 9: Critical User Paths

### Path 1: New User Registration
```
1. Visit http://localhost:5174
2. Click "Registrarse" button
3. Fill registration form
4. Submit form
5. Verify redirect to dashboard
6. Verify header/footer visible
```

### Path 2: Doctor Onboarding
```
1. Visit http://localhost:5174/connect
2. Click "Únete al Equipo"
3. Fill doctor signup form
4. Submit form
5. Verify verification page loads
6. Verify header/footer visible
```

### Path 3: AI Consultation
```
1. Login as patient
2. Visit http://localhost:5174/doctor
3. Type medical question
4. Submit question
5. Verify AI response displays
6. Verify header/footer visible
```

### Path 4: Payment
```
1. Login as patient
2. Select consultation
3. Visit http://localhost:5174/pay/checkout
4. Fill payment form
5. Submit form
6. Verify header/footer visible
```

### Path 5: Mobile Navigation
```
1. Resize to 375px width
2. Click hamburger menu
3. Click navigation item
4. Verify page loads
5. Verify menu closes
6. Verify header/footer visible
```

---

## Part 10: Verification Checklist

### Layout & Navigation ✅
- [ ] Header visible on all pages
- [ ] Footer visible on all pages
- [ ] Logo clickable on all pages
- [ ] Navigation links work
- [ ] Mobile menu functional
- [ ] Scroll indicator visible
- [ ] Breadcrumb present

### Pages ✅
- [ ] Home page loads
- [ ] Login page displays
- [ ] Register page displays
- [ ] Doctor directory loads
- [ ] Dashboard loads (when logged in)
- [ ] Checkout page displays
- [ ] All pages have header/footer

### Responsive Design ✅
- [ ] Mobile layout correct
- [ ] Tablet layout correct
- [ ] Desktop layout correct
- [ ] No horizontal scroll
- [ ] Touch targets adequate
- [ ] Images scale properly

### Functionality ✅
- [ ] Authentication works
- [ ] Navigation works
- [ ] Forms work
- [ ] Links work
- [ ] No console errors
- [ ] No broken images

### Accessibility ✅
- [ ] Skip links present
- [ ] Keyboard navigation works
- [ ] ARIA labels correct
- [ ] Color contrast sufficient
- [ ] Focus indicators visible

### Performance ✅
- [ ] Page load < 3 seconds
- [ ] Lighthouse > 80
- [ ] No console errors
- [ ] Smooth animations
- [ ] No lag

---

## Part 11: Issue Reporting

### If Issues Found

1. **Document Issue**
   - Take screenshot
   - Note page URL
   - Note browser/device
   - Note steps to reproduce

2. **Check Console**
   - Open DevTools (F12)
   - Go to Console tab
   - Copy any error messages

3. **Report Details**
   - Issue title
   - Expected behavior
   - Actual behavior
   - Steps to reproduce
   - Screenshots
   - Console errors

---

## Part 12: Success Criteria

### All Tests Pass When:
✅ Header visible on all pages  
✅ Footer visible on all pages  
✅ Navigation works on all pages  
✅ Mobile menu functional  
✅ All links work  
✅ Forms submit correctly  
✅ No console errors  
✅ Page loads < 3 seconds  
✅ Responsive on all breakpoints  
✅ Accessibility features work  

---

## Summary

The Doctor.mx application is ready for comprehensive browser verification. Use this guide to systematically test:

1. **Navigation** - All pages accessible
2. **Layout** - Consistent header/footer
3. **Responsiveness** - Works on all devices
4. **Functionality** - All features work
5. **Accessibility** - Inclusive design
6. **Performance** - Fast loading

**Status:** ✅ READY FOR VERIFICATION

---

**Last Updated:** October 31, 2025  
**Version:** 1.0  
**Dev Server:** http://localhost:5174
