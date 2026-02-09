# Doctory Design System: shadcn/ui Integration Strategy

## Mission Alignment

**shadcn/ui Philosophy**: "A set of beautifully designed components that you can
customize, extend, and build on. Start here then make it your own. Open Source.
Open Code."

**Doctory Mission**: Transform into a premium healthcare platform with
Doctoralia.mx-level elegance while leveraging shadcn/ui's customizable
foundation to create healthcare-specific, innovative experiences.

---

## Core Integration Principles

### 1. **Copy-Paste, Not Dependencies**

- Copy shadcn/ui components into `src/components/ui/`
- Full control over customization
- No version lock-in
- Easy to extend and modify

### 2. **Customization Over Configuration**

- Extend shadcn components with healthcare-specific logic
- Create compound components for complex patterns
- Build custom hooks for state management
- Maintain design consistency through Tailwind config

### 3. **Accessibility First**

- All shadcn components are WCAG 2.1 AA compliant
- Enhance with healthcare-specific accessibility needs
- Test with screen readers for medical terminology
- Ensure color contrast for vision-impaired users

---

## Implementation Architecture

```
src/
├── components/
│   ├── ui/                          # shadcn/ui components (copy-paste)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── alert.tsx
│   │   ├── toast.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── pagination.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── skeleton.tsx
│   │   └── spinner.tsx
│   │
│   ├── healthcare/                  # Healthcare-specific components
│   │   ├── DoctorCard.tsx           # Doctor profile card with rating
│   │   ├── EmptyState.tsx           # Innovative empty states
│   │   ├── ClinicianHeader.tsx      # Doctor/patient header
│   │   ├── AppointmentSlot.tsx      # Appointment booking
│   │   ├── MedicalHistory.tsx       # Patient history timeline
│   │   ├── PrescriptionCard.tsx     # Prescription display
│   │   ├── VitalsMonitor.tsx        # Vital signs display
│   │   ├── ConsultationCard.tsx     # Consultation details
│   │   └── VerificationBadge.tsx    # Doctor verification
│   │
│   ├── layout/                      # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   ├── Container.tsx
│   │   └── PageLayout.tsx
│   │
│   └── sections/                    # Page sections
│       ├── HeroSection.tsx
│       ├── FeaturesSection.tsx
│       ├── TestimonialsSection.tsx
│       ├── CTASection.tsx
│       └── FAQSection.tsx
│
├── hooks/
│   ├── useDoctor.ts
│   ├── useAppointment.ts
│   ├── usePatient.ts
│   └── useForm.ts
│
├── lib/
│   ├── cn.ts                        # Tailwind class merger
│   ├── colors.ts                    # Color utilities
│   └── animations.ts                # Animation utilities
│
└── styles/
    ├── globals.css
    ├── animations.css
    └── healthcare.css
```

---

## shadcn/ui Components to Implement

### Essential Components (Phase 1)

| Component  | Use Case             | Customization                                |
| ---------- | -------------------- | -------------------------------------------- |
| **Button** | CTAs, actions        | Add loading states, doctor-specific variants |
| **Card**   | Content containers   | Add hover effects, doctor profile cards      |
| **Input**  | Form fields          | Add medical field validation                 |
| **Select** | Dropdowns            | Add specialty selection, location filters    |
| **Dialog** | Modals               | Appointment booking, confirmation dialogs    |
| **Form**   | Form handling        | Integrate React Hook Form + Zod              |
| **Table**  | Data display         | Doctor listings, appointment history         |
| **Tabs**   | Content organization | Patient dashboard sections                   |
| **Avatar** | User profiles        | Doctor avatars with status indicators        |
| **Badge**  | Status indicators    | Verification badges, specialty tags          |

### Advanced Components (Phase 2)

| Component         | Use Case           | Customization                         |
| ----------------- | ------------------ | ------------------------------------- |
| **Alert**         | Notifications      | Medical alerts, appointment reminders |
| **Toast**         | Temporary messages | Booking confirmations, errors         |
| **Dropdown Menu** | Navigation menus   | User menu, doctor actions             |
| **Pagination**    | List navigation    | Doctor directory pagination           |
| **Breadcrumb**    | Navigation path    | Appointment flow breadcrumbs          |
| **Skeleton**      | Loading states     | Doctor card skeletons                 |
| **Spinner**       | Loading indicator  | Form submission loading               |

---

## Innovative Empty States Pattern

### Reference: Your Image (No Team Members)

**Pattern Elements**:

- Circular avatars with icons (visual interest)
- Clear headline ("No Team Members")
- Descriptive subtext
- Prominent CTA button with icon

### Healthcare Adaptations

#### 1. **No Doctors Found**

