# Technical Specification — Motorcycle & Quad E-Commerce Website

**Project Type:** E-commerce + Showroom Website  
**Frontend:** Next.js + TypeScript  
**Backend:** Next.js server-side functionality  
**Database:** PostgreSQL  
**Image Storage:** Cloudflare R2  
**Priority:** Mobile-first, performance, maintainability, and conversion  
**Design Direction:** Sporty, dynamic, modern, and product-focused

---

## 1. Project Overview

Develop a responsive e-commerce website for a motorcycle and quad showroom selling:

- Motorcycles for children and adults
- Quad bikes
- Riding equipment and accessories
- Related products and replacement parts, if offered by the client

The website must combine a professional showroom presentation with a complete online shopping experience. Customers should be able to browse products, filter by specifications, check availability, place orders, pay online, or request a delivery quotation for international shipping.

The client must be able to manage products, prices, photos, and stock through an administrative dashboard without editing code.

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js with App Router |
| Language | TypeScript |
| UI | Tailwind CSS |
| Components | shadcn/ui or custom reusable components |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | Auth.js or an equivalent secure authentication solution |
| Image and media storage | Cloudflare R2 |
| Image optimization | Next.js Image |
| Payments | Stripe or a payment provider supported by the client's country and business |
| Email | Resend or equivalent transactional email provider |
| Maps | Google Maps links or embedded map |
| Validation | Zod |
| Deployment | Vercel or a suitable Node.js hosting platform |
| Version control | GitHub |
| CI/CD | GitHub Actions |

**Architecture principle:** Use Next.js server components for data-driven pages and server-side operations. Use client components only where interactivity is necessary, such as filters, carts, galleries, and checkout steps.

## 3. Visual Identity and Color Scheme

The visual identity should communicate speed, adventure, reliability, and motorsports.

### Color palette

| Purpose | Color | Hex |
|---|---|---|
| Primary background | Off-white | `#F7F8F5` |
| Main text | Near-black | `#171A18` |
| Primary brand color | Racing green | `#16803C` |
| Accent / CTA | Vivid green | `#27C85A` |
| Secondary background | Light grey | `#E9ECE8` |
| Borders | Neutral grey | `#D7DDD7` |
| Sale / warning | Red | `#D92D20` |
| White surfaces | White | `#FFFFFF` |

Use the client's official brand colors and logo if supplied. The palette above is the default proposal until the client's brand identity is confirmed.

### Design rules

- Use bold, condensed headings where appropriate.
- Use high-quality motorcycle and showroom photography.
- Use strong horizontal layouts, angled graphic accents, and restrained motorsport-inspired details.
- Keep product cards clean, with prominent pricing and availability.
- Use green for primary actions, selected filters, and important highlights.
- Avoid excessive gradients, decorative animations, and clutter.
- Ensure readable text contrast and accessible interactive states.
- Use consistent spacing, border radii, and typography across all pages.

### Typography

Use **Barlow Condensed** or **Oswald** for headings and **Inter** for body text. Load fonts locally or through a reliable font optimization method.

## 4. Website Structure and Pages

### A. Home Page (`/`)

**1. Announcement bar**
- Shipping, promotions, or seasonal offers
- Optional configurable message

**2. Header**
- Brand logo
- Main navigation
- Product search
- Language selector
- Account icon
- Shopping cart with item count

**3. Hero section**
- Large motorcycle or quad image/video
- Short, compelling headline
- Primary CTA: “Shop Now”
- Secondary CTA: “Visit Our Showroom”

**4. Featured categories**
- Motorcycles
- Kids' Motorcycles
- Adult Motorcycles
- Quad Bikes
- Riding Equipment and Accessories

**5. Featured products**
- Product cards in a responsive grid
- Price, availability, discount, and quick product access

**6. Promotional banner**
- Seasonal campaigns, special offers, or selected products
- Managed from the admin dashboard

**7. Shop by age and engine capacity**
- Age-group shortcuts
- Engine-capacity categories, based on the products sold

**8. Showroom introduction**
- Showroom images
- Short business introduction
- Location, opening hours, and contact CTA

**9. Trust and service section**
- Secure checkout
- Delivery and pickup options
- Customer support
- Product quality and warranty information, where applicable

**10. Footer**
- Contact details
- Showroom address and map link
- Social media links
- Customer service
- Legal pages
- Language selector

### B. Shop Page (`/shop`)

The main catalog must display products in a responsive grid.

**Filtering options:**
- Product category
- Age group
- Engine capacity
- Price range
- Availability
- Brand, if applicable

