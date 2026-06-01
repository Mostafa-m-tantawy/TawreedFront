# PROJECT_CONTEXT.md - Tawreed Frontend

This document serves as the comprehensive context reference for the Tawreed Next.js frontend application. It is designed to be used by AI assistants when working on this project.

---

## Project Overview

### Business Domain & Purpose
Tawreed is a multi-tenant SaaS application designed for supply chain and inventory management. The platform enables businesses to manage procurement, sales, inventory, and organizational resources efficiently.

### Main Features & Modules
- **Dashboard**: Central analytics and metrics hub
- **Inventory Management**: Product catalog, categories, stock tracking
- **Sales Module**: Order management, customer tracking
- **Purchase Module**: Supplier management, purchase orders
- **Groups Management**: Organization/company group hierarchy
- **Roles & Permissions**: Access control and user authorization
- **Bilingual Support**: Full English/Arabic (RTL/LTR) interface

### High-Level Application Flow
1. User authenticates via login form
2. Credentials validated against backend API
3. User data, permissions, and token stored in Zustand store + encrypted cookies
4. Middleware validates authentication on every route access
5. Dashboard loads with role-based feature visibility
6. Users navigate modules based on permissions
7. All API requests include tenant ID header for multi-tenant isolation

### Key User Journeys
1. **Authentication Journey**: Login → Store credentials → Redirect to dashboard
2. **Permission-Gated Access**: Check permission → Show/hide features → Allow/deny actions
3. **CRUD Operations**: View list → Select item → Edit/delete → API call → Refresh list
4. **Multi-tenant Operations**: All API calls include X-Tenant header for data isolation

---

## Technology Stack

### Core Framework
- **Next.js**: 15.5.2 (App Router architecture)
- **React**: 19.1.0
- **TypeScript**: 5.x (strict mode enabled)

### State Management
- **Zustand**: 5.0.8 - Lightweight global store for authentication state, permissions, user data

### API Communication
- **Axios**: 1.11.0 - HTTP client with request/response interceptors
  - Automatically injects Bearer token on requests
  - Injects X-Tenant header for multi-tenant support
  - Handles 401 responses with automatic logout

### UI & Styling
- **Radix UI**: 1.x - Accessible component primitives
- **Tailwind CSS**: 4.x - Utility-first CSS framework
- **clsx**: Utility for conditional class names

### Internationalization
- **next-intl**: 4.3.5 - Multi-language support (English/Arabic)
- RTL/LTR support via CSS logical properties

### Form & Validation
- **React Hook Form**: Form state management
- **Zod**: Schema validation library

### Security & Encryption
- **CryptoJS**: 4.2.0 - Client-side encryption for sensitive data (tokens, user info)

### Development Tools
- **ESLint**: Code quality and consistency
- **TypeScript**: Static type checking

---

## Project Structure

### `/src/app`
**Purpose**: Next.js App Router pages and layouts  
**Responsibilities**: 
- Route definitions and page components
- Layout hierarchy with locale-aware routing
- Static site generation via generateStaticParams()
**Patterns**:
- `[locale]/` prefix for language routing
- Layouts cascade parent contexts and providers
- Pages are async components with data fetching at page level

### `/src/components`
**Purpose**: Reusable React components  
**Responsibilities**:
- UI components (Input, Select, Button, Modal, etc.)
- Page-level components (Dashboard, Tables)
- Form components with validation
- Layout wrappers
**Patterns**:
- Small, focused components with single responsibility
- Props interface defined via TypeScript
- Conditional rendering via `cn()` utility for Tailwind classes
- RTL-aware styling using CSS logical properties

### `/src/lib`
**Purpose**: Core utilities and helpers  
**Responsibilities**:
- API client configuration (api.client.ts)
- Encryption/decryption utilities (crypto.ts, cookies.ts)
- Static configuration data (static-data.ts)
**Patterns**:
- Centralized Axios instance with interceptors
- Cookie management with AES encryption
- Configuration-driven data (INVENTORY_CATEGORIES, CRUD endpoints)

