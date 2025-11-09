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

# Start development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Build in development mode (preserves component tagging)
npm run build:dev

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for build tooling (SWC for fast compilation)
- **React Router** for navigation
- **shadcn/ui** components (Radix UI primitives + Tailwind)
- **TanStack Query** for server state management
- **Supabase** client for database and edge functions

### Database Layer (Supabase)
The application uses 7 main tables:
- `products` - Product catalog with images, pricing, inventory, analytics
- `ai_sessions` - Chat history for AI Builder sessions
- `edits` - File change tracking for AI Builder
- `projects` - Hosted project metadata
- `deployments` - Build and deployment history
- `domains` - Custom domain management
- `orders` - Order transactions
- `analytics` - Historical analytics data

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
- Uses Tailwind CSS with CSS variables for theming
- Color scheme: `foreground`, `background`, `card`, `accent`, `muted`, `border`
- Component styling via `cn()` utility from `src/lib/utils.ts`

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
- shadcn/ui components in `src/components/ui/` are managed by the CLI
- Custom components should be feature-specific (builder/, products/)
- Use Radix UI primitives for complex interactions
- Icons from `lucide-react`

## Environment Variables

Required for Supabase edge functions:
- `LOVABLE_API_KEY` - For AI product analysis (set in Supabase dashboard)

Supabase credentials are hardcoded in client.ts (public anon key is safe for frontend).

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

## Notes

- This is a Lovable.dev project (scaffold for rapid prototyping)
- The `lovable-tagger` plugin runs in development mode only
- Server runs on port 8080 (IPv6 enabled)
- Monaco editor configuration: no minimap, dark theme, 14px font
- Component tagging is stripped in production builds
