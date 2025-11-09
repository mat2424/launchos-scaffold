# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LaunchOS is a multi-purpose platform built with React, TypeScript, Vite, and Supabase. It combines:
- **Product Management**: E-commerce product catalog with AI-powered image analysis
- **AI Builder**: Interactive code building interface with Monaco editor and live preview
- **Hosting Dashboard**: Project deployment and monitoring system
- **Analytics**: Real-time tracking of product views, sales, and conversions

## Development Commands

```bash
# Install dependencies
npm i

# Start development server (runs on port 8080, with IPv6 support)
npm run dev

# Build for production
npm run build

# Build in development mode (preserves component tagging for Lovable)
npm run build:dev

# Run linter (ESLint with TypeScript support)
npm run lint

# Preview production build locally
npm run preview
```

**Note**: The dev server runs on port 8080 with IPv6 enabled (`::`). Unused variables are allowed (ESLint rule disabled) for rapid prototyping.

## Architecture

### Frontend Stack
- **React 18** with TypeScript 5.8
- **Vite 5** for build tooling with SWC plugin for fast compilation
- **React Router 6** for client-side routing
- **shadcn/ui** components (Radix UI primitives + Tailwind CSS 3.4)
- **TanStack Query v5** for server state management and caching
- **Supabase JS Client** for database operations, auth, and edge functions
- **Monaco Editor** for code editing in AI Builder
- **Recharts** for analytics visualizations

### Database Layer (Supabase)
The application uses 8 main tables:
- `products` - Product catalog with images, pricing, inventory, analytics
- `ai_sessions` - Chat history for AI Builder sessions
- `edits` - File change tracking for AI Builder
- `projects` - Hosted project metadata
- `deployments` - Build and deployment history
- `domains` - Custom domain management
- `orders` - Order transactions
- `analytics` - Historical analytics data

**Auth**: Uses Supabase Auth with email/password authentication. Auth state is managed via `AuthContext` (src/contexts/AuthContext.tsx) with `useAuth()` hook. All routes except `/login` are protected via `ProtectedRoute` component.

### Application Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components (don't modify directly)
│   ├── builder/         # AI Builder specific components
│   ├── products/        # Product management components
│   ├── DashboardLayout.tsx  # Main layout with sidebar navigation
│   └── NavLink.tsx      # Custom routing component
├── pages/               # Route-level components
│   ├── Dashboard.tsx    # Main overview with stats
│   ├── Products.tsx     # Product CRUD with camera capture
│   ├── Builder.tsx      # AI-powered code editor
│   ├── Hosting.tsx      # Project/deployment management
│   └── Settings.tsx
├── integrations/supabase/
│   ├── client.ts        # Supabase client instance
│   └── types.ts         # Auto-generated database types
└── lib/
    └── utils.ts         # Utility functions (cn for class merging)

supabase/functions/
└── analyze-product/     # Edge function for AI product analysis
```

### Key Features

#### 1. AI Product Analysis
- Users can capture product images via camera (`CameraCapture` component)
- Images are sent to Supabase edge function `analyze-product`
- Uses Google Gemini 2.5 Flash via Lovable AI Gateway
- Returns: title, description, price estimate, and tags
- See: `src/pages/Products.tsx:97-136`, `supabase/functions/analyze-product/index.ts`

#### 2. AI Builder
- Monaco editor for code editing with TypeScript syntax
- Three view modes: split (chat + preview), preview only, code only
- Chat interface with message history stored in `ai_sessions` table
- Live preview of React components (currently simulated)
- Debug console for tracking operations
- See: `src/pages/Builder.tsx`

#### 3. Real-time Updates
- Uses Supabase real-time subscriptions for live data sync
- Products page subscribes to `products` table changes
- Hosting page subscribes to `projects` and `deployments` changes
- Automatically invalidates TanStack Query cache on changes

#### 4. Product Management
- Full CRUD operations via Supabase client
- Analytics tracking (views, sales, conversion rate)
- Support for multiple images per product
- Tag-based organization
- Click-to-edit functionality with `EditProductDialog`

## Important Patterns

### Routing
- All routes defined in `src/App.tsx`
- Custom routes must be added ABOVE the catch-all `*` route
- All pages (except NotFound) wrapped in `DashboardLayout`

### Styling
- Uses Tailwind CSS 3.4 with CSS variables for theming (configured in `tailwind.config.ts`)
- Dark mode support via class-based strategy (`darkMode: ["class"]`)
- Color scheme defined using HSL CSS variables:
  - Layout: `background`, `foreground`, `border`, `card`, `sidebar`
  - Semantic: `primary`, `secondary`, `destructive`, `muted`, `accent`, `success`, `warning`
  - Each color has a matching `-foreground` variant for text
- Component styling via `cn()` utility from `src/lib/utils.ts` (combines clsx + tailwind-merge)
- Custom animations: `accordion-down`, `accordion-up`
- Typography plugin available via `@tailwindcss/typography`

### Data Fetching
- Use TanStack Query's `useQuery` for reads
- Use `useMutation` for writes (creates, updates, deletes)
- Always invalidate relevant query keys after mutations
- Query keys follow pattern: `['entity-name']` or `['entity-name-count']`

### Supabase Integration
- Client configured in `src/integrations/supabase/client.ts`
- Database types auto-generated in `types.ts` - do not manually edit
- Use `.select()`, `.insert()`, `.update()`, `.delete()` methods
- Real-time: create channel → subscribe to table changes → invalidate queries → cleanup

### Component Development
- shadcn/ui components in `src/components/ui/` are managed by the shadcn CLI (don't edit manually)
- Custom components should be feature-specific (place in `builder/`, `products/` subdirectories)
- Use Radix UI primitives for complex interactions (dialogs, dropdowns, popovers, etc.)
- Icons from `lucide-react` library
- Toast notifications: use `useToast()` hook from `src/hooks/use-toast.ts` or `sonner` for simpler toasts
- Forms: use `react-hook-form` with `zod` for validation and `@hookform/resolvers` for integration

## Environment Variables

Required for Supabase edge functions:
- `LOVABLE_API_KEY` - For AI product analysis (set in Supabase dashboard)

Supabase credentials are hardcoded in client.ts (public anon key is safe for frontend).

## Deployment

### Vercel Deployment

The project is configured for Vercel deployment with `vercel.json`:

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod
```

