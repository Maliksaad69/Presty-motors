# Presty Motors — Project Milestones & Roadmap

Based on the [Technical Specification (Plan.md)](./Plan.md), the project is structured into 5 cohesive delivery milestones.

---

## Roadmap Overview

```
Milestone 1: Foundation, DB (PostgreSQL + Prisma), i18n & Core Theme  [COMPLETED]
     │
     ▼
Milestone 2: Product Catalog, Showroom & Public Storefront            [COMPLETED]
     │
     ▼
Milestone 3: Cart, Multi-step Checkout, Orders & Customer Account     [COMPLETED]
     │
     ▼
Milestone 4: Admin Dashboard, Inventory & Quotation Management        [COMPLETED]
     │
     ▼
Milestone 5: QA, Security Hardening, RTL/SEO & Launch Readiness       [COMPLETED]
```

---

## Milestone 1: Foundation, Database Architecture, ORM, i18n & Design System
**Status:** ✅ Completed  
**Objective:** Establish a robust architectural foundation, connect to the local Docker PostgreSQL instance, define the complete Prisma relational schema with proper migrations, seed baseline data, configure the 4-language i18n routing (FR/EN/ES/AR), and establish the motorsport design system.

### Deliverables:
- [x] **Project Workspace Configuration:**
  - Standardized root Next.js 16 App Router setup.
  - Configured `components.json` for shadcn UI component system.
  - Setup `.env` and `.env.example` configurations.
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
- [x] **Motorsport Visual Design System (Tailwind CSS v4):**
  - High-contrast **White, Black, and Racing Red** palette (`#FFFFFF`, `#0A0A0A`, `#DC2626`).
  - Strict no-badge clean aesthetic.
  - Light header micro-animations (entry reveal, scroll-responsive glass blur, animated nav underlines, expandable search, and animated cart micro-interactions).
  - Client interactivity: Cart context provider with interactive slide-over cart drawer (`CartDrawer`), interactive live category filtering without page reloads.
  - Typography: Barlow Condensed heading typography & Inter body typography.
- [x] **Multilingual Support (i18n):**
  - Locale-based routing `/[locale]` supporting French (`fr`, default), English (`en`), Spanish (`es`), and Arabic (`ar`)
  - Native directional support (`dir="ltr"` / `dir="rtl"`)
  - Full message dictionaries for all 4 languages
- [x] **Verification & Health Endpoint:**
  - Database connectivity test & `/api/health` check endpoint verifying live queries from PostgreSQL.

---

## Milestone 2: Product Catalog, Showroom & Public Storefront
**Status:** ✅ Completed  
**Objective:** Implement the public-facing storefront featuring the motorsport visual identity, category browsing, multi-attribute product filters, detailed vehicle specs, showroom presentation, and supporting company pages.

### Deliverables:
- [x] **Motorsport Color Tokens & Design System (Tailwind CSS v4):**
  - Primary black: `#0B0B0B`
  - Secondary black: `#171717`
  - Racing red: `#E10600`
  - Hover red: `#B80500`
  - Pure white: `#FFFFFF`
  - Off-white background: `#F5F5F5`
  - Border grey: `#E2E2E2`
  - Muted text: `#737373`
  - Success / in-stock: `#16803C`
- [x] **Core Motorsport Layout Components:**
  - `SiteHeader`: Deep black background (`#0B0B0B`), white navigation text, racing red active/hover states, live search, cart indicator with badge, responsive mobile menu drawer.
  - `AnnouncementBar`: Sleek black and red carousel banner for promotions and showroom hours.
  - `LanguageSwitcher`: Accessible segmented selector with full 4-language support (FR, EN, ES, AR).
  - `SiteFooter`: Black background (`#0B0B0B`), white headings, organized columns, legal links.
  - `CartDrawer`: Persistent slide-out cart with quantity controls, subtotal, and checkout link.