### `/src/hooks`
**Purpose**: Custom React hooks  
**Responsibilities**:
- Reusable stateful logic
- API calling hooks
- Permission checking hooks
**Patterns**:
- Prefix with 'use' convention
- Custom hooks leverage Zustand store for state

### `/src/store`
**Purpose**: Global application state  
**Responsibilities**:
- User authentication state
- Permissions and authorization
- User metadata
**Patterns**:
- Single Zustand store (authStore.ts)
- State persisted to encrypted cookies
- hasPermission() method for access control

### `/src/types`
**Purpose**: TypeScript type definitions  
**Responsibilities**:
- API response interfaces
- Domain model types
- Component prop types
**Patterns**:
- Interfaces for API contracts
- Type definitions co-located with usage

### `/src/middleware.ts`
**Purpose**: Next.js middleware  
**Responsibilities**:
- Route protection (redirect to /login if unauthenticated)
- Locale prefix routing
- Request/response modification
**Patterns**:
- Checks authentication status before page render
- Validates user has required permissions

### `/src/utils`
**Purpose**: Utility functions  
**Responsibilities**:
- String formatting, date handling
- Conditional logic helpers
- Data transformation
**Patterns**:
- Pure functions without side effects
- Generic utility functions reusable across codebase

### `/src/services`
**Purpose**: Business logic layer  
**Responsibilities**:
- API integration abstractions
- Data fetching and transformation
- Business rule implementation
**Patterns**:
- Service functions call API client
- Response transformation before component use

### `/public`
**Purpose**: Static assets  
**Responsibilities**:
- Images, icons, static files
- Public resources accessible via /

---

## Architecture Analysis

### Architecture Style
**Feature-Based Architecture with Layered Design**

The application combines:
1. **Feature-based organization**: Each business domain (Inventory, Sales, Groups) encapsulates related components, hooks, and logic
2. **Layered architecture**: Clear separation between API/services, state management, and UI components
3. **Domain separation**: Authentication, UI, API communication exist as distinct, loosely-coupled layers

### Layer Diagram
```
┌─────────────────────────────────────────────────────┐
│           User Interface Layer                      │
│  (Pages, Components, Forms - React Components)     │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│         State Management Layer                      │
│  (Zustand Store - Auth, Permissions, User Data)    │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│        Services & API Layer                         │
│  (API Client, HTTP Interceptors, Data Transform)   │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│        Backend API                                  │
│  (REST endpoints returning JSON)                   │
└─────────────────────────────────────────────────────┘
```

### Dependency Direction
- **UI Components** depend on → State Store, Services, Utils
- **State Store** depends on → Crypto Utils, Cookie Utils
- **Services** depend on → API Client, Types
- **API Client** depends on → Axios, Crypto (for headers)
- **No circular dependencies** - clear, acyclic dependency graph

### Data Flow
1. **User Action** (button click, form submission)
2. → **Component Event Handler** calls service or dispatches store action
3. → **Service** makes API call via Axios
4. → **Interceptor** injects token + tenant header
5. → **Backend Response** returns data or error
6. → **Response Transform** converts API response to app types
7. → **Zustand Store Update** or component state update
8. → **Component Re-render** with new data

### State Flow
- **Global State**: Zustand store holds user, token, permissions (persistent via encrypted cookies)
- **Local State**: Component-level state for UI (form inputs, modals, loading)
- **Server State**: API responses cached minimally; re-fetching on demand
- **Client-Side Encryption**: Sensitive data encrypted before cookie storage

### Multi-Tenant Data Isolation
- Every API request includes `X-Tenant` header from Zustand store
- Backend ensures user can only access data for their tenant
- Single user cannot access another tenant's data

---

## Coding Style Analysis

### Naming Conventions

**Files & Folders**
- Components: `PascalCase` (e.g., `Dashboard.tsx`, `UserProfile.tsx`)
- Utilities, services: `camelCase` (e.g., `api.client.ts`, `crypto.ts`)
- Types/interfaces: `PascalCase` (e.g., `User.ts`, `ApiResponse.ts`)
- Hooks: `use` prefix + `camelCase` (e.g., `useAuth.ts`, `usePermission.ts`)

