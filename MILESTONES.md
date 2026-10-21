# Presty Motors — Project Milestones & Roadmap

Based on the [Technical Specification (Plan.md)](./Plan.md), the project is structured into 5 cohesive delivery milestones.

---

## Roadmap Overview

```
Milestone 1: Foundation, DB (PostgreSQL + Prisma), i18n & Core Theme  [COMPLETED]
     │
     ▼
Milestone 2: Product Catalog, Showroom & Public Storefront            [UP NEXT]
     │
     ▼
Milestone 3: Cart, Multi-step Checkout, Orders & Customer Account     [PLANNED]
     │
     ▼
Milestone 4: Admin Dashboard, Inventory & Quotation Management        [PLANNED]
     │
     ▼
Milestone 5: QA, Security Hardening, RTL/SEO & Launch Readiness       [PLANNED]
```

---

## Milestone 1: Foundation, Database Architecture, ORM, i18n & Design System
**Status:** ✅ Completed  
**Objective:** Establish a robust architectural foundation, connect to the local Docker PostgreSQL instance, define the complete Prisma relational schema with proper migrations, seed baseline data, configure the 4-language i18n routing (FR/EN/ES/AR), and establish the motorsport design system.

### Deliverables:
- [x] **Project Structure & Organization:** Standardized Next.js 16 App Router setup in workspace root with clean TypeScript configuration.
- [x] **PostgreSQL Database:** Connected to local Docker PostgreSQL instance (`cyberguard-postgres` on port 5432, database `presty_motors`).
- [x] **Prisma ORM & Migration System:**
  - Complete relational schema implementing all core models from Section 7 of `Plan.md`:
    - `User` & `Address` (RBAC: `CUSTOMER`, `STAFF`, `ADMIN`)
    - `Category` & `CategoryTranslation`
    - `Product`, `ProductTranslation`, `ProductImage`, `ProductVariant`
    - `Inventory` & `InventoryMovement` (audit logging)
    - `Cart` & `CartItem`
    - `Order`, `OrderItem`, `Payment`, `Shipment`, `ShippingQuote`
    - `Promotion` & `SiteSetting`
  - Successful initial migration via `prisma migrate dev --name init`
  - Singleton Prisma client instance with PostgreSQL driver adapter
  - Comprehensive seed script with store settings, default categories, initial products & specs, and admin/customer accounts
- [x] **Design Tokens & Theme:**
  - Tailwind CSS v4 configured with brand palette:
    - Racing Green (`#16803C`)
    - Vivid Green CTA (`#27C85A`)
    - Off-white background (`#F7F8F5`)
    - Dark text (`#171A18`)
    - Warning/Sale Red (`#D92D20`)
  - Typography: Barlow Condensed heading typography & Inter body typography
- [x] **Multilingual Support (i18n):**
  - Locale-based routing `/[locale]` supporting French (`fr`, default), English (`en`), Spanish (`es`), and Arabic (`ar`)
  - Native directional support (`dir="ltr"` / `dir="rtl"`)
  - Full message dictionaries for all 4 languages
- [x] **Verification & Health Endpoint:**
  - Database connectivity test & `/api/health` check endpoint verifying live queries from PostgreSQL.

---

## Milestone 2: Product Catalog, Showroom & Public Storefront
**Status:** Planned  
**Objective:** Implement the public-facing storefront featuring the motorsport visual identity, category browsing, multi-attribute product filters, detailed vehicle specs, showroom presentation, and supporting company pages.

### Deliverables:
- **Core UI Components:**
  - `SiteHeader`, `AnnouncementBar`, `LanguageSwitcher`, `SearchBar`, `SiteFooter`
  - `ProductCard`, `ProductGrid`, `PriceDisplay`, `StockBadge`, `QuantitySelector`
  - `CategoryCard`, `Breadcrumbs`, `Pagination`