**Sorting options:**
- Featured
- Price: low to high
- Price: high to low
- Newest
- Best-selling, if reliable sales data is available

Include pagination or load-more functionality, active-filter indicators, a clear-filters action, and an empty-results state.

Filters must be usable on mobile through a drawer or collapsible panel.

### C. Product Detail Page (`/products/[slug]`)

Each product page must include:

- Product title and SKU
- Image gallery with zoom
- Video, when provided
- Price and sale price
- Stock availability
- Category and relevant specifications
- Age suitability
- Engine capacity
- Product description
- Quantity selector
- Add-to-cart button
- Delivery or showroom-pickup options
- Related products
- Shipping and returns information

For vehicles, specifications may include engine type, displacement, transmission, dimensions, maximum load, and other attributes relevant to the particular model.

Only display specifications supplied or verified by the client. Product attributes should be flexible enough to accommodate different product categories.

### D. Shopping Cart (`/cart`)

- Product image, name, price, and quantity
- Update or remove items
- Subtotal
- Discount code support, if enabled
- Estimated domestic shipping or pickup selection, where available
- Checkout CTA

Validate stock and pricing on the server before proceeding to checkout.

### E. Checkout (`/checkout`)

Implement a clear, step-by-step checkout:

1. Customer information
2. Delivery or showroom pickup
3. Shipping address and delivery quote, when required
4. Payment method
5. Order review
6. Confirmation

Support both registered customers and guest checkout.

International customers must be able to request a shipping quotation instead of receiving an invented or inaccurate automatic shipping price. Orders requiring manual quotations should have a dedicated pending-quotation status and workflow.

### F. Customer Account (`/account`)

Registered customers should be able to:

- View their profile and addresses
- Review previous orders
- View order status
- Access order details
- Manage account information

Guest customers should receive an order confirmation and a secure method of accessing order information, if guest order lookup is implemented.

### G. Showroom Page (`/showroom`)

- Showroom introduction
- Photo gallery
- Address
- Google Maps link or map embed
- Opening hours
- Telephone and WhatsApp
- Contact CTA
- Directions

### H. Contact Page (`/contact`)

- Contact form
- Phone number
- WhatsApp link
- Email address
- Showroom address
- Business hours

Validate and protect form submissions against spam.

### I. Supporting Pages

- `/about`
- `/shipping`
- `/returns`
- `/privacy`
- `/terms`
- `/faq`

The client must supply or approve the legal and commercial policies before launch.

## 5. Multilingual Support

The website must support four languages:

- French (`fr`)
- English (`en`)
- Spanish (`es`)
- Arabic (`ar`)

Use a localization library compatible with the Next.js App Router, such as `next-intl`.

**Requirements:**
- Localized navigation, page content, validation messages, and transactional emails
- Language selector in the main header and footer
- Locale-aware product URLs where appropriate
- Correct Arabic right-to-left layout
- Language-specific metadata and SEO
- Persistent language preference where appropriate

The original French content should be the default unless the client specifies otherwise.

Product descriptions and legal content must be translated or approved before publication. Do not assume that multi-currency support is included; confirm the required currencies and pricing rules separately.

## 6. Product and Inventory Management

Create a protected admin dashboard at `/admin`.

### Product management

Administrators must be able to:

- Create, edit, publish, and archive products
- Set prices and sale prices
- Upload and reorder images
- Add product videos
- Manage descriptions and specifications
- Assign categories and age groups
- Set engine capacity and other filter attributes
- Configure product slugs and SEO metadata
- Mark products as featured

### Inventory management

- Set available stock per product or variant
- Update inventory manually
- Reserve or decrement stock safely during order processing
- Restore stock when eligible orders are cancelled
- Prevent overselling through transactional stock checks
- Display availability on product pages
- Maintain an inventory movement or audit history

For the first version, inventory can be managed manually through the dashboard. POS synchronization and multi-location inventory are not included unless requested.

## 7. Database Design

Use PostgreSQL for structured business data. Store image files in object storage, not as binary data in database records.

### Core tables

| Table | Purpose |
|---|---|
| `users` | Customer and administrator accounts |
| `addresses` | Customer shipping addresses |
| `categories` | Product categories |
| `products` | Product details, prices, slugs, and status |
| `product_translations` | Localized product content |
| `product_images` | Image URLs and ordering |
| `product_variants` | Optional variations, such as size or model |
| `inventory` | Stock levels |
| `inventory_movements` | Stock change history |
| `carts` | Persistent customer carts, if required |
| `cart_items` | Cart product quantities |
| `orders` | Order totals, customer details, and status |
| `order_items` | Product and price snapshots at purchase time |
| `payments` | Payment provider references and status |
| `shipments` | Shipping method, tracking, and delivery status |
| `shipping_quotes` | Manual shipping quotation requests |
| `promotions` | Discount campaigns, if enabled |
| `site_settings` | Configurable store information and settings |

