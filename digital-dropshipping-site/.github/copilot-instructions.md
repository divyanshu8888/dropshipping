# AI Agent Instructions for Digital Dropshipping Site

## Project Overview
This is a Next.js TypeScript-based digital dropshipping platform with the following key components:
- Frontend: Next.js with TypeScript and Tailwind CSS
- API: Next.js API routes for product/order management
- Data: Prisma for database interactions
- Payments: Stripe integration
- State Management: Custom React hooks with localStorage persistence

## Architecture Patterns

### Frontend Components
- Pages (`src/pages/`): Next.js pages following file-based routing
- Components (`src/components/`): Reusable UI components with `.tsx` extension
- Hooks (`src/hooks/`): Custom React hooks for shared logic (e.g., `useCart.ts`)

### API Structure
- API routes in `src/pages/api/` handle data operations and webhooks
- RESTful endpoints follow standard HTTP methods:
```typescript
if (req.method === 'GET') {
    // Handle GET request
} else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
```

### State Management
- Cart state uses `useCart` hook with localStorage persistence:
```typescript
const [cartItems, setCartItems] = useState([]);
useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
        setCartItems(JSON.parse(storedCart));
    }
}, []);
```

## Key Development Workflows

### Running the Project
- Development: `npm run dev`
- Production build: `npm run build`
- Start production: `npm start`
- Run tests: `npm test`

### Testing Patterns
- Unit tests in `tests/unit/`
- E2E tests in `tests/e2e/`
- Test files follow `.test.ts` or `.spec.ts` naming convention

## Common Tasks

### Adding New Products
1. Define product type in `src/types/index.ts`
2. Add API handler in `src/pages/api/products.ts`
3. Create product page in `src/pages/products/[id].tsx`

### Implementing New Features
1. Add types in `src/types/`
2. Create API endpoints if needed in `src/pages/api/`
3. Add UI components in `src/components/`
4. Implement page logic in `src/pages/`

### Error Handling
- API routes use try-catch with standard error responses
- Frontend components should handle loading/error states
- Use Next.js error boundaries for component-level errors

## Dependencies
- Next.js for frontend and API
- Stripe for payment processing
- Prisma for database operations
- Tailwind CSS for styling
- Jest for testing

When making changes, ensure to:
1. Follow TypeScript type definitions
2. Maintain consistent error handling patterns
3. Update tests for new functionality
4. Follow existing component and API patterns