- [x] **Home Page (`/[locale]`):**
  - Dynamic Hero Showcase with live vehicle telemetry HUD and quick add-to-cart.
  - Product Categories grid with red racing accents and model counters.
  - Featured Products interactive showcase with category filters, live search, and quick view specs modal.
  - Motorsport Promotional Banner with season opening campaign highlights and CTA.
  - Paris Flagship Showroom section with interactive test ride modal booking and Google Maps link.
  - Trust & Service pillars (Premier showroom, secure delivery, international quotes, technical support).
- [x] **Shop & Catalog Page (`/[locale]/shop`):**
  - Responsive catalog grid (4 cols wide, 3 cols desktop, 2 cols tablet/mobile, 1 col narrow).
  - Multi-attribute filtering (Category, Vehicle Type, In-stock only, Price sorting, live search).
  - Mobile Filter Drawer for seamless narrow viewport UX.
- [x] **Product Detail Page (`/[locale]/products/[slug]`):**
  - Responsive image gallery with switching thumbnails and zoom.
  - Detailed technical specifications sheet (Engine, transmission, weight, seat height, etc.).
  - Price display with promotional sale badges, stock counter, and quantity stepper.
  - Direct Add to Cart action and Paris Showroom Test Ride booking trigger.
  - Related models and gear recommendations.
- [x] **Showroom & Contact Pages:**
  - `/[locale]/showroom`: Comprehensive showroom guide, gallery, opening hours, facilities breakdown.
  - `/[locale]/contact`: Interactive quote and message transmission form, direct WhatsApp, and phone contacts.
- [x] **Checkout & Account Pages:**
  - `/[locale]/checkout`: Step-by-step customer details, fulfillment choice (Paris Pickup vs Domestic Freight), payment choices, sticky order summary.
  - `/[locale]/account`: Customer order history, fulfillment tracking, profile details.

---

## Milestone 3: Cart, Multi-Step Checkout, Orders & Customer Account
**Status:** ✅ Completed  
**Objective:** Deliver the e-commerce purchase lifecycle, including persistent shopping cart, domestic delivery rules, international quotation requests, and customer order history.

### Deliverables:
- [x] **Shopping Cart (`/[locale]/cart`):**
  - [x] Dedicated full-width cart management page with interactive quantity modifiers & item deletion
  - [x] Real-time server-side stock availability verification
  - [x] Dynamic promotional coupon code redemption (Prisma `Promotion` model)
  - [x] Estimated fulfillment breakdown (Showroom collection vs Domestic carrier)
  - [x] Enhanced Cart Drawer with direct link to full Cart review
- [x] **Step-by-Step Checkout Workflow (`/[locale]/checkout`):**
  - [x] Step 1: Customer Contact & Identification (Guest vs Registered)
  - [x] Step 2: Fulfillment Selection with Dual Purchase/Reservation Modes:
    - **Showroom Reservation (Paris 16e):** Free holding option (€0.00 online). Customer reserves machine, schedules showroom visit/test ride, and settles in person upon collection.
    - **Domestic Freight Delivery:** Enclosed hydraulic tailgate freight across France (€150.00) with online card or wire payment.
    - **International Quotation:** Overseas shipping request with custom freight quote.
  - [x] Step 3: Shipping & Billing Address with validation (bypassed for Showroom Pickup)
  - [x] Step 4: Payment Method (Paris Showroom In-Person Settlement, Credit Card simulation ready for future Stripe keys, Bank Wire Transfer instructions)
  - [x] Step 5: Server-side atomic order creation with price tampering protection, inventory reduction (`InventoryMovement` audit log), and database persistence
  - [x] Step 6: Dynamic Order / Reservation Confirmation screen with customized showroom visit slips, order reference, and lookup action
- [x] **International Shipping Quotation System:**
  - [x] Seamless overseas quote submission integrated in checkout workflow
  - [x] Database persistence with `PENDING_QUOTE` status & `ShippingQuote` record generation (`PM-QUOTE-XXXX`)
  - [x] Quote acknowledgment view with international logistics guidance
