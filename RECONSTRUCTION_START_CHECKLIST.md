# ✅ CHECKLIST DE INICIO DE RECONSTRUCCIÓN
## DoctorMX v2.0 - Comenzar desde Cero

---

## 🎯 ANTES DE COMENZAR (Pre-requisitos)

### Preparación del Entorno
- [ ] Node.js 20+ instalado (`node --version`)
- [ ] Bun instalado (`bun --version`) - Opcional pero recomendado
- [ ] Git configurado con nombre y email
- [ ] Cuenta de GitHub lista
- [ ] Cuenta de Supabase lista
- [ ] Cuenta de Stripe lista (modo test)
- [ ] Cuenta de Vercel lista
- [ ] Cuenta de Sentry lista (para monitoreo)
- [ ] Editor configurado (VS Code settings)

### Variables de Entorno (Preparar archivo)
```bash
# Crear archivo de referencia para variables
cat > env-template.txt << 'EOF'
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# AI Providers
GLM_API_KEY=
OPENAI_API_KEY=
DEEPSEEK_API_KEY=

# Monitoring
SENTRY_DSN=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
EOF
```

---

## 🚀 DÍA 1: CREACIÓN DEL PROYECTO

### Paso 1.1: Crear Proyecto Next.js
```bash
# Crear proyecto nuevo
npx create-next-app@latest doctormx-v2 \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd doctormx-v2
```

### Paso 1.2: Inicializar Git
```bash
# Git setup
git init
git add .
git commit -m "chore: initial commit - Next.js foundation"
```

### Paso 1.3: Configurar TypeScript Strict
```bash
# Modificar tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] },
    "forceConsistentCasingInFileNames": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF
```

### Paso 1.4: Configurar ESLint (Reglas del Council)
```bash
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Crear eslint.config.mjs
cat > eslint.config.mjs << 'EOF'
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // TypeScript strict
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/strict-boolean-expressions": "error",
      
      // Best practices
      "no-console": ["warn", { allow: ["error"] }],
      "no-debugger": "error",
      "prefer-const": "error",
      "no-var": "error",
      
      // React
      "react-hooks/exhaustive-deps": "error",
      "react/no-unescaped-entities": "error",
    },
  },
];

export default eslintConfig;
EOF
```

### Paso 1.5: Configurar Prettier
```bash
npm install -D prettier

cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "endOfLine": "lf"
}
EOF
```

### Paso 1.6: Configurar Vitest
```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom

cat > vitest.config.ts << 'EOF'
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '.next/'],
    },
  },
});
EOF

mkdir -p tests
cat > tests/setup.ts << 'EOF'
import '@testing-library/jest-dom';
EOF
```