```tsx
<EmptyState
    icon={<Stethoscope className="w-12 h-12" />}
    title="No Doctors Found"
    description="Try adjusting your filters or search criteria"
    action={{
        label: "Browse All Doctors",
        onClick: () => navigate("/doctors"),
    }}
    secondaryAction={{
        label: "Request a Specialist",
        onClick: () => navigate("/request-specialist"),
    }}
/>;
```

#### 2. **No Appointments**

```tsx
<EmptyState
    icon={<Calendar className="w-12 h-12" />}
    title="No Appointments Scheduled"
    description="Book your first consultation with a healthcare professional"
    action={{
        label: "+ Schedule Appointment",
        onClick: () => navigate("/book"),
    }}
    illustration={<IllustrationComponent />}
/>;
```

#### 3. **No Medical Records**

```tsx
<EmptyState
    icon={<FileText className="w-12 h-12" />}
    title="No Medical Records"
    description="Your medical records will appear here once you have consultations"
    action={{
        label: "Book First Consultation",
        onClick: () => navigate("/doctors"),
    }}
    hint="Your records are securely stored and encrypted"
/>;
```

#### 4. **No Team Members** (For Doctors)

```tsx
<EmptyState
    icon={<Users className="w-12 h-12" />}
    title="No Team Members"
    description="Invite your medical team to collaborate on this practice"
    action={{
        label: "+ Invite Members",
        onClick: () => openInviteDialog(),
    }}
    avatarGroup={[
        { icon: <User1 />, label: "Doctor" },
        { icon: <User2 />, label: "Nurse" },
        { icon: <Plus />, label: "Add" },
    ]}
/>;
```

---

## Color System Integration with shadcn/ui

### Tailwind Configuration

```typescript
// tailwind.config.ts
const config = {
    theme: {
        extend: {
            colors: {
                primary: {
                    50: "#E6F0FF",
                    100: "#CCE0FF",
                    200: "#99C2FF",
                    300: "#66A3FF",
                    400: "#3385FF",
                    500: "#0066CC",
                    600: "#0052A3",
                    700: "#003D7A",
                    800: "#002952",
                    900: "#001429",
                },
                secondary: {
                    50: "#F0F9FF",
                    100: "#E0F2FE",
                    500: "#0EA5E9",
                    600: "#0284C7",
                },
                success: {
                    50: "#F0FDF4",
                    500: "#10B981",
                    600: "#059669",
                },
                warning: {
                    50: "#FFFBEB",
                    500: "#F59E0B",
                    600: "#D97706",
                },
                error: {
                    50: "#FEF2F2",
                    500: "#EF4444",
                    600: "#DC2626",
                },
                gray: {
                    50: "#F9FAFB",
                    100: "#F3F4F6",
                    200: "#E5E7EB",
                    300: "#D1D5DB",
                    400: "#9CA3AF",
                    500: "#6B7280",
                    600: "#4B5563",
                    700: "#374151",
                    800: "#1F2937",
                    900: "#111827",
                },
            },
            borderRadius: {
                sm: "4px",
                md: "8px",
                lg: "12px",
                xl: "16px",
                "2xl": "20px",
            },
            boxShadow: {
                sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            },
        },
    },
};
```

---

## Healthcare-Specific Component Extensions

### 1. **DoctorCard Component**

```tsx
// components/healthcare/DoctorCard.tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, MapPin, Star } from "lucide-react";

export function DoctorCard({ doctor }) {
    return (
        <Card className="hover:shadow-lg transition-shadow">
            <div className="p-6">
                {/* Header with avatar and info */}
                <div className="flex gap-4 mb-4">
                    <Avatar className="w-16 h-16">
                        <AvatarImage src={doctor.avatar} />
                        <AvatarFallback>{doctor.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg">{doctor.name}</h3>
                        <p className="text-sm text-gray-600">
                            {doctor.specialty}
                        </p>
                        <div className="flex gap-2 mt-2">
                            {doctor.verified && (
                                <Badge variant="success" className="text-xs">
                                    ✓ Verified
                                </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                                {doctor.experience}y exp
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Rating and location */}
                <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{doctor.rating}</span>
                        <span className="text-gray-600">
                            ({doctor.reviews} reviews)
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{doctor.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Available {doctor.availability}</span>
                    </div>
                </div>

                {/* CTA */}
                <Button className="w-full">Book Appointment</Button>
            </div>
        </Card>
    );
}
```

### 2. **EmptyState Component**