**Variables & Functions**
- Constants: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`, `INVENTORY_CATEGORIES`)
- Functions: `camelCase` (e.g., `formatDate`, `validateEmail`)
- React Components: `PascalCase` (e.g., `function UserCard() {}`)
- Boolean variables: `is/has/can` prefix (e.g., `isLoading`, `hasPermission`, `canEdit`)

### Component Structure Patterns
```typescript
// Typical component structure:
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ComponentProps {
  title: string;
  onClick?: () => void;
  className?: string;
}

export function MyComponent({ title, onClick, className }: ComponentProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("p-4 bg-white", className)}>
      <h2>{title}</h2>
      <Button onClick={onClick}>Action</Button>
    </div>
  );
}
```

### Hook Patterns
- Custom hooks extract state logic and reuse across components
- Hooks follow React rules (no conditional calls, proper dependencies)
- Custom hooks integrate with Zustand store for global state

### API Calling Patterns
- Centralized Axios instance in `lib/api.client.ts`
- Request interceptor adds Bearer token and tenant header
- Response interceptor handles errors (401 triggers logout)
- Service functions call API and transform responses

### Error Handling Patterns
- Try-catch blocks in async operations
- Error messages extracted from API response.data.message
- User-facing errors displayed in UI (toast, modal, or inline)
- Console errors for debugging

### State Management Patterns
- Zustand store for global auth state
- `useStore()` hook called in components needing store data
- `hasPermission()` method checks user permissions
- Store initializes from encrypted cookies on app load

### File Naming Conventions
- **React components**: `ComponentName.tsx`
- **Type definitions**: `types.ts` or `*.types.ts`
- **Utilities**: `utility.ts`
- **Hooks**: `useHookName.ts`
- **Tests**: `ComponentName.test.tsx`

### Import Ordering Style
```typescript
// 1. React & Next.js imports
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party library imports
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// 3. Internal imports (absolute paths @/)
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

