# Test Portal Client - AI Coding Agent Instructions

## Project Overview
Student-facing test portal for JEE/NEET exam preparation. Next.js 16 app with full test-taking interface, analytics, and performance tracking. Currently uses mock data for development; designed for easy backend integration.

## Architecture & Organization

### Path Alias
- `@/` → `./src/` (e.g., `@/components`, `@/services`)
- Different from admin-ae which uses `@/` → project root

### Route Structure (Next.js App Router)
- `src/app/(auth)/` - Login, Register, OTP verification
- `src/app/(dashboard)/` - Protected routes (dashboard, tests, analytics, profile, history)
- `src/app/test/[testId]/` - Test-taking interface (not in route groups)

### Component Organization
- `src/components/ui/` - shadcn/ui primitives
- `src/components/test/` - Test-specific components (question display, navigation, timer)
- `src/components/analytics/` - Charts and performance visualizations
- `src/components/dashboard/` - Dashboard widgets
- `src/components/layout/` - Navbar, Footer, navigation components

### State Management
- **AuthContext** (`src/contexts/AuthContext.tsx`) - User authentication, JWT management
- **Zustand** (stores/) - For complex test state (attempt data, answers, time tracking)
- **React Query** (`@tanstack/react-query`) - Server state caching and synchronization
- Local state for UI interactions

### Data Layer
- `src/services/` - API services with mock implementations
- `src/services/mock/mockData.ts` - Full mock dataset (tests, questions, users, analytics)
- Services use same interface for mock/real API - toggle via `NEXT_PUBLIC_USE_MOCK_DATA`
- `src/utils/storage.ts` - Type-safe localStorage wrapper with prefix `test_portal_`
- `src/utils/tokenManager.ts` - JWT token storage and validation

## Critical Patterns

### Mock Data Development
- All services check `process.env.NEXT_PUBLIC_USE_MOCK_DATA`
- Mock data in `services/mock/mockData.ts` with realistic exam content
- Example: `mockTests`, `mockUsers`, `generateMCQQuestion()`, `generateNumericalQuestion()`
- Switch to real API by setting `NEXT_PUBLIC_USE_MOCK_DATA=false`

### Authentication Flow
1. Login/Register → Stores tokens via `tokenManager`, user via `storage`
2. `AuthContext` checks for tokens on mount, initializes user state
3. Token refresh handled in api interceptor (401 → refresh → retry)
4. Protected routes in `(dashboard)/` layout enforce auth check

### Test Taking Architecture
- Store test attempt locally during test: `STORAGE_KEYS.TEST_ATTEMPT + testId`
- Timer hook: `useTimer()` with auto-save intervals
- Question state: answered, marked for review, time spent per question
- Auto-save pattern: Debounce answer changes, save to storage + API
- Submit → Clear local storage, navigate to results

### Math Rendering
- **KaTeX** for LaTeX formulas in questions/solutions
- Use `react-katex` or `MathRenderer` component
- LaTeX in strings: Wrap in `$...$` for inline, `$$...$$` for block
- Example: `"The integral $\\int_0^1 x^2 dx$ equals..."`

### Styling Convention
- `cn()` utility from `src/lib/utils.ts` (clsx + tailwind-merge)
- Theme switching: `ThemeContext` with `next-themes` and `react-theme-switch-animation`
- Color scheme: Primary brand colors, dark/light mode support
- Responsive: Mobile-first, use `useMediaQuery` hook

### Analytics & Charts
- **Chart.js** + react-chartjs-2 for performance graphs
- **Recharts** for alternative chart types
- Data formatters in `src/utils/` (percentages, time, ranks, scores)

## Developer Workflows

### Development Setup
```bash
npm install
# Create .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:8000/v1
# NEXT_PUBLIC_USE_MOCK_DATA=true
npm run dev          # Start on localhost:3000
```

### Building Features
```bash
npm run build        # Production build
npm run lint         # ESLint
```

### Adding Test Types
1. Define types in `src/types/` (Question, Test, TestAttempt)
2. Add mock data in `services/mock/mockData.ts`
3. Create service method (mock + real API version)
4. Build UI components in `components/test/`
5. Add route in `app/(dashboard)/tests/`

### Key Files for Common Tasks
- **New question type**: Update `QuestionType` enum, create renderer component
- **New chart**: Add to `components/analytics/`, use Chart.js or Recharts
- **New API endpoint**: Add to relevant service, implement mock version
- **Storage key**: Add to `STORAGE_KEYS` in `utils/storage.ts`

## Integration Points

### Backend API (docs/BACKEND_API_SPECIFICATION.md)
- Base URL: `https://aspiring-engineers-api-dbbcfdascdezgvcx.centralindia-01.azurewebsites.net/api/v1`
- RESTful JSON API with JWT auth
- Response format: `{ success: boolean, data: T, message?: string }`
- WebSocket for real-time features (leaderboard, test sync)
- See full spec in `docs/BACKEND_API_SPECIFICATION.md` (1600+ lines)

### External Dependencies
- **React Query** - Data fetching, caching (not fully integrated yet)
- **KaTeX** - Math formula rendering
- **GSAP** - Scroll animations and advanced effects
- **date-fns** - Date formatting
- **Socket.io-client** - WebSocket for real-time updates

## Common Gotchas

- Path alias `@/` → `src/`, different from admin-ae
- Mock data MUST be enabled in development: `NEXT_PUBLIC_USE_MOCK_DATA=true`
- Don't forget localStorage prefix: Use `storage.get/set` not raw localStorage
- Test state persistence: Save to localStorage during test, clear on submit
- Timer must pause when tab is inactive - check implementation
- LaTeX strings need double escaping in code: `"\\int"` renders as `\int`
- Theme context requires `ThemeProvider` wrapper in root layout
- Route groups `(auth)` and `(dashboard)` have separate layouts - don't leak state

## Development Strategy (docs/DEVELOPMENT_STRATEGY.md)
Project built with mock-first approach:
1. ✅ Core infrastructure (types, utils, hooks)
2. ✅ Mock services for development
3. 🔨 Authentication + Context
4. 🔨 Essential pages (Dashboard, Tests, Test Taking)
5. ⏭️ Analytics, Results, Advanced features
6. ⏭️ Backend integration (swap mock for real services)

When backend is ready, toggle `USE_MOCK_DATA=false` and ensure service methods match API spec.