### Paso 1.7: Configurar Husky + lint-staged
```bash
npx husky-init && npm install
npm install -D lint-staged

cat > .lintstagedrc.json << 'EOF'
{
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{css,scss,json,md}": [
    "prettier --write"
  ]
}
EOF

# Configurar pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

### Paso 1.8: Verificar Build (¡Debe pasar con 0 warnings!)
```bash
npm run build
```

### Paso 1.9: Commit
```bash
git add .
git commit -m "chore: setup complete - TypeScript strict, ESLint, Prettier, Vitest, Husky"
```

---

## 📦 DÍA 2: SHADCN/UI Y DESIGN SYSTEM

### Paso 2.1: Inicializar shadcn/ui
```bash
npx shadcn@latest init
# Seleccionar:
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes
```

### Paso 2.2: Instalar Componentes Base
```bash
npx shadcn add button card input dialog label checkbox select
```

### Paso 2.3: Configurar Tailwind con Tokens Médicos
```bash
# Modificar tailwind.config.ts con los tokens del Council
cat > tailwind.config.ts << 'EOF'
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Medical Primary
        'medical-blue': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Medical Severity
        'severity-success': '#10b981',
        'severity-warning': '#f59e0b',
        'severity-danger': '#ef4444',
        'severity-info': '#3b82f6',
        // Border radius
        borderRadius: {
          lg: 'var(--radius)',
          md: 'calc(var(--radius) - 2px)',
          sm: 'calc(var(--radius) - 4px)',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
EOF
```

### Paso 2.4: Crear Componente ErrorPage Unificado
```bash
mkdir -p src/components/ui/error

cat > src/components/ui/error/ErrorPage.tsx << 'EOF'
'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle, Home, ArrowLeft, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

interface ErrorPageProps {
  title?: string;
  message?: string;
  variant?: 'default' | 'medical' | 'auth';
  reset?: () => void;
  backUrl?: string;
}

export function ErrorPage({
  title = 'Ha ocurrido un error',
  message = 'Lo sentimos, algo salió mal. Por favor intenta de nuevo.',
  variant = 'default',
  reset,
  backUrl = '/',
}: ErrorPageProps) {
  const isMedical = variant === 'medical';

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
          isMedical ? 'bg-red-100' : 'bg-gray-100'
        }`}>
          <AlertCircle className={`w-10 h-10 ${isMedical ? 'text-red-600' : 'text-gray-600'}`} />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600">{message}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {reset && (
            <Button onClick={reset} variant="outline">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Intentar de nuevo
            </Button>
          )}
          <Button asChild>
            <Link href={backUrl}>
              <Home className="w-4 h-4 mr-2" />
              Ir al inicio
            </Link>
          </Button>
        </div>

        {isMedical && (
          <p className="text-sm text-red-600 font-medium">
            Si es una emergencia médica, llama al 911 inmediatamente.
          </p>
        )}
      </div>
    </div>
  );
}
EOF
```

### Paso 2.5: Crear MedicalDisclaimer Component
```bash
mkdir -p src/components/legal

cat > src/components/legal/MedicalDisclaimer.tsx << 'EOF'
'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle } from 'lucide-react';

interface MedicalDisclaimerProps {
  onAcknowledge: () => void;
  compact?: boolean;
}

export function MedicalDisclaimer({ onAcknowledge, compact = false }: MedicalDisclaimerProps) {
  const [checked, setChecked] = useState(false);

  const handleCheckedChange = (checked: boolean): void => {
    setChecked(checked);
    if (checked) onAcknowledge();
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-2">
          <h4 className="font-medium text-amber-900">
            Aviso Médico Importante
          </h4>
          <p className={`text-amber-800 ${compact ? 'text-sm' : ''}`}>
            Esta plataforma no reemplaza la atención médica de emergencia. 
            Si experimentas síntomas graves (dificultad para respirar, dolor 
            severo, sangrado incontrolable), llama al 911 o acude a urgencias 
            inmediatamente.
          </p>
          <div className="flex items-start gap-2 pt-2">
            <Checkbox
              id="disclaimer"
              checked={checked}
              onCheckedChange={handleCheckedChange}
            />
            <label htmlFor="disclaimer" className="text-sm text-amber-900 cursor-pointer">
              Entiendo que esta es una plataforma de orientación médica, 
              no un reemplazo de consulta presencial cuando sea necesario.
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
EOF
```

### Paso 2.6: Verificar Build
```bash
npm run build
```

### Paso 2.7: Commit
```bash
git add .
git commit -m "feat: design system with shadcn/ui, ErrorPage, MedicalDisclaimer"
```

---

## 🔐 DÍA 3: SUPABASE Y AUTENTICACIÓN

### Paso 3.1: Instalar Supabase
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### Paso 3.2: Crear Utils de Supabase
```bash
mkdir -p src/lib/server src/lib/client

cat > src/lib/server/db.ts << 'EOF'
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function createClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}

// Service role (server-only, bypasses RLS)
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
EOF

cat > src/lib/client/db.ts << 'EOF'
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
EOF
```

### Paso 3.3: Crear Middleware
```bash
cat > src/middleware.ts << 'EOF'
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect app routes
  if (request.nextUrl.pathname.startsWith('/app') && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect logged in users from auth pages
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
    return NextResponse.redirect(new URL('/app', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
EOF
```

### Paso 3.4: Crear Primeras Páginas de Auth
```bash
mkdir -p src/app/login src/app/register

cat > src/app/login/page.tsx << 'EOF'
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Iniciar Sesión</h1>
        <LoginForm />
      </div>
    </div>
  );
}
EOF
```

### Paso 3.5: Verificar Build
```bash
npm run build
```

### Paso 3.6: Commit
```bash
git add .
git commit -m "feat: Supabase setup with auth middleware and protected routes"
```

---

## 📊 VERIFICACIÓN POST-FASE 0

Después de completar los 3 días anteriores, verificar:

### Build Quality
```bash
npm run build
# Debe pasar con 0 warnings
```

### Tests Infrastructure
```bash
npm test
# Debe correr sin errores (aunque no haya tests todavía)
```

### Lint/Format
```bash
npx eslint src/
npx prettier --check src/
# Ambos deben pasar
```

### Pre-commit Hook
```bash
git commit --allow-empty -m "test: pre-commit hook verification"
# Debe correr lint-staged sin errores
```

---

## 🎯 CHECKPOINTS SEMANA 1

```
✅ TypeScript strict mode activado
✅ ESLint con reglas del Council
✅ Vitest configurado
✅ Husky + lint-staged funcionando
✅ shadcn/ui inicializado
✅ Design system configurado
✅ ErrorPage unificado creado
✅ MedicalDisclaimer creado
✅ Supabase configurado
✅ Middleware de auth creado
✅ Build pasa con 0 warnings
✅ Git repo limpio y organizado
```

---

## 🚀 LISTO PARA SEMANA 2

Una vez completado este checklist, estarás listo para:
1. **Semana 2**: Completar sistema de auth y seguridad
2. **Semana 3-4**: Core functionality (doctores y citas)
3. **Semana 5-6**: Pagos y compliance
4. **Semana 7-8**: AI y consulta
5. **Semana 9-10**: Polish y lanzamiento

---

## 📚 REFERENCIAS

- `RECONSTRUCTION_MASTER_PLAN.md` - Plan completo
- `reconstruction/LESSONS_LEARNED.md` - Qué evitar
- `reconstruction/ARCHITECTURE_PRINCIPLES.md` - Cómo estructurar
- `reconstruction/COMPONENT_LIBRARY_SPEC.md` - Componentes necesarios
- `reconstruction/API_CONTRACTS_V2.md` - Diseño de APIs
- `reconstruction/DATABASE_SCHEMA_V2.md` - Schema de base de datos

**¡A construir DoctorMX v2.0 correctamente desde el inicio! 🏗️**