```tsx
// components/healthcare/EmptyState.tsx
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description: string;
    action: {
        label: string;
        onClick: () => void;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
    illustration?: ReactNode;
    hint?: string;
}

export function EmptyState({
    icon,
    title,
    description,
    action,
    secondaryAction,
    illustration,
    hint,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            {/* Icon or Illustration */}
            <div className="mb-6 text-gray-400">
                {illustration || (
                    <div className="w-16 h-16 flex items-center justify-center">
                        {icon}
                    </div>
                )}
            </div>

            {/* Content */}
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {title}
            </h2>
            <p className="text-gray-600 text-center max-w-md mb-6">
                {description}
            </p>

            {/* Hint */}
            {hint && (
                <p className="text-sm text-gray-500 mb-6">
                    {hint}
                </p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
                <Button onClick={action.onClick} size="lg">
                    {action.label}
                </Button>
                {secondaryAction && (
                    <Button
                        variant="outline"
                        onClick={secondaryAction.onClick}
                        size="lg"
                    >
                        {secondaryAction.label}
                    </Button>
                )}
            </div>
        </div>
    );
}
```

### 3. **VerificationBadge Component**

```tsx
// components/healthcare/VerificationBadge.tsx
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface VerificationBadgeProps {
    status: "verified" | "pending" | "unverified";
    type: "doctor" | "clinic" | "credential";
}

export function VerificationBadge({ status, type }: VerificationBadgeProps) {
    const variants = {
        verified: {
            icon: <CheckCircle2 className="w-4 h-4" />,
            label: `${type} Verified`,
            variant: "success" as const,
        },
        pending: {
            icon: <AlertCircle className="w-4 h-4" />,
            label: `${type} Pending`,
            variant: "warning" as const,
        },
        unverified: {
            icon: <AlertCircle className="w-4 h-4" />,
            label: `${type} Unverified`,
            variant: "secondary" as const,
        },
    };

    const config = variants[status];

    return (
        <Badge variant={config.variant} className="flex gap-1">
            {config.icon}
            {config.label}
        </Badge>
    );
}
```

---

## Animation & Micro-interactions

### Framer Motion Integration

```tsx
// lib/animations.ts
import { Variants } from "framer-motion";

export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
};

export const slideUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export const slideInLeft: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};
```

---

## Form Handling with React Hook Form + Zod

### Example: Doctor Registration Form

```tsx
// components/forms/DoctorRegistrationForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

const doctorSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    specialty: z.string().min(1, "Please select a specialty"),
    cedula: z.string().regex(/^\d{6,8}$/, "Invalid professional license"),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
});

type DoctorFormData = z.infer<typeof doctorSchema>;

export function DoctorRegistrationForm() {
    const form = useForm<DoctorFormData>({
        resolver: zodResolver(doctorSchema),
    });

    const onSubmit = async (data: DoctorFormData) => {
        // Submit to API
        console.log(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Dr. Juan Pérez"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="specialty"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Medical Specialty</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your specialty" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="cardiology">
                                        Cardiology
                                    </SelectItem>
                                    <SelectItem value="dermatology">
                                        Dermatology
                                    </SelectItem>
                                    <SelectItem value="neurology">
                                        Neurology
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full">
                    Register as Doctor
                </Button>
            </form>
        </Form>
    );
}
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)

- [ ] Install shadcn/ui and copy base components
- [ ] Configure Tailwind with Doctory color palette
- [ ] Create layout components (Header, Sidebar, Footer)
- [ ] Build EmptyState component
- [ ] Set up animations with Framer Motion

### Phase 2: Healthcare Components (Week 2)

- [ ] Create DoctorCard component
- [ ] Build VerificationBadge component
- [ ] Create AppointmentSlot component
- [ ] Build MedicalHistory timeline
- [ ] Create ConsultationCard component

### Phase 3: Page Redesigns (Week 3)

- [ ] Redesign landing page with new components
- [ ] Redesign doctor directory
- [ ] Redesign doctor profile pages
- [ ] Redesign dashboard
- [ ] Redesign second opinion pages

### Phase 4: Polish & Deploy (Week 4)

- [ ] Dark mode implementation
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Cross-browser testing
- [ ] Production deployment

---

## Key Advantages of This Approach

✅ **Customizable**: Full control over component code\
✅ **Extensible**: Easy to add healthcare-specific features\
✅ **Accessible**: Built on WCAG 2.1 AA standards\
✅ **Professional**: Enterprise-grade design system\
✅ **Maintainable**: Clear component structure\
✅ **Scalable**: Supports growth and new features\
✅ **Open Source**: Community-backed, no vendor lock-in

---

## Success Metrics

- **Design Consistency**: 100% of pages follow design system
- **Component Reusability**: 80%+ component reuse across pages
- **Accessibility**: WCAG 2.1 AA compliance on all pages
- **Performance**: Lighthouse score > 90
- **User Satisfaction**: Positive feedback on design quality

---

## Resources

- **shadcn/ui Docs**: https://ui.shadcn.com/docs
- **shadcn/ui Components**: https://ui.shadcn.com/docs/components
- **shadcn/ui Blocks**: https://ui.shadcn.com/blocks
- **Tailwind CSS**: https://tailwindcss.com
- **Framer Motion**: https://www.framer.com/motion
- **React Hook Form**: https://react-hook-form.com
- **Zod**: https://zod.dev