- **Home Page (`/[locale]`):**
  - High-impact Hero section with dual CTAs ("Shop Now", "Visit Our Showroom")
  - Featured Categories carousel/grid (Motorcycles, Kids', Adults, Quads, Gear)
  - Featured Products showcase with stock badges & pricing
  - Promotional Banner component
  - Showroom introduction teaser & Trust & Service badges
- **Shop & Catalog Page (`/[locale]/shop`):**
  - Responsive catalog grid with server-side queries
  - Multi-attribute filtering (Category, Age Group, Engine Capacity, Price range, In-stock)
  - Mobile filter drawer
  - Sort options (Featured, Price: Low-to-High, Price: High-to-Low, Newest)
- **Product Detail Page (`/[locale]/products/[slug]`):**
  - Image gallery with zoom
  - Vehicle specifications breakdown (displacement, transmission, dimensions, power)
  - Multilingual localized content
  - Stock availability & quantity selector
  - Add to cart trigger & related products slider
- **Showroom & Contact Pages:**
  - `/[locale]/showroom`: Gallery, Google Maps link, address, opening hours, WhatsApp direct link
  - `/[locale]/contact`: Anti-spam contact form, showroom details, contact numbers
- **Content Pages:**
  - About Us, Shipping Policy, Returns & Warranty, Privacy, Terms, FAQ

---

## Milestone 3: Cart, Multi-Step Checkout, Orders & Customer Account
**Status:** Planned  
**Objective:** Deliver the e-commerce purchase lifecycle, including persistent shopping cart, domestic delivery rules, international quotation requests, and customer order history.

### Deliverables:
- **Shopping Cart (`/[locale]/cart`):**
  - Cart drawer & dedicated cart page
  - Real-time stock validation
  - Subtotal, promotional code validation, shipping estimate
- **Step-by-Step Checkout Workflow (`/[locale]/checkout`):**
  1. Customer Contact & Identification (Guest vs Registered)
  2. Fulfillment Selection: Showroom Pickup vs Domestic Delivery vs International Quote Request
  3. Shipping / Pickup Address
  4. Payment Method (Stripe integration stub / provider gateway)
  5. Order Review & Submission with server-side price validation
  6. Order Confirmation page with order reference
- **International Shipping Quotation System:**
  - Quote request form for overseas destinations
  - Pending-quotation order state
- **Customer Portal (`/[locale]/account`):**
  - Order history & real-time status tracking
  - Saved shipping addresses & profile management

---

## Milestone 4: Admin Dashboard, Inventory & Quotation Management
**Status:** Planned  
**Objective:** Create an administrative control panel (`/[locale]/admin`) allowing staff to manage catalog products, stock levels, images, incoming orders, and international shipping quotes.

### Deliverables:
- **Admin Layout & Role-Based Access Control:**
  - Protected admin routes with authentication check
  - Admin sidebar, summary metrics (products, orders, revenue, low stock)
- **Product Management:**
  - Product creation & editing with multi-language tabbed inputs
  - Technical specification editor for vehicles & gear
  - Media upload management (Cloudflare R2 integration stub)
- **Inventory & Movement Auditing:**
  - Real-time stock adjustment table
  - Transactional inventory updates with audit log (`InventoryMovement`)
  - Low-stock threshold alerts
- **Order & Quote Processing:**
  - Order management table with status transitions (Pending, Processing, Shipped, Ready for Pickup, Delivered, Cancelled)
  - International quotation review & price quote dispatch
- **Store Settings & Promotions:**
  - Announcement bar text, contact information, showroom hours
  - Promo code creation & discount percentage/fixed amount rules

---

## Milestone 5: Testing, RTL / Accessibility, Security Hardening & Launch Readiness
**Status:** Planned  
**Objective:** Comprehensive quality assurance, RTL layout verification for Arabic, security audit, search engine optimization, and production deployment preparation.

### Deliverables:
- **RTL & Accessibility Audit:**
  - Arabic RTL layout validation across all components
  - Keyboard navigation, ARIA landmarks, color contrast compliance (WCAG AA)
- **Security & Concurrency Testing:**
  - Server actions validation using Zod
  - Race-condition testing for inventory decrementing during checkout
  - Protection against unauthorized price alterations
  - Rate limiting on contact and checkout endpoints
- **SEO & Performance Optimization:**
  - Dynamic sitemap (`sitemap.xml`) & `robots.txt`
  - Multilingual metadata, alternate hreflang tags, OpenGraph previews
  - Structured data (`Product`, `BreadcrumbList`, `Store`)
  - Core Web Vitals optimization
- **Deployment & Backup Strategy:**
  - Environment configuration guide (`.env.production`)
  - Database backup scripts & migration verification