- [x] **Customer Portal (`/[locale]/account`):**
  - [x] Live database order lookup (lookup by Order Number + Email)
  - [x] Order status tracking timeline (`PENDING`, `PROCESSING`, `READY_FOR_PICKUP`, `SHIPPED`, `DELIVERED`, `PENDING_QUOTE`)
  - [x] Order detail view with itemized snapshot pricing and delivery tracking
  - [x] Saved shipping addresses management

---

## Milestone 4: Admin Dashboard, Inventory & Quotation Management
**Status:** ✅ Completed  
**Objective:** Create an administrative control panel (`/[locale]/admin`) allowing staff to manage catalog products, stock levels, images, incoming orders, and international shipping quotes.

### Deliverables:
- [x] **Admin Layout & Role-Based Access Control:**
  - [x] Protected admin portal layout (`/[locale]/admin`) with responsive navigation sidebar
  - [x] Dashboard KPI metrics (Total revenue, active catalog machines, pending orders, low stock alerts)
  - [x] Quick navigation to Catalog, Inventory, Orders, Quotes, Promotions, and Site Settings
- [x] **Product Management (`/[locale]/admin/products`):**
  - [x] Complete product catalog table with live status badges, categories, prices, and stock
  - [x] Create & Edit product modals / forms with multi-lingual inputs (FR, EN, ES, AR)
  - [x] Vehicle technical specifications editor (displacement, power, transmission, seat height, weight)
  - [x] Media & image URL management
- [x] **Inventory & Movement Auditing (`/[locale]/admin/inventory`):**
  - [x] Real-time stock adjustment interface
  - [x] Low-stock threshold alerts (< threshold)
  - [x] Immutable inventory movement history with audit logs (`InventoryMovement`)
- [x] **Order & Quote Processing (`/[locale]/admin/orders` & `/[locale]/admin/quotes`):**
  - [x] Order fulfillment management with state machine transitions (`PENDING` → `PROCESSING` → `READY_FOR_PICKUP` / `SHIPPED` → `DELIVERED` / `CANCELLED`)
  - [x] International quotation review interface with rate input & status transitions (`REQUESTED` → `REVIEWING` → `QUOTED` → `ACCEPTED`)
- [x] **Marketing & Store Settings (`/[locale]/admin/settings`):**
  - [x] Live store setting management (announcement banner text, showroom opening hours, contact details)
  - [x] Promotional coupon creation & status management (percentage / fixed discount, minimum order, usage limits)

---

## Milestone 5: Testing, RTL / Accessibility, Security Hardening & Launch Readiness
**Status:** ✅ Completed  
**Objective:** Comprehensive quality assurance, RTL layout verification for Arabic, security audit, search engine optimization, and production deployment preparation.

### Deliverables:
- [x] **RTL & Accessibility Audit:**
  - [x] Arabic RTL layout validation across all components (`dir="rtl"`, mirrored iconography, alignment)
  - [x] Keyboard navigation, ARIA landmarks, and WCAG AA contrast ratio compliance
- [x] **Security, Validation & Concurrency Hardening:**
  - [x] Strict runtime input validation using Zod schemas for checkout, contact, and inventory
  - [x] Concurrent transaction race-condition testing (preventing double-selling when stock = 1)
  - [x] Price tamper resistance verified with server-authoritative calculations
- [x] **SEO & Performance Optimization:**
  - [x] Dynamic database-driven `sitemap.xml` with multilingual hreflang alternates (FR, EN, ES, AR, x-default)
  - [x] Crawl optimization with `robots.txt` protecting admin and sensitive endpoints
  - [x] Structured JSON-LD schemas (`AutoDealer` / `MotorcycleDealer` & `Product` offer schemas)
  - [x] OpenGraph & Twitter social preview metadata
- [x] **Production Deployment & Disaster Recovery:**
  - [x] Complete production environment configuration template (`.env.production.example`)
  - [x] Automated PostgreSQL backup and rotation utility script (`scripts/backup-db.sh`)
  - [x] Migration integrity verification script (`scripts/verify-migrations.sh`)