Use database transactions for order creation, payment-state updates, and inventory changes. Preserve the purchased product name and price in `order_items` so historical orders remain accurate when catalog prices change.

## 8. Image and Media Storage

**Recommended starting option: Cloudflare R2.**

Store product images, showroom photography, and other media in R2. Save their object keys, URLs, alt text, and ordering information in PostgreSQL.

Requirements:
- Upload images from the admin dashboard
- Validate file type and size
- Generate optimized thumbnail and product-image sizes
- Support WebP or AVIF delivery where appropriate
- Use a CDN-enabled public image domain for public product images
- Keep private assets and sensitive documents non-public
- Delete obsolete files when safe to do so

Use Next.js Image for responsive image delivery. Configure approved image hostnames in Next.js.

Alternative services include Cloudinary for managed image transformations or an equivalent media CDN. Final storage selection should consider the expected catalog size, upload volume, transformation requirements, and budget.

## 9. Payments and Order Processing

The client requested broad payment support, but the exact payment methods and provider remain to be confirmed.

The implementation must:
- Integrate a supported payment provider
- Handle successful, failed, pending, and refunded payments
- Verify payment notifications server-side
- Validate order totals on the server
- Avoid storing card details directly
- Use idempotent payment and order-processing operations
- Send order confirmation emails
- Keep payment status separate from fulfillment status

Do not mark an order as paid based solely on the customer returning to a success page. Use verified provider notifications or server-side payment verification.

## 10. Shipping and Pickup

Support two fulfillment methods:

**Showroom pickup**
- Customer selects pickup at checkout
- Display showroom details and pickup instructions
- Staff can update order readiness and collection status

**Home delivery**
- Domestic shipping rules and rates depend on the destination and product dimensions
- Show available rates only when configured and supported by a carrier or shipping-rate service

**International shipping**
- Allow the customer to request a quotation
- Record destination, products, and contact information
- Let an administrator provide the quote and update the order workflow
- Clearly communicate that international delivery costs and any applicable duties or taxes may require confirmation

Automated carrier integration, customs calculations, and guaranteed international shipping rates are separate scope items unless explicitly agreed.

## 11. UI Components and Design System

Build reusable components rather than implementing every page independently.

Recommended components:

- `SiteHeader`
- `AnnouncementBar`
- `MobileNavigation`
- `SiteFooter`
- `LanguageSwitcher`
- `SearchBar`
- `CategoryCard`
- `ProductCard`
- `ProductGrid`
- `ProductFilters`
- `ProductSort`
- `ProductGallery`
- `PriceDisplay`
- `StockBadge`
- `QuantitySelector`
- `AddToCartButton`
- `CartSummary`
- `CheckoutStepper`
- `PaymentMethodSelector`
- `ShippingMethodSelector`
- `ShowroomInfo`
- `WhatsAppButton`
- `PromotionBanner`
- `Breadcrumbs`
- `Pagination`
- `AdminSidebar`
- `AdminProductForm`
- `AdminInventoryTable`

All components must share the defined typography, spacing, color tokens, responsive breakpoints, and interaction states.

## 12. Suggested Next.js Project Structure

```text
src/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx
│   │   ├── shop/
│   │   ├── products/[slug]/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── account/
│   │   ├── showroom/
│   │   ├── contact/
│   │   └── admin/
│   ├── api/
│   └── globals.css
├── components/
│   ├── layout/
│   ├── products/
│   ├── cart/
│   ├── checkout/
│   ├── forms/
│   └── ui/
├── features/
│   ├── catalog/
│   ├── inventory/
│   ├── orders/
│   ├── payments/
│   └── shipping/
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── storage.ts
│   ├── payments.ts
│   └── validation.ts
├── server/
│   ├── actions/
│   └── services/
├── i18n/
├── types/
└── middleware.ts

prisma/
└── schema.prisma

public/
└── assets/
```

Keep business logic in reusable server-side services. Use server actions or route handlers for mutations, with explicit authentication, authorization, and validation.

## 13. Security Requirements

- Validate all inputs on the server.
- Protect admin routes and server mutations with role-based authorization.
- Hash passwords securely if credentials are used.
- Apply rate limiting to login, contact, and sensitive endpoints.
- Verify payment webhooks.
- Store secrets in environment variables.
- Never expose private API keys in client-side code.
- Use secure session cookies and CSRF protections where applicable.
- Prevent unauthorized price, discount, or stock manipulation.
- Apply upload restrictions and safe file handling.
- Configure backups, error monitoring, and audit logging.

