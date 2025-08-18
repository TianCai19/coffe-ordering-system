# Coffee Ordering System - Copilot Instructions

Coffee ordering system is a Next.js 14 web application built with React 18, TypeScript, and Tailwind CSS. It's designed for managing coffee orders in a cafe/restaurant environment with table-based ordering, queue management, and data archiving features. The system uses Upstash Redis for data persistence with a fallback to in-memory storage.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap, Build, and Test the Repository
- Install dependencies: `npm install` -- takes ~90 seconds. NEVER CANCEL. Set timeout to 180+ seconds.
- Build the application: `npm run build` -- takes ~15 seconds. NEVER CANCEL. Set timeout to 60+ seconds.
- Run linting: `npm run lint` -- takes ~2 seconds. Set timeout to 30+ seconds.
- Setup environment: `cp .env.example .env.local` then edit `.env.local` with real Redis credentials

### Run the Application
- ALWAYS run the bootstrapping steps first (npm install, environment setup).
- Development server: `npm run dev` -- starts in ~3 seconds on http://localhost:3000
- Production mode: `npm run build && npm run start`

### Environment Configuration
- Copy environment template: `cp .env.example .env.local`
- Required environment variables:
  - `UPSTASH_REDIS_REST_URL` - Redis database URL (starts with https://)
  - `UPSTASH_REDIS_REST_TOKEN` - Redis authentication token (long string)
  - `NEXT_PUBLIC_APP_URL` - Application URL (http://localhost:3000 for local dev)
- The application will fallback to memory storage if Redis is not configured
- Check console for "Using Upstash Redis" or "Using Memory Store" messages

## Validation

### Manual Validation Requirements
- ALWAYS run through at least one complete end-to-end scenario after making changes:
  1. Navigate to http://localhost:3000
  2. Click a table number (e.g., Table 1)
  3. Add coffee items to order (use + buttons for Hot/Iced options)
  4. Place the order and verify it appears in "Preparing Queue" (NOTE: will fail with "Failed to place order" if Redis is not configured - this is expected behavior)
  5. If Redis is configured: Mark items as completed and verify they move to "Completed" section
- Test the statistics view shows correct counts
- Test the export functionality works
- ALWAYS take a screenshot of any UI changes to verify visual correctness
- Check browser console for any errors - should see data loading messages
- **Redis connection**: Check console for "Using Upstash Redis" (configured) or "Using Memory Store" (fallback mode)

### Build and Test Validation
- Always run `npm run build` to ensure the application builds successfully
- Run `npm run lint` to check for code style issues
- The build should complete without TypeScript or build errors
- ESLint is configured to use Next.js recommended settings

## Common Tasks

### Repository Structure
```
/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── orders/        # Order management endpoints
│   │   ├── menu/          # Menu data endpoint
│   │   ├── statistics/    # Statistics endpoint
│   │   └── archives/      # Data archiving endpoint
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout component
│   └── page.tsx          # Main page component
├── components/            # React components
├── lib/                   # Utility libraries
│   ├── order-service.ts   # Order management logic
│   ├── redis.ts          # Redis configuration
│   ├── menu.ts           # Menu data definitions
│   ├── api-service.ts    # API client functions
│   └── archive-service.ts # Data archiving logic
├── types/                 # TypeScript type definitions
├── .env.example          # Environment variables template
├── package.json          # Dependencies and scripts
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

### Key Files to Check After Changes
- Always check `lib/order-service.ts` after making changes to order management
- Always check `app/api/orders/route.ts` after making API changes
- Always verify `types/index.ts` after modifying data structures
- Check `app/page.tsx` for main UI component changes

### Package.json Scripts
```json
{
  "dev": "next dev",           // Start development server
  "build": "next build",       // Build for production  
  "start": "next start",       // Start production server
  "lint": "next lint"          // Run ESLint
}
```

### Technology Stack Details
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes with Edge Runtime
- **Database**: Upstash Redis (with in-memory fallback)
- **Deployment**: Designed for Vercel
- **Styling**: Tailwind CSS with custom components

## Timing Expectations

- **CRITICAL**: NEVER CANCEL any build or long-running commands
- `npm install`: ~90 seconds (Set timeout: 180+ seconds)
- `npm run build`: ~15 seconds (Set timeout: 60+ seconds) 
- `npm run dev`: ~2 seconds to start
- `npm run lint`: ~2 seconds (Set timeout: 30+ seconds)
- Manual testing: Allow 2-3 minutes for complete validation scenario

## Common Issues and Solutions

### Redis Connection Issues
- Symptom: Console shows "Using Memory Store" instead of "Using Upstash Redis"
- Solution: Check `.env.local` has correct `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- Test connection: Check browser console for Redis-related error messages

### Build Failures
- TypeScript errors are configured to be ignored during builds (`ignoreBuildErrors: true`)
- ESLint warnings are configured to be ignored during builds (`ignoreDuringBuilds: true`)
- Check for missing dependencies or syntax errors if build fails

### Port Conflicts
- Next.js automatically uses port 3001 if 3000 is occupied
- Manual port specification: `npm run dev -- -p 3001`

### Development Dependencies Issues
- Clear cache: `rm -rf node_modules package-lock.json && npm install`
- Check Node.js version compatibility (requires Node.js 18+)

## Coffee Ordering System Features

### Core Functionality
- **Table-based ordering**: Select table number (1-24) or priority ordering by name
- **Menu items**: Black 美式, White 拿铁, Mocha 摩卡, Choc 巧克力, Milk 牛奶, Piccolo
- **Temperature options**: Hot/Iced for most items (Piccolo is Hot only)
- **Order customization**: Remarks, quick-add options (extra sugar, less ice, etc.)
- **Queue management**: Preparing queue with sorting options (by table, by time)
- **Completion tracking**: Move items from preparing to completed status
- **Statistics**: Real-time counts by coffee type and table
- **Data export**: Export order data as text reports
- **Archiving**: Weekly data archiving with historical view

### UI Components
- Main dashboard with statistics and table selection
- Order form with menu items and customization options  
- Queue management with drag-and-drop style interactions
- Modal dialogs for history, export, and confirmation
- Responsive design optimized for tablet/desktop use

## Testing Checklist

After making any changes, verify:
- [ ] Application builds successfully (`npm run build`)
- [ ] Development server starts without errors (`npm run dev`)
- [ ] Main page loads at http://localhost:3000
- [ ] Can select a table and see order form
- [ ] Can add items to order (test Hot/Iced options)
- [ ] Can place order and see it in preparing queue
- [ ] Can mark items as completed
- [ ] Statistics update correctly
- [ ] No console errors in browser developer tools
- [ ] Export functionality works (generates text report)

Always run the complete validation scenario to ensure the coffee ordering workflow functions end-to-end.