#!/usr/bin/env bash
# ==============================================================================
# Presty Motors — Database Migration & Integrity Verification
# ==============================================================================
set -euo pipefail

echo "=================================================="
echo " Presty Motors — Migration & Schema Verification"
echo "=================================================="

# Check Prisma schema formatting & validation
echo "1. Validating Prisma Schema syntax..."
npx prisma validate

# Check migration status
echo "2. Checking Prisma Migration status..."
npx prisma migrate status

# Run database table & model counts check
echo "3. Querying database table health..."
npx tsx -e "
import { db } from './src/lib/db';
async function testHealth() {
  const [products, orders, movements, categories, settings] = await Promise.all([
    db.product.count(),
    db.order.count(),
    db.inventoryMovement.count(),
    db.category.count(),
    db.siteSetting.count()
  ]);
  console.log('✅ Database Health Summary:');
  console.log('   - Products in catalog:', products);
  console.log('   - Categories configured:', categories);
  console.log('   - Orders recorded:', orders);
  console.log('   - Inventory movements logged:', movements);
  console.log('   - Site settings active:', settings);
}
testHealth().then(() => process.exit(0)).catch(e => { console.error('Health check failed:', e); process.exit(1); });
"

echo "=================================================="
echo "✅ All migration and schema verification checks passed!"
echo "=================================================="