## 14. SEO and Performance

- Server-render product and category pages where appropriate.
- Use descriptive product URLs and metadata.
- Generate sitemap and robots directives.
- Add canonical URLs and localized alternate-language metadata.
- Add appropriate Product and Breadcrumb structured data.
- Optimize images, fonts, and client-side JavaScript.
- Use pagination for large catalogs.
- Cache public catalog content while keeping carts, account pages, and checkout private.
- Invalidate relevant caches when products or stock change.
- Track performance using Core Web Vitals.

## 15. Responsive Design

Design mobile-first and verify layouts at mobile, tablet, laptop, and large desktop widths.

On mobile:
- Use a compact navigation layout.
- Keep search and cart access easy.
- Present filters in a drawer.
- Make primary actions touch-friendly.
- Avoid oversized product galleries that push purchase actions too far down.
- Ensure the checkout form is easy to complete on small screens.
- Support Arabic RTL without horizontal overflow.

## 16. Testing and Quality Assurance

Test the following before release:

- Product creation and editing
- Image uploads and rendering
- Product search, filters, and sorting
- Stock availability and concurrent purchase attempts
- Cart persistence and quantity updates
- Guest checkout and account checkout
- Payment success, failure, and duplicate notifications
- Domestic delivery and pickup workflows
- International shipping quotation workflow
- Admin permissions
- All four languages and Arabic RTL
- Mobile responsiveness and accessibility
- SEO metadata and sitemap
- Database backup and recovery

Use unit tests for business logic, integration tests for order and payment workflows, and end-to-end tests for critical customer journeys.

## 17. Deployment and Environment Configuration

Deploy the Next.js application to Vercel or a suitable Node.js platform, with PostgreSQL hosted through a managed database service or reliable infrastructure.

Use separate development, staging, and production environments where feasible.

Required environment variables will include:

```text
DATABASE_URL=
AUTH_SECRET=
APP_URL=
PAYMENT_SECRET_KEY=
PAYMENT_WEBHOOK_SECRET=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
EMAIL_API_KEY=
```

Use only the variables required by the selected providers. Keep production credentials out of Git, configure database migrations as part of controlled deployment, and enable scheduled backups.

## 18. Development Phases

**Phase 1 — Design and foundation**
- Confirm branding, sitemap, and UI direction
- Approve homepage and product-page mockups
- Set up Next.js, database, localization, and design system

**Phase 2 — Catalog and showroom**
- Build public pages
- Implement categories, filters, product details, and media
- Build showroom and contact sections

**Phase 3 — E-commerce**
- Cart, checkout, accounts, payments, and order records
- Pickup, domestic shipping, and international quote workflow

**Phase 4 — Administration**
- Product and category management
- Image uploads
- Inventory and order management
- Promotion and site settings

**Phase 5 — QA and launch**
- Functional, security, and responsive testing
- Content and translation review
- Production deployment, monitoring, and backup validation

The design must be approved by the client before full development proceeds.

## 19. Items Requiring Client Confirmation

Before implementation, confirm:

1. Official logo, brand colors, fonts, and existing design assets.
2. Final product categories, specifications, photos, and translations.
3. Supported payment methods and payment provider.
4. Domestic delivery zones, carrier, pricing rules, and delivery expectations.
5. International quotation and order-approval workflow.
6. Whether multiple currencies are required.
7. Legal policies, warranty, returns, and cancellation rules.
8. Whether inventory needs POS integration or will remain manually managed.
9. Whether customer order tracking requires carrier tracking integration.
10. Hosting, domain, email provider, and ongoing service budget.

## 20. Scope Boundaries

The baseline includes a responsive multilingual storefront, product catalog, admin-managed products and inventory, cart, checkout, supported payment integration, customer orders, showroom pickup, domestic delivery rules, and an international shipping quotation workflow.

The following require separate estimation if needed:
- POS or external inventory synchronization
- Complex ERP integrations
- Automated international shipping and customs calculations
- Multiple payment-provider integrations beyond the agreed scope
- Advanced loyalty programs, subscriptions, or marketplace functionality
- Professional product photography and translation services
- Ongoing hosting, provider usage fees, and maintenance

**Acceptance criteria:** The website is ready for launch when customers can browse and filter products, see accurate prices and stock, complete supported checkout flows, choose pickup or configured delivery, request international shipping quotes, and receive order confirmations—and when authorized staff can manage the catalog, inventory, and orders through the admin dashboard.
