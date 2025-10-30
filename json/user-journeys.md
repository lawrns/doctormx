# Doctor.mx User Journeys

## Journey Mermaid Diagrams

### 1. Guest User Journey

```mermaid
graph TD
    Start[Landing Page '/'] -->|View| Features[Browse Features]
    Start -->|Click| Login[Login Page]
    Start -->|Click| Register[Register Page]
    Start -->|Click| Doctors[Doctor Directory]
    
    Login -->|Success| PatientHome[Patient Dashboard]
    Register -->|Success| PatientHome
    
    Doctors -->|Browse| DoctorProfile[Doctor Profile]
    DoctorProfile -->|Need Login| Login
    
    style Start fill:#4ade80
    style Login fill:#60a5fa
    style Register fill:#60a5fa
    style PatientHome fill:#a78bfa
```

### 2. Patient User Journey (Current - WITH ISSUES)

```mermaid
graph TD
    Dashboard[Patient Dashboard ✅ Has Nav] -->|Nav Menu| Options[Navigation Options]
    
    Options -->|Click Doctores| DoctorDir[Doctor Directory ✅]
    Options -->|Click Consultar IA| ConsultAI[AI Consultation ✅]
    Options -->|Click Imágenes| Vision[Vision Analysis ✅]
    Options -->|Click Referencias| Referrals[AI Referrals ❌ NO NAV]
    Options -->|Click Comunidad| Community[Community ❌ NO NAV]
    Options -->|Click Tienda| Marketplace[Marketplace ❌ NO NAV]
    Options -->|Click Puntos| Gamification[Gamification ❌ NO NAV]
    
    DoctorDir -->|Has Nav Bar| BackToDash[Can Navigate Back ✅]
    ConsultAI -->|Has Nav Bar| BackToDash
    Vision -->|Has Nav Bar| BackToDash
    
    Referrals -->|NO Nav Bar| Stranded1[User Stranded 🔴]
    Community -->|NO Nav Bar| Stranded2[User Stranded 🔴]
    Marketplace -->|NO Nav Bar| Stranded3[User Stranded 🔴]
    Gamification -->|NO Nav Bar| Stranded4[User Stranded 🔴]
    
    Stranded1 -->|Only Option| BrowserBack[Browser Back Button]
    Stranded2 -->|Only Option| BrowserBack
    Stranded3 -->|Only Option| BrowserBack
    Stranded4 -->|Only Option| BrowserBack
    
    style Dashboard fill:#4ade80
    style Referrals fill:#ef4444
    style Community fill:#ef4444
    style Marketplace fill:#ef4444
    style Gamification fill:#ef4444
    style Stranded1 fill:#dc2626
    style Stranded2 fill:#dc2626
    style Stranded3 fill:#dc2626
    style Stranded4 fill:#dc2626
```

### 3. Doctor User Journey (Current - WITH ISSUES)

```mermaid
graph TD
    Start[Landing Page] -->|Click| Connect[Connect Landing ✅]
    Connect -->|Sign Up| Signup[Doctor Signup ✅]
    Signup -->|Submit| Verify[Verification Process ✅]
    Verify -->|Approved| DocDash[Doctor Dashboard ✅]
    
    DocDash -->|Access Nav| NavOptions[Navigation Menu]
    NavOptions -->|Panel Doctor| DoctorPanel[Doctor Panel ❌ NO NAV]
    NavOptions -->|Dashboard| Dashboard[Dashboard ✅]
    NavOptions -->|Subscriptions| Subs[Subscription Mgmt ✅]
    
    DoctorPanel -->|NO Nav| Stranded[Stranded Without Nav 🔴]
    
    style Start fill:#4ade80
    style DoctorPanel fill:#ef4444
    style Stranded fill:#dc2626
```

### 4. Complete Feature Access Map