**Configuration**:
- Build command: `npm run build`
- Output directory: `dist`
- Framework: Vite
- Rewrites: All routes redirect to `/index.html` (for client-side routing)

**Environment Variables on Vercel**:
No environment variables are required for the frontend as Supabase credentials are in the code (public anon key). However, ensure your Supabase edge functions have the necessary secrets configured in the Supabase dashboard.

**Important Notes**:
- Vercel automatically detects Vite projects
- The build output is in the `dist/` directory
- Client-side routing is handled via rewrites to `index.html`
- Edge functions remain on Supabase (not moved to Vercel)
- Make sure your Supabase project allows connections from Vercel's deployment URLs

## Common Tasks

### Adding a New Page
1. Create component in `src/pages/YourPage.tsx`
2. Add route in `src/App.tsx` before the `*` route
3. Add navigation item in `src/components/DashboardLayout.tsx` navigation array
4. Import appropriate icon from `lucide-react`

### Adding Supabase Table Operations
1. Update database schema in Supabase dashboard
2. Regenerate types (Lovable handles this automatically)
3. Create query in page component using `useQuery`/`useMutation`
4. Add real-time subscription if needed (see Products.tsx:64-76)

### Working with AI Builder
- AI integration is currently simulated (see Builder.tsx:96-112)
- Real implementation would replace setTimeout with actual AI API call
- Messages are saved to `ai_sessions` table
- Code changes should be tracked in `edits` table

### Testing Product AI Analysis
1. Ensure `LOVABLE_API_KEY` is set in Supabase edge function secrets
2. Click camera icon in Add Product dialog
3. Capture or upload image
4. Form will auto-populate with AI-extracted data
5. Check browser console for detailed error messages if analysis fails

## Authentication & Authorization

The app uses Supabase Auth with a context-based approach:

```tsx
// Get auth state
const { user, session, loading, signIn, signOut, signUp } = useAuth();

// Sign in
await signIn(email, password);

// Sign up
await signUp(email, password);

// Sign out
await signOut();
```

- Auth state is initialized in `AuthProvider` and persisted via Supabase session
- Auth changes are logged via `src/lib/logger.ts` for debugging
- Routes are protected using `ProtectedRoute` wrapper component
- Login page is at `/login` (unprotected)
- All other routes require authentication

## Logging System

A custom logger is available at `src/lib/logger.ts` for consistent logging:

```tsx
import { logger } from '@/lib/logger';

logger.info('Message', 'ComponentName', { data });
logger.error('Error message', 'ComponentName', error);
logger.debug('Debug info', 'ComponentName');
```

Logs include context (component name) and optional metadata for better debugging.

## Notes

- This is a Lovable.dev project (scaffold for rapid prototyping)
- The `lovable-tagger` plugin runs in development mode only (strips tags in production)
- Server runs on port 8080 with IPv6 enabled (`::`)
- Monaco editor configuration: no minimap, dark theme, 14px font
- Path alias `@/` points to `src/` directory (configured in vite.config.ts)
- TypeScript strict mode is enabled with ES2020 target
- Uses Bun for package management (bun.lockb present)