// 4. Styles/CSS
import styles from './Component.module.css';
```

### TypeScript Conventions
- Strict mode enabled in `tsconfig.json`
- All function parameters typed
- Return types explicitly declared
- Interfaces for props and API responses
- Avoid `any` type; use `unknown` or generics
- Enums for fixed sets of values

### Reusable Patterns
- `cn()` utility for conditional Tailwind classes
- Configuration objects (INVENTORY_CATEGORIES) reduce code duplication
- Service layer abstracts API complexity
- Custom hooks encapsulate stateful logic
- Layout components for consistent page structure

---

## Project Coding Standards

**This section is the source of truth for all development on this project.**

### Component Development Standards
- All components must be typed with TypeScript interfaces
- Props interfaces exported from component file
- Components should be pure and deterministic (same props = same output)
- Avoid prop drilling; use context or store for deeply nested data
- Each component has a single, clear responsibility

### Hook Development Standards
- Custom hooks must be prefixed with `use`
- Custom hooks should abstract complex stateful logic
- Never call hooks conditionally or dynamically
- Include proper dependency arrays for useEffect
- Extract hook logic in functions outside component for reusability

### State Management Standards
- Global state (auth, user, permissions) goes in Zustand store
- Local UI state (modals, forms) remains in component state
- Use `useAuth()` hook to access auth store in components
- Never mutate Zustand store state directly
- Persist sensitive data only after encryption

### API Standards
- All API calls must go through centralized Axios instance
- API calls should be in service layer, not directly in components
- Error responses must be caught and handled gracefully
- API base URL must be configurable via environment variables
- Include tenant ID (X-Tenant header) on all requests in multi-tenant mode

### Form Standards
- Use React Hook Form for form state management
- Use Zod for schema validation
- Validate on blur and change events
- Display inline error messages for each field
- Submit button disabled while form is invalid or submitting

### TypeScript Standards
- Never use `any` type; use `unknown` or generics
- All function parameters must have types
- Export types/interfaces from relevant files
- Use `typeof`, `instanceof`, or type guards for type narrowing
- Avoid type assertions; prefer type inference

### Styling Standards
- Use Tailwind CSS utility classes; avoid custom CSS when possible
- Use RTL-aware CSS logical properties (insetInlineStart, paddingInline)
- Use `cn()` utility for conditional class composition
- Maintain consistent spacing/sizing (use Tailwind scale)
- Dark mode considerations for components

### Internationalization Standards
- All user-facing text wrapped in `useTranslations()`
- Language switching routed via `[locale]/` parameter
- RTL layout automatically applied based on locale
- Component styles must support both LTR and RTL

### Authentication Standards
- All authentication state in Zustand store
- Sensitive data (token) stored in httpOnly cookies
- Permissions validated before rendering sensitive features
- 401 responses trigger automatic logout
- User redirect to /login if not authenticated

### Error Handling Standards
- Wrap async operations in try-catch blocks
- Distinguish between validation errors and server errors
- User-facing error messages clear and actionable
- Log errors to console for debugging (in dev mode)
- Never expose sensitive data in error messages

### Testing Standards
- Test components with React Testing Library
- Test business logic with Jest
- Aim for >80% code coverage on critical paths
- Mock API calls and store in tests
- Test user interactions, not implementation details

---

## Component Patterns

### Smart vs Presentational Components
- **Smart Components**: Container/wrapper components that manage state, fetch data, handle logic
  - Example: `Dashboard.tsx` fetches data, manages filters, calls services
  - Located at page level or feature-level containers
  
- **Presentational Components**: UI/dumb components that receive data via props, focus on rendering
  - Example: `Button.tsx`, `Card.tsx`, `UserAvatar.tsx`
  - Located in `/components/ui` or feature-specific component folders
  - No direct API calls or state management

### Layout Patterns
- Root layout at `/app/[locale]/layout.tsx` provides providers (Zustand, i18n)
- Feature layouts provide feature-specific context
- Consistent header, sidebar, footer across pages via layout component nesting

### Shared Component Patterns
- UI components (Button, Input, Select, Modal) in `/components/ui`
- Form components (FormInput, FormSelect) with validation integration
- Layout wrappers (Card, Container, Grid) for consistent spacing
- Navigation components (Sidebar, Header, Breadcrumb)

### Reusable UI Patterns
- **Button variants**: Primary, secondary, destructive via className props
- **Input variations**: Text, email, password, number with consistent styling
- **Select/Dropdown**: Radix UI Select wrapped with custom styling
- **Modal/Dialog**: Controlled via state, backdrop click dismissal
- **Table patterns**: Headers, rows, pagination, sorting, filtering

### Form Patterns
- Forms use React Hook Form for state
- Field-level validation with Zod schemas
- Error messages displayed inline under fields
- Submit button disabled until form valid
- Async validation for unique fields (email, username)

### Modal Patterns
- Modal state managed in component or custom hook
- Backdrop click closes modal (when appropriate)
- Keyboard escapes close modal
- Focus trap within modal for accessibility
- Content scrollable if exceeds viewport height

### Table Patterns
- Columns defined in configuration object with sortable/filterable flags
- Sorting/filtering handled client-side or server-side depending on data size
- Pagination for large datasets
- Row selection for bulk operations
- Empty state when no data

---

## API Architecture

### API Clients
- **Centralized Axios instance** in `lib/api.client.ts`
- Single HTTP client used throughout application
- Interceptors handle token injection and error responses

### Service Layer
- Service functions in `/src/services` or feature folders
- Each service function wraps API endpoint
- Services transform API responses to app types
- Services handle error extraction and user messaging

### Fetching Strategy
- **On-demand fetching**: Components request data when mounted
- **No global caching layer**: Responses cached in component state
- **Refetch capability**: Manual refetch via button click or react-query style
- **Loading states**: Loading flag shown during API call

### Authentication Flow
1. User submits login form with email/password
2. Backend validates credentials
3. Backend returns user object, token, permissions array
4. Client stores in Zustand store
5. Client encrypts token, user, permissions to cookies
6. Client redirects to dashboard
7. Future requests include token via Authorization header

### Authorization Flow
1. User permissions array stored in Zustand store
2. Components call `hasPermission('permission-key')` before rendering
3. Permission check returns boolean
4. Feature/action conditionally shown/hidden
5. Backend validates permissions on API endpoint (defense in depth)

### Error Handling
- 401 responses trigger logout and redirect to login
- 403 responses show "unauthorized" message
- 500 responses show "server error" message
- Network errors show "connection error" message
- Validation errors (400) show field-specific messages

### Response Transformation
- API responses in format `{ data: [...], status: 200 }`
- Service layer extracts `data` property
- Types converted to TypeScript interfaces
- Null/undefined handling before returning

---

## State Management

### Global State (Zustand Store)
- **User object**: name, email, phone, role
- **Token**: JWT token for API authorization
- **Permissions array**: List of permission keys user has
- **Tenant ID**: Current tenant user is accessing
- **Methods**: `hasPermission(permission)` checks if user has permission

### Local State
- Form input values (React Hook Form manages)
- Modal open/closed status
- Loading flags for async operations
- Filter and sort preferences (in-page)

### Server State
- Minimal server state caching
- API responses treated as fresh each fetch
- Re-fetch on user navigation between pages
- Could be optimized with react-query in future

### Caching Strategy
- No explicit caching layer currently
- Component state caches fetched data during component lifecycle
- Re-fetch triggers new API call
- Browser HTTP caching via headers if backend supports

### Data Synchronization
- Store initialized from encrypted cookies on app load
- Manual synchronization via store updates after API calls
- No real-time sync; optimistic updates where appropriate
- Cookie sync happens after every store mutation

---

## AI Development Rules

**These rules are mandatory for AI code generation. Violation results in broken code or architecture violations.**

### Folder Placement Rules
1. **New component**: Place in `/src/components/<category>/` where category is `ui`, `forms`, or `layout`
2. **New hook**: Place in `/src/hooks/` with `use` prefix
3. **New service/API call**: Place in `/src/services/` or feature-specific folder
4. **New type/interface**: Place in `/src/types/` or co-locate with usage
5. **New utility**: Place in `/src/utils/`
6. **Never** create nested folders deeper than 3 levels

### Naming Rules
1. React components: `PascalCase.tsx`
2. TypeScript interfaces: `PascalCase.ts`
3. Utilities and services: `camelCase.ts`
4. Custom hooks: `useHookName.ts`
5. Folder names: `lowercase` or `camelCase`
6. Avoid single-letter or abbreviated names

### Import Rules
1. Always use absolute imports with `@/` alias (not relative imports)
2. Group imports: React/Next.js → third-party → internal → styles
3. Import only what's needed; no unused imports
4. Use named exports (not default) for better refactoring

### Component Rules
1. All components must be TypeScript typed with Props interface
2. Components must export Props interface for external use
3. Complex components (>50 lines) should extract sub-components
4. Components must handle loading and error states
5. Never access window object without checking typeof window
6. Client components require `'use client'` directive at top
7. Server components can be async and fetch data

### Hook Rules
1. All custom hooks must start with `use` prefix
2. Hooks must follow Rules of Hooks (no conditional calls)
3. Hooks must have proper useEffect dependencies
4. Complex hooks should be extracted to separate file
5. Hooks should return single value or object with named properties

### API Rules
1. **All API calls must use centralized Axios instance** (`import api from '@/lib/api.client'`)
2. API calls should be in service layer, not in components
3. Error handling mandatory: wrap in try-catch
4. Always include loading state during API call
5. All requests automatically get Bearer token + X-Tenant header
6. API base URL must be configurable (not hardcoded)

### State Management Rules
1. Use Zustand store for global auth/user state only
2. Use React component state for local UI state
3. No prop drilling; use context for 3+ levels deep
4. Never mutate Zustand state directly; use actions
5. Persist sensitive data only after encryption

### TypeScript Rules
1. Never use `any` type
2. All function parameters must be typed
3. Function return types must be explicit
4. Use `unknown` for dynamic types; narrow with type guards
5. Use discriminated unions for complex types
6. Enums for fixed sets of string/number values

### Styling Rules
1. Use Tailwind CSS utility classes exclusively
2. Use `cn()` utility for conditional classes
3. Use RTL-aware properties: `insetInlineStart`, `paddingInline`, etc.
4. No custom CSS files unless unavoidable
5. Maintain consistent spacing: use Tailwind scale (px, 1, 2, 4, 6, 8, etc.)

### Testing Rules
1. Test user interactions, not implementation
2. Use React Testing Library for component tests
3. Mock external dependencies (API, store, hooks)
4. Aim for high coverage on business logic
5. Write tests before code when possible (TDD)

### Form Rules
1. Use React Hook Form for all forms
2. Use Zod for schema validation
3. Display inline error messages
4. Submit button disabled while invalid or submitting
5. Handle async validation for unique fields

### I18n Rules
1. All user-facing text wrapped in `useTranslations()`
2. Dynamic text values provided as i18n parameters
3. RTL components use CSS logical properties
4. Language switching via `[locale]/` URL parameter

---

## AI Context Summary

**Use this condensed section for future AI prompts. Copy and include in all requests.**

### Project Essence
Tawreed is a **Next.js 15.5.2 + React 19.1.0** multi-tenant SaaS application for supply chain management. Built with **TypeScript**, **Zustand** for state, **Axios** for API communication, **Radix UI** + **Tailwind CSS** for UI, and **next-intl** for bilingual support (English/Arabic).

### Core Architecture
- **Feature-based**: Each business domain (Inventory, Sales, Groups) self-contained
- **Layered**: UI → State (Zustand) → Services → API (Axios) → Backend
- **Multi-tenant**: All requests include `X-Tenant` header; data isolated per tenant
- **Authentication**: JWT token stored in httpOnly cookies; user/permissions in encrypted localStorage
- **Authorization**: Permission-based access control via `hasPermission()` method

### Critical Patterns
1. **API calls**: Centralized Axios with interceptors (token + tenant header)
2. **Components**: TypeScript Props interface; Tailwind + RTL-aware
3. **Forms**: React Hook Form + Zod validation
4. **State**: Zustand store (global) + component state (local)
5. **Error handling**: Try-catch in services; user messaging in UI
6. **i18n**: `useTranslations()` wrapper; CSS logical properties for RTL

### Must-Follow Rules
- **Always** use `@/` absolute imports (not relative)
- **Always** add TypeScript types to all functions and components
- **Always** place API calls in service layer via centralized Axios
- **Always** use `cn()` for conditional Tailwind classes
- **Never** hardcode API URLs, encryption keys, or secrets
- **Never** mutate Zustand store state directly
- **Never** access `window` without `typeof window` check
- **Never** skip error handling in async operations

### File Locations Quick Reference
| Type | Location | Example |
|------|----------|---------|
| Component | `/src/components/<category>/` | `Button.tsx` in `/ui/` |
| Hook | `/src/hooks/` | `useAuth.ts` |
| Service | `/src/services/` | `authService.ts` |
| Type | `/src/types/` | `User.ts` |
| Utility | `/src/utils/` | `formatDate.ts` |
| Store | `/src/store/` | `authStore.ts` |
| Page | `/src/app/[locale]/` | `dashboard/page.tsx` |

### Tech Stack Versions
- Next.js: 15.5.2
- React: 19.1.0
- TypeScript: 5.x
- Zustand: 5.0.8
- Axios: 1.11.0
- Radix UI: 1.x
- Tailwind: 4.x
- next-intl: 4.3.5

---

## Key Files Reference

**Critical files to understand before making changes:**

1. **src/store/authStore.ts** - Zustand store; user state, permissions, methods
2. **src/lib/api.client.ts** - Centralized Axios; interceptors, token injection
3. **src/middleware.ts** - Route protection, locale routing
4. **src/app/[locale]/layout.tsx** - Root layout with providers
5. **src/lib/static-data.ts** - Configuration for CRUD operations
6. **src/lib/crypto.ts** - Encryption/decryption utilities
7. **src/lib/cookies.ts** - Cookie management
8. **src/components/Auth/Login.tsx** - Authentication flow reference

---

**Last Updated**: Generated from comprehensive codebase analysis  
**Version**: 1.0  
**Status**: Ready for use by AI assistants