```mermaid
graph LR
    User[Authenticated User] --> MainNav[Main Navigation Bar]
    
    MainNav --> Group1[Core Services ✅]
    MainNav --> Group2[Extended Services ❌]
    MainNav --> Group3[Content ❌]
    MainNav --> Group4[Doctor Tools ❌]
    
    Group1 --> |Has Layout| Doctors[Doctores]
    Group1 --> |Has Layout| AIConsult[Consultar IA]
    Group1 --> |Has Layout| VisionServ[Imágenes]
    Group1 --> |Has Layout| PatDash[Dashboard]
    
    Group2 --> |NO Layout| Referrals[Referencias]
    Group2 --> |NO Layout| Community[Comunidad]
    Group2 --> |NO Layout| Market[Tienda]
    Group2 --> |NO Layout| Points[Puntos]
    
    Group3 --> |NO Layout| Blog[Blog]
    Group3 --> |NO Layout| FAQ[FAQ]
    Group3 --> |NO Layout| QA[Q&A Board]
    Group3 --> |NO Layout| ExpertQA[Expert Q&A]
    
    Group4 --> |NO Layout| DocPanel[Panel Doctor]
    Group4 --> |NO Layout| DocDash2[Doctor Dashboard*]
    Group4 --> |NO Layout| Affiliate[Affiliate]
    Group4 --> |NO Layout| SubPlans[Subscription Plans]
    
    style Group1 fill:#4ade80
    style Group2 fill:#ef4444
    style Group3 fill:#ef4444
    style Group4 fill:#ef4444
```

### 5. Ideal Patient Journey (FIXED)

```mermaid
graph TD
    Dashboard[Patient Dashboard] -->|Nav Menu| Options[Navigation Options]
    
    Options -->|All Routes| WithLayout[All Pages Have Layout Wrapper]
    
    WithLayout --> Doctores[Doctores]
    WithLayout --> ConsultAI[Consultar IA]
    WithLayout --> Vision[Imágenes]
    WithLayout --> Referrals[Referencias]
    WithLayout --> Community[Comunidad]
    WithLayout --> Marketplace[Tienda]
    WithLayout --> Gamification[Puntos]
    
    Doctores -->|Nav Visible| Navigate[Can Always Navigate]
    ConsultAI -->|Nav Visible| Navigate
    Vision -->|Nav Visible| Navigate
    Referrals -->|Nav Visible| Navigate
    Community -->|Nav Visible| Navigate
    Marketplace -->|Nav Visible| Navigate
    Gamification -->|Nav Visible| Navigate
    
    Navigate -->|Consistent| AnyPage[To Any Page]
    
    style Dashboard fill:#4ade80
    style WithLayout fill:#4ade80
    style Navigate fill:#22c55e
    style AnyPage fill:#22c55e
```

### 6. Current Routing Flow

```mermaid
sequenceDiagram
    participant User
    participant Nav as Navigation Bar
    participant Router
    participant Page
    
    User->>Nav: Clicks "Comunidad"
    Nav->>Router: Navigate to /community
    Router->>Page: Load HealthCommunity component
    Note over Page: Component renders WITHOUT Layout
    Page-->>User: Page displays (NO NAV BAR!)
    
    User->>User: Confused - where is navigation?
    User->>Browser: Uses back button
    Browser->>Router: Go back
    Router->>Nav: Previous page with nav
    Note over User: Broken experience
```

### 7. Desired Routing Flow (FIXED)

```mermaid
sequenceDiagram
    participant User
    participant Nav as Navigation Bar
    participant Router
    participant Layout
    participant Page
    
    User->>Nav: Clicks "Comunidad"
    Nav->>Router: Navigate to /community
    Router->>Layout: Load Layout wrapper
    Layout->>Page: Load HealthCommunity component
    Layout->>Nav: Render navigation bar
    Layout->>Page: Render page content
    Page-->>User: Full page with nav + content
    
    User->>Nav: Can click any menu item
    Note over User: Consistent experience
```

## Journey Issues Summary

### Current State Issues

| Journey Step | Issue | Severity | User Impact |
|-------------|-------|----------|-------------|
| Patient → Comunidad | No navigation bar | 🔴 High | User stranded |
| Patient → Tienda | No navigation bar | 🔴 High | User stranded |
| Patient → Puntos | No navigation bar | 🔴 High | User stranded |
| Patient → Referencias | No navigation bar | 🔴 High | User stranded |
| Doctor → Panel Doctor | No navigation bar | 🔴 High | User stranded |
| Any → Blog | No navigation bar | 🟡 Medium | Content isolated |
| Any → FAQ | No navigation bar | 🟡 Medium | Support isolated |
| Any → Q&A Board | No navigation bar | 🟡 Medium | Content isolated |

### User Pain Points

1. **Navigation Disappearance**: User clicks menu item → nav vanishes
2. **Context Loss**: User doesn't know where they are
3. **No Way Back**: Must use browser back button
4. **Inconsistent UI**: Some pages have nav, others don't
5. **Professional Concern**: Looks like broken website
6. **Trust Issues**: Users may think site is malfunctioning

## Required Journey Fixes

See `/json/recommendations.md` for implementation details.

---

**Generated**: October 30, 2025  
**Purpose**: Identify and document user journey issues in Doctor.mx application
